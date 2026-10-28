// Parse actual renderer output; this verifies text serialization, not layout.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {execFileSync}=require('child_process');
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../book-renderer/design-pack-01.js'),'utf8'),ctx);
const renderer=ctx.window.OcherkiBookRenderer;
const raw='  Ёлка\t<&> "e\u0301" 🏒\r\nНовая\n\nстрока\u00a0.  ';
const fixtures=[];
for(const mode of ['chapter','inline-quote','margin','important','important-margin']){
 for(const side of ['left','right']){
  const quote=mode==='inline-quote',important=mode.includes('important'),margin=mode.includes('margin');
  const cells=(quote?[0,1,2]:[0,1]).map(i=>`${i}${raw}`);
  const inlineRanges=important?cells.map(text=>[{start:1,end:Math.min(text.length,8),editable:true}]):cells.map(()=>[]);
  const page={kind:'text',master:'D01-TEXT',rhythm:mode,quoteColumn:side,layout:mode==='chapter'?'chapter-intro':'prose-dense',text:'',marginNote:raw,importantLine:raw,inlineQuote:raw,measuredFlow:{mode,quoteColumn:side,cells,cellBreaks:cells.map(()=>[3]),inlineRanges,accentBreaks:{},promoted:{},accentOverflow:{},geometry:{origin:86,height:810}}};
  fixtures.push({mode,side,expected:cells.join(''),html:renderer.renderPage(page,side,{})});
 }
}
const parser=String.raw`
import sys,json
from html.parser import HTMLParser
class Stream(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.stack=[];self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag in ('br','img','meta','link','hr','input','source','wbr'):return
  self.stack.append('data-source-stream' in dict(attrs) or any(self.stack))
 def handle_endtag(self,tag):
  if self.stack:self.stack.pop()
 def handle_data(self,data):
  if any(self.stack):self.parts.append(data)
out=[]
for fixture in json.load(sys.stdin):
 parser=Stream();parser.feed(fixture['html'])
 out.append(''.join(parser.parts)==fixture['expected'])
print(json.dumps(out))
`;
const checks=JSON.parse(execFileSync('python3',['-c',parser],{input:JSON.stringify(fixtures),encoding:'utf8'}));
assert(checks.every(Boolean),JSON.stringify(checks));
console.log(JSON.stringify({status:'pass',checks:checks.length,exactRenderedCharacters:true,allRolesBothSides:true,browserGeometry:'not executed'},null,2));
