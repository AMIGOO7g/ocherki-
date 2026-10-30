const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const shell = fs.readFileSync(path.join(root, 'shell.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engineSource = fs.readFileSync(path.join(root, 'book-renderer', 'book-engine.js'), 'utf8');
const fail = message => { throw new Error(message); };

if (!/class="hanging book-preview-control/.test(shell)) fail('Preview composition controls are not constructor hanging controls');
if (!/class="key book-preview-layout/.test(shell)) fail('Preview controls do not use constructor key faces');
if (!/document\.querySelectorAll\('\.book-preview-layout-hanger \.book-preview-control'\)\.forEach\(bind\)/.test(shell)) fail('Preview pendulum is not bound to the hanging control');
if (!/book-preview-layout-hanger::before\{display:none!important;content:none!important\}/.test(shell)) fail('Shared vertical separator is still present between preview icons');
if (!/book-preview-control::before[\s\S]*height:100vh/.test(shell)) fail('Preview threads do not reach the screen edge');
if (!/id="startAuthKey"|enableStartAuthSwing/.test(index) || /id="authBtn"|auth-hanging|auth-label/.test(shell)) fail('Authorization must be a responsive start-screen control only');
if (!/start-auth-key__pendulum\.lb-hanging-icon:hover/.test(index) || !/start-auth-gate__caption[\s\S]*color:#3b2a20/.test(index) || !/start-auth-gate__caption[\s\S]*text-shadow:none/.test(index) || !/start-auth-gate__caption[\s\S]*background:transparent/.test(index) || !/start-auth-gate__caption[\s\S]*padding:0/.test(index) || !/начать книгу/.test(index)) fail('Start authorization hover or caption contrast is missing');
if (!/enableStartAuthSwing[\s\S]*maxAngle=\.22[\s\S]*pushForce=\.025/.test(index) || !/enableStartAuthSwing[\s\S]*kick\(\.014\)/.test(index) || !/enableStartAuthSwing[\s\S]*Math\.abs\(dx\)>24/.test(index)) fail('Start authorization pendulum is still too strong');
if (/bd-render-parity/.test(shell) || !/const inner=renderBookPage\(p,side\)/.test(shell) || !/page-canvas-host" data-source/.test(shell)) fail('Thumbnails no longer use the v33 page-canvas text renderer');
if (!/\.book-design-shell \.bd-head h2[\s\S]*color:#f4e9d8!important/.test(shell)) fail('Right panel headings are not light');
if (!/function spreadPhotoRef\(/.test(shell) || !/dataset\.previewBound/.test(shell)) fail('Preview composition/navigation state is not rebound after modal lookup');
if (!/previewCompositionLabel\(sp\)/.test(shell)) fail('Preview does not identify the active composition');
if (!/PREVIEW_COMPOSITION_CATALOG=Object\.freeze\(\[[\s\S]*photo-rail/.test(shell) || !/let previewCompositionOverride=null/.test(shell) || !/renderPreviewCompositionOverride/.test(shell) || !/const overrideId=previewCompositionOverride/.test(shell)) fail('Preview composition override is missing');
const catalogBlock = shell.match(/const PREVIEW_COMPOSITION_CATALOG=Object\.freeze\(\[([\s\S]*?)\]\);/);
const catalogIds = catalogBlock ? [...catalogBlock[1].matchAll(/\bid:'([^']+)'/g)].map(match => match[1]) : [];
if (catalogIds.length < 10 || new Set(catalogIds).size !== catalogIds.length) fail('Preview composition catalog must contain unique layouts');
if (!/previewPinnedTarget/.test(shell) || !/const target=previewPendingTarget\|\|previewPinnedTarget/.test(shell)) fail('Preview composition target is not pinned through rebuild');
if (!/maxAngle=\.22/.test(shell) || !/kick\(\.014\)/.test(shell) || !/Math\.abs\(dx\)>24/.test(shell)) fail('Preview pendulum impulse is still too strong');
if (!/book-preview-spread\.is-empty::after\{display:none!important\}/.test(shell) || !/book-preview-layout-hanger\.is-empty/.test(shell) || !/Создайте хотя бы одну главу/.test(shell)) fail('Empty preview still exposes book controls or spine');
if (!/v39-entry-empty-preview-map-clock/.test(shell) || !/top:calc\(50% \+ 78px\)/.test(shell)) fail('Entry clock travel is missing');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(engineSource, context);
const engine = context.window.OcherkiBookEngine;
const prose = count => Array.from({ length: count }, (_, index) => `Фрагмент ${index + 1} сохраняет семейную память и связывает время с сегодняшним днём.`).join(' ');
const photo = (id, width, height, layoutPreference = 'auto') => ({
  id, src: `data:image/jpeg;base64,${id}`, width, height, layoutPreference,
  caption: `Фото ${id}`, year: '1971', place: 'Семейный архив'
});
const pages = Array.from({ length: 8 }, (_, index) => ({
  uid: `page-${index}`, type: 'chapter', title: 'Глава 1. Дом', episode: `Эпизод ${index + 1}`,
  userEdited: true, text: prose(260), photos: [photo(`photo-${index}`, index % 3 === 0 ? 2200 : 1200, index % 3 === 0 ? 1400 : 1800)]
}));
const result = engine.assemble({ sections: [{ id: 'chapter-1', type: 'chapter', title: 'Глава 1. Дом', included: true, pages }] }, { title: 'Ритм' });
if (!result.ready) fail('Deterministic rhythm did not assemble');
const opener = result.spreads[0];
if (opener.left?.layout !== 'chapter-photo' || opener.right?.layout !== 'chapter-intro') fail('Chapter opener is not photo/quote left and title/text right');
if (!result.spreads.some(spread => spread.master === 'D01-SPREAD-DARK-GRADIENT-PHOTO')) fail('Planned dark gradient spread is still missing');
if (result.spreads.some((spread, index) => index && spread.master === result.spreads[index - 1].master && /PHOTO|GRADIENT|MOSAIC|TRIPTYCH|DUO|RAIL/.test(spread.master))) fail('Automatic visual composition repeats without a pause');

const threePhoto = engine.assemble({ sections: [{ id: 'chapter-3', type: 'chapter', title: 'Глава 3. Три кадра', included: true, pages: [{
  uid: 'three', type: 'chapter', title: 'Глава 3. Три кадра', userEdited: true, text: prose(180),
  photos: [photo('a', 1200, 1800), photo('b', 1800, 1200), photo('c', 1200, 1800)]
}] }] }, { title: 'Три кадра' });
if (!threePhoto.spreads.some(spread => spread.master === 'D01-SPREAD-THREE-PHOTO')) fail('Three photos do not resolve to a stable triptych');

console.log(JSON.stringify({ status: 'pass', opener: 'photo-left/text-right', darkGradient: true, triptychByCount: true, previewControls: true, authPendulum: true }, null, 2));
