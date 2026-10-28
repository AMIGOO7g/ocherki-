const fs = require('fs');

const path = require('path');
const root = path.resolve(__dirname, '..');
const shell = fs.readFileSync(path.join(root, 'shell.html'), 'utf8');
const sheet = fs.readFileSync(path.join(root, 'sheet_v35.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'book-renderer/design-pack-01.js'), 'utf8');

const must = (source, pattern, label) => {
  if (!pattern.test(source)) throw new Error(`missing: ${label}`);
};

must(index, /id="startAuthKey"/, 'start-screen authorization control');
if(/id="authBtn"|id="authModal"|auth-hanging|auth-label/.test(shell)) throw new Error('constructor still contains a duplicate authorization control');
must(shell, /вернёмся во времени(?: назад)?\?/, 'startup caption');
must(shell, /const designs=\[\['editorial','Современный'/, 'editorial design first');
must(shell, /function contentFingerprint\(st\)/, 'content-only rebuild key');
must(shell, /built&&hadStructure&&contentChanged/, 'skip rebuild on navigation-only state');
if(/id="zoom(?:Out|In)Btn"/.test(shell)||/function setZoom\(/.test(shell)) throw new Error('removed zoom controls still present');
must(shell, /\.bm-episodes\{padding-left:0!important\}/, 'single marker axis');
must(shell, /\.bd-spread-rows\.is-revealing-spreads \.bd-spread-row\{animation:none!important/, 'no spread reveal delay');
must(sheet, /Navigation must not wait for a decorative thumbnail cascade/, 'instant page thumbnail swap');
must(sheet, /function revealSectionPhotosCascade\(\)[\s\S]*?photoStack\.classList\.remove\('section-photo-hidden'\)/, 'opaque incoming photos');
must(sheet, /\.sheet\.active \.page-content-fade,[\s\S]*?transition:none!important/, 'no page content fade');
must(sheet, /hyphens:auto/, 'Russian hyphenation support');
must(renderer, /loading="lazy" decoding="async"/, 'deferred image decoding');

console.log(JSON.stringify({
  status: 'pass',
  navigation: 'content swap without thumbnail fade',
  rebuild: 'content changes only',
  interface: 'start-screen auth, fitted paper, aligned map markers',
  designOrder: 'Современный first'
}, null, 2));
