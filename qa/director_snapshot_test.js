// The director's fingerprint: a rich book (chapters, episodes, photographs with a hero portrait, a document) is assembled and
// what the director chose — spreads, masters, page roles, words — is compared with the saved fingerprint. Any change in the
// director's choices shows here before a build goes out. To accept a change on purpose: node qa/director_snapshot_test.js --update
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const words=(n,s)=>Array.from({length:n},(_,i)=>`${s} ${i+1} хранит голос семьи, запах дома и свет того лета.`).join(' ');
const ph=(id,w=1200,h=1600,extra={})=>Object.assign({id,src:`data:image/jpeg;base64,${id}`,width:w,height:h,layoutPreference:'auto',caption:'Подпись '+id,year:'1962',place:'Тула',people:'Анна',story:''},extra);
const pg=(uid,ep,text,photos=[],extra={})=>Object.assign({uid,type:'chapter',title:ep,episode:ep,included:true,userEdited:true,text,photos},extra);
const book={sections:[
  {id:'ch1',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
    pg('a','Эпизод 1. Первые воспоминания',words(120,'Строка'),[ph('hero',1200,1600,{portraitHero:true,heroYears:'1901 – 1982',heroRole:'Хранительница дома',people:'Анна Петровна'})]),
    pg('b','Эпизод 1. Первые воспоминания',words(260,'Абзац'),[ph('p2',2200,1500),ph('p3',1500,2100)]),
    pg('c','Эпизод 2. Лето у бабушки',words(180,'Запись'),[ph('p4',2000,1400,{story:words(6,'История')})],{isEpisodeStart:true,episodeWhen:'1960-е',episodeWhere:'у бабушки в деревне'}),
    pg('d','Эпизод 2. Лето у бабушки','Дорогая мама, пишу тебе из части.',[ph('doc',1400,2000,{isDocument:true,caption:'Письмо отца'})],{type:'document',bookRole:'document',title:'Письмо отца',explanation:'Письмо 1943 года'})]},
  {id:'ch2',type:'chapter',title:'Глава 2. Война',included:true,pages:[
    pg('e','Эпизод 1. Уход на фронт',words(400,'Рассказ'),[ph('p5',2200,1400),ph('p6',2100,1500),ph('p7',1300,1800)])]}]};
const res=engine.assemble(book,{title:'Отпечаток режиссёра',subtitle:'проверка'});
const snap=JSON.stringify({spreads:res.spreads.map(s=>s.master),pages:res.pages.map(p=>[p.role||p.layout||'',p.master||'',(p.title||'').slice(0,40),String(p.text||'').split(/\s+/).filter(Boolean).length,(p.photos||[]).map(x=>x&&x.id).join(',')])},null,1);
const file=path.join(__dirname,'director_snapshot.json');
if(process.argv.includes('--update')||!fs.existsSync(file)){fs.writeFileSync(file,snap);console.log('director fingerprint saved');process.exit(0);}
const old=fs.readFileSync(file,'utf8');
if(old!==snap){const a=old.split('\n'),b=snap.split('\n');const i=a.findIndex((x,k)=>x!==b[k]);throw new Error(`Director's choices changed at line ${i+1}:\n  was: ${a[i]}\n  now: ${b[i]}`);}
console.log('director fingerprint unchanged',res.spreads.length,'spreads');
