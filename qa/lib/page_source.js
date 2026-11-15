// v166 — the page as one text again: every app/ file that shell.html loads in place of an inline block
// (data-inline-from="style|script") is put back inline, exactly as it was. Static tests read pages through this.
const fs=require('fs'),path=require('path');
const MARK=/\/\*@block (\[.*?\])\*\//g;
function unrewrite(css){return css.replace(/url\(\s*(['"]?)\.\.\/\.\.\//g,'url($1');}
function inline(root,html){
  return html.replace(/<link rel="stylesheet" href="(app\/[^"?]+)(?:\?[^"]*)?" data-inline-from="style">|<script src="(app\/[^"?]+)(?:\?[^"]*)?" data-inline-from="script"><\/script>/g,(all,css,js)=>{
    const file=path.join(root,css||js);const text=fs.readFileSync(file,'utf8');
    const parts=[];let m,last=null;MARK.lastIndex=0;
    while((m=MARK.exec(text))){if(last)parts.push({meta:last.meta,body:text.slice(last.end,m.index)});last={meta:JSON.parse(m[1]),end:MARK.lastIndex};}
    if(last)parts.push({meta:last.meta,body:text.slice(last.end)});
    return parts.map((p,i)=>{let body=p.body;if(i<parts.length-1&&body.endsWith('\n'))body=body.slice(0,-1);
      const [attrs,sep]=p.meta;return css?`${sep}<style${attrs}>${unrewrite(body)}</style>`:`<script${attrs}>${body}</script>`;}).join('');});
}
function readPage(root,name){return inline(root,fs.readFileSync(path.join(root,name),'utf8'));}
module.exports={readPage,inline};
