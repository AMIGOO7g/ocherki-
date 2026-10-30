'use strict';
/* Ocherki account server: e-mail code sign-in, manuscript and photo storage,
 * and the constructor's own files from one origin (so the session cookie
 * is first-party). Meant for a server in Russia (152-ФЗ): the database and
 * the photos stay on this machine's disk.
 *
 * Run: node server/server.js  (settings come from the environment, see
 * server/README.md). Needs Node 22.5+ for the built-in SQLite. */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { sendCode } = require('./mail');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.resolve(process.env.OCHERKI_DATA || path.join(__dirname, 'data'));
const PORT = Number(process.env.PORT || 8080);
const SECRET = process.env.OCHERKI_SECRET || '';
const SECURE_COOKIE = process.env.OCHERKI_INSECURE_COOKIE !== '1';
if (SECRET.length < 32) { console.error('OCHERKI_SECRET must be set to at least 32 random characters.'); process.exit(1); }

const CODE_TTL = 10 * 60 * 1000, SESSION_TTL = 60 * 24 * 60 * 60 * 1000;
const MAX_PROJECT = 8 * 1024 * 1024, MAX_PHOTO = 30 * 1024 * 1024;

fs.mkdirSync(path.join(DATA, 'photos'), { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'ocherki.sqlite'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS codes (email TEXT PRIMARY KEY, hash TEXT NOT NULL, expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (user_id INTEGER NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, saved_at INTEGER NOT NULL, PRIMARY KEY (user_id, id));
  CREATE TABLE IF NOT EXISTS sends (ip TEXT NOT NULL, at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS email_sends (email TEXT NOT NULL, at INTEGER NOT NULL);
`);

const hmac = value => crypto.createHmac('sha256', SECRET).update(value).digest('hex');
const sameHash = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const normEmail = value => String(value || '').trim().toLowerCase();
const validEmail = value => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/u.test(value);

function send(res, status, body, headers = {}) {
  const json = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(json);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', chunk => { size += chunk.length; if (size > limit) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); } else chunks.push(chunk); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const cookieOf = req => Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => part.trim().split('=')).filter(pair => pair[0]).map(([key, ...rest]) => [key, rest.join('=')]));
const sessionCookie = (token, maxAge) => `ocherki_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAge / 1000)}${SECURE_COOKIE ? '; Secure' : ''}`;

function currentUser(req) {
  const token = cookieOf(req).ocherki_session;
  if (!token || !/^[a-f0-9]{64}$/u.test(token)) return null;
  const row = db.prepare('SELECT users.id, users.email, sessions.expires_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ?').get(hmac(token));
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email };
}

const clientIp = req => String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');

async function api(req, res, url) {
  // Mutating calls must carry this header: a cross-site form cannot set
  // it, so together with SameSite=Strict it closes CSRF.
  if (req.method !== 'GET' && req.headers['x-ocherki'] !== '1') return send(res, 403, { error: 'forbidden' });

  if (url.pathname === '/api/auth/request' && req.method === 'POST') {
    const { email: raw } = JSON.parse(await readBody(req, 4096) || '{}');
    const email = normEmail(raw), now = Date.now(), ip = clientIp(req);
    if (!validEmail(email)) return send(res, 400, { error: 'Проверьте адрес почты.' });
    const last = db.prepare('SELECT sent_at FROM codes WHERE email = ?').get(email);
    if (last && now - last.sent_at < 60 * 1000) return send(res, 429, { error: 'Код уже отправлен. Новый можно запросить через минуту.', retryIn: Math.ceil((60 * 1000 - (now - last.sent_at)) / 1000) });
    // Limits against bots and mail flooding: a new code once a minute,
    // five letters an hour to one address, ten an hour from one IP.
    db.prepare('DELETE FROM sends WHERE at < ?').run(now - 60 * 60 * 1000);
    db.prepare('DELETE FROM email_sends WHERE at < ?').run(now - 60 * 60 * 1000);
    if (db.prepare('SELECT COUNT(*) AS n FROM email_sends WHERE email = ?').get(email).n >= 5) return send(res, 429, { error: 'На этот адрес уже отправлено много кодов. Попробуйте через час.' });
    if (db.prepare('SELECT COUNT(*) AS n FROM sends WHERE ip = ?').get(ip).n >= 10) return send(res, 429, { error: 'Слишком много запросов. Попробуйте через час.' });
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    db.prepare('INSERT INTO codes (email, hash, expires_at, attempts, sent_at) VALUES (?, ?, ?, 0, ?) ON CONFLICT(email) DO UPDATE SET hash = excluded.hash, expires_at = excluded.expires_at, attempts = 0, sent_at = excluded.sent_at')
      .run(email, hmac(`${email}:${code}`), now + CODE_TTL, now);
    db.prepare('INSERT INTO sends (ip, at) VALUES (?, ?)').run(ip, now);
    db.prepare('INSERT INTO email_sends (email, at) VALUES (?, ?)').run(email, now);
    try { await sendCode(email, code); } catch (error) { console.error('mail:', error.message); return send(res, 502, { error: 'Не удалось отправить письмо. Попробуйте позже.' }); }
    return send(res, 200, { ok: true, retryIn: 60 });
  }

  if (url.pathname === '/api/auth/verify' && req.method === 'POST') {
    const { email: raw, code } = JSON.parse(await readBody(req, 4096) || '{}');
    const email = normEmail(raw), now = Date.now();
    const row = db.prepare('SELECT hash, expires_at, attempts FROM codes WHERE email = ?').get(email);
    if (!row || row.expires_at < now || row.attempts >= 5) return send(res, 400, { error: 'Код устарел. Запросите новый.' });
    if (!sameHash(row.hash, hmac(`${email}:${String(code || '').replace(/\D/gu, '')}`))) {
      db.prepare('UPDATE codes SET attempts = attempts + 1 WHERE email = ?').run(email);
      return send(res, 400, { error: 'Неверный код.' });
    }
    db.prepare('DELETE FROM codes WHERE email = ?').run(email);
    db.prepare('INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)').run(email, now);
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(hmac(token), user.id, now + SESSION_TTL);
    return send(res, 200, { email }, { 'Set-Cookie': sessionCookie(token, SESSION_TTL) });
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = cookieOf(req).ocherki_session;
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hmac(token));
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
  }

  const user = currentUser(req);
  if (url.pathname === '/api/me') return user ? send(res, 200, { email: user.email }) : send(res, 401, { error: 'not signed in' });
  if (!user) return send(res, 401, { error: 'not signed in' });

  // The bookcase: id, save time and the small «book» summary of every book.
  if (url.pathname === '/api/projects' && req.method === 'GET') {
    const rows = db.prepare("SELECT id, saved_at, json_extract(body, '$.book') AS book FROM projects WHERE user_id = ? ORDER BY saved_at DESC").all(user.id);
    return send(res, 200, rows.map(row => ({ id: row.id, savedAt: row.saved_at, book: row.book ? JSON.parse(row.book) : null })));
  }
  const project = url.pathname.match(/^\/api\/projects\/([\w-]{1,64})$/u);
  if (project && req.method === 'GET') {
    const row = db.prepare('SELECT body FROM projects WHERE user_id = ? AND id = ?').get(user.id, project[1]);
    if (!row) return send(res, 404, { error: 'not found' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(row.body);
  }
  if (project && req.method === 'DELETE') {
    db.prepare('DELETE FROM projects WHERE user_id = ? AND id = ?').run(user.id, project[1]);
    return send(res, 200, { ok: true });
  }
  if (project && req.method === 'PUT') {
    const body = await readBody(req, MAX_PROJECT), record = JSON.parse(body);
    db.prepare('INSERT INTO projects (user_id, id, body, saved_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, id) DO UPDATE SET body = excluded.body, saved_at = excluded.saved_at')
      .run(user.id, project[1], body, Number(record.savedAt) || Date.now());
    return send(res, 200, { ok: true });
  }

  // Photos: one file per image, named by a hash of the client's reference.
  const photoDir = path.join(DATA, 'photos', String(user.id)), photoFile = ref => path.join(photoDir, crypto.createHash('sha256').update(String(ref)).digest('hex'));
  if (url.pathname === '/api/photos/missing' && req.method === 'POST') {
    const { refs } = JSON.parse(await readBody(req, 1024 * 1024) || '{}');
    return send(res, 200, { missing: (Array.isArray(refs) ? refs : []).filter(ref => !fs.existsSync(photoFile(ref))) });
  }
  const photo = url.pathname === '/api/photos' ? url.searchParams.get('ref') : null;
  if (photo && req.method === 'GET') {
    if (!fs.existsSync(photoFile(photo))) return send(res, 404, { error: 'not found' });
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, max-age=31536000, immutable' });
    return fs.createReadStream(photoFile(photo)).pipe(res);
  }
  if (photo && req.method === 'PUT') {
    const body = await readBody(req, MAX_PHOTO);
    if (!body.startsWith('data:image/')) return send(res, 400, { error: 'not an image' });
    fs.mkdirSync(photoDir, { recursive: true });
    fs.writeFileSync(photoFile(photo), body);
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'not found' });
}

// The constructor itself: static files from the repository folder, never
// the server's own directory.
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.webp': 'image/webp' };
function serveStatic(req, res, url) {
  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return send(res, 403, { error: 'forbidden' });
  const relative = path.relative(ROOT, file);
  if (relative.split(path.sep)[0] === 'server' || relative.split(path.sep).some(part => part.startsWith('.'))) return send(res, 404, { error: 'not found' });
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return send(res, 404, { error: 'not found' });
  // Byte ranges, so audio and large images stream instead of holding the
  // browser's connections open.
  const size = fs.statSync(file).size, type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = String(req.headers.range || '').match(/^bytes=(\d*)-(\d*)$/u);
  const head = { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2])), end = range[1] && range[2] ? Number(range[2]) : size - 1;
    end = Math.min(end, size - 1);
    if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
    res.writeHead(206, { ...head, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...head, 'Content-Length': size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else if (req.method === 'GET' || req.method === 'HEAD') serveStatic(req, res, url);
    else send(res, 405, { error: 'method not allowed' });
  } catch (error) {
    if (!res.headersSent) send(res, error.status || (error instanceof SyntaxError ? 400 : 500), { error: error.status === 413 ? 'Слишком большой файл.' : 'Ошибка сервера.' });
    if (!error.status && !(error instanceof SyntaxError)) console.error(error);
  }
}).listen(PORT, () => console.log(`Очерки: http://localhost:${PORT}`));
