const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const renderer=read('book-renderer/design-pack-01.js');
const css=read('book-renderer/design-pack-01.css');
const shell=read('shell.html');

assert(renderer.includes('<aside class="dpk-margin-note"><span class="${overflowClass(\'margin\').trim()}"${editorialAttrs(\'margin\')}>'),
  'margin editor must be attached to the full-length rotated span, not the narrow aside');
assert(!/<aside class="dpk-margin-note"\$\{editorialAttrs\('margin'\)\}/.test(renderer),
  'narrow margin container is still editable');
assert(/font:400 36px\/40px 'SignThatS'/.test(css),'larger Sign That S note style missing');
assert(/white-space:pre-wrap!important/.test(css),'two-line whitespace/wrapping is not preserved');
assert(renderer.includes('noteLeading=40')&&renderer.includes('noteDepth=noteLeading*noteMaxLines'),
  'renderer does not reserve exactly two larger note lines');
assert(shell.includes("const probe=document.createElement('div')")&&shell.includes('logicalWidth')&&shell.includes('transform:none'),
  'live editor still measures the transformed margin note');
assert(!/field\.scrollHeight<=field\.clientHeight/.test(shell),
  'live editor still rejects the second line from transformed client geometry');
console.log(JSON.stringify({status:'pass',editableTarget:'full-length-span',maxLines:2,font:'SignThatS 36/40'}));
