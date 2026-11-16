// The old V16 test asserted a three-step cycle, a top quote and word-count fallback.
// Those behaviours were explicitly replaced by the four existing measured roles.
require('./dom_pagination_contract_test');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const shell=require('./lib/page_source.js').readPage(root,'shell.html');
const sheet=require('./lib/page_source').readPage(root,'sheet_v35.html');
assert(/bindPreviewAccentEditors/.test(shell)&&/setEditorialAccent/.test(shell)&&/editorialOverrides/.test(shell));
assert(/a === 'setEditorialAccent'/.test(sheet)&&/editorialOverrides/.test(sheet));
console.log('Editorial edit/persistence bridge: pass (DOM geometry requires browser).');
