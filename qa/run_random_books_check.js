// Builds many random books (chapters, episodes, documents, photos of every
// shape and tone, both formats, all wizard profiles) and fails on any error.
// Usage: start a static server in the project root on PORT (default 8849),
// then `node qa/run_random_books_check.js [PORT] [SEED]`.
const {chromium}=require('playwright');
const PORT=process.argv[2]||'8849',SEED=Number(process.argv[3]||7);
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto(`http://127.0.0.1:${PORT}/qa/README.md`);
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><base href="http://127.0.0.1:${PORT}/qa/"><link rel="stylesheet" href="../book-renderer/fonts.css"><link rel="stylesheet" href="../book-renderer/design-pack-01.css"></head><body>
<script charset="utf-8" src="../book-renderer/geo-cities.js"></script><script charset="utf-8" src="../book-renderer/geo-atlas.js"></script><script charset="utf-8" src="../book-renderer/design-pack-01.js"></script><script charset="utf-8" src="../book-renderer/book-engine.js"></script><script charset="utf-8" src="../book-renderer/design-pack-01.layout.js"></script><script charset="utf-8" src="../book-renderer/layout-pagination-engine.js"></script></body></html>`,{waitUntil:'networkidle'});
const r=await p.evaluate(async(SEED)=>{await OcherkiLayoutPagination.readyFonts();
 let seed=SEED;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
 const pick=a=>a[Math.floor(rnd()*a.length)];
 const sentences=['Мама всегда оставляла свет в прихожей.','Дедушка помнил каждую дорогу домой.','В 1967 году семья переехала в Тбилиси, и всё изменилось!','Мы жили бедно, но весело.','Кто знает, что было бы, если бы не война?','Отец работал на заводе — от рассвета до заката.','Бабушка пекла хлеб по субботам, и запах держался в доме до вечера.','Да.','«Береги себя», — писала она в каждом письме.','Это было давно.'];
 const para=n=>Array.from({length:n},()=>pick(sentences)).join(' ');
 const text=n=>Array.from({length:n},()=>para(1+Math.floor(rnd()*7))).join(rnd()<.5?'\n\n':'\n');
 const names=['photo_man.jpg','photo_walk.jpg','photo_window.jpg','photo_city.jpg','photo_portrait.jpg','photo_double.jpg','photo_laundry.jpg','photo_camera.jpg'];
 const dims=[[900,1300],[1300,900],[1000,1000],[2000,1000],[1200,700],[700,1200],[0,0]];
 const photo=k=>{const d=pick(dims);return {id:'ph'+k+'_'+Math.floor(rnd()*1e6),src:'assets/'+pick(names)+'?'+k,width:d[0],height:d[1],caption:rnd()<.5?pick(['Подпись к фото','Иван','Мария Сергеевна']):'',year:rnd()<.5?String(1940+Math.floor(rnd()*80)):'',place:rnd()<.3?pick(['Москва','Карс','Тифлис']):'',story:rnd()<.4?para(2):'',colorKind:pick(['bw','color','']),portraitHero:rnd()<.08,heroName:'',peopleMarks:rnd()<.1?Array.from({length:1+Math.floor(rnd()*12)},(_,m)=>({x:rnd()*100,y:rnd()*100,name:rnd()<.85?'Имя '+m:''})):[]};};
 const fails=[];let ok=0;
 for(let t=0;t<60;t++){
  const chapters=Array.from({length:1+Math.floor(rnd()*3)},(_,c)=>{const pages=[];const np=1+Math.floor(rnd()*3);for(let i=0;i<np;i++){const kind=i>0&&rnd()<.25?'document':'chapter';pages.push({uid:`c${c}p${i}`,type:kind==='document'?'document':(i?'text':'chapter'),bookRole:kind==='document'?'document':undefined,title:'Глава '+(c+1),episode:i&&rnd()<.6?`Эпизод ${i+1}. Название эпизода номер ${i+1}`:'',isEpisodeStart:i>0&&rnd()<.6,continuation:rnd()<.1,text:rnd()<.08?'':text(Math.floor(rnd()*60)),explanation:kind==='document'?para(2):'',userEdited:true,photos:Array.from({length:Math.floor(rnd()*(rnd()<.3?12:4))},(_,k)=>photo(k))});}return {id:'ch'+c,type:'chapter',title:'Глава '+(c+1),included:true,pages};});
  const front=id=>({id,title:id,type:id,auto:true,included:true,pages:[{uid:id+'1',type:id,title:id,text:rnd()<.5?para(2):'',photos:id.includes('cover')?[photo(0)]:[]}]});
  const towns=['Карс','Тифлис','Москва','Ленинград','Ташкент','Крит, Греция','Деревня Ромашково','Хутор [47.1, 39.2]','Владикавказ','Прага','Новосибирск'];
  // Then/now pairs between photos of the same page.
  for(const chapter of chapters)for(const page of chapter.pages)if(page.photos&&page.photos.length>1&&rnd()<.3){const a=page.photos[0],b=page.photos[1];a.pairWith=b.id;b.pairWith=a.id;a.pairRole=pick(['then','now','']);}
  const timeline={id:'timeline',title:'Хронология',type:'timeline',included:true,pages:[{uid:'tl1',type:'timeline',title:'Хронология',text:Array.from({length:Math.floor(rnd()*9)},(_,i)=>`${pick(['','ок. ','до '])}${1850+i*15}${rnd()<.3?'–'+(1860+i*15):''} — ${pick(towns)} — ${rnd()<.7?para(1):''}`).join('\n')}]};
  const treeLines=[];let level=0;
  for(let i=0,n=Math.floor(rnd()*30);i<n;i++){level=Math.max(0,Math.min(level+pick([-1,0,1,1]),4));treeLines.push(`${'— '.repeat(level)}${pick(['+ ',''])}${pick(['Иван','Мария Сергеевна','Константин Евстафиади','Имя'])}${rnd()<.2?' *':''}${rnd()<.6?` (${1850+level*25}–${1900+level*25})`:''}${rnd()<.3?', Карс':''}${rnd()<.4?' + Анна':''}`);}
  const familyTree={id:'family-tree',title:'Семейное древо',type:'family-tree',included:true,pages:[{uid:'ft1',type:'family-tree',title:pick(['Семейное древо','Род Петровых']),text:treeLines.join(pick(['\n','\n\n']))}]};
  const voices={id:'voices',title:'Голоса семьи',type:'voices',included:true,pages:[{uid:'vc1',type:'voices',title:'Голоса семьи',text:Array.from({length:Math.floor(rnd()*14)},()=>para(1+Math.floor(rnd()*4))+(rnd()<.8?'\n— '+pick(['внучка Анна','сын','соседка тётя Валя']):'')).join(pick(['\n','\n\n']))}]};
  const recipes={id:'recipes',title:'Рецепты и традиции',type:'recipes',included:true,pages:Array.from({length:1+Math.floor(rnd()*2)},(_,k)=>({uid:'rc'+k,type:'recipes',title:'Рецепты',photos:rnd()<.5?[photo(90+k)]:[],text:Array.from({length:Math.floor(rnd()*4)},()=>'Название\n'+Array.from({length:Math.floor(rnd()*14)},()=>'— продукт').join('\n')+'\n'+para(1+Math.floor(rnd()*9))).join('\n***\n')}))};
  const interview={id:'interview',title:'Вопросы и ответы',type:'interview',included:true,pages:[{uid:'iv1',type:'interview',title:'Разговор',text:(rnd()<.5?para(2)+'\n':'')+Array.from({length:Math.floor(rnd()*12)},()=>'Как это было?\n'+text(1+Math.floor(rnd()*4))).join('\n')}]};
  const structure={sections:[front('cover'),front('endpaper'),front('title'),front('contents'),front('intro'),...chapters,timeline,familyTree,voices,recipes,interview,front('afterword'),front('thanks'),front('colophon'),front('back-endpaper'),front('back-cover')]};
  const meta={format:rnd()<.5?'square':'portrait',contentBalance:pick(['','Преимущественно текст','Преимущественно фото','Текст и фотографии']),bookPhotoMode:pick(['as-is','bw','era'])};
  try{const res=OcherkiLayoutPagination.build(structure,meta);if(res.ready===false&&!/Добавьте/.test(res.message||''))fails.push({t,msg:'not ready '+res.message});else ok++;
    for(const s of res.spreads||[])for(const k of ['left','right'])if(s[k])OcherkiLayoutPagination.renderPage(s[k],k,meta);
  }catch(e){fails.push({t,msg:String(e.message).slice(0,200),stack:String(e.stack).split('\n').slice(1,3).join(' | ')});}
 }
 return {ok,fails};},SEED);
console.log(JSON.stringify(r,null,1).slice(0,5000));await b.close();if(r.fails.length)process.exitCode=1;})();
