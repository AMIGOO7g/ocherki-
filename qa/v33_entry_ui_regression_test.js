const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const rendererCss=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const fail=message=>{throw new Error(message)};

if(!/id="v35-auth-gate-state"/.test(shell)||!/window\.__OCHERKI_AUTH_GATE_PENDING\s*=\s*false/.test(shell))fail('constructor auth gate was not disabled');
if(!/if\(!embedded && !window\.__OCHERKI_AUTH_GATE_PENDING\)startBootSequence\(\);/.test(shell))fail('constructor boot release hook is missing');
if(!/вернёмся во времени(?: назад)?\?/.test(shell)||!/Вернёмся во времени назад\?/.test(index))fail('startup caption was not updated');
if(!/\.master-clock \.pendulum\{left:76px!important;top:34px!important;/.test(shell))fail('pendulum is not aligned with the hand axis');
if(!/\.book-design-shell \.bd-design-card::before,.book-design-shell \.bd-design-card::after,[\s\S]*?display:none!important;content:none!important/.test(shell))fail('design-card threads are still visible');
if(!/shell\.is-night \.book-design-shell \.bd-format-shape\{border-color:rgba\(255,255,255,\.84\)!important\}/.test(shell))fail('night format-card contrast is missing');
if(/id="photoLayoutField"/.test(sheet)||/id="photoLayoutPreference"/.test(sheet))fail('composition dropdown still lives in the photo card');
if(!/id="bookPreviewLayout"/.test(shell)||!/id="bookPreviewLayoutPrev"/.test(shell)||!/id="bookPreviewLayoutNext"/.test(shell))fail('bidirectional preview composition controls are missing');
const catalogBlock=shell.match(/const PREVIEW_COMPOSITION_CATALOG=Object\.freeze\(\[([\s\S]*?)\]\);/);
const catalogIds=catalogBlock?[...catalogBlock[1].matchAll(/\{id:'([^']+)'/g)].map(match=>match[1]):[];
if(catalogIds.length!==20||!catalogIds.includes('dark-gradient-photo')||!catalogIds.includes('dark-fade-2.2')||!catalogIds.includes('ctx-detail-sq')||!catalogIds.includes('spread')||!catalogIds.includes('photo-rail'))fail('manual composition catalog is incomplete');
if(/id="paperAirplane"/.test(index)||/setAirplaneFlight/.test(index)||/movePaperAirplane/.test(index))fail('paper airplane should be removed from onboarding');
if(!/class="lb-start is-preauth"/.test(index)||!/start-auth-key__pendulum lb-hanging-icon/.test(index))fail('start auth sequence is not hanging/pre-auth');
if(!/setTimeout\(\(\) => \{\s*if \(!isSkipped\) showStartAuth\(\);\s*\}, 1050\)/.test(index))fail('auth does not appear after the light');
if(!/id="bookRhythmWarning"/.test(shell)||!/rhythmViolations/.test(shell))fail('rhythm warning is missing');
if(!/previewPendingTarget/.test(shell)||!/function pageCanvasHost/.test(shell))fail('preview target/parity host is missing');
if(!/LifeBookPhotoVision/.test(sheet)||!/analyzePhotoInBackground/.test(sheet))fail('background photo recognition is missing');
if(!/-webkit-hyphens:auto!important/.test(rendererCss)||!/hyphenate-character:"-"!important/.test(rendererCss)||/\[data-manuscript\][^{}]*\{[^}]*hyphens:none!important/.test(rendererCss))fail('Russian hyphenation contract regressed');

console.log(JSON.stringify({
  status:'pass',
  auth:'start-screen gate before the six steps; shell gate disabled',
  startupCaption:'вернёмся во времени назад?',
  airplane:'removed from onboarding',
  pendulum:'aligned to central hand axis',
  cardThreads:'removed',
  nightContrast:'white labels and format outlines',
  russianHyphenation:'auto inside lines; whole words at page boundaries'
},null,2));
