const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fail = message => { throw new Error(message); };
const sourcesMatch = html.match(/const musicPlaylistSources = \[([\s\S]*?)\];/);
if (!sourcesMatch) fail('Music playlist declaration is missing');
const sources = [...sourcesMatch[1].matchAll(/"([^"]+\.mp3)"/g)].map(match => match[1]);
if (sources.length !== 11) fail(`Expected 11 tracks, found ${sources.length}`);
sources.forEach(source => {
  if (!fs.existsSync(path.join(root, source))) fail(`Missing playlist file: ${source}`);
});
if (!/VINYL_BETWEEN_TRACKS_MS\s*=\s*3000/.test(html)) fail('Vinyl gap is not exactly 3000 ms');
if (!/track\.addEventListener\('ended',\s*scheduleNextTrack\)/.test(html)) fail('Next-track event is missing');
if (!/page:\s*new Audio\("assets\/audio\/page\.mp3"\)/.test(html)) fail('Paper sound is not independent');
if (!/audioTracks\.vinyl\.currentTime\s*=\s*0/.test(html)) fail('Vinyl is not restarted between melodies');
if (!/d\.action==='nextTrack'\) switchMusicTrack\(1\)/.test(html)) fail('Next-track command is not wired');
if (!/d\.action==='prevTrack'\) switchMusicTrack\(-1\)/.test(html)) fail('Previous-track command is not wired');
const manualSwitchMatch = html.match(/const switchMusicTrack = async delta => \{([\s\S]*?)\n      \};/);
if (!manualSwitchMatch || !/setTimeout\(async\(\)=>\{[\s\S]*?next\.play\(\)[\s\S]*?\},VINYL_BETWEEN_TRACKS_MS\)/.test(manualSwitchMatch[1])) {
  fail('Manual track switching must play vinyl for 3000 ms before the next melody');
}
console.log(JSON.stringify({ status: 'pass', tracks: sources.length, vinylGapMs: 3000, paperFxIndependent: true, manualTrackSwitching: 'vinyl-first' }, null, 2));
