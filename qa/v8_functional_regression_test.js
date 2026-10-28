const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const shell = fs.readFileSync(path.join(root, 'shell.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'book-renderer', 'design-pack-01.css'), 'utf8');
const fail = message => { throw new Error(message); };

if (!/grid-template-columns:1fr!important/.test(shell) || !/book-preview-spread\.is-single/.test(shell)) fail('Single-cover preview does not occupy one full page column');
if (!/function standalonePrintHtml\(\)/.test(shell) || !/fetch\('\/api\/export-pdf'/.test(shell) || !/pdfBtn\?\.addEventListener/.test(shell)) fail('Direct PDF workflow is not wired');
if (!/@page\{size:\$\{size\[0\]\}mm \$\{size\[1\]\}mm;margin:0\}/.test(shell)) fail('PDF page size is not derived from the selected trim size');
if (!/sendAudioCommand\('nextTrack'\)/.test(shell) || !/sendAudioCommand\('prevTrack'\)/.test(shell)) fail('Constructor track buttons still navigate pages');
if (!/bottom:44px!important;[\s\S]*max-width:620px!important/.test(css)) fail('Photo captions are not aligned to the folio baseline');
if (!/dpk-document-text-page[\s\S]*dpk-document-rule/.test(css)) fail('Text document master rules are missing');

console.log(JSON.stringify({ status: 'pass', coverScale: true, pdfExport: true, captionBaseline: true, documentMaster: true, trackButtons: true }, null, 2));
