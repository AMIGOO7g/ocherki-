// State isolation and async cancellation. Does not simulate DOM geometry.
const assert=require('node:assert/strict');require('../test-mode-state.js');
const {TestSession,snapshot}=globalThis.OcherkiTestMode;
const raw='  Ёлка\tи e\u0301 🏒.\r\n\nСледующая\u00a0строка.  ';
const source={structure:{sections:[{type:'chapter',pages:[{text:raw,photos:[{src:'data:image/png;base64,AAA',caption:'Подпись'}]}]}]},format:'portrait',meta:{title:'Книга'}};
const frozen=JSON.stringify(source),view=label=>({label,spreads:[{},{},{}]});let calls=[],pending=[];
const session=new TestSession((structure,meta)=>{calls.push({structure,meta});return new Promise((resolve,reject)=>pending.push({resolve,reject}));});
(async()=>{
 const load=session.loadSource(source);assert(session.busy);pending.shift().resolve(view('baseline'));await load;session.move(2);assert.equal(session.index,2);
 session.draft.text=raw;session.draft.photos=[{src:'blob:photo',caption:'Тест'}];const apply=session.apply(),sent=calls.at(-1);
 assert.equal(sent.structure.sections[0].pages[0].text,raw);assert.equal(sent.meta.composition,undefined);session.draft.photos[0].caption='Позднее';assert.equal(sent.structure.sections[0].pages[0].photos[0].caption,'Тест');
 pending.shift().resolve(view('test'));await apply;assert(session.testing);assert.equal(session.index,0);
 const fail=session.apply();pending.shift().reject(Error('ACCENT_UNFIT'));await fail;assert.equal(session.view.label,'test');assert.equal(session.error,'ACCENT_UNFIT');assert(!session.busy);
 const stale=session.apply();session.clear();pending.shift().resolve(view('stale'));await stale;assert.equal(session.view.label,'baseline');assert.equal(session.index,2);assert.equal(session.draft.text,'');assert.equal(session.draft.photos.length,0);assert(!session.testing);
 session.draft.photos=[{src:'blob:only-photo'}];const photo=session.apply();pending.shift().resolve(view('photo'));await photo;assert.equal(calls.at(-1).structure.sections[0].pages[0].text,'');
 session.draft.text=raw;const first=session.apply(),a=pending.shift(),second=session.apply(),b=pending.shift();b.resolve(view('newer'));await second;a.reject(Error('older'));await first;assert.equal(session.view.label,'newer');assert.equal(session.error,'');
 const badLoad=session.loadSource(source);pending.shift().reject(Error('broken source'));await badLoad;assert.equal(session.view.label,'newer');assert.equal(session.baseline.label,'baseline');assert.equal(JSON.stringify(source),frozen);assert.notEqual(session.source.structure,source.structure);
 assert.throws(()=>snapshot({sections:[{pages:[{text:17}]}]}),/карточка/);assert.throws(()=>snapshot({sections:[{}]}),/раздел/);session.clear();const count=calls.length;await session.apply();assert.equal(calls.length,count);assert(session.error);
 console.log(JSON.stringify({status:'pass',exactDraft:true,inputUnchanged:true,clearRestoresView:true,staleResultIgnored:true,errorIsolation:true,browserGeometry:'not executed'}));
})().catch(error=>{console.error(error);process.exitCode=1;});
