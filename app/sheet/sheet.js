/*@block ["", ""]*/
// Marks the lowest visible sheet of the pile (it carries the night shadow).
// the long shadow lies under the lowest sheet of the pile (a sheet folding back under the open one no longer counts)
setInterval(()=>{const all=[...document.querySelectorAll('.sheet-stack .sheet')].filter(el=>el.offsetParent!==null&&getComputedStyle(el).display!=='none'&&!el.classList.contains('stack-hidden-for-section')&&!el._folding);const bottom=all[0];document.querySelectorAll('.sheet.is-pile-bottom').forEach(el=>{if(el!==bottom)el.classList.remove('is-pile-bottom');});bottom?.classList.add('is-pile-bottom');},400);

/*@block ["", ""]*/
window.LifeBookFlowEngine={
  mode:"word-flow-v1",
  measure(page){
    return {
      text:(page?.text||"").length,
      pageId:page?.id||null
    };
  }
};

const SAMPLE_PREFIX='ТЕКСТ-ОБРАЗЕЦ';
// Cover/title are multi-field pages: each line is its own independently
// click-to-edit field (title / subtitle / author), instead of one blob that
// clears entirely on the first click. FIELD_SKIP marks a position whose field
// was never filled in, so it round-trips through the plain-string `text`
// prop (used everywhere else) without losing which slot is which.
const FIELD_SKIP=' ';
const MULTI_FIELD_PLACEHOLDERS={
  // v255: the words the book used to print by itself are the author's too (stored after the old ones, so older books keep theirs)
  cover:['Название книги','Короткий подзаголовок','Имя автора','Нижняя подпись на обложке (необязательно)','Семейная хроника','Год (необязательно)'],
  'back-cover':['Текст на задней обложке','Нижняя подпись (необязательно)'],
  title:['Название книги','Подзаголовок книги','Имя автора','Семейная история','Город','Год','Очерки жизни'],
  dedication:['Текст посвящения','От кого (необязательно)'],
  epigraph:['Текст цитаты','Источник или автор (необязательно)'],
  colophon:['Составитель','Дизайн и вёрстка','Год издания','Место издания']
};
// v255: the fields in the order they stand on the page, and a quiet note above each saying what the line is
const MULTI_FIELD_ORDER={cover:[4,5,2,0,1,3],title:[2,3,0,1,4,5,6]};
const MULTI_FIELD_LABELS={
  cover:['Название','Подзаголовок','Автор — над названием, как в книгах','Подпись внизу обложки','Надпись вверху слева','Год — вверху справа'],
  'back-cover':['Текст задней обложки','Подпись внизу'],
  title:['Название','Подзаголовок','Автор — вверху титула','Надпись над названием','Город — внизу титула','Год издания','Шмуцтитул (страница слева) — надпись вверху'],
  dedication:['Посвящение','Подпись'],
  epigraph:['Цитата','Источник'],
  colophon:['Составитель','Дизайн и вёрстка','Год издания','Место издания']
};
function multiFieldOrder(t){const n=(MULTI_FIELD_PLACEHOLDERS[t]||[]).length;return MULTI_FIELD_ORDER[t]||Array.from({length:n},(_,i)=>i);}
function isMultiFieldPageType(t){ return Object.prototype.hasOwnProperty.call(MULTI_FIELD_PLACEHOLDERS,t); }
const initialParas=[
`История семьи чаще всего начинается не с громких событий, а с едва уловимых подробностей: с дороги, по которой когда-то шли пешком, с дома, где по вечерам зажигали лампу, с имени, которое в детстве звучало особенно тепло. Эти маленькие детали переживают годы и становятся тем, из чего складывается память рода.`,
`Говорят, что прошлое молчит. Но стоит открыть старый альбом, развернуть пожелтевшее письмо или вспомнить рассказ, услышанный за семейным столом, — и тишина постепенно наполняется голосами. В них слышатся забота, надежда, тревога, смелость и то простое человеческое достоинство, благодаря которому жизнь продолжалась даже в самые непростые времена.`,
`Эта книга может стать местом, где разрозненные воспоминания соединятся в одну историю. Здесь можно сохранить не только даты и имена, но и настроение эпохи: как пахло летом во дворе, каким голосом говорила бабушка, о чём мечтал отец, как выглядели улицы, по которым однажды прошли те, с кого началась ваша семейная линия.`,
`Пусть этот лист станет началом рассказа — спокойного, тёплого и внимательного к мелочам. Именно из таких мелочей и складывается память, которую хочется передать дальше.`
];


const AUTO_PAGE_SAMPLES={
  title:`Очерки жизни

История семьи

Составитель
2026`,
  dedication:`Эта книга посвящается тем,
кто сохранил для нас имена, лица и воспоминания.`,
  epigraph:`«Пока о человеке помнят,
его история продолжается».

— из семейных воспоминаний`,
  intro:`Здесь начинается история семьи. Этот лист можно редактировать так же, как обычную страницу книги.`,
  author:`Эта книга появилась из желания сохранить то, что обычно остаётся между строк: семейные рассказы, интонации, фотографии, письма и маленькие подробности, которые со временем становятся особенно дорогими.

Пусть эти страницы помогут услышать голоса тех, кто был до нас, и передать их дальше.`,
  afterword:`История не заканчивается на последней странице. Она продолжается в новых встречах, разговорах и воспоминаниях, которые однажды тоже станут частью семейной памяти.`,
  thanks:`Спасибо всем, кто делился воспоминаниями, находил старые фотографии и документы, уточнял даты и имена и помогал этой истории обрести форму.`,
  sources:`Семейный архив
Личные фотографии и письма
Устные воспоминания родственников
Документы из частных коллекций`,
  colophon:`Составитель: имя автора
Дизайн и вёрстка: Очерки жизни
Год издания: 2026
Место издания: —`,
  backCover:``
};

const sections=[
 {
  id:'cover',
  title:'Обложка',
  type:'cover',
  active:0,
  pages:[{type:'cover',title:'Обложка',episode:'',sample:true,text:'',photos:[],photoOffset:0,included:true}]
 },
 {
  id:'endpaper',
  title:'Форзац',
  type:'endpaper',
  active:0,
  pages:[{type:'endpaper',title:'Форзац',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'title',
  title:'Титульный лист',
  type:'title',
  active:0,
  pages:[{type:'title',title:'Титульный лист',episode:'',sample:true,text:'',photos:[],photoOffset:0}]
 },
 {
  id:'dedication',
  title:'Посвящение',
  type:'dedication',
  active:0,
  pages:[{type:'dedication',title:'Посвящение',episode:'',sample:true,text:'',photos:[],photoOffset:0}]
 },
 {
  id:'epigraph',
  title:'Эпиграф',
  type:'epigraph',
  active:0,
  pages:[{type:'epigraph',title:'Эпиграф',episode:'',sample:true,text:'',photos:[],photoOffset:0}]
 },
 {
  id:'contents',
  title:'Оглавление',
  type:'contents',
  active:0,
  pages:[{type:'contents',title:'Оглавление',episode:'',autoContents:true,text:'',photos:[],photoOffset:0}]
 },
 {
  id:'intro',
  title:'Вступление',
  type:'intro',
  active:0,
  pages:[{type:'intro',title:'Вступление',episode:'',sample:true,text:AUTO_PAGE_SAMPLES.intro,photos:[],photoOffset:0}]
 },
 {
  id:'author',
  title:'От автора',
  type:'text',
  auto:true,
  active:0,
  pages:[{type:'text',title:'От автора',episode:'',sample:true,text:AUTO_PAGE_SAMPLES.author,photos:[],photoOffset:0}]
 },
 {
  id:'chapter-1',
  title:'Глава 1. Начало',
  type:'chapter',
  active:0,
  pages:[{type:'chapter',title:'Глава 1. Начало',episode:'Эпизод 1. Первые воспоминания',sample:true,text:SAMPLE_PREFIX+'\n\n'+initialParas.join('\n\n'),photos:[],photoOffset:0,isEpisodeStart:true,included:true}]
 },
 {
  id:'timeline',
  title:'Хронология',
  type:'timeline',
  auto:true,
  active:0,
  pages:[{type:'timeline',title:'Хронология',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'family-tree',
  title:'Семейное древо',
  type:'family-tree',
  auto:true,
  active:0,
  pages:[{type:'family-tree',title:'Семейное древо',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'voices',
  title:'Голоса семьи',
  type:'voices',
  auto:true,
  active:0,
  pages:[{type:'voices',title:'Голоса семьи',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'recipes',
  title:'Рецепты и традиции',
  type:'recipes',
  auto:true,
  active:0,
  pages:[{type:'recipes',title:'Рецепты и традиции',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'interview',
  title:'Вопросы и ответы',
  type:'interview',
  auto:true,
  active:0,
  pages:[{type:'interview',title:'Вопросы и ответы',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'final',
  title:'Финальная страница',
  type:'text',
  auto:true,
  active:0,
  pages:[{type:'text',title:'Финальная страница',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'afterword',
  title:'Послесловие',
  type:'text',
  auto:true,
  active:0,
  pages:[{type:'text',title:'Послесловие',episode:'',sample:true,text:AUTO_PAGE_SAMPLES.afterword,photos:[],photoOffset:0}]
 },
 {
  id:'thanks',
  title:'Благодарности',
  type:'text',
  auto:true,
  active:0,
  pages:[{type:'text',title:'Благодарности',episode:'',sample:true,text:AUTO_PAGE_SAMPLES.thanks,photos:[],photoOffset:0}]
 },
 {
  id:'sources',
  title:'Источники и архив',
  type:'text',
  auto:true,
  active:0,
  pages:[{type:'text',title:'Источники и архив',episode:'',sample:true,text:AUTO_PAGE_SAMPLES.sources,photos:[],photoOffset:0}]
 },
 {
  id:'colophon',
  title:'Выходные данные',
  type:'colophon',
  auto:true,
  active:0,
  pages:[{type:'colophon',title:'Выходные данные',episode:'',sample:true,text:'',photos:[],photoOffset:0}]
 },
 {
  id:'back-endpaper',
  title:'Нахзац',
  type:'endpaper',
  auto:true,
  active:0,
  pages:[{type:'endpaper',title:'Нахзац',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'inside-back-cover',
  title:'Оборот задней обложки',
  type:'inside-back-cover',
  auto:true,
  active:0,
  pages:[{type:'inside-back-cover',title:'Оборот задней обложки',episode:'',text:'',photos:[],photoOffset:0}]
 },
 {
  id:'back-cover',
  title:'Задняя обложка',
  type:'back-cover',
  auto:true,
  active:0,
  pages:[{type:'back-cover',title:'Задняя обложка',episode:'',sample:true,text:'',photos:[],photoOffset:0}]
 }
];

const OPTIONAL_AUTO_IDS=new Set(['endpaper','title','dedication','epigraph','contents','intro','author','timeline','family-tree','voices','recipes','interview','final','afterword','thanks','sources','colophon','back-endpaper','inside-back-cover','back-cover']);
sections.forEach(s=>{
  // V10: complete book by default. Only genuinely optional matter can later
  // be switched off by the author; mandatory structure never gets a toggle.
  s.included=true;
  (s.pages||[]).forEach(page=>{ if(typeof page.included!=='boolean') page.included=s.included; });
});
let activeSection=0;
let fontSize=14, lineHeight=1.42, photoAnimating=false, photoSwitching=false;
// Tone is stored on each photo card. Keep this compatibility value for older
// parent shells, but do not expose a page-wide black-and-white switch.
let photoRenderMode='color';
let sectionAnimating=false, wheelAccum=0, wheelResetTimer=null;

const workspace=document.getElementById('workspace');
const editor=document.getElementById('editor');
const measureBox=document.getElementById('measureBox');
const wordCount=document.getElementById('wordCount');
const saveState=document.getElementById('saveState');
const activeSheet=document.getElementById('activeSheet');
const stackIndicator=document.getElementById('stackIndicator');
const photoStack=document.getElementById('photoStack');
const photoInput=document.getElementById('photoInput');
const photoReplaceInput=document.getElementById('photoReplaceInput');
const photoToneBtn=document.getElementById('photoToneBtn');
const pageNo=document.getElementById('pageNo');

// v53: book hierarchy model: chapter -> episodes -> physical pages
function normalizeBookHierarchy(){
  sections.forEach(sec=>{
    if(sec.type!=='chapter') return;
    sec.episodes = {};
    (sec.pages||[]).forEach((pg,idx)=>{
      const ep = pg.episode || 'Эпизод 1. Новый эпизод';
      if(!sec.episodes[ep]) sec.episodes[ep]={title:ep,pages:[]};
      sec.episodes[ep].pages.push({ref:pg,index:idx});
    });
  });
}
function getChapterEpisodes(sec){
  normalizeBookHierarchy();
  return Object.values(sec.episodes||{});
}

const chapterLabel=document.querySelector('.chapter');
const episodeRow=document.querySelector('.episode-row');
const episodeLabel=document.querySelector('.episode');
const addPhotoBtn=document.getElementById('addPhotoBtn');
const pageIncludeWrap=document.getElementById('pageIncludeWrap');
const pageIncludeState=document.getElementById('pageIncludeState');
const pageIncludeToggle=document.getElementById('pageIncludeToggle');

function syncEmbeddedSize(){
  try{
    if(window.parent && window.parent!==window){
      const r=window.parent.document.getElementById('editorPaperWrap')?.getBoundingClientRect();
      if(r){
        document.documentElement.style.setProperty('--sheetW',Math.round(r.width)+'px');
        document.documentElement.style.setProperty('--sheetH',Math.round(r.height)+'px');
        if(typeof updateMeasureStyle==='function') updateMeasureStyle();
      }
    }
  }catch(e){}
}
window.addEventListener('resize',syncEmbeddedSize);
syncEmbeddedSize();
try{
  const parentWrap=window.parent&&window.parent!==window?window.parent.document.getElementById('editorPaperWrap'):null;
  if(parentWrap&&window.ResizeObserver)new ResizeObserver(syncEmbeddedSize).observe(parentWrap);
}catch(_){ }

activeSheet.appendChild(pageNo);

function currentSection(){ return sections[activeSection]; }
function currentPages(){ return currentSection().pages; }
function currentPage(){ return currentPages()[currentSection().active]; }
function currentPageIndex(){ return currentSection().active; }

// A page turn may animate, but it must never leave the writing surface
// disabled after a late callback or a rapid sequence of turns.
let interactionWatchdog=0;
function armInteractionWatchdog(){
  clearTimeout(interactionWatchdog);
  interactionWatchdog=setTimeout(()=>{
    if(photoSwitching) photoSwitching=false;
    if(photoAnimating) photoAnimating=false;
    if(!sectionAnimating && !document.querySelector('.section-scroll-viewport')){
      activeSheet.classList.remove('is-setting-back','page-content-leaving');
      editor.style.pointerEvents='auto';
      editor.parentElement?.style.setProperty('pointer-events','auto');
    }
    if(sectionAnimating && !document.querySelector('.section-scroll-viewport')) sectionAnimating=false;
  },1400);
}
function recoverEditorInteraction(){
  if(!currentSection() || !currentPage()) return false;
  if(!sectionAnimating){
    activeSheet.classList.remove('is-setting-back','page-content-leaving');
    editor.style.pointerEvents='auto';
    editor.parentElement?.style.setProperty('pointer-events','auto');
  }
  armInteractionWatchdog();
  return true;
}
function currentPhotos(){
 const p=currentPage();
 if(!p) return [];
 if(!Array.isArray(p.photos)) p.photos=[];
 p.photos=p.photos.map((x,index)=>{
   if(typeof x==='string') return {id:`photo_${p.uid||'page'}_${index}`,src:x,status:'uploaded'};
   const photo=(x&&typeof x==='object')?x:{src:'',status:'uploaded'};
   if(!photo.id) photo.id=`photo_${p.uid||'page'}_${index}`;
   if(!photo.status) photo.status='uploaded';
   return photo;
 });
 return p.photos;
}

// Lightweight, asynchronous photo recognition.  It records only visual
// signals that are useful to the director (orientation, brightness, contrast
// and monochrome), so analysis never blocks upload, pagination or page turns.
// The actual subject/face recognition can be added behind this same contract
// later without changing the editor data model.
window.LifeBookPhotoVision = window.LifeBookPhotoVision || {
  analyze(photo){
    if(!photo || !photo.src || typeof Image === 'undefined') return Promise.resolve(photo?.inferred || {});
    return new Promise(resolve=>{
      const image=new Image();
      let settled=false;
      const done=value=>{ if(!settled){settled=true;resolve(value||photo.inferred||{});} };
      image.onload=()=>{
        const width=Number(image.naturalWidth||photo.width||0);
        const height=Number(image.naturalHeight||photo.height||0);
        try{
          const canvas=document.createElement('canvas');
          const size=48;
          canvas.width=size; canvas.height=size;
          const context=canvas.getContext('2d',{willReadFrequently:true});
          if(!context) return done(photo.inferred||{});
          context.drawImage(image,0,0,size,size);
          const pixels=context.getImageData(0,0,size,size).data;
          let count=0,sum=0,sumSq=0,saturation=0;
          for(let i=0;i<pixels.length;i+=4){
            if(pixels[i+3]===0) continue;
            const r=pixels[i]/255,g=pixels[i+1]/255,b=pixels[i+2]/255;
            const luminance=.2126*r+.7152*g+.0722*b;
            sum+=luminance; sumSq+=luminance*luminance;
            saturation+=(Math.max(r,g,b)-Math.min(r,g,b)); count++;
          }
          const brightness=count?sum/count:.5;
          const variance=count?Math.max(0,sumSq/count-brightness*brightness):0;
          const spread=count?saturation/count:0;
          const orientation=width>height?'landscape':height>width?'portrait':'square';
          photo.inferred={
            version:1,
            source:'client-pixels',
            orientation,
            aspect:width&&height?Number((width/height).toFixed(3)):0,
            tone:brightness<.38?'dark':'light',
            contrast:variance>.025?'high':'soft',
            monochrome:spread<.075,
            brightness:Number(brightness.toFixed(3)),
            saturation:Number(spread.toFixed(3)),
            analyzedAt:Date.now()
          };
          done(photo.inferred);
        }catch(_){ done(photo.inferred||{}); }
      };
      image.onerror=()=>done(photo.inferred||{});
      image.src=photo.src;
    });
  }
};
// Black-and-white or colour, measured from the pixels once: the book uses it
// to keep colour and monochrome photographs off the same spread.
function detectPhotoColorKind(photo){
  return new Promise(resolve=>{
    if(!photo?.src||(photo.colorKind&&photo.edgeTone)){resolve(photo);return;}
    const img=new Image();
    img.onload=()=>{
      try{
        const c=document.createElement('canvas');c.width=48;c.height=48;
        const g=c.getContext('2d');g.drawImage(img,0,0,48,48);
        const d=g.getImageData(0,0,48,48).data;let chroma=0;
        for(let i=0;i<d.length;i+=4)chroma+=Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]);
        // Sepia and toned prints have a weak, uniform chroma: still "monochrome".
        photo.colorKind=chroma/(d.length/4)/255<.075?'bw':'color';
        // Brightness of the frame's edges and of its right part: a dark
        // template lets only a photograph that is already dark there fade
        // into the black page (a light studio background turns grey).
        const lum=i=>(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255;
        let edge=0,edgeN=0,right=0,rightN=0;
        for(let y=0;y<48;y++)for(let x=0;x<48;x++){const i=(y*48+x)*4;if(x<6||x>41||y<6||y>41){edge+=lum(i);edgeN++;}if(x>=30){right+=lum(i);rightN++;}}
        const tone=v=>v<.32?'dark':v>.55?'light':'mid';
        photo.edgeTone=tone(edge/edgeN);photo.rightTone=tone(right/rightN);
      }catch(_){}
      resolve(photo);
    };
    img.onerror=()=>resolve(photo);
    img.src=photo.src;
  });
}
// Photographs saved before this measurement existed are measured once after load.
setTimeout(()=>{
  const all=[];try{sections.forEach(sec=>(sec.pages||[]).forEach(page=>(page.photos||[]).forEach(photo=>{if(photo&&(!photo.colorKind||!photo.edgeTone))all.push(photo);})));}catch(_){}
  if(all.length)Promise.all(all.map(detectPhotoColorKind)).then(()=>window.__OCHERKI_EMIT_STRUCTURE?.());
},1800);
function analyzePhotoInBackground(photo){
  detectPhotoColorKind(photo).then(()=>window.__OCHERKI_EMIT_STRUCTURE?.());
  return window.LifeBookPhotoVision.analyze(photo).then(()=>{
    // Recognition is metadata only at this stage.  Do not rebuild the whole
    // book while the user is turning pages; the next director pass can use
    // the emitted visual signals without introducing a loading pause.
    window.__OCHERKI_EMIT_STRUCTURE?.();
    return photo;
  });
}
function updatePhotoStatus(photo){
 if(!photo)return;
 photo.status = photo.src ? (photo.caption||photo.year||photo.place||photo.people||photo.source||photo.story ? 'described':'uploaded') : 'uploaded';
 if(photo.caption && photo.people && (photo.story||photo.source)) photo.status='ready';
}
function photoStatusLabel(photo){
 const s=photo?.status||'uploaded';
 return {uploaded:'загружено',described:'описано',ready:'готово',placed:'размещено'}[s]||'загружено';
}
function optionalAuto(){return OPTIONAL_AUTO_IDS.has(currentSection().id);}
function includeToggleSvg(included){return included ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 18.2h9.1a4.1 4.1 0 0 0 .8-8.1A6 6 0 0 0 6 8.1a4.2 4.2 0 0 0 1.5 10.1Z"/><path d="M9 12h6" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 18.2h9.1a4.1 4.1 0 0 0 .8-8.1A6 6 0 0 0 6 8.1a4.2 4.2 0 0 0 1.5 10.1Z"/><path d="M12 9v6M9 12h6" stroke-linecap="round"/></svg>'; }


const ghostEls=[
  {el:document.getElementById('ghost1'),no:document.getElementById('ghost1No'),offset:1},
  {el:document.getElementById('ghost2'),no:document.getElementById('ghost2No'),offset:2},
  {el:document.getElementById('ghost3'),no:document.getElementById('ghost3No'),offset:3}
];

function esc(s){return String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function renderTextBlocks(text){
  const blocks=String(text||'').split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);
  if(!blocks.length)return '<p><br></p>';
  return blocks.map(b=>{
    if(b.startsWith('[ЦИТАТА]')){
      return `<p class="lb-text-block quote">${esc(b.replace('[ЦИТАТА]','').trim())}</p>`;
    }
    if(b.startsWith('[ПОДПИСЬ]')){
      return `<p class="lb-text-block caption">${esc(b.replace('[ПОДПИСЬ]','').trim())}</p>`;
    }
    return `<p>${esc(b)}</p>`;
  }).join('');
}

function emptyPageHint(){
  return '<p class="sample-lead">Начните писать историю...</p>';
}
function htmlFromText(t){
  const raw=String(t||'');
  const page=currentPage?.();
  const pageType=page?.type;
  if(isMultiFieldPageType(pageType)){
    // Each line is its own field (title / subtitle / author). A field that was
    // never filled in (or was cleared back to nothing) keeps its own
    // placeholder, independent of the other lines — clicking one field does
    // not touch the others.
    const placeholders=MULTI_FIELD_PLACEHOLDERS[pageType]||[];
    const rawParts=raw.split(/\n{2,}/);
    const labels=MULTI_FIELD_LABELS[pageType]||[];
    return multiFieldOrder(pageType).map(i=>{
      const ph=placeholders[i];
      const val=rawParts[i];
      const filled=val!==undefined && val!==FIELD_SKIP && val.trim()!=='';
      const at=` data-i="${i}"${labels[i]?` data-label="${esc(labels[i])}"`:''}`;
      if(!filled){
        const kind=i===0?'lead':'body';
        return `<p class="sample-${kind}" data-sample="${kind}"${at}>${esc(ph)}</p>`;
      }
      return `<p${at}>${esc(val.trim())}</p>`;
    }).join('');
  }
  // The family sections are read line by line: every line is its own paragraph.
  const parts=raw.split(['recipes','voices','interview','timeline'].includes(pageType)?/\n+/:/\n{2,}/).map(x=>x.trim()).filter(Boolean);
  if(!parts.length)return '<p><br></p>';
  const isSample=page?.sample===true || parts[0]===SAMPLE_PREFIX;
  return parts.map((p,i)=>{
    if(isSample && i===0)return `<p class="sample-lead" data-sample="lead">${esc(p)}</p>`;
    if(isSample)return `<p class="sample-body" data-sample="body">${esc(p)}</p>`;
    return `<p>${esc(p)}</p>`;
  }).join('');
}


function buildBookPageIndex(){
  const result=[];
  let pageNo=1;
  sections.forEach(sec=>{
    if(sec.included===false)return;
    (sec.pages||[]).forEach((page,i)=>{
      if(page.included===false)return;
      result.push({
        section:sec,
        page,
        number:pageNo++
      });
    });
  });
  return result;
}
function buildAutoContents(){
  const index=buildBookPageIndex();
  const rows=[];
  const hidden=['cover','endpaper','title','dedication','epigraph','contents','colophon','back-cover'];
  const seenSections=new Set();

  const firstPageNumberFor=(sec,page)=>{
    const found=index.find(x=>x.section===sec && x.page===page);
    return found?found.number:null;
  };

  index.forEach(item=>{
    const sec=item.section;
    if(!sec || hidden.includes(sec.id) || seenSections.has(sec.id)) return;

    if(sec.type==='chapter'){
      seenSections.add(sec.id);

      // Chapter appears once, at the first physical page of the chapter.
      rows.push({
        kind:'chapter',
        title:sec.title||item.page?.title||'Глава',
        page:item.number
      });

      // Episode is a semantic unit: several physical pages can belong to it,
      // but the contents must show the episode only once, using its first page.
      const seenEpisodes=new Set();
      (sec.pages||[]).forEach(pg=>{
        const episodeTitle=String(pg.episode||'').trim();
        if(!episodeTitle || seenEpisodes.has(episodeTitle)) return;
        seenEpisodes.add(episodeTitle);

        rows.push({
          kind:'episode',
          title:episodeTitle,
          page:firstPageNumberFor(sec,pg) ?? item.number
        });
      });

    } else if(['intro','author','afterword','thanks','sources'].includes(sec.id)){
      seenSections.add(sec.id);
      rows.push({
        kind:'section',
        title:sec.title||item.page?.title||'Раздел',
        page:item.number
      });
    }
  });

  return rows;
}
function autoContentsHtml(){
  const rows=buildAutoContents();
  if(!rows.length)return '<div class="contents-list"><div class="contents-row"><span class="contents-title">Добавьте главы — оглавление соберётся автоматически</span><span class="contents-page-no"></span></div></div>';
  return '<div class="contents-list">'+rows.map(r=>`<div class="contents-row contents-${r.kind}"><span class="contents-title">${esc(r.title)}</span><span class="contents-dots"></span><span class="contents-page-no">${r.page}</span></div>`).join('')+'</div>';
}

function contentsHtml(t){
  const lines=String(t||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
  if(!lines.length)return '<div class="contents-list"><div class="contents-row"><span class="contents-title">Глава</span><span class="contents-page-no">1</span></div></div>';
  return '<div class="contents-list">'+lines.map(line=>{
    const m=line.match(/^(.*?)(?:\.{2,}|\s{2,})(\d+)\s*$/);
    const title=m?m[1].trim():line.replace(/\s+\d+\s*$/,'').trim();
    const no=m?m[2]:(line.match(/(\d+)\s*$/)?.[1]||'');
    return `<div class="contents-row"><span class="contents-title">${esc(title)}</span><span class="contents-dots"></span><span class="contents-page-no">${esc(no)}</span></div>`;
  }).join('')+'</div>';
}
function syncSemanticHtml(page){
  if(!page) return;
  const hasSemantic=!!editor.querySelector('.semantic-inline');
  page.semanticHtml=hasSemantic ? editor.innerHTML : '';
}

// The family sections are filled in through simple forms; the form writes
// the page text itself, so the hidden editor never overwrites it.
function pageUsesForm(page){return ['recipes','voices','interview','timeline'].includes(page?.type)&&!page?.freeText;}
function textFromEditor(){
  if(pageUsesForm(currentPage()))return String(currentPage()?.text||'');
  if(isMultiFieldPageType(editor.dataset.pageType)){
    // each line goes back to its own place (the page shows them in another order than they are kept)
    const t0=editor.dataset.pageType,order=multiFieldOrder(t0),out=order.map(()=>FIELD_SKIP);
    [...editor.querySelectorAll('p')].forEach((p,j)=>{
      const i=p.dataset.i!==undefined&&p.dataset.i!==''?+p.dataset.i:order[j];if(!(i>=0&&i<out.length))return;
      if(p.hasAttribute('data-sample')) return;
      const t=p.innerText.replace(/\n+/g,' ').trim();
      if(t)out[i]=t;
    });
    return out.join('\n\n');
  }
  if(editor.dataset.pageType==='contents'){
    const cp=currentPage();
    if(cp?.autoContents)return cp.text||'';
    const rows=[...editor.querySelectorAll('.contents-row')];
    if(rows.length)return rows.map(r=>{
      const title=(r.querySelector('.contents-title')?.innerText||'').trim();
      const no=(r.querySelector('.contents-page-no')?.innerText||'').trim();
      return title+(no?' ................................ '+no:'');
    }).filter(Boolean).join('\n');
  }
  if(window.OcherkiEditorSourceBridge) return window.OcherkiEditorSourceBridge.semanticText(editor);
  const blocks=[...editor.children].map(node=>String(node.textContent||'').replace(/\u00ad/g,'').trim()).filter(Boolean);
  if(blocks.length) return blocks.join('\n\n');
  return String(editor.textContent||'').replace(/\u00ad/g,'').trim();
}
function updateMeasureStyle(){
  editor.style.fontSize=fontSize+'px';
  // v256: the pages with a size of their own (cover, title, dedication…) grow with «Аа» too, in the same measure
  document.documentElement.style.setProperty('--fzk',(fontSize/14).toFixed(3));
  editor.style.lineHeight=lineHeight;
  if(window.OcherkiEditorSourceBridge) window.OcherkiEditorSourceBridge.syncMeasureBox(editor,measureBox);
  else{
    measureBox.style.fontSize=fontSize+'px';
    measureBox.style.lineHeight=lineHeight;
    measureBox.style.width=editor.getBoundingClientRect().width+'px';
  }
}
function editorShowsSample(){
  const p=currentPage();
  return !!p && (p.sample===true || String(p.text||'').startsWith(SAMPLE_PREFIX));
}
function clearSampleTextIfNeeded(){
  if(!editorShowsSample())return false;
  const p=currentPage();
  p.sample=false;
  p.text='';
  editor.innerHTML='<p><br></p>';
  updateCount();
  return true;
}
function tokenise(text){
  return (text||'')
    .replace(/\n{2,}/g,' ¶ ')
    .trim()
    .split(/(\s+)/)
    .filter(Boolean);
}
function untokenise(tokens){
  return tokens.join('')
    .replace(/\s+¶\s+/g,'\n\n')
    .trim();
}
// v217: a sheet is filled to its last line and the rest goes on to the next one, cut between words (it used to step back to the
// last full stop, and with a long sentence next half the sheet stayed empty); the book joins the sheets of a chapter anyway
function smartCutTokens(tokens,maxIndex){
  let cut=Math.min(maxIndex,tokens.length);
  while(cut>1 && !/\s/.test(tokens[cut-1])) cut--;
  return cut;
}
function fits(text){
  measureBox.innerHTML=htmlFromText(text);
  return measureBox.scrollHeight<=editor.clientHeight+1;
}
function maxFit(tokens){
  let lo=0,hi=tokens.length,best=0;
  while(lo<=hi){
    const mid=(lo+hi)>>1;
    const candidate=untokenise(tokens.slice(0,mid));
    if(fits(candidate)){best=mid;lo=mid+1}else hi=mid-1;
  }
  return best;
}
function mergeText(a,b){
  a=(a||'').trim(); b=(b||'').trim();
  if(!a)return b;if(!b)return a;
  return a+' '+b;
}
function pageCanFlow(page){
  const sid=currentSection()?.id;
  if(['title','dedication','epigraph','contents','sources','colophon','back-cover'].includes(sid))return false;
  return ['chapter','intro','text','inside-back-cover','document'].includes(page.type);
}
function canHavePhotos(page){
  const sid=currentSection()?.id;
  const autoPhotoIds=new Set(['cover','title','dedication','epigraph','intro','author','afterword','thanks','back-cover','final','recipes']);
  if(autoPhotoIds.has(sid))return true;
  return ['chapter','intro','text','photo','document','map','recipes','endpaper'].includes(page.type);
}

function normalizeCurrentSection(){
  const pages=currentPages();
  let active=currentPageIndex();

  for(let i=0;i<pages.length;i++){
    const p=pages[i];
    if(!pageCanFlow(p)) continue;
    if(!Array.isArray(p.photos))p.photos=[];
    if(typeof p.text!=='string')p.text='';

    while(p.text && !fits(p.text)){
      const toks=tokenise(p.text);
      const fit=measuredMaxFit(toks);
      if(fit<=0||fit>=toks.length)break;

      const head=untokenise(toks.slice(0,fit));
      const tail=untokenise(toks.slice(fit));
      p.text=head;

      const nextType=p.type;
      const nextTitle=p.title;
      const nextEpisode=p.episode;
      if(!pages[i+1]){
        pages[i+1]={type:nextType,title:nextTitle,episode:nextEpisode,text:'',photos:[],photoOffset:0,continuation:true,continuationOf:p.uid||p.id||null};
      }
      pages[i+1].text=tail+(pages[i+1].text?'\n\n'+pages[i+1].text:'');
    }
  }

  currentSection().active=Math.min(active,pages.length-1);
}

function wordForm(n){return n%10===1&&n%100!==11?'слово':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'слова':'слов')}
function updateCount(){
  const t=textFromEditor().trim();
  const n=t?t.split(/\s+/).length:0;
  if(wordCount){
    wordCount.textContent=n+' '+wordForm(n);
  }
}
// «Черновик сохранён» is shown only after the store confirms the write.
function updateSave(){ persistSoon(); }
function showSaved(ok){
  const d=new Date();
  const time=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  const sync=window.OcherkiStore?.lastSync?.();
  if(saveState)saveState.textContent=!ok
    ?'Не удалось сохранить — не закрывайте страницу'
    :sync?.ok?'Сохранено в аккаунте '+time
    :sync?'Сохранено на этом компьютере '+time+' · нет связи с аккаунтом'
    :'Черновик сохранён '+time;
}
// Autosave: the whole manuscript (text, pages, photos) goes to the project
// store a moment after each change and when the tab is hidden; on start the
// last saved copy is restored.
// Several books per account: the open one is named in «ocherkiActiveBook»
// (the bookcase switches it); the first book keeps its old id «current».
var PROJECT_ID=(()=>{try{return localStorage.getItem('ocherkiActiveBook')||'current';}catch(_){return 'current';}})();
var persistTimer=0, projectRestoring=true;
// A small summary rides along for the bookcase, so the shelf never loads
// the manuscript itself.
function bookSummary(){
  const firstLine=id=>String(sections.find(section=>section.id===id)?.pages?.[0]?.text||'').split(/\n+/).map(line=>line.trim()).filter(line=>line&&line!==SAMPLE_PREFIX);
  const titleLines=firstLine('title').length?firstLine('title'):firstLine('cover');
  return {title:titleLines[0]||'',author:titleLines[2]||titleLines[1]||'',pages:sections.reduce((sum,section)=>sum+(section.pages||[]).length,0)};
}
// v221: the book's album — photographs brought in with «+ добавить фото» on the desk's album, not yet laid on any sheet
let albumPhotos=[];
function projectSnapshot(){return {version:1,activeSection,fontSize,lineHeight,sections,album:albumPhotos,book:bookSummary()};}
const samePhoto=(a,b)=>a===b||(!!a&&!!b&&a.src===b.src);
function inBook(p){return sections.some(s=>(s.pages||[]).some(pg=>(pg.photos||[]).some(r=>samePhoto(r,p))));}
function dropEverywhere(p){albumPhotos=albumPhotos.filter(r=>!samePhoto(r,p));
  sections.forEach(s=>(s.pages||[]).forEach(pg=>{if(!Array.isArray(pg.photos))return;const n=pg.photos.length;pg.photos=pg.photos.filter(r=>!samePhoto(r,p));if(pg.photos.length!==n)pg.photoOffset=Math.min(pg.photoOffset||0,Math.max(0,pg.photos.length-1));}));}
function persistSoon(){clearTimeout(persistTimer);persistTimer=setTimeout(persistNow,700);}
function persistNow(){
  clearTimeout(persistTimer);
  // A book deleted from the shelf while open is never written back.
  if(projectRestoring||!window.OcherkiStore||window.__ocherkiNoSave)return Promise.resolve();
  return window.OcherkiStore.save(PROJECT_ID,projectSnapshot()).then(()=>showSaved(true),()=>showSaved(false));
}
window.__ocherkiPersistSoon=persistSoon;
window.__ocherkiPersistNow=persistNow;
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistNow();});
window.addEventListener('pagehide',()=>persistNow());
function restoreProject(){
  if(!window.OcherkiStore){projectRestoring=false;applyProjectSetup();return;}
  let restored=false;
  window.OcherkiStore.load(PROJECT_ID).then(record=>{
    if(record&&Array.isArray(record.sections)&&record.sections.length){
      restored=true;
      // Sections added to the constructor after the save (a new optional
      // page) are put back in their usual place.
      const saved=record.sections.slice(),ids=new Set(saved.map(section=>section.id));
      sections.forEach((section,index)=>{
        if(ids.has(section.id)||section.type==='chapter')return;
        const before=sections.slice(0,index).reverse().find(item=>ids.has(item.id));
        saved.splice(before?saved.findIndex(item=>item.id===before.id)+1:0,0,section);ids.add(section.id);
      });
      sections.splice(0,sections.length,...saved);tidyOneSheetSections();
      activeSection=Math.max(0,Math.min(sections.length-1,Number(record.activeSection)||0));
      if(Number(record.fontSize))fontSize=Number(record.fontSize);
      if(Number(record.lineHeight))lineHeight=Number(record.lineHeight);
      if(Array.isArray(record.album))albumPhotos=record.album.filter(r=>r&&r.src);
      render();
      try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}
      showSaved(true);
    }
  }).catch(()=>{}).finally(()=>{projectRestoring=false;if(!restored)applyProjectSetup();});
}
// The start wizard's answers (index.html keeps them in
// «ocherkiLifeProjectDraft») shape a fresh book once: title page and
// cover, the family tree's main person and, with prompts, chapters by
// periods of life with questions beside the page (never printed).
const PROMPT_PLANS={
  first:[
    ['Корни и детство',['Где и когда вы родились? Каким был дом, двор, улица?','Кем были ваши родители, бабушки и дедушки?','Какое ваше самое раннее воспоминание?','Во что играли, какие праздники запомнились, какие запахи и звуки детства?']],
    ['Юность и учёба',['Где вы учились? Какие учителя и друзья запомнились?','О чём вы мечтали в юности?','Какое время было вокруг — что происходило в стране и в городе?']],
    ['Работа и дело жизни',['Кем вы работали и как выбрали этот путь?','Чем вы гордитесь в работе?','Какие трудные времена были и как вы с ними справились?']],
    ['Семья',['Как вы встретили своего мужа или жену?','Как появились дети? Каким был дом в те годы?','Какие семейные традиции у вас есть?']],
    ['Переезды и перемены',['Куда и почему переезжала семья?','Как большие события страны коснулись вашей жизни?']],
    ['Что хочется передать',['Чему научила вас жизнь?','Что важно знать вашим детям и внукам?','За что вы благодарны?']]
  ],
  third:[
    ['Корни и детство',['Где и когда он или она родились? Каким был дом?','Кем были родители, бабушки и дедушки?','Какие истории о детстве рассказывали в семье?']],
    ['Юность и учёба',['Где учился или училась? Какие друзья и учителя были рядом?','О чём мечтал или мечтала в юности?']],
    ['Работа и дело жизни',['Кем работал или работала? Чем гордился?','Какие трудные времена пришлось пережить?']],
    ['Семья',['Как познакомился или познакомилась с супругом?','Какими были отношения с детьми и внуками?','Какие слова, привычки, блюда остались в памяти семьи?']],
    ['Какой он был человек',['Каким его или её помнят близкие — характер, шутки, любимые занятия?','Какой случай лучше всего показывает этого человека?']],
    ['Память',['Что осталось от него или неё в семье — вещи, письма, фотографии?','Что вы хотели бы сказать, если бы была возможность?']]
  ],
  family:[
    ['Откуда мы родом',['Откуда происходит семья? Что известно о самых старших предках?','Какие фамилии, места и даты сохранились?']],
    ['Старшее поколение',['Кем были прадеды и прабабушки? Чем занимались?','Какие истории о них передавались?']],
    ['Переезды и перемены',['Куда и почему переезжала семья? Как это было?','Как войны и большие события изменили судьбы семьи?']],
    ['Дом и традиции',['Каким был дом семьи? Что в нём было главным?','Какие праздники, блюда, песни передаются из поколения в поколение?']],
    ['Наши дни',['Где сейчас живут родные? Чем занимаются?','Что объединяет семью сегодня?']],
    ['Что передать детям',['Что важно сохранить и передать внукам?','Какие слова старших хочется запомнить?']]
  ]
};
function applyProjectSetup(){
  let draft=null;
  try{draft=JSON.parse(localStorage.getItem('ocherkiLifeProjectDraft')||'null');}catch(_){draft=null;}
  if(!draft||!draft.setupId)return;
  try{if(localStorage.getItem('ocherki_setup_applied')===String(draft.setupId))return;}catch(_){}
  const setFields=(id,values)=>{const page=sections.find(section=>section.id===id)?.pages?.[0];if(!page)return;page.text=values.map(value=>String(value||'').trim()).join('\n\n');page.sample=false;page.userEdited=true;page._userEdited=true;page.semanticHtml='';};
  if(draft.title)setFields('title',[draft.title,draft.subtitle,draft.author]);
  if(draft.title)setFields('cover',[draft.title,draft.subtitle,draft.author,'']);
  const treePage=sections.find(section=>section.id==='family-tree')?.pages?.[0];
  if(treePage&&draft.heroName&&!(treePage.treeData&&treePage.treeData.people)&&window.OcherkiTreeEditor){
    const id='p'+Date.now().toString(36);
    treePage.treeData={version:1,rootId:id,people:{[id]:{id,name:draft.heroName,dates:draft.heroYears||'',place:'',major:true,photoId:''}},unions:[]};
    treePage.text=window.OcherkiTreeEditor.toText(treePage.treeData);
  }
  if(draft.workMode==='С вопросами-подсказками'){
    const plan=PROMPT_PLANS[draft.storyType==='Моя жизнь'?'first':draft.storyType==='История семьи'?'family':'third'];
    const firstChapter=sections.findIndex(section=>section.type==='chapter');
    const untouched=sections.filter(section=>section.type==='chapter').every(section=>(section.pages||[]).every(page=>page.sample===true||!String(page.text||'').trim()));
    if(untouched){
      const stamp=Date.now().toString(36);
      const chapters=plan.map(([name,questions],index)=>{const title=`Глава ${index+1}. ${name}`;return {id:`chapter-${stamp}-${index+1}`,title,type:'chapter',active:0,
        pages:[{uid:`page-${stamp}-${index+1}`,type:'chapter',title,episode:'',sample:true,text:SAMPLE_PREFIX+'\n\n'+'Вопросы к этой главе — в карточке «Вопросы к главе». Отвечайте на те, что откликаются, своими словами; начните печатать — этот текст исчезнет.',prompts:questions,photos:[],photoOffset:0,isEpisodeStart:true,included:true}]};});
      const rest=sections.filter(section=>section.type!=='chapter');
      const at=firstChapter<0?rest.length:sections.slice(0,firstChapter).filter(section=>section.type!=='chapter').length;
      rest.splice(at,0,...chapters);
      sections.splice(0,sections.length,...rest);
      activeSection=Math.max(0,sections.findIndex(section=>section.type==='chapter'));
    }
  }
  try{localStorage.setItem('ocherki_setup_applied',String(draft.setupId));}catch(_){}
  render();
  try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}
  persistSoon();
}

function stackSequence(){
  const pages=currentPages();
  const active=currentPageIndex();
  const seq=[];
  if(pages.length<=1)return seq;
  for(let step=1;step<pages.length;step++)seq.push((active+step)%pages.length);
  return seq.slice(0,3);
}

function updateStack(){
  const pages=currentPages();
  const seq=stackSequence();

  ghostEls.forEach(({el,no},slot)=>{
    const idx=seq[slot];
    if(idx!==undefined && pages.length>1){
      el.style.display='block';
      no.textContent=String(idx+1);
      el.dataset.target=idx;
    }else{
      el.style.display='none';
      no.textContent='';
      delete el.dataset.target;
    }
  });

  stackIndicator.classList.toggle('show',pages.length>1);
  if(pageNo)pageNo.textContent=String(currentPageIndex()+1);
}

function render(){
  if(!recoverEditorInteraction()) return;
  syncEmbeddedSize();
  updateMeasureStyle();

  const p=currentPage();
  if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(p);

  chapterLabel.textContent=p.title||currentSection().title||'Страница';
  chapterLabel.setAttribute('contenteditable','true');
  chapterLabel.setAttribute('spellcheck','false');
  chapterLabel.title='Нажмите и измените название';

  const isChapter=currentSection()?.type==='chapter';
  episodeRow.style.display=isChapter?'flex':'none';
  episodeLabel.setAttribute('contenteditable',isChapter?'true':'false');
  episodeLabel.setAttribute('spellcheck','false');
  episodeLabel.title=isChapter?'Нажмите и измените название эпизода':'';
  if(isChapter)episodeLabel.textContent=p.episode||'';
  // the first sheet's episode name is the chapter's subtitle in the book (printed under the chapter's name): when it is empty, the line
  // says so, to be written in
  {const sec=currentSection(),first=(sec?.pages||[]).find(q=>q&&q.type!=='document'&&q.bookRole!=='document');
    episodeLabel.dataset.ph=isChapter&&first===p?'подзаголовок главы — его напечатают под названием':'название эпизода';}
  // v211: under an episode's name, its «когда · где» (the line the book prints under it)
  {let el=episodeLabel.nextElementSibling;if(!el||!el.classList.contains('episode-sub')){el=document.createElement('div');el.className='episode-sub';episodeLabel.after(el);}
    el.textContent=isChapter&&p.isEpisodeStart?String(p.episodeLine||'').trim():'';
    // v266: the handwritten line the book prints under an episode's name can be written here, under the name: empty, it shows
    // (faded) what the book will take by itself — the photograph's story or a phrase of the episode
    const own=isChapter&&p.isEpisodeStart===true&&(currentSection()?.pages||[]).find(q=>q&&q.type!=='document'&&q.bookRole!=='document')!==p;
    if(own)el.textContent='';
    let hl=episodeRow.nextElementSibling;if(!hl||!hl.classList.contains('ep-hand')){hl=document.createElement('div');hl.className='ep-hand';hl.setAttribute('contenteditable','true');hl.setAttribute('spellcheck','false');hl.title='Строка от руки под названием эпизода — её можно написать свою';episodeRow.after(hl);}
    hl.hidden=!own;hl.closest('.paper')?.classList.toggle('has-ep-hand',own);if(own){if(document.activeElement!==hl)hl.textContent=String(p.episodeLine||'').trim();
      const story=String((p.photos||[]).find(ph=>ph&&ph.src&&String(ph.story||'').trim())?.story||'').trim().match(/^[^.!?…]+[.!?…]?/u)?.[0]||'';
      hl.dataset.ph=(story&&story.length<=90?story:'')||autoEpisodeLine(p.text)||'строка от руки под названием эпизода';}}

  const showIncludeToggle=optionalAuto();
  const paperEl=activeSheet.querySelector('.paper');
  paperEl?.classList.toggle('has-page-toggle',showIncludeToggle);
  pageIncludeWrap?.classList.toggle('show',showIncludeToggle);
  if(showIncludeToggle){
    const included=currentSection().included!==false && p.included!==false;
    pageIncludeState.textContent=included?'Можно выключить · сейчас включено':'Можно выключить · сейчас выключено';
    pageIncludeToggle.innerHTML=includeToggleSvg(included);
    pageIncludeToggle.setAttribute('aria-pressed',included?'true':'false');
    pageIncludeToggle.setAttribute('aria-label',included?'Исключить из книги':'Добавить в книгу');
    pageIncludeToggle.title=included?'Исключить из книги':'Добавить в книгу';
  }else{
    pageIncludeState.textContent='';
    pageIncludeToggle.innerHTML='';
  }

  editor.innerHTML=p.type==='contents'
    ?(p.autoContents?autoContentsHtml():contentsHtml(p.text||''))
    :(p.semanticHtml ? p.semanticHtml : htmlFromText(p.text||''));
  editor.dataset.pageType=p.type||'text';
  editor.querySelectorAll('.semantic-inline').forEach(token=>{
    token.contentEditable='false';
    token.setAttribute('contenteditable','false');
  });
  editor.dataset.sectionId=currentSection().id||'';
  editor.dataset.pageUid=String(p.uid||p.id||'');
  editor.setAttribute('contenteditable',p.autoContents?'false':'true');
  editor.classList.toggle('is-auto-contents',!!p.autoContents);

  addPhotoBtn.style.display=canHavePhotos(p)?'block':'none';
  if(typeof updateContextActions==='function') updateContextActions();

  updateCount();
  updatePageFill();
  updateStack();
  renderPhotos();
  try{
    if(window.__OCHERKI_RENDER_NAVIGATION) window.__OCHERKI_EMIT_ACTIVE?.();
    else window.__OCHERKI_EMIT_STRUCTURE?.();
  }catch(_){ }
}

// Sheet navigation does not need to resend the manuscript and all photo data
// to the host. The bridge turns this flag into a tiny active-page message;
// content edits continue to use the complete structure message.
function renderNavigation(){
  window.__OCHERKI_RENDER_NAVIGATION=true;
  try{return render();}
  finally{window.__OCHERKI_RENDER_NAVIGATION=false;}
}

function placeCaretEnd(el){
  el.focus();
  const range=document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel=window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function chapterNumberFor(section){
  const m=String(section?.title||'').match(/^Глава\s+(\d+)/i);
  if(m) return Number(m[1]);
  let n=0;
  for(const s of sections){ if(s.type==='chapter') n++; if(s===section) return n||1; }
  return 1;
}

function commitChapterHeading(){
  const p=currentPage(), sec=currentSection(); if(!p||!sec) return;
  let raw=(chapterLabel.textContent||'').replace(/\s+/g,' ').trim();
  if(!raw){ render(); return; }
  if(sec.type==='chapter' && p.type==='chapter'){
    const old=sec.title; const num=chapterNumberFor(sec);
    raw=raw.replace(/^Глава\s+\d+[.:]?\s*/i,'').trim();
    const title=`Глава ${num}. ${raw||'Без названия'}`;
    sec.title=title;
    (sec.pages||[]).forEach(pg=>{ if(pg.type==='chapter' || pg.title===old) pg.title=title; });
  }else{
    p.title=raw;
  }
  render();
}

function commitEpisodeHeading(){
  const p=currentPage(), sec=currentSection(); if(!p||!sec||sec.type!=='chapter') return;
  const old=String(p.episode||'');
  const raw=(episodeLabel.textContent||'').replace(/\s+/g,' ').trim();
  if(!raw){ render(); return; }
  (sec.pages||[]).forEach(pg=>{ if(String(pg.episode||'')===old) pg.episode=raw; });
  render();
}

chapterLabel.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();chapterLabel.blur();}
  if(e.key==='Escape'){e.preventDefault();render();chapterLabel.blur();}
});
chapterLabel.addEventListener('blur',commitChapterHeading);
episodeLabel.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();episodeLabel.blur();}
  if(e.key==='Escape'){e.preventDefault();render();episodeLabel.blur();}
});
episodeLabel.addEventListener('blur',commitEpisodeHeading);
// v266: the episode's handwritten line — the same choice as the book's (a phrase of 24–70 letters, from the second sentence on)
function autoEpisodeLine(text){const ss=String(text||'').split(/\n+/u).join(' ').match(/[^.!?…]+[.!?…]+/gu)||[];const fit=x=>{const c=x.trim();return c.length>=24&&c.length<=70&&!/[«»"„“:;]/u.test(c);};
  return ((ss.slice(1,14).find(fit)||ss.slice(0,1).find(fit)||'').trim()).replace(/[.…]+$/u,'');}
document.addEventListener('keydown',e=>{const el=e.target?.closest?.('.ep-hand');if(!el)return;if(e.key==='Enter'){e.preventDefault();el.blur();}else if(e.key==='Escape'){e.preventDefault();el.textContent=String(currentPage()?.episodeLine||'');el.blur();}},true);
document.addEventListener('focusout',e=>{const el=e.target?.closest?.('.ep-hand');if(!el)return;const p=currentPage();if(!p)return;const v=String(el.textContent||'').replace(/\s+/g,' ').trim();
  if(v===String(p.episodeLine||'').trim())return;p.episodeLine=v;if(!v){delete p.episodeWhen;delete p.episodeWhere;}el.textContent=v;p.userEdited=true;try{persistSoon();}catch(_){}try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}},true);

function placeCaretInParagraph(pEl){
  if(!pEl) return;
  editor.focus();
  const range=document.createRange();
  range.selectNodeContents(pEl);
  range.collapse(true);
  const sel=window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
function clearSampleParagraphAt(target){
  const pEl=target && target.closest ? target.closest('p[data-sample]') : null;
  if(!pEl || !editor.contains(pEl)) return null;
  pEl.removeAttribute('data-sample');
  pEl.classList.remove('sample-lead','sample-body');
  pEl.innerHTML='<br>';
  updateCount();
  return pEl;
}

let saveTimer;
editor.addEventListener('focus',()=>{
  if(isMultiFieldPageType(editor.dataset.pageType)) return;
  if(clearSampleTextIfNeeded()) placeCaretEnd(editor);
});
editor.addEventListener('mousedown',e=>{
  if(isMultiFieldPageType(editor.dataset.pageType)){
    const pEl=clearSampleParagraphAt(e.target);
    if(pEl){ e.preventDefault(); placeCaretInParagraph(pEl); }
    return;
  }
  if(editorShowsSample()){
    e.preventDefault();
    clearSampleTextIfNeeded();
    editor.focus();
    placeCaretEnd(editor);
  }
});
editor.addEventListener('beforeinput',e=>{
  if(isMultiFieldPageType(editor.dataset.pageType)){
    const sel=window.getSelection();
    const node=sel && sel.anchorNode;
    const anchorEl=node ? (node.nodeType===1?node:node.parentElement) : null;
    const pEl=anchorEl ? anchorEl.closest('p[data-sample]') : null;
    if(pEl){ clearSampleParagraphAt(pEl); placeCaretInParagraph(pEl); }
    return;
  }
  if(editorShowsSample()){
    clearSampleTextIfNeeded();
    placeCaretEnd(editor);
  }
});
function createContinuationPageIfNeeded(targetPage=null){
  const page=targetPage || currentPage();
  if(!pageCanFlow(page) || !editorContentOverflows()) return false;

  // Locate the section that actually owns `page` instead of assuming
  // currentSection(). A long chapter's overflow cascade resolves across
  // several chained timeouts (see below); if the user/script has since
  // navigated to a different chapter before a queued step runs, `page`
  // here can belong to that EARLIER chapter while currentSection() now
  // points at the new one. Splicing into the wrong section's pages array
  // is exactly how a page from chapter 1 used to end up corrupting
  // chapter 2's content (or vice versa).
  const sec=sections.find(s=>Array.isArray(s.pages)&&s.pages.includes(page));
  if(!sec) return false;
  const at=sec.pages.indexOf(page)+1;
  const parentId=pageIdentity(page);

  const tokens=tokenise(page.text);
  const keep=measuredMaxFit(tokens);
  let rest=keep>0&&keep<tokens.length?untokenise(tokens.slice(keep)):'';
  let head=keep>0&&keep<tokens.length?untokenise(tokens.slice(0,keep)):page.text;
  if(!rest.trim()){
    // v165: only empty lines run over a full sheet (Enter at its end) — the next line starts on a new sheet
    const t=String(page.text||'').replace(/\s+$/,'');
    if(!t.trim()||!measuredFits(t)||!/\n\s*$/.test(editor.innerText||'')) return false;
    head=t;rest='';
  }

  const newPage=makeSiblingPage(page,true,{
    autoCreated:true,
    continuation:true,
    continuationOf:parentId
  });

  page.text=head;
  newPage.text=rest;
  newPage.movedText=rest;
  page.overflowContinuationId=pageIdentity(newPage);

  if(window.LifeBookPageBlocks){
    window.LifeBookPageBlocks.syncText(page,head);
    window.LifeBookPageBlocks.syncText(newPage,rest);
  }

  sec.pages.splice(at,0,newPage);
  // Only move the visible caret to the new page if that section is still
  // the one actually on screen — never yank the user (or the automation)
  // sideways onto a page in a chapter they've already left.
  if(sec===currentSection()) sec.active=at;
  window.__OCHERKI_EMIT_STRUCTURE?.();

  // Cascade flow: switch the editor to the new continuation page first.
  // Overflow measurement works against the visible editor, so it must be
  // rendered before checking the newly created page. Guard every step on
  // this chapter still being the active one — otherwise this queued
  // continuation of an OLD chapter's split would re-render (and recurse
  // into) whatever chapter the user has since switched to.
  setTimeout(()=>{
    if(sec!==currentSection()) return;
    if(!window.__continuationFlowBusy){
      window.__continuationFlowBusy=true;
      try{
        render();
        if(editorContentOverflows()) createContinuationPageIfNeeded(newPage);
      } finally {
        window.__continuationFlowBusy=false;
      }
    }
  },80);

  return newPage;
}

let overflowFlowTimer=0;
let overflowFlowBusy=false;

// v165: after a sheet turns over by itself, the caret stays where one was writing — at the end of the carried text —
// even if the sheet is redrawn a moment later
let keepEndUntil=0,keepEndPage=null;
function keepCaretAtEnd(){keepEndUntil=performance.now()+1600;keepEndPage=currentPage();}
document.addEventListener('selectionchange',()=>{
  if(performance.now()>keepEndUntil||currentPage()!==keepEndPage||document.activeElement!==editor)return;
  const sel=getSelection();if(!sel.rangeCount)return;const r=sel.getRangeAt(0);if(!r.collapsed||!editor.contains(r.startContainer))return;
  const q=document.createRange();q.selectNodeContents(editor);q.setEnd(r.startContainer,r.startOffset);
  if(q.toString().length===0&&editor.textContent.length>0)placeCaretEnd(editor);
});
editor.addEventListener('mousedown',()=>{keepEndUntil=0;});

function editorContentOverflows(){
  if(!editor) return false;

  // Method 1: native scroll geometry.
  if(editor.scrollHeight > editor.clientHeight + 2) return true;

  // Method 2: compare the final rendered content box with the editor viewport.
  const last=editor.lastElementChild || editor.lastChild;
  if(last && last.getBoundingClientRect){
    const er=editor.getBoundingClientRect();
    const lr=last.getBoundingClientRect();
    if(lr.bottom > er.bottom + 1) return true;
  }

  // Method 3: full contents range. This also catches text nodes at the root.
  try{
    const range=document.createRange();
    range.selectNodeContents(editor);
    const rr=range.getBoundingClientRect();
    const er=editor.getBoundingClientRect();
    if(rr.bottom > er.bottom + 1) return true;
  }catch(_){}

  return false;
}

function measuredTextHeight(text){
  const cs=getComputedStyle(editor);
  const probe=document.createElement('div');

  probe.style.position='fixed';
  probe.style.left='-10000px';
  probe.style.top='0';
  probe.style.visibility='hidden';
  probe.style.pointerEvents='none';
  probe.style.boxSizing=cs.boxSizing;
  probe.style.width=editor.getBoundingClientRect().width+'px';
  probe.style.height='auto';
  probe.style.minHeight='0';
  probe.style.maxHeight='none';
  probe.style.overflow='visible';
  probe.style.margin='0';
  probe.style.padding=cs.padding;
  probe.style.border='0';
  probe.style.fontFamily=cs.fontFamily;
  probe.style.fontSize=cs.fontSize;
  probe.style.fontWeight=cs.fontWeight;
  probe.style.fontStyle=cs.fontStyle;
  probe.style.lineHeight=cs.lineHeight;
  probe.style.letterSpacing=cs.letterSpacing;
  probe.style.whiteSpace='normal';
  probe.style.wordBreak=cs.wordBreak;
  probe.style.overflowWrap=cs.overflowWrap;
  // v217: the same hyphenation, alignment and spacing as the sheet (without them the probe's lines were longer)
  probe.style.hyphens=cs.hyphens;probe.style.webkitHyphens=cs.webkitHyphens||cs.hyphens;probe.style.textAlign=cs.textAlign;probe.style.wordSpacing=cs.wordSpacing;probe.style.textIndent=cs.textIndent;probe.style.fontFeatureSettings=cs.fontFeatureSettings;probe.style.fontKerning=cs.fontKerning;probe.lang=editor.lang||document.documentElement.lang||'ru';
  probe.innerHTML=htmlFromText(text);
  // v217: the probe's paragraphs are spaced as the sheet's own (it measured them with the browser's wider margins, so a sheet
  // with many short paragraphs — a dialogue — was thought full while lines were still free at its foot)
  {const sp=editor.querySelector('p');const pm=sp?getComputedStyle(sp):null;const m=pm?`${pm.marginTop} 0px ${pm.marginBottom}`:`0px 0px ${(parseFloat(cs.fontSize)*.72).toFixed(2)}px`;
    probe.querySelectorAll('p').forEach(x=>{x.style.margin=m;});}

  document.body.appendChild(probe);
  const h=probe.getBoundingClientRect().height;
  probe.remove();
  return h;
}

function measuredFits(text){
  const available=Math.max(1,editor.getBoundingClientRect().height-2);
  return measuredTextHeight(text)<=available;
}

function measuredMaxFit(tokens){
  let lo=0,hi=tokens.length,best=0;
  while(lo<=hi){
    const mid=(lo+hi)>>1;
    const candidate=untokenise(tokens.slice(0,mid));
    if(measuredFits(candidate)){best=mid;lo=mid+1;}
    else hi=mid-1;
  }
  return best;
}

function flowCurrentPageOverflow(expectedPage){
  clearTimeout(overflowFlowTimer);
  if(overflowFlowBusy) return;
  if(!expectedPage || currentPage()!==expectedPage) return;
  if(!pageCanFlow(expectedPage)) return;

  const fullText=textFromEditor();
  if(!fullText.trim()) return;

  // Two independent checks: the actual rendered editor and an unconstrained clone.
  // Either one is enough to start pagination.
  const overflowing=editorContentOverflows() || !measuredFits(fullText);
  if(!overflowing) return;

  // v165: a full sheet and Enter — only empty lines run over the edge. Nothing to carry,
  // so the next line simply starts on a new sheet (the sheet itself never scrolls).
  const trimmedText=fullText.replace(/\s+$/,'');
  if(trimmedText!==fullText && trimmedText.trim() && measuredFits(trimmedText)){
    overflowFlowBusy=true;
    try{
      const sec=currentSection();const ci=sec.pages.indexOf(expectedPage);if(ci<0) return;
      expectedPage.text=trimmedText;expectedPage.semanticHtml='';
      if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(expectedPage,trimmedText);
      const next=makeSiblingPage(expectedPage,true,{autoCreated:true,continuation:true,continuationOf:pageIdentity(expectedPage)});
      pageIdentity(next);next.text='';next.episode=expectedPage.episode;next.continuation=true;next.autoCreated=true;next.blocks=[];next.semanticHtml='';
      if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(next,'');
      sec.pages.splice(ci+1,0,next);sec.active=ci+1;
      render();placeCaretEnd(editor);keepCaretAtEnd();window.__OCHERKI_EMIT_STRUCTURE?.();
    }finally{setTimeout(()=>{overflowFlowBusy=false;},0);}
    return;
  }

  const tokens=tokenise(fullText);
  if(tokens.length<2) return;

  let keep=smartCutTokens(tokens,measuredMaxFit(tokens));

  // Safety guard: never create a continuation with an empty/near-empty first page.
  if(keep<=0) keep=Math.max(1,Math.floor(tokens.length*.85));
  if(keep>=tokens.length) return;

  const head=untokenise(tokens.slice(0,keep));
  const tail=untokenise(tokens.slice(keep));
  if(!tail.trim()) return;

  overflowFlowBusy=true;
  try{
    const sec=currentSection();
    const currentIndex=sec.pages.indexOf(expectedPage);
    if(currentIndex<0) return;

    expectedPage.text=head;
    expectedPage.semanticHtml='';
    if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(expectedPage,head);

    // One overflow event = one continuation page.
    // If the pasted tail itself needs another page, it will be checked after render.
      const next=makeSiblingPage(expectedPage,true,{autoCreated:true,continuation:true,continuationOf:pageIdentity(expectedPage)});
    pageIdentity(next);
    next.text=tail;
    next.episode=expectedPage.episode;
    next.continuation=true;
    next.autoCreated=true;
    next.blocks=[];
    next.semanticHtml='';
    if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(next,tail);

      sec.pages.splice(currentIndex+1,0,next);
    sec.active=currentIndex+1;

    render();
    placeCaretEnd(editor);keepCaretAtEnd();
    window.__OCHERKI_EMIT_STRUCTURE?.();

    // Re-check only the newly created continuation with the same measuring engine.
    // This produces another sheet only when the tail really does not fit on one page.
    overflowFlowTimer=setTimeout(()=>{
      if(currentPage()===next && (editorContentOverflows() || !measuredFits(textFromEditor()))){
        flowCurrentPageOverflow(next);
      }
    },120);
  }finally{
    setTimeout(()=>{overflowFlowBusy=false;},0);
  }
}

// Pasted text arrives as plain text in the sheet's own type: the formatting
// of a website or a Word file (large fonts, colours) never reaches the page.
editor.addEventListener('paste',event=>{
  const plain=event.clipboardData?.getData('text/plain');
  if(plain!=null&&plain!==''){event.preventDefault();document.execCommand('insertText',false,plain.replace(/\r\n?/g,'\n'));
    // v217: what does not fit goes on to the next sheets at once — the sheet is not scrolled up to the caret meanwhile (it jumped)
    keepSheetStill();const p=currentPage();try{flowCurrentPageOverflow(p);}catch(_){}keepSheetStill();}
},true);
// the sheet itself never scrolls: whatever the browser does to bring the caret into view is undone before it is painted
function keepSheetStill(){let n=editor;while(n&&n!==document.body){if(n.scrollTop)n.scrollTop=0;if(n.scrollLeft)n.scrollLeft=0;n=n.parentElement;}}
editor.addEventListener('scroll',keepSheetStill);document.querySelector('.editor-wrap')?.addEventListener('scroll',keepSheetStill);
editor.addEventListener('paste',()=>{
  const p=currentPage();
  setTimeout(()=>{
    if(currentPage()===p){
      p.text=textFromEditor();
      syncSemanticHtml(p);
      updatePageFill();
    }
  },0);
});


function pageHasRichContent(page){
  if(!page) return false;
  const photos=Array.isArray(page.photos) ? page.photos.length : 0;
  const richBlocks=Array.isArray(page.blocks)
    ? page.blocks.some(b=>b && b.type && b.type!=='text')
    : false;
  const semantic=!!(page.semanticHtml && page.semanticHtml.includes('semantic-inline'));
  return photos>0 || richBlocks || semantic;
}

function continuationBelongsTo(next,page){
  if(!next || !page || !next.autoCreated || !next.continuation) return false;
  const parentId=pageIdentity(page);
  return next.continuationOf===parentId ||
         next.continuationOf===page.id ||
         next.continuationOf===page.uid ||
         page.overflowContinuationId===next.id ||
         page.overflowContinuationId===next.uid;
}

function captureEditorCaretOffset(){
  try{
    const sel=window.getSelection();
    if(!sel || !sel.rangeCount) return null;
    const range=sel.getRangeAt(0);
    if(!editor.contains(range.startContainer)) return null;
    const pre=document.createRange();
    pre.selectNodeContents(editor);
    pre.setEnd(range.startContainer,range.startOffset);
    return pre.toString().length;
  }catch(_){return null;}
}

function restoreEditorCaretOffset(offset){
  if(offset===null || offset===undefined) return;
  try{
    let remaining=Math.max(0,offset);
    const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);
    let node,last=null;
    while((node=walker.nextNode())){
      last=node;
      if(remaining<=node.nodeValue.length){
        const r=document.createRange();
        r.setStart(node,remaining);
        r.collapse(true);
        const s=window.getSelection();
        s.removeAllRanges(); s.addRange(r);
        editor.focus();
        return;
      }
      remaining-=node.nodeValue.length;
    }
    if(last){
      const r=document.createRange();
      r.setStart(last,last.nodeValue.length);
      r.collapse(true);
      const s=window.getSelection();
      s.removeAllRanges(); s.addRange(r);
      editor.focus();
    }
  }catch(_){}
}

function removeEmptyAutoPage(page=currentPage()){
  if(!page || !page.autoCreated || !page.continuation) return false;
  if(String(page.text||'').replace(/\s+/g,'').trim()) return false;
  if(pageHasRichContent(page)) return false;

  const sec=currentSection();
  const idx=sec.pages.indexOf(page);
  if(idx<=0) return false;

  const prev=sec.pages[idx-1];
  const following=sec.pages[idx+1];

  sec.pages.splice(idx,1);

  if(prev){
    prev.overflowContinuationId=following ? pageIdentity(following) : null;
  }
  if(following && following.autoCreated && following.continuation){
    following.continuationOf=pageIdentity(prev);
  }

  sec.active=Math.max(0,idx-1);
  window.__OCHERKI_EMIT_STRUCTURE?.();
  render();
  placeCaretEnd(editor);
  updateSave();
  return true;
}

let emptySheetRemovalTimer=null;
function removeEmptyUserSheet(page){
  const sec=sections.find(section=>(section.pages||[]).includes(page));
  if(!sec || sec.type!=='chapter' || (sec.pages||[]).length<=1) return false;
  const idx=sec.pages.indexOf(page);
  if(page.type==='document' || !(page.userCreated===true || page.autoCreated===true)) return false;
  if(String(page.text||'').replace(/\s+/g,'').trim() || pageHasRichContent(page)) return false;
  sec.pages.splice(idx,1);
  sec.active=Math.max(0,Math.min(idx-1,sec.pages.length-1));
  window.__OCHERKI_EMIT_STRUCTURE?.();
  render();
  updateSave();
  return true;
}

function maxPrefixThatFits(baseText,nextText){
  const tokens=tokenise(nextText);
  let lo=0,hi=tokens.length,best=0;
  while(lo<=hi){
    const mid=(lo+hi)>>1;
    const prefix=untokenise(tokens.slice(0,mid));
    const candidate=mergeText(baseText,prefix);
    if(measuredFits(candidate)){best=mid;lo=mid+1;}
    else hi=mid-1;
  }
  return {tokens,best};
}


function rebalanceContinuationChain(page){
  if(!page) return false;
  const sec=currentSection();
  const start=sec.pages.indexOf(page);
  if(start<0) return false;

  let changed=false;
  // Move text backwards through the complete continuation chain.
  for(let i=start; i<sec.pages.length-1; i++){
    const current=sec.pages[i];
    const next=sec.pages[i+1];

    if(!continuationBelongsTo(next,current)) break;
    if(pageHasRichContent(next)) break;

    const nextText=String(next.text||'').trim();
    if(!nextText){
      sec.pages.splice(i+1,1);
      changed=true;
      i--;
      continue;
    }

    const combined=mergeText(current.text,nextText);

    if(measuredFits(combined)){
      current.text=combined;
      if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(current,current.text);
      sec.pages.splice(i+1,1);
      changed=true;
      i--;
      continue;
    }

    const fit=maxPrefixThatFits(current.text,nextText);
    if(fit.best>0){
      const moved=untokenise(fit.tokens.slice(0,fit.best));
      const rest=untokenise(fit.tokens.slice(fit.best));
      current.text=mergeText(current.text,moved);
      next.text=rest;
      next.movedText=rest;
      next.continuationOf=pageIdentity(current);
      if(window.LifeBookPageBlocks){
        window.LifeBookPageBlocks.syncText(current,current.text);
        window.LifeBookPageBlocks.syncText(next,next.text);
      }
      changed=true;
    }
  }

  if(changed) window.__OCHERKI_EMIT_STRUCTURE?.();
  return changed;
}

function pullTextBackFromContinuation(page){
  if(!page || !pageCanFlow(page)) return false;

  const sec=currentSection();
  const idx=sec.pages.indexOf(page);
  if(idx<0) return false;

  let changed=false;
  let safety=0;

  while(safety++<20){
    const next=sec.pages[idx+1];
    if(!continuationBelongsTo(next,page)) break;
    if(pageHasRichContent(next)) break;

    const nextText=String(next.text||'').trim();

    // Empty auto continuation: remove it immediately.
    if(!nextText){
      const following=sec.pages[idx+2];
      sec.pages.splice(idx+1,1);
      page.overflowContinuationId=following ? pageIdentity(following) : null;
      if(following && following.autoCreated && following.continuation){
        following.continuationOf=pageIdentity(page);
      }
      changed=true;
      continue;
    }

    const combined=mergeText(page.text,nextText);

    // Everything from the next page now fits on the current page.
    if(measuredFits(combined)){
      page.text=combined;
      if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(page,page.text);

      const following=sec.pages[idx+2];
      sec.pages.splice(idx+1,1);
      page.overflowContinuationId=following ? pageIdentity(following) : null;
      if(following && following.autoCreated && following.continuation){
        following.continuationOf=pageIdentity(page);
      }
      changed=true;
      continue;
    }

    // Pull only as much text as actually fits.
    const {tokens,best}=maxPrefixThatFits(page.text,nextText);
    if(best<=0) break;

    const moved=untokenise(tokens.slice(0,best));
    const rest=untokenise(tokens.slice(best));
    if(!moved.trim()) break;

    page.text=mergeText(page.text,moved);
    next.text=rest;
    next.movedText=rest;
    next.continuationOf=pageIdentity(page);
    page.overflowContinuationId=pageIdentity(next);

    if(window.LifeBookPageBlocks){
      window.LifeBookPageBlocks.syncText(page,page.text);
      window.LifeBookPageBlocks.syncText(next,next.text);
    }

    changed=true;
    break; // current page is now filled as far as possible
  }

  if(changed) window.__OCHERKI_EMIT_STRUCTURE?.();
  return changed;
}

function updatePageFill(){
  const ind=document.getElementById('fillIndicator');
  const bar=document.getElementById('fillBar');
  if(!ind) return;

  const sec=currentSection?.();
  if(!sec) return;
  const allPages=Array.isArray(sec.pages)?sec.pages:[];
  // One physical sheet = its own statistics. A chapter/section with several
  // physical sheets shows the total for that whole section.
  const scopePages=allPages.length>1 ? allPages : (currentPage?.() ? [currentPage()] : allPages);

  let words=0, documentsCount=0;
  const uniquePhotos=new Set();
  const uniqueDocuments=new Set();

  scopePages.forEach((page,pageIndex)=>{
    if(!page) return;
    // Template/demo copy is never a user statistic. A page starts counting only
    // after the user actually edits it; this flag is persisted with the page.
    if(page.userEdited===true || page._userEdited===true){
      const text=String(page.text||'').trim();
      if(text) words+=text.split(/\s+/).filter(Boolean).length;
    }

    if(Array.isArray(page.photos)){
      page.photos.forEach((ph,photoIndex)=>{
        if(!ph) return;
        const key=String(ph.id||ph.uid||ph.src||`${page.uid||pageIndex}:${photoIndex}`);
        const isDoc=ph.kind==='document'||ph.type==='document'||ph.isDocument===true;
        if(isDoc) uniqueDocuments.add(key);
        else uniquePhotos.add(key);
      });
    }
  });
  documentsCount=uniqueDocuments.size;
  const photosCount=uniquePhotos.size;

  const fmt=n=>new Intl.NumberFormat('ru-RU').format(n);
  const docForm=n=>n%10===1&&n%100!==11?'документ':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'документа':'документов');
  ind.textContent=`${fmt(words)} ${wordForm(words)}   ${fmt(photosCount)} фото   ${fmt(documentsCount)} ${docForm(documentsCount)}`;
  ind.classList.remove('warn','full');
  if(bar) bar.style.width='0';
}

editor.addEventListener('input',()=>persistSoon());
// v165: the sheet is a page, not a scroll — its first line never slides away
editor.addEventListener('scroll',()=>{if(editor.scrollTop)editor.scrollTop=0;});
editor.addEventListener('input',ev=>{
  const p=currentPage();
  if(!p) return;
  const caretOffset=captureEditorCaretOffset();
  // v165: only erasing empties a sheet away; Enter on a fresh empty sheet keeps it
  const erasing=!ev||!ev.inputType||/^delete/.test(ev.inputType);

  p.text=textFromEditor();
  p.userEdited=true;
  p._userEdited=true;
  syncSemanticHtml(p);
  pageIdentity(p);

  if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.syncText(p,p.text);

  // If the user emptied an automatically created continuation, remove only
  // that empty physical page. Deleted text is never resurrected.
  if(erasing && removeEmptyAutoPage(p)) return;

  clearTimeout(emptySheetRemovalTimer);
  if(erasing && !String(p.text||'').replace(/\s+/g,'').trim() && !pageHasRichContent(p)){
    emptySheetRemovalTimer=setTimeout(()=>{
      if(currentPage()===p) removeEmptyUserSheet(p);
    },900);
  }

  // Word-like reverse flow: when the current page becomes shorter, pull text
  // forward from the next continuation and remove that page if it becomes empty.
  const pulled=rebalanceContinuationChain(p);
  if(pulled){
    render();
    restoreEditorCaretOffset(caretOffset);

    // After pulling text back, the current page may overflow again.
    // Re-run forward flow so long documents keep the chain of pages.
    clearTimeout(overflowFlowTimer);
    overflowFlowTimer=setTimeout(()=>{
      if(currentPage()!==p) return;
      if(editorContentOverflows() && createContinuationPageIfNeeded()){
        render();
        placeCaretEnd(editor);keepCaretAtEnd();
      }
    },120);
  }

  if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(p);
  updateContextActions();
  updatePageFill();
  updateCount();

  if(saveState) saveState.textContent='Сохраняем…';
  clearTimeout(saveTimer);
  saveTimer=setTimeout(updateSave,420);

  // Forward Word-like flow: create exactly one continuation when content
  // really overflows the physical text area.
  clearTimeout(overflowFlowTimer);
  overflowFlowTimer=setTimeout(()=>{
    if(currentPage()!==p) return;
    if(editorContentOverflows() && createContinuationPageIfNeeded()){
      render();
      placeCaretEnd(editor);keepCaretAtEnd();
    }
  },120);
});

// navigation resets the pile's state (the photograph's card cannot be open then: it covers the desk)
function closePhotoImmediate(){
  photoSwitching=false;
  photoAnimating=false;
  photoStack.classList.remove('section-photo-hidden');
}

function foldPhotoStack(after,{revealAfter=true}={}){
  // the next page is rendered at once; its prints come out from under it (revealSectionPhotosCascade). Ordinary page navigation swaps cards immediately.  Only the physical
  // section transition uses the folded state; a missed frame can therefore
  // never leave the incoming photos transparent.
  if(revealAfter){
    photoStack.classList.remove('section-photo-hidden');
    after?.();
    requestAnimationFrame(()=>revealSectionPhotosCascade());
  }else{
    photoStack.classList.add('section-photo-hidden');
    after?.();
  }
}

// v212: the prints of the sheet coming in are tucked under it — they show once the sheet has come to rest over them (they
// were shown at once, whole, while the sheet was still moving: the part under the sheet flashed into view)
function animatePhotoSetChange(direction,after){
  foldPhotoStack(after,{revealAfter:false});
  setTimeout(()=>{photoStack.classList.remove('section-photo-hidden');revealSectionPhotosCascade();},520);
}

function goPage(i,dir=1){
  const pages=currentPages();
  if(i<0||i>=pages.length||i===currentPageIndex())return;
  recoverEditorInteraction();

  if(!editor.dataset.pageUid||editor.dataset.pageUid===String(currentPage().uid||currentPage().id||'')){currentPage().text=textFromEditor();syncSemanticHtml(currentPage());}
  closePhotoImmediate();
  animatePhotoSetChange(dir,()=>{
    currentSection().active=i;
    renderNavigation();
  });
}

function playPhysicalPageFx(volume=.92){
  try{ window.parent?.postMessage({type:'OCHERKI_PAGE_TURN_FX',volume},'*'); }catch(_){}
}

function animatePull(i){
  if(sectionAnimating) return;
  recoverEditorInteraction();
  const g=ghostEls.find(x=>+x.el.dataset.target===i);
  playPhysicalPageFx(.96);
  if(!g)return goPage(i,1);

  activeSheet.classList.add('is-setting-back','page-content-leaving');
  g.el.classList.add('is-pulling');

  setTimeout(()=>{
    activeSheet.classList.remove('is-setting-back');
    g.el.classList.remove('is-pulling');
    const active=currentPageIndex();
    const pages=currentPages();
    let dir=((i-active+pages.length)%pages.length)<=pages.length/2?1:-1;
    goPage(i,dir);
  },150);
}

ghostEls.forEach(({el})=>el.addEventListener('click',()=>{
  if(el.dataset.target!==undefined)animatePull(+el.dataset.target);
}));

function toggle(id){
  const p=document.getElementById(id);
  document.querySelectorAll('.popover').forEach(x=>{if(x!==p)x.classList.remove('open')});
  p.classList.toggle('open');
}
function applyPhotoRenderMode(){
  document.body.classList.toggle('photo-mode-bw',photoRenderMode==='bw');
  if(photoToneBtn){
    const bw=photoRenderMode==='bw';
    photoToneBtn.setAttribute('aria-pressed',bw?'true':'false');
    photoToneBtn.title=bw?'Фото: чёрно-белые':'Фото: цветные';
    photoToneBtn.textContent=bw?'◑':'◐';
  }
}
document.getElementById('sheetBtn').onclick=e=>{e.stopPropagation();toggle('sheetMenu')};
document.getElementById('textBtn').onclick=e=>{e.stopPropagation();toggle('textMenu')};
document.getElementById('moreBtn').onclick=e=>{e.stopPropagation();updateContextActions();toggle('moreMenu')};
photoToneBtn?.addEventListener('click',e=>{
  e.stopPropagation();
  photoRenderMode=photoRenderMode==='bw'?'color':'bw';
  try{localStorage.setItem('ocherki_photo_render_mode',photoRenderMode)}catch(_){ }
  applyPhotoRenderMode();
  updateSave();
  window.__OCHERKI_EMIT_STRUCTURE?.();
});
// A press that starts inside the card (selecting text and letting go
// outside it) never closes the card.
document.addEventListener('click',e=>{
  const inPopover=e.target.closest('.popover');
  if(!inPopover){
    document.querySelectorAll('.popover').forEach(x=>x.classList.remove('open'));
  }
});
document.querySelectorAll('.popover').forEach(x=>x.onclick=e=>e.stopPropagation());

function pageIdentity(page){
  if(!page) return null;
  const existing=page.uid||page.id;
  const uid=existing||('page_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8));
  page.uid=uid;
  page.id=uid;
  return uid;
}

// A new or continued sheet is always a writing sheet: a document, photo or map page is never copied as the next one
// (that is how «+ Лист» once made another «Архивный документ», where text cannot flow on).
function siblingType(src){
  const t=src?.type;if(['chapter','intro','text','inside-back-cover'].includes(t))return t;
  const sec=sections.find(s=>Array.isArray(s.pages)&&s.pages.includes(src));
  const own=sec?.pages?.find(p=>['chapter','intro','text'].includes(p.type));
  return own?own.type:(sec?.type==='chapter'?'chapter':'text');
}
function makeSiblingPage(src,blank=true,options={}){
  const uid='page_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  // v217: a document's text that runs over its sheet goes on to a sheet of the same document (the book joins them)
  if(src?.type==='document'&&options.continuation)return {uid,id:uid,type:'document',bookRole:'document',title:src.title,episode:src.episode,text:'',photos:[],photoOffset:0,included:true,isEpisodeStart:false,autoCreated:true,continuation:true,continuationOf:src.uid||src.id||null,explanation:''};
  const plain=!['chapter','intro','text','inside-back-cover'].includes(src?.type);
  return {
    uid,
    id:uid,
    type:siblingType(src),
    title:plain&&src.type==='document'?(sections.find(s=>s.pages?.includes(src))?.title||src.title):src.title,
    episode:src.episode,
    text:blank?'':src.text,
    photos:[],
    photoOffset:0,
    included:true,
    isEpisodeStart:false,
    autoCreated:!!options.autoCreated,
    userCreated:options.userCreated===true,
    continuation:!!options.continuation,
    continuationOf:options.continuationOf || null,
    movedText:''
  };
}

// v213: a new sheet (a page, an episode, a document) is ready to be written on: once it has come, the caret stands in its text,
// blinking — there is nothing to guess about where to click
function caretInNewSheet(){setTimeout(()=>{try{if(window.__ocPhotoCardOpen?.())return;try{window.parent?.focus();window.frameElement?.focus({preventScroll:true});window.focus();}catch(_){}editor.focus({preventScroll:true});
  const r=document.createRange();r.selectNodeContents(editor);r.collapse(false);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);}catch(_){}},760);}
// v256: the cover, the title and the other one-page parts of the book have one sheet only — a second one could be added (by «+»
// or a sheet carried in) and stayed there empty, with no way to take it away
const ONE_SHEET_IDS=new Set(['cover','title','back-cover','endpaper','back-endpaper','dedication','epigraph','colophon']);
function sheetIsEmpty(pg){return !String(pg?.text||'').split(/\n{2,}/).some(x=>x.trim()&&x!==FIELD_SKIP&&x.trim()!==SAMPLE_PREFIX)&&!(pg?.photos||[]).length;}
function tidyOneSheetSections(){let changed=false;sections.forEach(sec=>{if(!ONE_SHEET_IDS.has(sec.id)||!Array.isArray(sec.pages)||sec.pages.length<2)return;
  const keep=sec.pages.filter((pg,i)=>i===0||!sheetIsEmpty(pg));if(keep.length!==sec.pages.length){sec.pages=keep;sec.active=Math.min(sec.active||0,keep.length-1);changed=true;}});return changed;}
function addPage(){
  if(ONE_SHEET_IDS.has(currentSection()?.id)){window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_NOTE',text:'У этой страницы книги один лист'},'*');return;}
  currentPage().text=textFromEditor();
  const sec=currentSection();
  const at=sec.active+1;
  sec.pages.splice(at,0,makeSiblingPage(currentPage(),true,{userCreated:true}));
  render();
  animatePageChange(at);
  caretInNewSheet();
}

document.getElementById('addPageBtn').onclick=addPage;
document.getElementById('newPageBtn').onclick=addPage;

document.getElementById('duplicateBtn').onclick=()=>{
  currentPage().text=textFromEditor();
  const sec=currentSection();
  const at=sec.active+1;
  sec.pages.splice(at,0,makeSiblingPage(currentPage(),false,{userCreated:true}));
  render();
  animatePageChange(at);
};

document.getElementById('deletePageBtn').onclick=()=>{
  const sec=currentSection();

  if(sec.pages.length<=1){
    const p=sec.pages[0];
    p.text='';
    p.photos=[];
    p.photoOffset=0;
    closePhotoImmediate();
    render();
    return;
  }

  sec.pages.splice(sec.active,1);
  sec.active=Math.min(sec.active,sec.pages.length-1);
  closePhotoImmediate();
  render();
};

function animatePageChange(i){
  const pages=currentPages();
  const active=currentPageIndex();
  if(i===active||i<0||i>=pages.length)return;

  const seq=stackSequence();
  if(!seq.includes(i)) playPhysicalPageFx(.88);
  if(seq.includes(i))return animatePull(i);

  activeSheet.classList.add('is-setting-back','page-content-leaving');
  setTimeout(()=>{
    const dir=i>active?1:-1;
    goPage(i,dir);
    activeSheet.classList.remove('is-setting-back');
  },150);
}

document.getElementById('prevBtn').onclick=()=>{
  const pages=currentPages();
  if(pages.length>1)animatePageChange((currentPageIndex()-1+pages.length)%pages.length);
};
document.getElementById('nextBtn').onclick=()=>{
  const pages=currentPages();
  if(pages.length>1)animatePageChange((currentPageIndex()+1)%pages.length);
};
document.getElementById('backBtn').onclick=()=>{
  const pages=currentPages();
  if(pages.length>1)animatePageChange((currentPageIndex()-1+pages.length)%pages.length);
};

// v213: the letters' size on the sheet is chosen on a ladder, each step written in its own size (it was «плотнее/свободнее» besides,
// which read as nothing); the one in use is marked. Only the sheet changes — the book keeps its own type.
const markSize=()=>document.querySelectorAll('#textMenu [data-size]').forEach(b=>b.classList.toggle('is-on',+b.dataset.size===fontSize));
document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{fontSize=+b.dataset.size;render();markSize();persistSoon();});
document.getElementById('textBtn').addEventListener('click',markSize);
// «Крупный интерфейс»: larger text on the sheet and larger controls around
// it, here and in the constructor around the sheet (shared choice).
function applyLargeUi(on,fromUser){
  document.documentElement.classList.toggle('large-ui',on);
  document.getElementById('largeUiBtn')?.classList.toggle('is-on',on);
  if(fromUser){fontSize=on?Math.max(fontSize,18):14;try{localStorage.setItem('ocherkiLargeUI',on?'1':'0');}catch(e){}render();persistSoon();}
  try{window.parent.postMessage({type:'OCHERKI_LARGE_UI',on},'*');}catch(e){}
}
document.getElementById('largeUiBtn').onclick=()=>applyLargeUi(!document.documentElement.classList.contains('large-ui'),true);
addEventListener('message',e=>{if(e.data&&e.data.type==='OCHERKI_LARGE_UI_SET')applyLargeUi(!!e.data.on,true);});
try{if(localStorage.getItem('ocherkiLargeUI')==='1')applyLargeUi(true,false);}catch(e){}

// Voice input (the browser's own speech recognition): the words go where
// the caret is; «точка», «запятая», «новый абзац»… become punctuation.
(()=>{
  const btn=document.getElementById('voiceBtn'),status=document.getElementById('voiceStatus');
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  let rec=null,listening=false,savedRange=null,startOfSentence=true;
  const say=(html,ms)=>{status.innerHTML=html;status.hidden=false;clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{status.hidden=true;},ms);};
  const SPOKEN=[[/\s*(?<!\p{L})вопросительный знак(?!\p{L})/giu,'?'],[/\s*(?<!\p{L})восклицательный знак(?!\p{L})/giu,'!'],[/\s*(?<!\p{L})точка с запятой(?!\p{L})/giu,';'],[/\s*(?<!\p{L})точка(?!\p{L})/giu,'.'],[/\s*(?<!\p{L})запятая(?!\p{L})/giu,','],[/\s*(?<!\p{L})двоеточие(?!\p{L})/giu,':'],[/\s*(?<!\p{L})многоточие(?!\p{L})/giu,'…'],[/\s*(?<!\p{L})тире(?!\p{L})/giu,' —'],[/\s*(?<!\p{L})(?:новый абзац|новая строка|с новой строки)(?!\p{L})\s*/giu,'\n']];
  const tidy=text=>{
    let out=' '+text.trim();
    for(const [re,to] of SPOKEN)out=out.replace(re,to);
    out=out.replace(/\s+([.,!?;:…])/gu,'$1').replace(/([.,!?;:…])(?=[^\s\n])/gu,'$1 ');
    // A capital letter after the end of a sentence and at the start.
    out=out.replace(/(^\s*|[.!?…]\s+|\n\s*)(\p{Ll})/gu,(m,a,b)=>a+b.toUpperCase());
    if(startOfSentence)out=out.replace(/^\s*(\p{Ll})/u,(m,b)=>b.toUpperCase());
    return out;
  };
  const insert=text=>{
    editor.focus();
    const sel=window.getSelection();
    if(savedRange&&editor.contains(savedRange.startContainer)){sel.removeAllRanges();sel.addRange(savedRange);}
    const range=sel.rangeCount?sel.getRangeAt(0):null,prev=range?range.startContainer.textContent.slice(0,range.startOffset):'';
    if(!prev||/\s$/u.test(prev))text=text.replace(/^ +/u,'');
    const parts=text.split('\n');
    parts.forEach((part,i)=>{if(i>0)document.execCommand('insertParagraph');if(part)document.execCommand('insertText',false,i>0?part.replace(/^\s+/u,''):part);});
    savedRange=sel.rangeCount?sel.getRangeAt(0).cloneRange():null;
    startOfSentence=/[.!?…\n]\s*$/u.test(text);
  };
  const stop=()=>{listening=false;btn.classList.remove('is-listening');try{rec?.stop();}catch(e){}};
  // Pressing the button must not take the caret away from the text.
  btn.addEventListener('pointerdown',e=>{e.preventDefault();const sel=window.getSelection();if(sel.rangeCount&&editor.contains(sel.anchorNode))savedRange=sel.getRangeAt(0).cloneRange();});
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    if(!Recognition){say('Голосовой ввод работает в браузерах Chrome, Edge и Яндекс Браузер.',6000);return;}
    if(listening){stop();say('Готово.',1500);return;}
    // v97: say plainly why the voice cannot start, before the browser's own refusal.
    if(window.isSecureContext===false){say('Голос работает только на защищённом адресе — <b>https://</b>. Сейчас сайт открыт по http: браузер запрещает микрофон. Включите SSL-сертификат на хостинге (обычно бесплатно, Let’s Encrypt).',12000);return;}
    if(!savedRange){const range=document.createRange();range.selectNodeContents(editor);range.collapse(false);savedRange=range;}
    if(editorShowsSample())clearSampleTextIfNeeded();
    const before=savedRange.startContainer.textContent.slice(0,savedRange.startOffset);
    startOfSentence=!before.trim()||/[.!?…]\s*$/u.test(before);
    rec=new Recognition();rec.lang='ru-RU';rec.continuous=true;rec.interimResults=true;
    rec.onresult=event=>{
      let interim='';
      for(let i=event.resultIndex;i<event.results.length;i++){const r=event.results[i];if(r.isFinal)insert(tidy(r[0].transcript));else interim+=r[0].transcript;}
      say(`<b>●</b>${interim?esc(interim):'Слушаю… говорите спокойно. Нажмите микрофон ещё раз, чтобы закончить.'}`);
    };
    rec.onerror=event=>{stop();if(['audio-capture','not-allowed'].includes(event.error)&&navigator.mediaDevices?.enumerateDevices){navigator.mediaDevices.enumerateDevices().then(list=>{if(!list.some(d=>d.kind==='audioinput'))say('К этому компьютеру не подключён микрофон. Подключите наушники с микрофоном или веб-камеру — или диктуйте с телефона: откройте книгу там.',12000);}).catch(()=>{});}if(event.error==='audio-capture'){say('Микрофон не найден или занят другой программой. Проверьте, что он подключён.',9000);return;}say(event.error==='not-allowed'||event.error==='service-not-allowed'?'Браузер не дал доступ к микрофону. Разрешите микрофон для этой страницы (значок слева от адреса) и нажмите ещё раз.':event.error==='no-speech'?'Не слышно голоса. Нажмите микрофон и говорите.':'Голосовой ввод сейчас недоступен. Проверьте интернет и микрофон.',7000);};
    rec.onend=()=>{if(listening){try{rec.start();}catch(e){stop();}}};
    try{rec.start();listening=true;btn.classList.add('is-listening');say('<b>●</b>Слушаю… говорите спокойно. Нажмите микрофон ещё раз, чтобы закончить.');}catch(err){say('Не удалось включить микрофон.',5000);}
  });
})();
function closeMoreMenu(){
  document.getElementById('moreMenu')?.classList.remove('open');
}

const pageContextActions=document.getElementById('pageContextActions');
const quickPhotoBtn=document.getElementById('quickPhotoBtn');
const quickQuoteBtn=document.getElementById('quickQuoteBtn');
const quickDateBtn=document.getElementById('quickDateBtn');
const contextSuggestion=document.getElementById('contextSuggestion');
const contextSuggestionAction=document.getElementById('contextSuggestionAction');
const contextSuggestionDismiss=document.getElementById('contextSuggestionDismiss');
let contextSuggestionValue=null;
let contextSuggestionDismissedKey='';

function currentEpisodeContextKey(){
  const p=currentPage(), s=currentSection();
  return [s?.id||'', p?.id||'', p?.episode||'', String(p?.text||'').length].join('|');
}

function pageHasDateValue(page,value){
  if(!window.LifeBookPageBlocks) return false;
  return window.LifeBookPageBlocks.normalize(page).some(b=>
    b?.type==='date' && String(b.content||'').trim()===String(value||'').trim()
  );
}

function detectContextSuggestion(){
  const p=currentPage();
  if(!p || p.autoContents || p.type==='contents') return null;
  const text=String(p.text||'');
  const years=[...text.matchAll(/\b(18\d{2}|19\d{2}|20\d{2})\b/g)].map(m=>m[1]);
  const year=years.find(y=>!pageHasDateValue(p,y));
  if(year) return null;
  return null;
}

function updateContextSuggestion(){
  if(!contextSuggestion) return;
  const suggestion=detectContextSuggestion();
  const key=currentEpisodeContextKey()+'|'+(suggestion?.type||'')+'|'+(suggestion?.value||'');
  if(!suggestion || key===contextSuggestionDismissedKey){
    contextSuggestion.classList.remove('show');
    contextSuggestionValue=null;
    return;
  }
  contextSuggestionValue=suggestion;
  contextSuggestionAction.textContent=suggestion.label;
  contextSuggestion.classList.add('show');
}

let ctxTargetX=0,ctxTargetY=0,ctxCurrentX=0,ctxCurrentY=0,ctxRAF=0;

function caretRectInsideEditor(){
  const sel=window.getSelection();
  if(!sel || !sel.rangeCount) return null;
  const range=sel.getRangeAt(0).cloneRange();
  if(!editor.contains(range.startContainer)) return null;

  let rect=range.getBoundingClientRect();
  // v221: a collapsed caret has no box: it is measured by the letter beside it (or its line), never by putting a marker into
  // the text — that moved the selection, which asked for a new measure, and so on thousands of times a second (the caret
  // never blinked)
  if(!rect || (!rect.width && !rect.height)){
    const n=range.startContainer,o=range.startOffset,r=document.createRange();
    if(n.nodeType===3&&o<n.length){r.setStart(n,o);r.setEnd(n,o+1);const q=r.getClientRects()[0];if(q)return new DOMRect(q.left,q.top,0,q.height);}
    if(n.nodeType===3&&o>0){r.setStart(n,o-1);r.setEnd(n,o);const q=r.getClientRects()[0];if(q)return new DOMRect(q.right,q.top,0,q.height);}
    const el=n.nodeType===1?(n.childNodes[o]||n):n.parentElement;const q=el?.getBoundingClientRect?.();
    if(q)return new DOMRect(q.left,q.top,0,parseFloat(getComputedStyle(el.nodeType===1?el:editor).lineHeight)||q.height);
  }
  return rect;
}

function animateContextActions(){
  const dx=ctxTargetX-ctxCurrentX;
  const dy=ctxTargetY-ctxCurrentY;
  ctxCurrentX+=dx*.22;
  ctxCurrentY+=dy*.22;
  pageContextActions.style.setProperty('--ctx-x',ctxCurrentX+'px');
  pageContextActions.style.setProperty('--ctx-y',ctxCurrentY+'px');
  if(Math.abs(dx)>.15 || Math.abs(dy)>.15){
    ctxRAF=requestAnimationFrame(animateContextActions);
  }else{
    ctxCurrentX=ctxTargetX;ctxCurrentY=ctxTargetY;ctxRAF=0;
  }
}

function positionContextActionsAtCaret(immediate=false){
  if(!pageContextActions || !editor) return;
  const rect=caretRectInsideEditor();
  const sheetRect=activeSheet.getBoundingClientRect();
  if(!rect || !sheetRect.width) return;

  const menuW=pageContextActions.offsetWidth||220;
  const menuH=pageContextActions.offsetHeight||30;

  // Always keep the menu below the current text line.
  // Horizontal position can flip left/right, but vertical position never moves above the line.
  const safeGap=30;
  const lineGap=10;
  let x=rect.right-sheetRect.left+safeGap;
  let y=rect.bottom-sheetRect.top+lineGap;

  if(x+menuW>sheetRect.width-18) x=rect.left-sheetRect.left-menuW-safeGap;
  if(x<18) x=Math.max(18,rect.left-sheetRect.left);

  // Keep it inside the physical sheet while remaining below the line.
  if(y+menuH>sheetRect.height-14){
    y=Math.min(sheetRect.height-menuH-14, rect.bottom-sheetRect.top+4);
  }
  if(y<18) y=18;

  ctxTargetX=x;ctxTargetY=y;
  if(immediate || (!ctxCurrentX && !ctxCurrentY)){
    ctxCurrentX=x;ctxCurrentY=y;
    pageContextActions.style.setProperty('--ctx-x',x+'px');
    pageContextActions.style.setProperty('--ctx-y',y+'px');
  }else if(!ctxRAF){
    ctxRAF=requestAnimationFrame(animateContextActions);
  }
}

function updateContextActions(){
  const p=currentPage();
  const editable=!!p && !p.autoContents && p.type!=='contents';
  const hasDate=editable && (
    !!String(p.eraDate||p.dateLabel||p.dateWatermark||'').trim() ||
    (Array.isArray(p.blocks) && p.blocks.some(block=>block?.type==='date')) ||
    !!editor.querySelector('.semantic-date')
  );
  const editorActive=editable && (document.activeElement===editor || editor.contains(document.activeElement));
  const keepOpen=pageContextActions?.matches(':hover') || pageContextActions?.contains(document.activeElement);
  activeSheet.classList.toggle('context-actions-visible', editable && (editorActive || keepOpen));
  if(quickPhotoBtn) quickPhotoBtn.hidden=!editable || !canHavePhotos(p);
  if(quickQuoteBtn) quickQuoteBtn.hidden=!editable;
  if(quickDateBtn) quickDateBtn.hidden=!editable;
  const deleteDateBtn=document.getElementById('deleteDateBtn');
  if(deleteDateBtn) deleteDateBtn.hidden=!hasDate;
  if(editable && (editorActive || keepOpen)) requestAnimationFrame(()=>positionContextActionsAtCaret(false));
  updateContextSuggestion();
}

const semanticModal=document.getElementById('semanticModal');
const semanticModalInput=document.getElementById('semanticModalInput');
const semanticModalTitle=document.getElementById('semanticModalTitle');
const semanticModalKicker=document.getElementById('semanticModalKicker');
let pendingSemanticType=null;
let semanticCaretBookmark=null;
let editingSemanticToken=null;

function saveEditorCaretBookmark(){
  const sel=window.getSelection();
  if(!sel || !sel.rangeCount) return null;
  const range=sel.getRangeAt(0);
  if(!editor.contains(range.startContainer)) return null;

  const pre=document.createRange();
  pre.selectNodeContents(editor);
  pre.setEnd(range.startContainer,range.startOffset);

  return {
    start:pre.toString().length,
    end:pre.toString().length + range.toString().length
  };
}

function restoreEditorCaretBookmark(bookmark){
  if(!bookmark) return false;
  let start=Math.max(0,bookmark.start||0);
  let end=Math.max(start,bookmark.end??start);
  const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);
  let node,pos=0,startNode=null,endNode=null,startOffset=0,endOffset=0;

  while((node=walker.nextNode())){
    const next=pos+node.nodeValue.length;
    if(!startNode && start<=next){
      startNode=node; startOffset=Math.max(0,start-pos);
    }
    if(!endNode && end<=next){
      endNode=node; endOffset=Math.max(0,end-pos); break;
    }
    pos=next;
  }

  if(!startNode){
    editor.focus();
    const r=document.createRange();
    r.selectNodeContents(editor);
    r.collapse(false);
    const s=window.getSelection();
    s.removeAllRanges(); s.addRange(r);
    return true;
  }

  if(!endNode){endNode=startNode;endOffset=startOffset;}
  const r=document.createRange();
  r.setStart(startNode,Math.min(startOffset,startNode.nodeValue.length));
  r.setEnd(endNode,Math.min(endOffset,endNode.nodeValue.length));
  const s=window.getSelection();
  s.removeAllRanges(); s.addRange(r);
  editor.focus();
  return true;
}

function insertSemanticTextAtCaret(type,content){
  restoreEditorCaretBookmark(semanticCaretBookmark);
  const sel=window.getSelection();
  if(!sel || !sel.rangeCount) return;

  const range=sel.getRangeAt(0);
  range.deleteContents();

  let rendered=content;
  if(type==='quote') rendered='«'+content+'»';

  // Insert as a semantic inline token so it can later be edited without
  // confusing it with ordinary prose, while preserving the current design.
  const token=document.createElement('span');
  token.className='semantic-inline semantic-'+type;
  token.dataset.semanticType=type;
  token.dataset.semanticId='semantic_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
  token.contentEditable='false';
  token.setAttribute('contenteditable','false');
  token.textContent=rendered;

  const spacerBefore=document.createTextNode(' ');
  const spacerAfter=document.createTextNode(' ');
  const frag=document.createDocumentFragment();
  frag.append(spacerBefore,token,spacerAfter);
  range.insertNode(frag);

  const after=document.createRange();
  after.setStartAfter(spacerAfter);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);

  semanticCaretBookmark=saveEditorCaretBookmark();
}

function semanticConfig(type){
  return {
    quote:{title:'Добавить цитату',kicker:'ЦИТАТА',placeholder:'Введите текст цитаты…',single:false},
    date:{title:'Дата или период эпизода',kicker:'ДАТА · ВОДЯНОЙ ЗНАК',placeholder:'Например: 1987 или 1987—1992',single:true}
  }[type]||null;
}

function openSemanticModal(type){
  const cfg=semanticConfig(type);
  if(!cfg || !currentPage() || !window.LifeBookPageBlocks) return;
  semanticCaretBookmark=saveEditorCaretBookmark() || semanticCaretBookmark;
  pendingSemanticType=type;
  editingSemanticToken=null;
  document.getElementById('semanticModalDelete').hidden=true;
  document.getElementById('semanticModalDone').textContent='Добавить';
  semanticModalTitle.textContent=cfg.title;
  semanticModalKicker.textContent=cfg.kicker;
  semanticModalInput.placeholder=cfg.placeholder;
  semanticModalInput.value='';
  semanticModalInput.classList.toggle('single',!!cfg.single);
  semanticModal.setAttribute('aria-hidden','false');
  semanticModal.classList.add('open');
  closeMoreMenu();
  requestAnimationFrame(()=>semanticModalInput.focus());
}

function closeSemanticModal(){
  semanticModal.classList.remove('open');
  semanticModal.setAttribute('aria-hidden','true');
  pendingSemanticType=null;
  semanticModalInput.value='';
  editingSemanticToken=null;
}

function commitSemanticModal(){
  const type=pendingSemanticType;
  const content=String(semanticModalInput.value||'').trim();
  if(!type || !content) return;

  const page=currentPage();

  if(editingSemanticToken){
    editingSemanticToken.textContent=type==='quote' ? '«'+content+'»' : content;

    // Update the closest matching semantic block rather than creating a duplicate.
    const blocks=window.LifeBookPageBlocks.normalize(page);
    const oldValue=String(editingSemanticToken.dataset.originalContent||'');
    let block=blocks.find(b=>b?.type===type && String(b.content||'')===oldValue);
    if(!block) block=[...blocks].reverse().find(b=>b?.type===type);
    if(block) block.content=content;
    if(type==='quote') page.quote=content;
    if(type==='date') { page.eraDate=content; page.dateWatermark=content; page.dateMode='watermark'; }

    editingSemanticToken.dataset.originalContent=content;
  }else{
    if(type==='quote') { window.LifeBookPageBlocks.addQuote(page,content); page.quote=content; }
    if(type==='date') { window.LifeBookPageBlocks.addDate(page,content); page.eraDate=content; page.dateWatermark=content; page.dateMode='watermark'; }

    insertSemanticTextAtCaret(type,content);
    const sel=window.getSelection();
    if(sel?.anchorNode){
      const el=(sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement);
      const previous=el?.previousSibling?.previousSibling;
      if(previous?.classList?.contains('semantic-inline')) previous.dataset.originalContent=content;
    }
  }

  closeSemanticModal();
  page.text=textFromEditor();
  syncSemanticHtml(page);
  window.LifeBookPageBlocks.syncText(page,page.text);
  if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(page);
  updateContextActions();
  updateCount();
  updateSave();
  window.__OCHERKI_EMIT_STRUCTURE?.();
}

editor.addEventListener('click',e=>{
  const token=e.target.closest?.('.semantic-inline');
  if(!token) return;
  const type=token.dataset.semanticType;
  const cfg=semanticConfig(type);
  if(!cfg) return;

  pendingSemanticType=type;
  editingSemanticToken=token;
  token.dataset.originalContent=token.dataset.originalContent || (
    type==='quote'
      ? token.textContent.replace(/^«|»$/g,'')
      : token.textContent
  );

  semanticModalTitle.textContent=type==='quote'?'Изменить цитату':'Изменить дату';
  semanticModalKicker.textContent=cfg.kicker;
  semanticModalInput.placeholder=cfg.placeholder;
  semanticModalInput.value=token.dataset.originalContent;
  semanticModalInput.classList.toggle('single',!!cfg.single);
  document.getElementById('semanticModalDelete').hidden=false;
  document.getElementById('semanticModalDone').textContent='Сохранить';
  semanticModal.setAttribute('aria-hidden','false');
  semanticModal.classList.add('open');
  requestAnimationFrame(()=>{semanticModalInput.focus();semanticModalInput.select();});
});

document.getElementById('semanticModalDelete').onclick=()=>{
  if(!editingSemanticToken) return;
  const page=currentPage();
  const type=editingSemanticToken.dataset.semanticType;
  const original=String(editingSemanticToken.dataset.originalContent||'');
  editingSemanticToken.remove();
  if(type==='quote') page.quote='';
  if(type==='date') { page.eraDate=''; page.dateLabel=''; page.dateWatermark=''; page.dateMode=''; }

  const blocks=window.LifeBookPageBlocks.normalize(page);
  for(let index=blocks.length-1;index>=0;index-=1){
    if(blocks[index]?.type===type && String(blocks[index].content||'')===original) blocks.splice(index,1);
  }

  closeSemanticModal();
  editingSemanticToken=null;
  page.text=textFromEditor();
  syncSemanticHtml(page);
  window.LifeBookPageBlocks.syncText(page,page.text);
  if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(page);
  updateContextActions();
  updateCount();
  updateSave();
};

document.getElementById('semanticModalDone').onclick=commitSemanticModal;
document.getElementById('semanticModalCancel').onclick=closeSemanticModal;
document.getElementById('semanticModalBackdrop').onclick=closeSemanticModal;
semanticModalInput.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();closeSemanticModal();return;}
  if(e.key==='Enter' && semanticModalInput.classList.contains('single')){
    e.preventDefault();commitSemanticModal();
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && semanticModal.classList.contains('open')) closeSemanticModal();
});

document.getElementById('addQuoteBtn').onclick=()=>openSemanticModal('quote');
document.getElementById('addDateBtn').onclick=()=>openSemanticModal('date');
document.getElementById('deleteDateBtn').onclick=()=>{
  const page=currentPage();
  if(!page) return;
  editor.querySelectorAll('.semantic-date').forEach(token=>token.remove());
  page.eraDate='';
  page.dateLabel='';
  page.dateWatermark='';
  page.dateMode='';
  if(Array.isArray(page.blocks)){
    page.blocks=page.blocks.filter(block=>block?.type!=='date');
  }
  closeMoreMenu();
  page.text=textFromEditor();
  syncSemanticHtml(page);
  window.LifeBookPageBlocks?.syncText?.(page,page.text);
  window.LifeBookCompositionEngine?.update?.(page);
  updateContextActions();
  updateCount();
  updateSave();
  window.__OCHERKI_EMIT_STRUCTURE?.();
};

quickQuoteBtn.onclick=()=>openSemanticModal('quote');
quickDateBtn.onclick=()=>openSemanticModal('date');
quickPhotoBtn.onclick=()=>{
  if(canHavePhotos(currentPage())){
    if(window.LifeBookPageBlocks) window.LifeBookPageBlocks.normalize(currentPage());
    photoInput.click();
  }
};
contextSuggestionAction.onclick=()=>{
  const s=contextSuggestionValue;
  if(!s) return;
  if(s.type==='date'){
    semanticCaretBookmark=saveEditorCaretBookmark() || semanticCaretBookmark;
    pendingSemanticType='date';
    semanticModalTitle.textContent='Добавить дату';
    semanticModalKicker.textContent='ДАТА';
    semanticModalInput.placeholder='Например: 1987';
    semanticModalInput.value=s.value;
    semanticModalInput.classList.add('single');
    semanticModal.setAttribute('aria-hidden','false');
    semanticModal.classList.add('open');
    contextSuggestion.classList.remove('show');
    requestAnimationFrame(()=>{semanticModalInput.focus();semanticModalInput.select();});
  }
};
if(contextSuggestionDismiss) contextSuggestionDismiss.onclick=()=>{
  const s=contextSuggestionValue;
  contextSuggestionDismissedKey=currentEpisodeContextKey()+'|'+(s?.type||'')+'|'+(s?.value||'');
  contextSuggestion.classList.remove('show');
};
editor.addEventListener('focus',()=>{
  activeSheet.classList.add('context-actions-visible');
  requestAnimationFrame(()=>positionContextActionsAtCaret(true));
  updateContextActions();
});
editor.addEventListener('keyup',()=>{semanticCaretBookmark=saveEditorCaretBookmark()||semanticCaretBookmark;positionContextActionsAtCaret(false);});
editor.addEventListener('click',()=>{semanticCaretBookmark=saveEditorCaretBookmark()||semanticCaretBookmark;positionContextActionsAtCaret(false);});
document.addEventListener('selectionchange',()=>{
  if(document.activeElement===editor && window.getSelection()?.rangeCount){
    positionContextActionsAtCaret(false);
  }
});
editor.addEventListener('blur',()=>{
  setTimeout(()=>{
    if(!pageContextActions?.matches(':hover') &&
       !pageContextActions?.contains(document.activeElement) &&
       !contextSuggestion?.contains(document.activeElement)){
      activeSheet.classList.remove('context-actions-visible');
    }
  },180);
});
pageContextActions.addEventListener('mousedown',e=>{
  semanticCaretBookmark=saveEditorCaretBookmark()||semanticCaretBookmark;
  e.preventDefault();
});
window.addEventListener('resize',()=>positionContextActionsAtCaret(true));

pageIncludeToggle.onclick=()=>{
  if(!optionalAuto()) return;
  const sec=currentSection(), page=currentPage();
  const next=!(sec.included!==false && page.included!==false);
  page.included=next;
  sec.included=(sec.pages||[]).some(item=>item.included!==false);
  render();
};
document.getElementById('addPhotoBtn').onclick=()=>{
  if(canHavePhotos(currentPage())){
    if(window.LifeBookPageBlocks) LifeBookPageBlocks.normalize(currentPage());
    photoInput.click();
  }
};
function addDocumentPage(opts){
  if(currentPage()) currentPage().text=textFromEditor();
  const sec=currentSection();
  if(!sec || sec.type!=='chapter') return;
  const at=(sec.active||0)+1;
  const uid='page_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  sec.pages.splice(at,0,{uid,id:uid,type:'document',bookRole:'document',title:String(opts?.title||'').trim()||'Архивный документ',episode:currentPage()?.episode||'Эпизод 1. Новый эпизод',text:String(opts?.text||'').trim(),explanation:'',photos:opts?.src?[{id:'photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),src:opts.src,caption:String(opts?.title||'').trim(),year:'',place:'',people:'',source:'',story:'',photoMode:'auto',layoutPreference:'auto',isDocument:true,status:'uploaded',_newEntry:true}]:[],photoOffset:0,included:true,isEpisodeStart:false,userCreated:true});
  sec.included=true;
  sec.active=at;
  closeMoreMenu(); render(); animatePageChange(at); caretInNewSheet();
  window.__OCHERKI_EMIT_STRUCTURE?.();
}
function addEpisode(opts){
  if(currentPage()) currentPage().text=textFromEditor();
  // v126: «＋ Эпизод» from the manuscript names its chapter and always goes to its end.
  if(opts&&opts.sectionId){const i=sections.findIndex(s=>s.id===opts.sectionId);if(i>=0&&i!==activeSection){activeSection=i;}}
  const sec=currentSection();
  if(!sec || sec.type!=='chapter') return;
  const at=opts&&opts.atEnd?(sec.pages||[]).length:(sec.active||0)+1;
  const existing=new Set((sec.pages||[]).map(p=>String(p.episode||'').trim()).filter(Boolean));
  const next=existing.size+1;
  const uid='page_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  // v212: an episode taken from the desk's stack is born with its name and its «когда · где» (they were written in after it)
  const nm=String(opts?.title||'').trim()||'Новый эпизод',wh=[String(opts?.when||'').trim(),String(opts?.where||'').trim()];
  sec.pages.splice(at,0,{uid,id:uid,type:'text',title:nm,episode:`Эпизод ${next}. ${nm}`,text:'',photos:[],photoOffset:0,dropCapPreference:'auto',isEpisodeStart:true,included:true,userCreated:true,
    ...(wh[0]?{episodeWhen:wh[0]}:{}),...(wh[1]?{episodeWhere:wh[1]}:{}),...(wh[0]||wh[1]?{episodeLine:wh.filter(Boolean).join(' · ')}:{})});
  sec.included=true;
  sec.active=at;
  closeMoreMenu(); render(); animatePageChange(at); caretInNewSheet();
  window.__OCHERKI_EMIT_STRUCTURE?.();
}
document.getElementById('addDocumentBtn')?.addEventListener('click',addDocumentPage);
document.getElementById('newEpisodeBtn')?.addEventListener('click',addEpisode);

photoInput.addEventListener('change',e=>{
  closePhotoImmediate();
  if(!canHavePhotos(currentPage())){e.target.value='';return}

  const targetPage=currentPage();
  [...e.target.files].forEach(f=>{
    const r=new FileReader();
    r.onload=()=>{
      const rec={id:'photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),src:r.result,caption:'',year:'',place:'',people:'',source:'',story:'',photoMode:'auto',layoutPreference:'auto',isDocument:targetPage?.type==='document',status:'uploaded',_newEntry:true};
      const commit=()=>{
        if(!Array.isArray(targetPage.photos)) targetPage.photos=[];
        targetPage.photos.push(rec);
        if(window.LifeBookPageBlocks) LifeBookPageBlocks.addPhoto(targetPage,rec);
        if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(targetPage);
        updateContextActions();
        renderPhotos();
        window.__OCHERKI_EMIT_STRUCTURE?.();
      };
      const probe=new Image();
      probe.onload=()=>{
        rec.width=probe.naturalWidth||0;
        rec.height=probe.naturalHeight||0;
        rec.orientation=rec.width>rec.height?'landscape':rec.height>rec.width?'portrait':'square';
        commit();
        analyzePhotoInBackground(rec);
      };
      probe.onerror=()=>{ commit(); analyzePhotoInBackground(rec); };
      probe.src=r.result;
    };
    r.readAsDataURL(f);
  });

  e.target.value='';
});

// v213: «заменить фото» from the photograph's card: the new file takes the old one's place everywhere it stands; the card is told
let pendingPhotoReplaceTarget=null;
function replacePhotoFile(page,photo,done){if(!page||!photo)return;pendingPhotoReplaceTarget={page,photo,pageUid:page.uid,photoId:photo.id,done};
  if(photoReplaceInput)photoReplaceInput.value='';photoReplaceInput?.click();}
photoReplaceInput?.addEventListener('change',e=>{
  const f=e.target.files?.[0];
  const target=pendingPhotoReplaceTarget;
  pendingPhotoReplaceTarget=null;
  if(!f||!target?.page||!target?.photo){e.target.value='';return;}
  const r=new FileReader();
  r.onload=()=>{
    const rec=target.photo;
    const oldSrc=String(rec.src||'');
    rec.revision=(Number(rec.revision)||0)+1;
    // A revision fragment also refreshes the preview when the replacement file
    // happens to have the same bytes/name as the previous selection.
    rec.src=r.result+(r.result.includes('#')?'&':'#')+'photo-revision-'+rec.revision;
    const finish=()=>{
      const blocks=window.LifeBookPageBlocks?.normalize(target.page)||[];
      blocks.filter(block=>block?.type==='photo'&&(block.photoId===rec.id||block.src===oldSrc)).forEach(block=>{
        block.photoId=rec.id;
        block.src=rec.src;
      });
      if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(target.page);
      updatePhotoStatus(rec);
      if(currentPage()===target.page)renderPhotos();
      try{target.done?.(rec);}catch(_){}
      render();
      updateSave();
      window.__OCHERKI_EMIT_STRUCTURE?.();
      window.parent?.postMessage({type:'OCHERKI_PHOTO_REPLACED',pageUid:target.pageUid,photoId:target.photoId,revision:rec.revision},'*');
    };
    const probe=new Image();
    probe.onload=()=>{
      rec.width=probe.naturalWidth||0;
      rec.height=probe.naturalHeight||0;
      rec.orientation=rec.width>rec.height?'landscape':rec.height>rec.width?'portrait':'square';
      finish();
      analyzePhotoInBackground(rec);
    };
    probe.onerror=()=>{ finish(); analyzePhotoInBackground(rec); };
    probe.src=r.result;
  };
  r.readAsDataURL(f);
  e.target.value='';
});
function visiblePhotoIndices(){
  const photos=currentPhotos();
  const offset=currentPage().photoOffset||0;
  const res=[];
  for(let i=0;i<Math.min(3,photos.length);i++)res.push((offset+i)%photos.length);
  return res;
}

// v211: riffling through the prints — the one on top slips out to the side, the rest glide to their new places, the next one
// comes up from beneath (it was an instant redraw)
function animatePhotoCarousel(direction){
  const photos=currentPhotos();
  if(photoAnimating||photos.length<=3)return;
  photoAnimating=true;
  const p=currentPage();
  const leaving=photoStack.querySelector(direction>0?'.photo-card.p1':'.photo-card.p3');
  if(leaving){leaving.style.transition='left .42s ease,opacity .42s ease';leaving.style.left='-170px';leaving.style.opacity='0';}
  try{(window.parent?.parent?.OcherkiFX||window.parent?.OcherkiFX)?.play?.('page',.25);}catch(_){}
  setTimeout(()=>{
    try{if(p)window.__ocRelayPile(()=>{p.photoOffset=((p.photoOffset||0)+direction+photos.length)%photos.length;},leaving?.dataset.index);}
    finally{photoAnimating=false;armInteractionWatchdog();}
  },380);
}

function renderPhotos(){
  const photos=currentPhotos();
  updatePageFill();
  photoStack.innerHTML='';

  if(!canHavePhotos(currentPage())||!photos.length){
    photoStack.classList.remove('show');
    closePhotoImmediate();
    return;
  }

  photoStack.classList.add('show');
  // v256: on another sheet the prints come in one after another, and «ещё N» only once they lie (it showed first, the prints
  // appeared at once after it)
  {const u=currentPage()?.uid||currentPage()?.id||'';if(photoStack._uid!==u){photoStack._uid=u;photoStack.classList.remove('ph-in');void photoStack.offsetWidth;photoStack.classList.add('ph-in');
    clearTimeout(photoStack._inT);photoStack._inT=setTimeout(()=>photoStack.classList.remove('ph-in'),1400);}}

  visiblePhotoIndices().forEach((photoIndex,visIdx)=>{
    const p=photos[photoIndex];
    updatePhotoStatus(p);
    const c=document.createElement('button');
    c.type='button';
    const tone=String(p.photoMode||'auto').toLowerCase();
    c.className='photo-card p'+(visIdx+1)+(p._newEntry?' photo-new-entry':'')+(tone==='bw'?' photo-card-bw':'');
    c.dataset.index=photoIndex;
    c.innerHTML=`<img alt=""><div class="note">${p.caption?esc(p.caption):''}</div>`;
    if(p._newEntry){
      c.addEventListener('animationend',()=>{delete p._newEntry;c.classList.remove('photo-new-entry')},{once:true});
    }
    c.querySelector('img').src=p.src;
    c.addEventListener('click',ev=>{
      ev.stopPropagation();
      window.__ocTakePhoto?.(c,photoIndex);// v210: the print is taken up and turned over (the old side card is not opened)
    });
    photoStack.appendChild(c);
  });

  // v210: no arrows beside the prints any more — the pile fans out under the hand, and «+N» tells how many lie beneath
  window.__ocBadge?.();
}

/* Section navigation by vertical wheel.
   The physical page stack is not used for sections. */
function stripCloneIds(root){
  root.removeAttribute('id');
  root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  root.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
}

function lockSectionStack(){
  ghostEls.forEach(({el})=>{
    el.classList.remove('stack-cascade-in');
    el.classList.add('stack-hidden-for-section');
  });
  stackIndicator.classList.remove('show');
}
// v223: before the chapter scrolls away its sheets fanned at the right slide back under the open sheet one after another, the
// farthest first (the mirror of their cascade in); the scroll begins when the last is under (they vanished at once)
function foldSectionStack(done){
  const vis=ghostEls.filter(({el})=>el.style.display!=='none'&&!el.classList.contains('stack-hidden-for-section')&&getComputedStyle(el).display!=='none').reverse();
  if(!vis.length)return done();
  let left=vis.length;
  // the pile's long shadow goes over to the open sheet as the fold begins (it waited for the sheets to vanish, then jumped)
  vis.forEach(({el})=>{el._folding=true;el.classList.remove('is-pile-bottom');});activeSheet.classList.add('is-pile-bottom');
  vis.forEach(({el},k)=>{const from=getComputedStyle(el).transform;
    const a=el.animate([{transform:from},{transform:'translate(0px,0px) scale(1)'}],{duration:300,delay:k*90,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
    a.onfinish=()=>{el._folding=false;el.classList.add('stack-hidden-for-section');a.cancel();if(--left===0)done();};});
}

function revealSectionStackCascade(){
  const visible=ghostEls.filter(({el})=>el.style.display!=='none' && el.dataset.target!==undefined);
  // the long shadow goes to the lowest sheet as the cascade begins, and fades across while they slide out
  if(visible.length){document.querySelectorAll('.sheet.is-pile-bottom').forEach(x=>x.classList.remove('is-pile-bottom'));visible[visible.length-1].el.classList.add('is-pile-bottom');}
  visible.forEach(({el},slot)=>{
    el.classList.remove('stack-cascade-in');
    // Force the folded state to paint before the cascade starts.
    void el.offsetWidth;
    setTimeout(()=>{
      el.classList.remove('stack-hidden-for-section');
      el.classList.add('stack-cascade-in');
      el.addEventListener('animationend',()=>el.classList.remove('stack-cascade-in'),{once:true});
    },slot*90);
  });
  ghostEls.filter(({el})=>!visible.some(v=>v.el===el)).forEach(({el})=>el.classList.remove('stack-hidden-for-section','stack-cascade-in'));
  setTimeout(()=>stackIndicator.classList.toggle('show',currentPages().length>1),Math.max(0,visible.length-1)*90+260);
}

function lockSectionPhotos(){
  photoStack.classList.add('section-photo-hidden');
}

// v213: the prints of the sheet slide out from under its left edge one after another (the lowest first), ~0.4 s in all
function revealSectionPhotosCascade(){
  photoStack.classList.remove('section-photo-hidden');
  const cards=[...photoStack.querySelectorAll('.photo-card')].sort((a,b)=>(+getComputedStyle(a).zIndex||0)-(+getComputedStyle(b).zIndex||0));
  cards.forEach((el,i)=>{try{el.animate([{translate:'64px 0',opacity:0},{translate:'0px 0',opacity:1}],{duration:420,delay:i*130,easing:'cubic-bezier(.2,.8,.3,1)',fill:'backwards'});}catch(_){}});
}

function goSection(nextIndex,dir){
  if(sectionAnimating||nextIndex<0||nextIndex>=sections.length||nextIndex===activeSection)return;
  recoverEditorInteraction();

  currentPage().text=textFromEditor();
  closePhotoImmediate();
  sectionAnimating=true;

  // Use exactly the same thumbnail folding physics as page/menu navigation.
  // Once the old thumbnails have fully retracted, the physical sheet scroll begins.
  // the sheets at the right and the photographs go back at the same time; the scroll begins when both are done
  let waiting=2;const both=f=>()=>{if(--waiting===0)f();};
  const scroll=()=>{
    lockSectionStack();

    const stack=activeSheet.parentElement;
    stack.classList.add('section-shadow-lock');
    const activeRect=activeSheet.getBoundingClientRect();
    const stackRect=stack.getBoundingClientRect();

    // v205: the shadow held under the sheet's place is laid exactly on the sheet's own box (it was a box of the stack's own
    // size: at night its foot showed as a line below the sheet, and the shadow changed as the turn began and ended)
    stack.style.setProperty('--lkL',(activeRect.left-stackRect.left-stack.clientLeft)+'px');stack.style.setProperty('--lkT',(activeRect.top-stackRect.top-stack.clientTop)+'px');
    stack.style.setProperty('--lkW',activeRect.width+'px');stack.style.setProperty('--lkH',activeRect.height+'px');
    const viewport=document.createElement('div');
    viewport.className='section-scroll-viewport';
    viewport.style.left=(activeRect.left-stackRect.left)+'px';
    viewport.style.top=(activeRect.top-stackRect.top)+'px';
    viewport.style.width=activeRect.width+'px';
    viewport.style.height=activeRect.height+'px';

    const oldClone=activeSheet.cloneNode(true);
    stripCloneIds(oldClone);
    oldClone.classList.remove('active','section-out-next','section-out-prev','section-in-next','section-in-prev','is-setting-back','v46-new-from-bottom','v46-new-from-top');
    oldClone.classList.add('section-scroll-sheet',dir>0?'section-scroll-old-up':'section-scroll-old-down');
    viewport.appendChild(oldClone);

    activeSection=nextIndex;
    renderNavigation();
    lockSectionStack();
    lockSectionPhotos();

    const newClone=activeSheet.cloneNode(true);
    stripCloneIds(newClone);
    newClone.classList.remove('active','section-out-next','section-out-prev','section-in-next','section-in-prev','is-setting-back','v46-new-from-bottom','v46-new-from-top');
    newClone.classList.add('section-scroll-sheet',dir>0?'section-scroll-new-from-bottom':'section-scroll-new-from-top');
    viewport.appendChild(newClone);

    stack.appendChild(viewport);
    window.__ltPut?.();// v206: the copies get their light from the screen before they are painted
    activeSheet.style.visibility='hidden';

    setTimeout(()=>{
      viewport.remove();
      activeSheet.style.visibility='';
      revealSectionStackCascade();
      revealSectionPhotosCascade();
      stack.classList.remove('section-shadow-lock');
      sectionAnimating=false;
      recoverEditorInteraction();
    },830);
  };
  foldSectionStack(both(scroll));foldPhotoStack(both(scroll),{revealAfter:false});
}
window.addEventListener('wheel' ,e=>{
  if(sectionAnimating)return;

  wheelAccum+=e.deltaY;
  clearTimeout(wheelResetTimer);
  wheelResetTimer=setTimeout(()=>wheelAccum=0,180);

  if(Math.abs(wheelAccum)<70)return;

  const dir=wheelAccum>0?1:-1;
  wheelAccum=0;

  const next=activeSection+dir;
  if(next>=0&&next<sections.length){
    e.preventDefault();
    goSection(next,dir);
  }
},{passive:false});

window.addEventListener('resize',()=>render());
window.addEventListener('resize',()=>{try{updatePrompts();}catch(_){}});
// Family tree form (book-renderer/tree-editor.js).
function bookPhotos(){
  const out=[],seen=new Set();
  for(const section of sections)for(const page of section.pages||[])for(const photo of page.photos||[]){
    if(!photo||!photo.src||photo.isDocument||seen.has(String(photo.id)))continue;
    seen.add(String(photo.id));out.push({id:String(photo.id),src:photo.src,caption:photo.caption||''});
  }
  return out;
}
// Questions for a prompted chapter, beside the sheet (not in the book).
function updatePrompts(){
  // The chapter's questions now appear above the sheet, written by hand out
  // of a mist (the constructor shows them); the old card beside the sheet
  // stays hidden.
  const old=document.getElementById('pagePrompts');if(old)old.hidden=true;
  if(true)return;
  let box=document.getElementById('pagePrompts');
  const page=currentPage(),questions=Array.isArray(page?.prompts)?page.prompts.filter(Boolean):[];
  if(!questions.length){if(box)box.hidden=true;return;}
  if(!box){box=document.createElement('aside');box.id='pagePrompts';box.className='page-prompts';document.body.appendChild(box);
    box.addEventListener('click',event=>{if(event.target.closest('[data-hide]')){const p=currentPage();if(p){p.promptsHidden=!p.promptsHidden;updatePrompts();persistSoon();}}});}
  box.hidden=false;
  // Beside the sheet when there is room; otherwise a small button on the
  // sheet that opens the list over it.
  const sheet=document.getElementById('activeSheet')?.getBoundingClientRect();
  const roomy=sheet&&window.innerWidth-sheet.right>=300;
  box.classList.toggle('is-pinned',!roomy);
  if(sheet){
    if(roomy){box.style.left=Math.round(sheet.right+24)+'px';box.style.right='auto';box.style.top=Math.round(sheet.top+40)+'px';}
    else{box.style.left='auto';box.style.right=Math.max(8,Math.round(window.innerWidth-sheet.right+16))+'px';box.style.top=Math.round(sheet.top+52)+'px';}
  }
  if(!roomy&&page.promptsHidden===undefined)page.promptsHidden=true;
  box.classList.toggle('is-collapsed',!!page.promptsHidden);
  box.innerHTML=`<div class="page-prompts__head"><span>Вопросы к главе · ${questions.length}</span><button type="button" data-hide>${page.promptsHidden?'Показать':'Свернуть'}</button></div>`+(page.promptsHidden?'':`<ol>${questions.map(question=>`<li>${esc(question)}</li>`).join('')}</ol><p class="page-prompts__note">Это подсказки, в книгу они не попадут.</p>`);
}
// Short samples for the editorial sheets; the interview sheet can also
// receive ready questions (an unanswered one stays out of the book).
const PAGE_SAMPLES={
  interview:'Вопрос — отдельной строкой со знаком «?» в конце, ответ — строкой ниже.\nКаким было ваше первое воспоминание?\nПомню, как отец посадил меня на лошадь…',
  voices:'Воспоминание — отдельным абзацем, строкой ниже с тире — кто это сказал.\nБабушка пекла пироги каждую субботу.\n— внучка Анна',
  recipes:'Первая строка — название, строки с тире — что нужно, дальше — как готовили.\nПироги с капустой бабушки Марии\n— мука — 500 г\nТесто ставили с вечера…',
  timeline:'Каждое событие — с новой строки: год — место — что произошло.\n1921 — Владикавказ — Новый этап для семьи\nок. 1930 — Ташкент — Переезд всей семьёй',
  'family-tree':'Каждый человек — с новой строки, супруг через «+», дети ниже с тире.\nИван Петров + Мария Петрова\n— Анна Петрова'
};
const READY_QUESTIONS=['Каким было ваше первое воспоминание?','Какой была ваша семья, когда вы были ребёнком?','Кого вы считаете своим главным учителем в жизни?','Каким был самый счастливый день в вашей жизни?','Что было самым трудным и как вы это пережили?','Чему вас научила жизнь?','Что бы вы хотели передать внукам?'];
let pageSamplesHidden=false;
try{pageSamplesHidden=localStorage.getItem('ocherkiSamplesHidden')==='1';}catch(e){}
function updatePageSample(){
  const box=document.getElementById('pageSample');if(!box)return;
  const page=currentPage(),type=page?.type,sample=PAGE_SAMPLES[type];
  const paperEl=activeSheet.querySelector('.paper');
  const hasTree=type==='family-tree'&&page?.treeData&&page.treeData.people;
  const empty=!String(page?.text||'').trim();
  // An empty sheet already shows the full example inside the text area.
  const show=!!sample&&!hasTree&&!pageUsesForm(page)&&(!empty||type==='interview');
  box.hidden=!show;paperEl?.classList.toggle('has-page-sample',show);
  if(!show)return;
  const lines=sample.split('\n');
  const insert=type==='interview'&&READY_QUESTIONS.some(question=>!String(page.text||'').includes(question))?'<button type="button" class="page-sample__insert" data-insert-questions>Вставить готовые вопросы</button>':'';
  box.classList.toggle('is-collapsed',pageSamplesHidden);
  const backToForm=PAGE_FORMS[type]&&page?.freeText?'<button type="button" class="free-back" data-form-back>Вернуться к удобной форме</button>':'';
  box.innerHTML=empty
    ?`<div class="page-sample__head"><span>Можно начать с готовых вопросов</span></div>${insert}`
    :`<div class="page-sample__head"><span>Образец</span><button type="button" data-toggle-sample>${pageSamplesHidden?'Показать':'Свернуть'}</button></div><div class="page-sample__body"><div>${esc(lines[0])}</div><div style="color:#a8968a">${lines.slice(1).map(esc).join('<br>')}</div>${insert}</div>`;
  if(type==='timeline'&&!empty){const status=timelineMapStatus(page.text);if(status)box.insertAdjacentHTML('beforeend',status);}
  if(backToForm)box.insertAdjacentHTML('beforeend',backToForm);
  requestAnimationFrame(()=>paperEl?.style.setProperty('--page-sample-room',Math.round(box.offsetHeight+130)+'px'));
}
// The map «География семьи» needs at least three places the book knows;
// the timeline sheet says which places were found and which were not,
// instead of the map silently not appearing.
function timelineMapStatus(text){
  let geo=null;try{geo=window.parent?.OcherkiGeo||window.OcherkiGeo;}catch(e){geo=window.OcherkiGeo;}
  if(!geo?.resolve)return '';
  const found=[],missing=[];
  for(const line of String(text||'').split(/\r?\n/u)){
    const match=line.match(/^\s*((?:(?:ок\.|около|до|после|с|весна|лето|осень|зима)\s+)?(\d{4})(?:-е)?(?:\s*[–-]\s*\d{4})?)\s*(?:[—–-]+\s*|[.,:]\s*|\s+)(.+)$/iu);if(!match)continue;
    const parts=match[3].split(/\s+[—–-]+\s+/u).map(part=>part.trim()).filter(Boolean);
    const place=parts.length>1?parts[0]:'';if(!place)continue;
    const hit=geo.resolve(place);
    if(hit){const key=hit.lat.toFixed(1)+','+hit.lon.toFixed(1);if(!found.includes(key))found.push(key);}else if(!missing.includes(place))missing.push(place);
  }
  if(!found.length&&!missing.length)return '<div class="page-sample__map">Для карты пишите место между годом и событием: «1930 — Батуми — …».</div>';
  const ok=found.length>=3;
  const head=ok?`Карта «География семьи» будет: мест на ней — ${Math.min(found.length,8)}.`:`Карта появится, когда будет 3 известных места (сейчас ${found.length}).`;
  const miss=missing.length?` Не нашлось: ${missing.slice(0,4).map(esc).join(', ')}${missing.length>4?'…':''} — допишите через запятую ближайший город, например «${esc(missing[0])}, Краснодар».`:'';
  const many=found.length>8?' На карте поместится 8 мест: оставьте главные.':'';
  return `<div class="page-sample__map${ok?' is-ok':''}">${head}${miss}${many}</div>`;
}
document.getElementById('pageSample')?.addEventListener('click',event=>{
  if(event.target.closest('[data-form-back]')){const page=currentPage();if(page){page.freeText=false;persistSoon();render();}return;}
  if(event.target.closest('[data-toggle-sample]')){pageSamplesHidden=!pageSamplesHidden;try{localStorage.setItem('ocherkiSamplesHidden',pageSamplesHidden?'1':'0');}catch(e){}updatePageSample();return;}
  if(event.target.closest('[data-insert-questions]')){
    const page=currentPage();if(!page)return;
    const have=String(page.text||'');
    const fresh=READY_QUESTIONS.filter(question=>!have.includes(question));
    if(!fresh.length)return;
    page.text=(have.trim()?have.replace(/\s+$/u,'')+'\n\n':'')+fresh.join('\n\n');
    page.userEdited=true;page.sample=false;
    editor.innerHTML=htmlFromText(page.text);
    editor.dispatchEvent(new Event('input',{bubbles:true}));
    updatePageSample();
    // The caret goes to the end of the first new question: Enter, then the answer.
    const target=[...editor.querySelectorAll('p')].find(p=>p.textContent.trim()===fresh[0]);
    if(target){editor.focus();const range=document.createRange();range.selectNodeContents(target);range.collapse(false);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);}
  }
});
let timelineStatusTimer=0;editor.addEventListener('input',()=>{if(currentPage()?.type==='timeline'){clearTimeout(timelineStatusTimer);timelineStatusTimer=setTimeout(updatePageSample,700);}});
editor.addEventListener('input',()=>{const box=document.getElementById('pageSample');const empty=!String(currentPage()?.text||'').trim();if(PAGE_SAMPLES[currentPage()?.type]&&(box?.hidden||box?.dataset.empty!==String(empty))){box&&(box.dataset.empty=String(empty));updatePageSample();}});
// On the interview sheet a question (a line ending with «?») is set apart
// from the answers, so the author sees at once where to write.
function markInterviewQuestions(){
  const isInterview=currentPage()?.type==='interview';
  editor.querySelectorAll('p').forEach(p=>p.classList.toggle('is-question',isInterview&&/\?\s*$/u.test(p.textContent)));
}
editor.addEventListener('input',markInterviewQuestions);
// ---- Forms for «Рецепты и традиции», «Голоса семьи», «Вопросы и ответы»,
// «Хронология». The page text keeps the book's own format (the book engine
// reads it as before); the author only fills in fields.
const PAGE_FORMS={
  recipes:{
    intro:'Каждый рецепт или семейная традиция — отдельной карточкой. Фото встают по порядку: первое — к первому рецепту, второе — ко второму.',
    add:'＋ Ещё рецепт или традиция',
    parse:text=>String(text||'').split(/^\s*\*{3,}\s*$/mu).map(block=>{
      const lines=block.split(/\r?\n/u).map(line=>line.trim()).filter(Boolean);if(!lines.length)return null;
      const items=[],how=[];for(const line of lines.slice(1)){const m=line.match(/^[—–\-•·*]\s*(.+)$/u);if(m)items.push(m[1]);else how.push(line);}
      return {title:lines[0],items,how:how.join('\n')};
    }).filter(Boolean),
    empty:()=>({title:'',items:['',''],how:''}),
    write:list=>list.map(r=>[r.title.trim(),...r.items.map(i=>i.trim()).filter(Boolean).map(i=>'— '+i),...String(r.how||'').split(/\n+/u).map(l=>l.trim()).filter(Boolean)].filter(Boolean).join('\n')).filter(Boolean).join('\n***\n'),
    card:(r,i)=>`<div class="pf-card-no">Рецепт или традиция ${i+1}</div>
      <label class="pf-label">Название</label><input class="pf-input" data-f="title" value="${esc(r.title)}" placeholder="Например: Пироги с капустой бабушки Марии">
      <label class="pf-label">Что нужно — по одной строчке <i style="color:#a88a6c">(для традиции можно пропустить)</i></label>
      <div data-list>${(r.items.length?r.items:['']).map(item=>`<div class="pf-item"><input class="pf-input" data-f="item" value="${esc(item)}" placeholder="Например: мука — 500 г"></div>`).join('')}</div>
      <button type="button" class="pf-add pf-small" data-act="item">＋ ещё строчка</button>
      <div class="pf-photo" data-photo-slot="${i}"></div>
      <label class="pf-label">Как готовили или как это было</label><textarea class="pf-text" data-f="how" rows="4" placeholder="Например: Тесто ставили с вечера, а утром вся семья лепила пироги…">${esc(r.how)}</textarea>`,
    read:card=>({title:card.querySelector('[data-f=title]').value,items:[...card.querySelectorAll('[data-f=item]')].map(x=>x.value),how:card.querySelector('[data-f=how]').value})
  },
  voices:{
    intro:'Короткие воспоминания разных людей о герое или о семье. Каждое — отдельной карточкой.',
    add:'＋ Ещё воспоминание',
    parse:text=>String(text||'').split(/\n\s*\n/u).map(block=>{const lines=block.split(/\r?\n/u).map(l=>l.trim()).filter(Boolean);if(!lines.length)return null;const last=lines.at(-1).match(/^[—–-]\s*(.+)$/u);return {text:(last?lines.slice(0,-1):lines).join(' '),who:last?last[1].trim():''};}).filter(v=>v&&(v.text||v.who)),
    empty:()=>({text:'',who:''}),
    write:list=>list.filter(v=>v.text.trim()).map(v=>v.text.trim().replace(/\n+/gu,' ')+(v.who.trim()?'\n— '+v.who.trim():'')).join('\n\n'),
    card:(v,i)=>`<div class="pf-card-no">Воспоминание ${i+1}</div>
      <label class="pf-label">Что он или она вспоминает</label><textarea class="pf-text" data-f="text" rows="3" placeholder="Например: Бабушка пекла пироги каждую субботу, и весь двор знал, что у нас праздник.">${esc(v.text)}</textarea>
      <label class="pf-label">Кто это сказал</label><input class="pf-input" data-f="who" value="${esc(v.who)}" placeholder="Например: внучка Анна">`,
    read:card=>({text:card.querySelector('[data-f=text]').value,who:card.querySelector('[data-f=who]').value})
  },
  interview:{
    intro:'Разговор с героем книги: вопрос и ответ его словами. Вопросы без ответа в книгу не попадут.',
    add:'＋ Ещё вопрос',
    parse:text=>{const out=[];for(const raw of String(text||'').split(/\r?\n/u)){const line=raw.trim();if(!line)continue;if(/\?$/u.test(line))out.push({q:line,a:''});else if(out.length)out.at(-1).a+=(out.at(-1).a?'\n':'')+line;else out.push({q:'',a:line,intro:true});}return out;},
    empty:()=>({q:'',a:''}),
    write:list=>list.map(x=>{const q=x.q.trim(),a=String(x.a||'').split(/\n+/u).map(l=>l.trim()).filter(Boolean).join('\n');if(!q)return a;return (/\?$/u.test(q)?q:q.replace(/[.!…]*$/u,'')+'?')+(a?'\n'+a:'');}).filter(Boolean).join('\n\n'),
    card:(x,i)=>`<div class="pf-card-no">${x.intro?'Вступление':'Вопрос '+(i+1)}</div>
      ${x.intro?'':`<label class="pf-label">Вопрос</label><input class="pf-input" data-f="q" value="${esc(x.q)}" placeholder="Например: Каким было ваше первое воспоминание?">`}
      <label class="pf-label">${x.intro?'Несколько слов перед разговором':'Ответ — словами героя'}</label><textarea class="pf-text" data-f="a" rows="3" placeholder="${x.intro?'Например: Этот разговор мы записали летом, на даче.':'Например: Помню, как отец посадил меня на лошадь. Мне было года три…'}">${esc(x.a)}</textarea>`,
    read:card=>({q:card.querySelector('[data-f=q]')?.value||'',a:card.querySelector('[data-f=a]').value,intro:!card.querySelector('[data-f=q]')})
  },
  timeline:{
    intro:'Главные события семьи — по одному в строке. Из них соберутся разворот «Хронология» и карта «География семьи».',
    add:'＋ Ещё событие',table:true,
    parse:text=>String(text||'').split(/\r?\n/u).map(line=>line.trim()).filter(Boolean).map(line=>{
      const m=line.match(/^((?:(?:ок\.|около|до|после|с|весна|лето|осень|зима)\s+)?\d{4}(?:-е)?(?:\s*[–-]\s*\d{4})?)\s*(?:[—–-]+\s*|[.,:]\s*|\s+)(.+)$/iu);
      if(!m)return {year:'',place:'',what:line};
      const parts=m[2].split(/\s+[—–-]+\s+/u).map(p=>p.trim()).filter(Boolean);
      return parts.length>1?{year:m[1].trim(),place:parts[0],what:parts.slice(1).join(' — ')}:{year:m[1].trim(),place:'',what:parts[0]||''};
    }),
    empty:()=>({year:'',place:'',what:''}),
    write:list=>list.filter(e=>e.year.trim()||e.what.trim()).map(e=>[e.year.trim(),e.place.trim(),e.what.trim()].filter(Boolean).join(' — ')).join('\n'),
    card:e=>`<div class="pf-row"><input class="pf-input pf-year" data-f="year" value="${esc(e.year)}" placeholder="1930"><input class="pf-input pf-place" data-f="place" value="${esc(e.place)}" placeholder="Батуми"><input class="pf-input pf-what" data-f="what" value="${esc(e.what)}" placeholder="Дедушка работает в порту"></div>`,
    read:card=>({year:card.querySelector('[data-f=year]').value,place:card.querySelector('[data-f=place]').value,what:card.querySelector('[data-f=what]').value})
  }
};
let pageFormFor=null,pageFormEmit=0;
function saveFormText(text){
  const p=currentPage();if(!p)return;
  p.text=text;p.userEdited=true;p._userEdited=true;p.sample=false;
  try{syncSemanticHtml(p);}catch(e){}
  try{pageIdentity(p);}catch(e){}
  try{window.LifeBookPageBlocks?.syncText(p,p.text);}catch(e){}
  persistSoon();
  clearTimeout(pageFormEmit);pageFormEmit=setTimeout(()=>{try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(e){}if(p.type==='timeline')updateFormStatus();},500);
}
function updateFormStatus(){
  const box=document.getElementById('pageForm')?.querySelector('.pf-status');if(!box)return;
  const html=timelineMapStatus(currentPage()?.text||'');
  const tmp=document.createElement('div');tmp.innerHTML=html;const node=tmp.firstElementChild;
  box.className='pf-status'+(node?.classList.contains('is-ok')?' is-ok':'');box.textContent=node?node.textContent:'';
}
function updatePageForm(){
  const form=document.getElementById('pageForm'),paperEl=activeSheet.querySelector('.paper');if(!form)return;
  const page=currentPage(),def=PAGE_FORMS[page?.type];
  const on=Boolean(def&&pageUsesForm(page));
  paperEl?.classList.toggle('has-form',on);form.hidden=!on;
  if(!on){pageFormFor=null;return;}
  if(pageFormFor===page){refreshRecipePhotos();return;}   // the form is not redrawn while typing
  pageFormFor=page;
  let list=def.parse(page.sample?'':page.text);
  if(!list.length)list=[def.empty()];
  const ready=page.type==='interview'?`<button type="button" class="pf-add pf-small" data-act="ready">Добавить готовые вопросы</button>`:'';
  form.innerHTML=`<p class="pf-intro">${def.intro}</p>${page.type==='timeline'?'<div class="pf-status"></div><div class="pf-tablehead"><span>Год</span><span>Место</span><span>Что произошло</span></div>':''}<div data-cards>${list.map((item,i)=>`<div class="${def.table?'pf-line':'pf-card'}" data-card>${def.table?'':'<button type="button" class="pf-remove" data-act="remove">убрать</button>'}${def.card(item,i)}</div>`).join('')}</div><button type="button" class="pf-add" data-act="add">${def.add}</button> ${ready}<button type="button" class="pf-free" data-act="free">Писать обычным текстом</button>`;
  if(page.type==='timeline')updateFormStatus();
  refreshRecipePhotos();
}
// Each recipe card shows its photo (the page's photos in order) or offers to add one.
function refreshRecipePhotos(){
  const page=currentPage();if(page?.type!=='recipes')return;
  const photos=(page.photos||[]).filter(photo=>photo&&(photo.src||photo.dataUrl));
  document.querySelectorAll('#pageForm [data-photo-slot]').forEach(slot=>{
    const photo=photos[Number(slot.dataset.photoSlot)];
    const html=photo?`<img src="${esc(photo.src||photo.dataUrl)}" alt=""><span>Фото к этому рецепту. Убрать или заменить его можно в карточке фото на листе.</span>`:`<button type="button" class="pf-add pf-small" data-act="photo">＋ Добавить фото к рецепту</button><span>Без фото рецепт займёт страницу целиком.</span>`;
    if(slot.dataset.html!==html){slot.innerHTML=html;slot.dataset.html=html;}
  });
}
(()=>{
  const form=document.getElementById('pageForm');if(!form)return;
  const collect=()=>{const page=currentPage(),def=PAGE_FORMS[page?.type];if(!def)return;saveFormText(def.write([...form.querySelectorAll('[data-card]')].map(def.read)));};
  form.addEventListener('input',collect);
  form.addEventListener('click',event=>{
    const act=event.target.closest('[data-act]')?.dataset.act;if(!act)return;
    const page=currentPage(),def=PAGE_FORMS[page?.type];if(!def)return;
    if(act==='add'){const cards=form.querySelector('[data-cards]'),n=cards.children.length;const div=document.createElement('div');div.className=def.table?'pf-line':'pf-card';div.dataset.card='';div.innerHTML=(def.table?'':'<button type="button" class="pf-remove" data-act="remove">убрать</button>')+def.card(def.empty(),n);cards.appendChild(div);div.querySelector('input,textarea')?.focus();div.scrollIntoView({block:'nearest',behavior:'smooth'});return;}
    if(act==='item'){const list=event.target.closest('[data-card]').querySelector('[data-list]');const row=document.createElement('div');row.className='pf-item';row.innerHTML='<input class="pf-input" data-f="item" placeholder="Например: молоко — 1 стакан">';list.appendChild(row);row.querySelector('input').focus();return;}
    if(act==='remove'){const card=event.target.closest('[data-card]');const filled=[...card.querySelectorAll('input,textarea')].some(x=>x.value.trim());if(filled&&!card.dataset.sure){card.dataset.sure='1';event.target.textContent='точно убрать?';return;}card.remove();collect();return;}
    if(act==='ready'){const have=String(page.text||'');const fresh=READY_QUESTIONS.filter(q=>!have.includes(q));if(!fresh.length)return;saveFormText((have.trim()?have.trim()+'\n\n':'')+fresh.join('\n\n'));pageFormFor=null;updatePageForm();return;}
    if(act==='photo'){document.getElementById('quickPhotoBtn')?.click();return;}
    if(act==='free'){page.freeText=true;persistSoon();pageFormFor=null;render();return;}
  });
})();
function updateTreeUi(){
  updatePrompts();
  updatePageForm();
  updatePageSample();
  markInterviewQuestions();
  const button=document.getElementById('treeLaunch');if(!button)return;
  const page=currentPage(),isTree=currentSection()?.id==='family-tree'&&page;
  button.hidden=!isTree;
  if(!isTree){editor.classList.remove('tree-locked');return;}
  const hasModel=!!(page.treeData&&page.treeData.people);
  button.textContent=hasModel?'Изменить древо':'Составить древо по шагам';
  editor.classList.toggle('tree-locked',hasModel);
  if(hasModel)editor.setAttribute('contenteditable','false');
}
document.getElementById('treeLaunch')?.addEventListener('click',()=>{
  const page=currentPage();if(!page||!window.OcherkiTreeEditor)return;
  window.OcherkiTreeEditor.open({page,photos:bookPhotos(),onChange:(model,text)=>{
    // One person per paragraph, so the page shows the tree line by line.
    text=String(text||'').split('\n').join('\n\n');
    page.treeData=model;page.text=text;page.userEdited=true;page._userEdited=true;page.semanticHtml='';
    if(currentPage()===page){editor.innerHTML=htmlFromText(text);updateTreeUi();}
    persistSoon();
    try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}
  }});
});
// «Кто на фото» (book-renderer/people-marker.js) and «было — стало», from the photograph's card (v213: they take the photograph
// itself; the card says on its buttons what is done)
function markPeopleLabel(photo){const n=(photo?.peopleMarks||[]).filter(mark=>mark&&mark.name).length;return n?`кто на фото: ${n}`:'отметить людей';}
function markPeoplePhoto(photo,done){if(!photo||!window.OcherkiPeopleMarker)return done?.();
  const doc=(()=>{try{return window.parent!==window&&window.frameElement?window.parent.document:document;}catch(_){return document;}})();
  window.OcherkiPeopleMarker.open({doc,src:photo.src,marks:photo.peopleMarks||[],onDone:marks=>{
    photo.peopleMarks=marks;const names=marks.map(mark=>mark.name).filter(Boolean).join(', ');
    if(!String(photo.people||'').trim()&&names)photo.people=names;
    persistSoon();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}done?.();},onCancel:()=>done?.()});}
function chapterPhotos(){return (currentSection().pages||[]).flatMap(page=>page.photos||[]).filter(photo=>photo&&photo.src&&!photo.isDocument);}
function pairLabel(photo){const other=photo&&chapterPhotos().find(item=>String(item.id)===String(photo.pairWith||'')&&String(item.pairWith||'')===String(photo.id));
  return other?(photo.pairRole==='now'?'«стало» ✓':'«было» ✓'):'было — стало';}
function pairPhoto(photo,done){if(!photo)return done?.();
  const others=chapterPhotos().filter(item=>item!==photo);
  const current=others.find(item=>String(item.id)===String(photo.pairWith||''));
  const box=document.createElement('div');box.className='pair-picker';
  box.innerHTML=`<div class="pair-picker__box"><h3>Было — стало</h3><p>Выберите второй снимок того же места или человека. В книге они встанут рядом: слева «было», справа «стало». Если у снимков указаны годы, порядок определится по ним.</p>`
    +(others.length?`<div class="pair-picker__grid">${others.map((item,index)=>`<button type="button" data-index="${index}" class="${item===current?'is-current':''}"><img src="${esc(item.src)}" alt=""></button>`).join('')}</div>`:'<p>В этой главе нет других фото. Добавьте второй снимок в эту же главу.</p>')
    +`<div class="pair-picker__actions">${current?'<button type="button" data-act="swap">Поменять местами</button><button type="button" data-act="clear">Убрать пару</button>':''}<button type="button" data-act="close">Закрыть</button></div></div>`;
  document.body.appendChild(box);
  // Clicks here must not reach the sheet, which would close the photo card.
  ['pointerdown','mousedown','mouseup','click'].forEach(type=>box.addEventListener(type,event=>event.stopPropagation()));
  const unpair=item=>{if(!item)return;const partner=chapterPhotos().find(other=>String(other.id)===String(item.pairWith||''));if(partner&&String(partner.pairWith||'')===String(item.id)){delete partner.pairWith;delete partner.pairRole;}delete item.pairWith;delete item.pairRole;};
  const finish=()=>{box.remove();persistSoon();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}done?.();};
  box.addEventListener('click',event=>{
    const pick=event.target.closest('[data-index]'),act=event.target.closest('[data-act]')?.dataset.act;
    if(pick){const other=others[Number(pick.dataset.index)];unpair(photo);unpair(other);photo.pairWith=other.id;other.pairWith=photo.id;photo.pairRole='then';other.pairRole='now';finish();return;}
    if(act==='swap'&&current){const role=photo.pairRole==='now'?'then':'now';photo.pairRole=role;current.pairRole=role==='now'?'then':'now';finish();return;}
    if(act==='clear'){unpair(photo);finish();return;}
    if(act==='close'||event.target===box){box.remove();done?.();}
  });
}
const renderWithoutTree=render;
render=function(){const result=renderWithoutTree.apply(this,arguments);updateTreeUi();return result;};
render(); restoreProject();

/*@block ["", ""]*/
window.addEventListener('message',e=>{
 if(!e.data||e.data.type!=='ocherki-key')return;
 const ed=document.getElementById('editor'); if(!ed)return;
 ed.focus();
 const k=e.data.key;
 if(k==='Backspace') document.execCommand('delete',false,null);
 else if(k==='Enter') document.execCommand('insertLineBreak',false,null);
 else if(k==='Tab') document.execCommand('insertText',false,'    ');
 else if(typeof k==='string' && k.length) document.execCommand('insertText',false,k);
 ed.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:k}));
});

/*@block [" id=\"v46-host-bridge\"", ""]*/
window.addEventListener('keydown',e=>{
  try{
    window.parent.postMessage({
      type:'OCHERKI_PHYSICAL_KEY',
      phase:'down',
      code:e.code==='NumpadEnter'?'Enter':e.code,
      repeat:!!e.repeat
    },'*');
  }catch(_){}
},true);

window.addEventListener('keyup',e=>{
  try{
    window.parent.postMessage({
      type:'OCHERKI_PHYSICAL_KEY',
      phase:'up',
      code:e.code==='NumpadEnter'?'Enter':e.code
    },'*');
  }catch(_){}
},true);

window.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.type!=='OCHERKI_HOST_MODE')return;
  document.body.classList.toggle('host-night',d.mode==='night');
  document.body.classList.toggle('host-day',d.mode==='day'||d.mode==='evening');
  document.body.classList.toggle('host-eve',d.mode==='evening');
});

/*@block [" id=\"v51-structure-bridge\"", ""]*/
(() => {
  const AUTO_IDS = new Set(['cover','endpaper','title','dedication','epigraph','contents','intro','author','timeline','family-tree','voices','recipes','interview','afterword','thanks','sources','colophon','back-endpaper','inside-back-cover','back-cover','final']);
  let serial = 0;
  const makeId = (prefix='node') => `${prefix}-${Date.now().toString(36)}-${(++serial).toString(36)}`;

  function ensureIds(){
    sections.forEach(section => {
      if(!section.id) section.id = makeId('section');
      section.pages = Array.isArray(section.pages) ? section.pages : [];
      section.pages.forEach(page => {
        if(!page.uid) page.uid = makeId('page');
        if(!Array.isArray(page.photos)) page.photos = [];
        if(typeof page.photoOffset !== 'number') page.photoOffset = 0;
        if(typeof page.text !== 'string') page.text = '';
        if(!page.editorialOverrides || typeof page.editorialOverrides !== 'object' || Array.isArray(page.editorialOverrides)) page.editorialOverrides = {};
        if(typeof page.included !== 'boolean') page.included = section.included !== false;
        if(typeof page.isEpisodeStart !== 'boolean') page.isEpisodeStart = page.type === 'chapter';
      });
    });
  }

  function isAuto(section){ return AUTO_IDS.has(section.id) || !!section.auto; }
  function totalPages(){ return sections.reduce((n,s)=>n+(s.included===false?0:(s.pages||[]).filter(p=>p.included!==false).length),0); }

  function state(){
    ensureIds();
      return {
        photoMode: photoRenderMode,
        activeSection,
      activePage: currentSection()?.active || 0,
      totalPages: totalPages(),
      editorDiagnostic: window.OcherkiEditorSourceBridge?.editorLineDiagnostic(editor) || null,
      sections: sections.map((section, sectionIndex) => ({
        id: section.id,
        title: section.title || 'Раздел',
        type: section.type || 'text',
        auto: isAuto(section),
        // A chapter the author has not touched yet (only the sample text).
        sample: section.type === 'chapter' && (section.pages || []).every(page => !(page.userEdited === true || page._userEdited === true) && !(page.photos || []).length),
        included: section.included !== false,
        active: sectionIndex === activeSection,
        activePage: section.active || 0,
        pages: (section.pages || []).map((page, pageIndex) => ({
          uid: page.uid,
          type: page.type || 'text',
          title: page.title || section.title || 'Лист',
          episode: page.episode || '',
          episodeLine: String(page.episodeLine || '').trim(),
          // Sentences glued without a space («побуждениями.Александр», as
          // text pasted from a website often is) get their space back, so a
          // justified line does not stretch around one long «word».
          text: String(page.text || '').replace(/([а-яё][.!?…»])(?=[А-ЯЁ])/gu, '$1 '),
          semanticHtml: String(page.semanticHtml || ''),
          quote: String(page.quote || ''),
          eraDate: String(page.eraDate || ''),
          dateLabel: String(page.eraDate || page.dateLabel || ''),
          dateWatermark: String(page.dateWatermark || ''),
          dateMode: String(page.dateMode || ''),
          blocks: Array.isArray(page.blocks) ? page.blocks.map(block=>({type:String(block?.type||''),content:String(block?.content||''),photoId:String(block?.photoId||''),src:String(block?.src||''),mode:String(block?.mode||'')})) : [],
          explanation: String(page.explanation || page.comment || ''),
          importantLine: String(page.importantLine || page.emphasis || page.important || ''),
          marginNote: String(page.marginNote || page.outerNote || page.margin || ''),
          ctxHandwrittenNote: String(page.ctxHandwrittenNote || ''),
          inlineQuote: String(page.inlineQuote || page.narrativeQuote || ''),
          editorialOverrides: page.editorialOverrides && typeof page.editorialOverrides === 'object' && !Array.isArray(page.editorialOverrides)
            ? Object.assign({}, page.editorialOverrides) : {},
          dropCapPreference: page.dropCapPreference || 'auto',
          wordCount: (page.userEdited===true||page._userEdited===true) && String(page.text||'').trim() ? String(page.text||'').trim().split(/\s+/).filter(Boolean).length : 0,
          userEdited: !!(page.userEdited===true||page._userEdited===true),
          photoCount: Array.isArray(page.photos) ? page.photos.length : 0,
          prompts: Array.isArray(page.prompts) ? page.prompts.filter(Boolean).map(String) : [],
          photos: Array.isArray(page.photos) ? page.photos.slice(0,12).map(photo => ({
            id: String(photo?.id || ''),
            src: String(photo?.src || ''),
            caption: String(photo?.caption || ''),
            year: String(photo?.year || ''),
            place: String(photo?.place || ''),
            people: String(photo?.people || ''),
            source: String(photo?.source || ''),
            story: String(photo?.story || ''),
            photoMode: String(photo?.photoMode || 'auto'),
            colorKind: String(photo?.colorKind || ''),
            edgeTone: String(photo?.edgeTone || ''),
            rightTone: String(photo?.rightTone || ''),
            layoutPreference: String(photo?.layoutPreference || 'auto'),
            portraitHero: photo?.portraitHero === true,
            heroYears: String(photo?.heroYears || ''),
            heroRole: String(photo?.heroRole || ''),
            heroVariant: String(photo?.heroVariant || ''),
            width: Number(photo?.width || 0),
            height: Number(photo?.height || 0),
            orientation: String(photo?.orientation || ''),
            inferred: photo?.inferred && typeof photo.inferred === 'object' ? Object.assign({},photo.inferred) : {},
            isDocument: photo?.isDocument === true,
            focalX: Number.isFinite(Number(photo?.focalX)) ? Number(photo.focalX) : 50,
            focalY: Number.isFinite(Number(photo?.focalY)) ? Number(photo.focalY) : 50,
            focalConfirmed: photo?.focalConfirmed === true,
            frameX: photo?.frameX == null ? undefined : Number(photo.frameX),
            frameY: photo?.frameY == null ? undefined : Number(photo.frameY),
            frameZoom: photo?.frameZoom == null ? undefined : Number(photo.frameZoom),
            focalSource: String(photo?.focalSource || ''),
            detailRoi: photo?.detailRoi && typeof photo.detailRoi === 'object' ? Object.assign({},photo.detailRoi) : null,
            regions: Array.isArray(photo?.regions) ? photo.regions.map(region=>Object.assign({},region)) : [],
            ctxHandwrittenNote: String(photo?.ctxHandwrittenNote || ''),
            ctxState: String(photo?.ctxState || ''),
            darkFadeState: String(photo?.darkFadeState || ''),
            revision: Number(photo?.revision || 0),
            pairWith: String(photo?.pairWith || ''),
            pairRole: String(photo?.pairRole || ''),
            peopleMarks: Array.isArray(photo?.peopleMarks) ? photo.peopleMarks.map(mark=>({x:Number(mark?.x)||0,y:Number(mark?.y)||0,name:String(mark?.name||'')})) : []
          })) : [],
          bookRole: String(page.bookRole || page.layoutIntent || 'auto'),
          continuation: page.continuation === true,
          continuationOf: page.continuationOf || null,
          isEpisodeStart: page.isEpisodeStart === true,
          treeData: page.treeData && typeof page.treeData === 'object' ? page.treeData : null,
          included: section.included !== false && page.included !== false,
          active: sectionIndex === activeSection && pageIndex === (section.active || 0)
        }))
      }))
    };
  }

  function emitStructure(){
    try{ window.__ocherkiPersistSoon?.(); }catch(_){ }
    // A book the editor cannot hand over (an old saved book, damaged data)
    // must not fail silently: the constructor shows the reason and offers
    // the report.
    try{ window.parent.postMessage({type:'OCHERKI_STRUCTURE_STATE', payload:state()}, '*'); }
    catch(error){ try{ window.parent.postMessage({type:'OCHERKI_STRUCTURE_ERROR', message:String(error?.message||error), stack:String(error?.stack||'').slice(0,4000)}, '*'); }catch(_){ } }
  }
  function emitActiveState(){
    try{
      const section=currentSection();
      const page=section?.pages?.[section.active||0];
      window.parent.postMessage({type:'OCHERKI_ACTIVE_STATE',payload:{
        activeSection,
        activePage:section?.active||0,
        sectionId:section?.id||'',
        pageUid:page?.uid||page?.id||''
      }}, '*');
    }catch(_){ }
  }
  window.__OCHERKI_EMIT_STRUCTURE = emitStructure;
  window.__OCHERKI_EMIT_ACTIVE = emitActiveState;

  function saveEditor(){
    try{
      const page=currentPage();
      if(!page) return;
      // v186: only the sheet the editor really shows is written — a command from «Рукопись» (reorder, move) used to
      // write the editor into whatever sheet was current there, and a sheet's text was lost
      if(editor.dataset.pageUid&&editor.dataset.pageUid!==String(page.uid||page.id||''))return;
      page.text = textFromEditor();
    }catch(_){ }
  }

  function chapterTail(title){
    return String(title||'').replace(/^Глава\s+\d+[.:]?\s*/i,'').trim() || 'Новая глава';
  }

  function renumberChapters(){
    let n = 1;
    sections.forEach(section => {
      if(section.type !== 'chapter') return;
      const title = `Глава ${n}. ${chapterTail(section.title)}`;
      section.title = title;
      (section.pages || []).forEach((page, idx) => {
        if(idx === 0 || page.type === 'chapter') page.title = title;
      });
      n++;
    });
  }

  function createChapter(){
    saveEditor();
    const count = sections.filter(s=>s.type==='chapter').length + 1;
    const title = `Глава ${count}. Новая глава`;
    const section = {
      id: makeId('chapter'),
      title,
      type:'chapter',
      auto:false,
      active:0,
      pages:[{
        uid:makeId('page'),
        type:'chapter',
        title,
        episode:'Эпизод 1. Новый эпизод',
        sample:true,text:SAMPLE_PREFIX+'\n\n'+initialParas.join('\n\n'), photos:[], photoOffset:0,
        isEpisodeStart:true,included:true
      }]
    };
    let insertAt = sections.length;
    const lastChapter = sections.map((s,i)=>s.type==='chapter'?i:-1).filter(i=>i>=0).pop();
    if(Number.isInteger(lastChapter)) insertAt = lastChapter + 1;
    sections.splice(insertAt,0,section);
    renumberChapters();
    const targetIndex = sections.findIndex(s=>s.id===section.id);
    closePhotoImmediate?.();
    emitStructure();
    if(targetIndex===activeSection){render();}
    else{goSection(targetIndex,targetIndex>activeSection?1:-1);}
    setTimeout(emitStructure,900);
  }

  function transitionToNode(sectionId,pageUid){
    saveEditor();
    const si=sections.findIndex(s=>s.id===sectionId);
    if(si<0)return;
    const section=sections[si];
    let pi=0;
    if(pageUid){const found=(section.pages||[]).findIndex(p=>p.uid===pageUid);if(found>=0)pi=found;}
    if(si===activeSection){
      if(pi!==currentPageIndex()) animatePageChange(pi);
      return;
    }
    section.active=pi;
    goSection(si,si>activeSection?1:-1);
  }

  function selectNode(sectionId, pageUid){
    transitionToNode(sectionId,pageUid);
  }

  function addPageFromHost(){
    saveEditor();
    const before = currentSection().pages.length;
    addPage();
    // addPage begins its own accepted page transition; structure can update immediately.
    ensureIds();
    if(currentSection().pages.length !== before) emitStructure();
  }

  function renameChapter(sectionId, newTail){
    saveEditor();
    const section=sections.find(s=>s.id===sectionId && s.type==='chapter');
    if(!section) return;
    const oldTitle=section.title;
    const m=String(oldTitle||'').match(/^Глава\s+(\d+)/i);
    const num=m?m[1]:(sections.filter(s=>s.type==='chapter').indexOf(section)+1);
    const clean=String(newTail||'').replace(/^Глава\s+\d+[.:]?\s*/i,'').trim() || 'Без названия';
    section.title=`Глава ${num}. ${clean}`;
    (section.pages||[]).forEach((p,i)=>{ if(i===0 || p.type==='chapter' || p.title===oldTitle) p.title=section.title; });
    render();
  }

  function renameEpisode(sectionId, episodeKey, newTitle){
    saveEditor();
    const section=sections.find(s=>s.id===sectionId); if(!section) return;
    const clean=String(newTitle||'').trim(); if(!clean) return;
    (section.pages||[]).forEach(p=>{ const key=String(p.episode||'').trim()||'__default__'; if(key===String(episodeKey)) p.episode=clean; });
    render();
  }

  function renamePage(sectionId, pageUid, newTitle){
    saveEditor();
    const section=sections.find(s=>s.id===sectionId); if(!section) return;
    const page=(section.pages||[]).find(p=>p.uid===pageUid); if(!page) return;
    page.title=String(newTitle||'').trim() || 'Без названия';
    render();
  }

  function reorderChapters(ids){
    if(!Array.isArray(ids) || !ids.length) return;
    saveEditor();
    const currentId = currentSection().id;
    const chapterMap = new Map(sections.filter(s=>s.type==='chapter').map(s=>[s.id,s]));
    const reordered = ids.map(id=>chapterMap.get(id)).filter(Boolean);
    const untouchedChapters = sections.filter(s=>s.type==='chapter' && !ids.includes(s.id));
    const allChapters = reordered.concat(untouchedChapters);
    let ci = 0;
    const rebuilt = sections.map(s => s.type==='chapter' ? allChapters[ci++] : s);
    sections.splice(0,sections.length,...rebuilt);
    renumberChapters();
    const nextSection=Math.max(0,sections.findIndex(s=>s.id===currentId));
    if(nextSection!==activeSection) goSection(nextSection,nextSection>activeSection?1:-1);
    else render();
  }

  function reorderPages(sectionId, pageIds){
    if(!Array.isArray(pageIds) || !pageIds.length) return;
    saveEditor();

    const si = sections.findIndex(s=>s.id===sectionId);
    if(si < 0) return;

    const section = sections[si];
    const pages = Array.isArray(section.pages) ? section.pages : [];

    // Drag & drop must move page objects, never copy their contents.
    // Keep uid/id/text/photos/flow metadata attached to the same page.
    const key = p => p && (p.uid || p.id);

    const lookup = new Map(pages.map(p=>[key(p), p]));
    const ordered = pageIds.map(id=>lookup.get(id)).filter(Boolean);

    if(ordered.length !== pages.length){
      const rest = pages.filter(p=>!ordered.includes(p));
      section.pages = ordered.concat(rest);
    } else {
      section.pages = ordered;
    }

    const activePage = pages[section.active || 0];
    const nextIndex = Math.max(0, section.pages.indexOf(activePage));

    if(si===activeSection){
      section.active = nextIndex;

      // Preserve the physical sheet transition when a page is reordered
      // from the book map. The page object itself is not replaced/copy-filled.
      activeSheet.classList.add('is-setting-back','page-content-leaving');

      setTimeout(()=>{
        render();
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            activeSheet.classList.remove('is-setting-back','page-content-leaving');
          });
        });
        emitStructure();
      },260);
    }else{
      section.active = nextIndex;
      emitStructure();
    }
  }

  // Preserve every accepted visual behaviour of v50; only add state notifications around render.
  const originalRender = render;
  render = function(){
    const navigationOnly=!!window.__OCHERKI_RENDER_NAVIGATION;
    const result = originalRender.apply(this, arguments);
    queueMicrotask(navigationOnly?emitActiveState:emitStructure);
    return result;
  };

  window.addEventListener('message', e => {
    const d = e.data || {};
    if(d.type !== 'OCHERKI_STRUCTURE_COMMAND') return;
    const a = d.action;
    if(a === 'requestState') emitStructure();
    // v126: the words just typed go to the constructor at once (before «показать в книге» lays the page).
    else if(a === 'flush'){ try{ if(currentPage()) currentPage().text=textFromEditor(); }catch(_){ } emitStructure(); }
    else if(a === 'select') selectNode(d.sectionId, d.pageUid);
    else if(a === 'addPage') addPageFromHost();
    else if(a === 'addChapter') createChapter();
    else if(a === 'addEpisode') addEpisode({atEnd:!!d.atEnd,sectionId:d.sectionId||''});
    else if(a === 'addDocument') addDocumentPage();
    else if(a === 'setPhotoLayout') {
      saveEditor();
      const section = sections.find(item => item.id === d.sectionId);
      const page = section?.pages?.find(item => item.uid === d.pageUid);
      const photo = page?.photos?.find(item => String(item?.id || '') === String(d.photoId || ''))
        || (section?.pages||[]).flatMap(item => item.photos || []).find(item => String(item?.id || '') === String(d.photoId || ''));
      if(photo) {
        photo.layoutPreference = String(d.layoutPreference || 'auto');
        persistSoon();
        render();
        emitStructure();
      }
    }
    else if(a === 'removeSampleChapters') {
      // «Убрать образцы»: untouched sample chapters leave the book; at least
      // one chapter always stays.
      saveEditor();
      const isSampleChapter = section => section.type === 'chapter' && (section.pages || []).every(page => !(page.userEdited === true || page._userEdited === true) && !(page.photos || []).length);
      const current = sections[activeSection];
      const keepOne = sections.filter(section => section.type === 'chapter').every(isSampleChapter) ? sections.find(section => section.type === 'chapter') : null;
      const next = sections.filter(section => !isSampleChapter(section) || section === keepOne);
      if(next.length !== sections.length){
        sections.splice(0, sections.length, ...next);
        activeSection = Math.max(0, sections.indexOf(current));
        if(activeSection < 0 || !sections[activeSection]) activeSection = Math.max(0, sections.findIndex(section => section.type === 'chapter'));
        persistSoon(); render(); emitStructure();
      }
    }
    else if(a === 'setPhotoFrame') {
      // The author moved or enlarged a photo inside its frame in the book
      // preview; «reset» returns it to the book's own framing.
      const photo = sections.flatMap(section => section.pages || []).flatMap(item => item.photos || []).find(item => String(item?.id || '') === String(d.photoId || ''));
      if(photo) {
        if(d.reset){ delete photo.frameX; delete photo.frameY; delete photo.frameZoom; }
        else { photo.frameX = Math.round(Math.min(100, Math.max(0, Number(d.frameX) || 0)) * 10) / 10; photo.frameY = Math.round(Math.min(100, Math.max(0, Number(d.frameY) || 0)) * 10) / 10; photo.frameZoom = Math.round(Math.min(3, Math.max(1, Number(d.frameZoom) || 1)) * 100) / 100; }
        persistSoon();
      }
    }
    else if(a === 'setEditorialAccent') {
      saveEditor();
      const section = sections.find(item => item.id === d.sectionId);
      const page = section?.pages?.find(item => item.uid === d.pageUid);
      const kind = String(d.kind || d.rhythm || '').trim().toLowerCase();
      const key = String(d.overrideKey || '').trim();
      const allowed = new Set(['important', 'margin', 'inline-quote', 'ctx-handwritten']);
      const value = String(d.text ?? '');
      if(page && allowed.has(kind) && key) {
        if(!page.editorialOverrides || typeof page.editorialOverrides !== 'object' || Array.isArray(page.editorialOverrides)) page.editorialOverrides = {};
        if(value) page.editorialOverrides[key] = value;
        else delete page.editorialOverrides[key];
        if(kind==='ctx-handwritten') page.ctxHandwrittenNote=value;
        emitStructure();
      }
    }
    else if(a === 'undo') { editor?.focus(); try{document.execCommand('undo',false,null)}catch(_){} editor?.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'historyUndo'})); }
    else if(a === 'redo') { editor?.focus(); try{document.execCommand('redo',false,null)}catch(_){} editor?.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'historyRedo'})); }
    else if(a === 'renameChapter') { /* names are edited in the sheet only */ }
    else if(a === 'renameEpisode') { /* names are edited in the sheet only */ }
    else if(a === 'renamePage') { /* names are edited in the sheet only */ }
    else if(a === 'reorderChapters') reorderChapters(d.ids);
    else if(a === 'reorderPages') reorderPages(d.sectionId, d.ids);
    // «Рукопись»: a new sheet at the end of a chapter, and a sheet carried
    // to another chapter (the chapter it leaves keeps at least one sheet).
    // v100: a story from the family archive becomes a new sheet of a chapter.
    else if(a === 'addStoryPage') {
      const si = sections.findIndex(item => item.id === d.sectionId);
      if(si >= 0){ saveEditor(); activeSection = si; sections[si].active = Math.max(0, (sections[si].pages || []).length - 1); render(); addPageFromHost();
        const list = sections[si].pages || [], pg = list[list.length-1];
        // The new sheet's page-turn finishes first (it saves the editor), then the words are laid in.
        const fill = () => { if(!pg) return; pg.text = String(d.text||''); if(d.episode) pg.episode = String(d.episode); pg.userEdited = true; pg._userEdited = true; pg.sample = false;
          if(currentPage() === pg){ try{ editor.innerText = pg.text; }catch(_){} } render(); persistSoon(); try{ window.__OCHERKI_EMIT_STRUCTURE?.(); }catch(_){} };
        setTimeout(fill, 900); }
    }
    else if(a === 'addPageAt') {
      const si = sections.findIndex(item => item.id === d.sectionId);
      if(si >= 0){ saveEditor(); activeSection = si; sections[si].active = Math.max(0, (sections[si].pages || []).length - 1); render(); addPageFromHost(); }
    }
    // «Рукопись»: photos laid onto a sheet there (carried from the stack or
    // dropped straight from the computer).
    else if(a === 'addPhotos') {
      saveEditor();
      const section = sections.find(item => item.id === d.sectionId);
      const page = section?.pages?.find(item => (item.uid || item.id) === d.pageUid);
      if(page && canHavePhotos(page) && Array.isArray(d.photos)){
        if(!Array.isArray(page.photos)) page.photos = [];
        d.photos.forEach(item => {
          if(!item?.src) return;
          const rec = {id:'photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),src:String(item.src),caption:String(item.caption||''),year:String(item.year||''),place:String(item.place||''),people:String(item.people||''),source:'',story:String(item.story||''),portraitHero:item.portraitHero===true,photoMode:'auto',layoutPreference:'auto',isDocument:page.type==='document',status:'uploaded',_newEntry:true,
            width:Number(item.width)||0,height:Number(item.height)||0};
          rec.orientation = rec.width > rec.height ? 'landscape' : rec.height > rec.width ? 'portrait' : 'square';
          page.photos.push(rec);
          if(window.LifeBookPageBlocks) LifeBookPageBlocks.addPhoto(page, rec);
          try{ analyzePhotoInBackground(rec); }catch(_){ }
        });
        if(window.LifeBookCompositionEngine) window.LifeBookCompositionEngine.update(page);
        page.included = true; section.included = true;
        persistSoon();
        if(currentPage() === page){ try{ renderPhotos(); updateContextActions(); }catch(_){ } }
        emitStructure();
      }
    }
    // «Рукопись»: a sheet carried to the bin. A chapter's own sheet is
    // removed (a chapter's last sheet takes the chapter with it, if other
    // chapters remain); a sheet of the book's own sections only leaves the
    // book. «Вернуть» brings back exactly what was removed.
    // «Рукопись»: a sheet carried to the basket. A chapter's own sheet is
    // removed (a chapter's last sheet takes the chapter with it, if other
    // chapters remain); a sheet of the book's own sections only leaves the
    // book. Everything removed waits in the basket and can come back.
    else if(a === 'deletePage') {
      saveEditor();
      const bin = window.__ocherkiBin = window.__ocherkiBin || [];
      const si = sections.findIndex(item => item.id === d.sectionId);
      const section = sections[si];
      const index = (section?.pages || []).findIndex(item => (item.uid || item.id) === d.pageUid);
      if(section && index >= 0){
        const current = sections[activeSection];
        const page = section.pages[index];
        const name = String(page.episode && section.type === 'chapter' ? String(page.episode).replace(/^Эпизод\s+\d+[.:]?\s*/i,'') : (page.title || section.title || 'Лист')).trim();
        const id = 'bin_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        // v256: a sheet of any part with several sheets is really taken away (a page of the cover or the introduction only went out
        // of the book and stayed in the manuscript)
        if(section.pages.length > 1){
          section.pages.splice(index, 1);
          bin.push({id, kind:'page', sectionId:section.id, index, page, name, from:section.title});
          // The sheet being written stays open when a sheet before it goes.
          if(index < (section.active || 0)) section.active = (section.active || 0) - 1;
          section.active = Math.min(section.active || 0, section.pages.length - 1);
        } else if(section.type === 'chapter' && sections.filter(item => item.type === 'chapter').length > 1){
          sections.splice(si, 1);
          bin.push({id, kind:'section', index:si, section, name:section.title, from:'целая глава'});
          renumberChapters();
        } else if(section.type !== 'chapter'){
          bin.push({id, kind:'exclude', sectionId:section.id, pageUid:d.pageUid, sectionIncluded:section.included, pageIncluded:page.included, name, from:section.title});
          page.included = false;
          if(section.pages.every(item => item.included === false)) section.included = false;
        } else { window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_NOTE', text:'Это единственная глава — в книге должна остаться хотя бы одна'}, '*'); return; }
        while(bin.length > 40) bin.shift();
        activeSection = Math.max(0, sections.indexOf(current));
        if(activeSection < 0 || !sections[activeSection]) activeSection = Math.max(0, sections.findIndex(item => item.type === 'chapter'));
        persistSoon(); render(); emitStructure();
        window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_BIN', items:bin.map(item => ({id:item.id, name:item.name, from:item.from})), removed:id}, '*');
      }
    }
    else if(a === 'undoDelete' || a === 'restoreFromBin') {
      const bin = window.__ocherkiBin = window.__ocherkiBin || [];
      const at = d.id ? bin.findIndex(item => item.id === d.id) : bin.length - 1;
      const last = at >= 0 ? bin.splice(at, 1)[0] : null;
      if(last?.kind === 'page'){ const section = sections.find(item => item.id === last.sectionId) || sections.find(item => item.type === 'chapter'); if(section) section.pages.splice(Math.min(last.index, section.pages.length), 0, last.page); }
      else if(last?.kind === 'section'){ sections.splice(Math.min(last.index, sections.length), 0, last.section); renumberChapters(); }
      else if(last?.kind === 'exclude'){ const section = sections.find(item => item.id === last.sectionId); const page = section?.pages?.find(item => (item.uid || item.id) === last.pageUid); if(page) page.included = last.pageIncluded !== false; if(section) section.included = true; }
      if(last){ persistSoon(); render(); emitStructure(); }
      window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_BIN', items:bin.map(item => ({id:item.id, name:item.name, from:item.from}))}, '*');
    }
    else if(a === 'emptyBin') {
      window.__ocherkiBin = [];
      window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_BIN', items:[]}, '*');
    }
    else if(a === 'excludeSection') {
      const section = sections.find(item => item.id === d.sectionId);
      if(section && section.type !== 'chapter'){ saveEditor(); const current = sections[activeSection]; section.included = false;
        if(current === section){ activeSection = Math.max(0, sections.findIndex(item => item.type === 'chapter')); }
        persistSoon(); render(); emitStructure(); }
    }
    // «Разделы книги»: one of the book's own sections joins the book.
    else if(a === 'includeSection') {
      const section = sections.find(item => item.id === d.sectionId);
      if(section){ saveEditor(); section.included = true; (section.pages || []).forEach(page => { if(page.included === false) page.included = true; }); persistSoon(); render(); emitStructure(); }
    }
    else if(a === 'movePage') {
      saveEditor();
      const from = sections.find(item => item.id === d.sectionId), to = sections.find(item => item.id === d.toSectionId);
      const index = (from?.pages || []).findIndex(item => (item.uid || item.id) === d.pageUid);
      if(from && to && from !== to && index >= 0 && from.pages.length > 1){
        const [page] = from.pages.splice(index, 1);
        if(page.type === 'chapter' && to.type === 'chapter') page.title = to.title;
        const at = Number.isInteger(d.toIndex) ? Math.max(0, Math.min(to.pages.length, d.toIndex)) : to.pages.length;
        to.pages.splice(at, 0, page);
        from.active = Math.min(from.active || 0, from.pages.length - 1);
        persistSoon(); render(); emitStructure();
      }
    }
    else if(a === 'saveProject') {
      saveEditor();
      window.__ocherkiPersistNow?.();
      try{
        localStorage.setItem('ocherki_project_v1', JSON.stringify({
          savedAt:Date.now(), activeSection, fontSize, lineHeight, sections
        }));
        window.parent.postMessage({type:'OCHERKI_PROJECT_SAVED', savedAt:Date.now()}, '*');
      }catch(_){ }
    }
  });

  let structureInputTimer=null;
  editor?.addEventListener('input',()=>{
    clearTimeout(structureInputTimer);
    structureInputTimer=setTimeout(emitStructure,220);
  });

ensureIds();
applyPhotoRenderMode();
emitStructure();
})();

/*@block ["", ""]*/
window.LifeBookCompositionEngine = {
  analyze(page){
    const blocks=window.LifeBookPageBlocks ? window.LifeBookPageBlocks.normalize(page) : (page?.blocks||[]);
    const types=blocks.map(b=>b?.type).filter(Boolean);
    const textBlock=blocks.find(b=>b?.type==='text');
    const text=String(textBlock?.content ?? page?.text ?? '');
    const photos=blocks.filter(b=>b?.type==='photo').length;
    const quotes=blocks.filter(b=>b?.type==='quote').length;
    const captions=blocks.filter(b=>b?.type==='caption').length;
    const dates=blocks.filter(b=>b?.type==='date').length;
    const photoRecords=Array.isArray(page?.photos)?page.photos.filter(photo=>photo&&photo.inferred&&typeof photo.inferred==='object'):[];
    const photoVisuals=photoRecords.map(photo=>Object.assign({},photo.inferred));
    return {
      types,
      textLength:text.trim().length,
      photos,quotes,captions,dates,
      hasText:text.trim().length>0,
      visual:photoVisuals[0]||{},
      photoVisuals
    };
  },
  choose(analysis){
    const a=analysis||{};
    if(a.photos>=1 && a.quotes>=1 && a.hasText) return 'text_photo_quote';
    if(a.photos>=1 && a.hasText) return a.textLength>1800 ? 'text_long_photo' : 'text_photo';
    if(a.quotes>=1 && a.hasText) return 'text_quote';
    if(a.photos>=1 && !a.hasText) return 'photo_focus';
    if(a.hasText) return a.textLength>2600 ? 'text_long' : 'text';
    return 'empty';
  },
  plan(page){
    const analysis=this.analyze(page);
    return {
      version:1,
      layout:this.choose(analysis),
      analysis,
      generatedAt:Date.now()
    };
  },
  update(page){
    if(!page) return null;
    page.composition=this.plan(page);
    return page.composition;
  }
};

/*@block ["", ""]*/
window.LifeBookPageBlocks = {
  makeId(prefix='block'){
    return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  },
  normalize(page){
    if(!page) return [];
    if(!Array.isArray(page.blocks)){
      page.blocks=[];
      if(page.text){
        page.blocks.push({id:this.makeId('text'),type:'text',content:page.text});
      }
      if(Array.isArray(page.photos)){
        page.photos.forEach(p=>{
          if(!p.id) p.id=this.makeId('photo');
          page.blocks.push({id:this.makeId('photoBlock'),type:'photo',photoId:p.id,src:p.src||''});
        });
      }
    }else{
      page.blocks.forEach(block=>{
        if(block && !block.id) block.id=this.makeId(block.type||'block');
      });
      if(Array.isArray(page.photos)){
        page.photos.forEach(p=>{ if(!p.id) p.id=this.makeId('photo'); });
      }
    }
    return page.blocks;
  },
  add(page,type,data){
    const block=Object.assign({id:this.makeId(type),type:type},data||{});
    this.normalize(page).push(block);
    return block;
  },
  syncText(page,content){
    const blocks=this.normalize(page);
    let block=blocks.find(b=>b && b.type==='text');
    if(!block){
      block={id:this.makeId('text'),type:'text',content:''};
      blocks.unshift(block);
    }
    block.content=String(content||'');
    return block;
  },
  addPhoto(page,photo){
    if(photo && !photo.id) photo.id=this.makeId('photo');
    return this.add(page,'photo',{photoId:photo?.id||null,src:photo?.src||''});
  },
  addQuote(page,content){return this.add(page,'quote',{content:String(content||'')});},
  addCaption(page,content){return this.add(page,'caption',{content:String(content||'')});},
  addDate(page,content){return this.add(page,'date',{content:String(content||''),mode:'watermark'});}
};

/*@block [" id=\"sheet-keys-script\"", ""]*/
(()=>{const box=document.getElementById('sheetKeys');if(!box)return;
  const click=id=>document.getElementById(id)?.click();
  const acts={photo:()=>click('addPhotoBtn'),page:()=>click('newPageBtn'),quote:()=>click('addQuoteBtn'),date:()=>click('addDateBtn'),episode:()=>click('newEpisodeBtn'),document:()=>click('addDocumentBtn'),
    view:()=>{try{const p=typeof currentPage==='function'?currentPage():null;window.parent.postMessage({type:'OCHERKI_VIEW_IN_BOOK',pageUid:String(p?.uid||p?.id||'')},'*');}catch(e){}}};
  const more=box.querySelector('[data-act="more"]');
  const setOpen=on=>{box.classList.toggle('is-open',on);more.setAttribute('aria-expanded',on?'true':'false');};
  // The caret is remembered before the key takes the focus, so a quote or a
  // date lands where the author was writing.
  box.addEventListener('pointerdown',e=>{if(e.target.closest('.skey'))try{semanticCaretBookmark=saveEditorCaretBookmark()||semanticCaretBookmark;}catch(err){}});
  box.addEventListener('click',e=>{const key=e.target.closest('.skey');if(!key)return;e.stopPropagation();const act=key.dataset.act;
    if(act==='more'){setOpen(!box.classList.contains('is-open'));return;}
    if(key.closest('.sheet-keys-extra'))setOpen(false);acts[act]?.();});
  document.addEventListener('click',e=>{if(!box.contains(e.target))setOpen(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
  // Only what fits this page: no photo key on a contents page, and so on.
  const sync=()=>{try{const p=currentPage();const editable=!!p&&!p.autoContents&&p.type!=='contents';
    box.querySelector('[data-act="photo"]').hidden=!editable||!canHavePhotos(p);
    ['quote','date'].forEach(a=>box.querySelector(`[data-act="${a}"]`).hidden=!editable);
    const sec=typeof currentSection==='function'?currentSection():null;
    ['episode','document'].forEach(a=>box.querySelector(`[data-act="${a}"]`).hidden=!sec||sec.type!=='chapter');
    const hidden={};box.querySelectorAll('.skey[data-act]').forEach(k=>hidden[k.dataset.act]=k.hidden);
    window.parent.postMessage({type:'OCHERKI_SHEET_TOOLS',hidden},'*');}catch(e){}};
  // The plate above the sheet (in the shell) asks for the same actions.
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_SHEET_ACTION')return;
    try{semanticCaretBookmark=saveEditorCaretBookmark()||semanticCaretBookmark;}catch(err){}
    acts[d.act]?.();});
  if(typeof updateContextActions==='function'){const base=updateContextActions;window.updateContextActions=updateContextActions=function(){const r=base.apply(this,arguments);sync();return r;};}
  setTimeout(sync,300);
})();

/*@block [" id=\"next-step-script\"", ""]*/
(()=>{const btn=document.getElementById('nextStep');if(!btn)return;
  let act=null,last='';
  const click=id=>document.getElementById(id)?.click();
  const focusEnd=()=>{try{editor.focus();const r=document.createRange();r.selectNodeContents(editor);r.collapse(false);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);}catch(e){}};
  const view=()=>{try{const p=currentPage();window.parent.postMessage({type:'OCHERKI_VIEW_IN_BOOK',pageUid:String(p?.uid||p?.id||'')},'*');}catch(e){}};
  // The one thing worth doing next on this sheet.
  function pick(){
    const sec=typeof currentSection==='function'?currentSection():null,p=typeof currentPage==='function'?currentPage():null;
    if(!sec||!p||p.autoContents)return null;
    const pages=Array.isArray(sec.pages)?sec.pages:[p];
    if(sec.type==='cover'){
      const own=!p.sample&&String(textFromEditor()||'').trim();
      return own?null:{text:'Назовите книгу',run:focusEnd};}
    if(sec.type!=='chapter')return null;
    if(p.sample)return {text:'Начните писать',why:'Начните писать — образец исчезнет',run:focusEnd};
    const words=pages.map(pg=>pg===p?textFromEditor():String(pg.text||'')).join(' ').trim().split(/\s+/).filter(Boolean).length;
    if(words<120)return {text:'Расскажите ещё немного',run:focusEnd};
    const photos=pages.flatMap(pg=>Array.isArray(pg.photos)?pg.photos:[]);
    if(!photos.length&&canHavePhotos(p))return {text:'Добавьте фото к главе',run:()=>click('addPhotoBtn')};
    const shown=typeof currentPhotos==='function'?currentPhotos():(p.photos||[]);const idx=(shown||[]).findIndex(ph=>ph&&!ph.isDocument&&!String(ph.caption||ph.people||'').trim());
    if(idx>=0)return {text:'Подпишите фото',why:'Подпишите фото: кто на нём?',run:()=>{try{window.__ocTakePhoto?.(null,idx);}catch(e){}}};
    // v98: «в книге ›» is already beside it — no second key for the same thing.
    return null;
  }
  function sync(){
    let step=null;try{step=pick();}catch(e){step=null;}
    btn.hidden=!step;act=step?.run||null;btn.title='Следующий шаг: '+(step?.why||step?.text||'');
    const text=step?.text||'';
    if(text!==last){last=text;btn.querySelector('.ns-text').textContent=text;btn.classList.remove('is-new');void btn.offsetWidth;if(text)btn.classList.add('is-new');}
  }
  btn.addEventListener('click',e=>{e.stopPropagation();act?.();setTimeout(sync,400);});
  document.getElementById('nsBook')?.addEventListener('click',e=>{e.stopPropagation();view();});
  if(typeof updateContextActions==='function'){const base=updateContextActions;window.updateContextActions=updateContextActions=function(){const r=base.apply(this,arguments);sync();return r;};}
  let t=0;editor?.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(sync,700);});
  setTimeout(sync,400);
})();

/*@block [" id=\"empty-sheet-goes\"", ""]*/
// Like Word: a sheet of a chapter with no words and no photos goes away
// when Backspace is pressed on it again; the caret moves to the end of the
// sheet before it. (It goes to the bin, so «Вернуть» brings it back.)
(()=>{
  const ed=document.getElementById('editor');if(!ed)return;
  ed.addEventListener('keydown',e=>{
    if(e.key!=='Backspace'&&e.key!=='Delete')return;
    const sec=currentSection(),page=currentPage();if(!sec||!page||sec.type!=='chapter'||(sec.pages||[]).length<2)return;
    if(String(ed.innerText||'').replace(/[\s\u200b]/g,'')!==''||(page.photos||[]).some(p=>p&&p.src))return;
    e.preventDefault();e.stopPropagation();
    const idx=sec.active||0,prev=sec.pages[Math.max(0,idx-1)]===page?sec.pages[idx+1]:sec.pages[Math.max(0,idx-1)];
    window.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'deletePage',sectionId:sec.id,pageUid:page.uid||page.id},'*');
    setTimeout(()=>{if(prev)window.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'select',sectionId:sec.id,pageUid:prev.uid||prev.id},'*');
      setTimeout(()=>{const el=document.getElementById('editor');if(!el)return;el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);},180);},60);
  },true);
})();

/*@block [" id=\"empty-sheet-left\"", ""]*/
// A written sheet that has become empty (no words, no photos) goes to the bin
// as soon as the author leaves it — no empty sheets stay in the book.
(()=>{let prev=null;
  const isEmpty=p=>p&&!String(p.text||'').replace(/[\s\u200b]/g,'')&&!(p.photos||[]).some(x=>x&&x.src);
  setInterval(()=>{try{const sec=currentSection(),page=currentPage();if(!sec||!page)return;
    const key=(page.uid||page.id);
    if(prev&&prev.uid!==key){const s2=sections.find(x=>x.id===prev.sid);const pg=s2?.pages?.find(x=>(x.uid||x.id)===prev.uid);
      if(gone(s2,pg))window.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'deletePage',sectionId:s2.id,pageUid:prev.uid},'*');}
    prev={uid:key,sid:sec.id};}catch(_){}} ,700);
  // v96: any sheet of a chapter (a new «＋ Лист» or «＋ Эпизод» too, not only
  // a written one) that holds no words and no photos goes when it is left —
  // also when the author leaves the editor for «Рукопись» (it asks for the
  // state as it opens). The only sheet of a chapter stays.
  function gone(s2,pg){return !!(s2&&s2.type==='chapter'&&!s2.sample&&s2.pages.length>1&&pg&&!pg.sample&&isEmpty(pg));}
  window.addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_STRUCTURE_COMMAND'||d.action!=='requestState')return;
    try{try{saveEditor();}catch(_){}const sec=currentSection(),page=currentPage();if(gone(sec,page)){prev=null;window.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'deletePage',sectionId:sec.id,pageUid:page.uid||page.id},'*');}}catch(_){}});
})();

/*@block [" id=\"delete-section-cmd\"", ""]*/
// A whole chapter goes to the bin at once (it comes back with «Вернуть»).
window.addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_STRUCTURE_COMMAND'||d.action!=='deleteSection')return;
  try{saveEditor();}catch(_){}
  const si=sections.findIndex(x=>x.id===d.sectionId),section=sections[si];if(!section||section.type!=='chapter')return;
  if(sections.filter(x=>x.type==='chapter').length<2){window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_NOTE',text:'Это единственная глава — в книге должна остаться хотя бы одна'},'*');return;}
  const current=sections[activeSection],bin=window.__ocherkiBin=window.__ocherkiBin||[];
  sections.splice(si,1);bin.push({id:'bin_'+Date.now().toString(36),kind:'section',index:si,section,name:section.title,from:'целая глава'});while(bin.length>40)bin.shift();
  try{renumberChapters();}catch(_){}
  activeSection=sections.indexOf(current);if(activeSection<0)activeSection=Math.max(0,sections.findIndex(x=>x.type==='chapter'));
  try{render();}catch(_){}try{persistSoon();}catch(_){}try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}
  window.parent.postMessage({type:'OCHERKI_MANUSCRIPT_BIN',items:bin.map(x=>({id:x.id,name:x.name,from:x.from,kind:x.kind}))},'*');
});

/*@block [" id=\"set-photo-props-cmd\"", ""]*/
// Small properties of one photo set from the book (e.g. the hero portrait on a light page).
window.addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_STRUCTURE_COMMAND'||d.action!=='setPhotoProps'||!d.photoId)return;
  let hit=false;for(const sec of sections)for(const pg of sec.pages||[])for(const ph of pg.photos||[])if(String(ph.id)===String(d.photoId)){Object.assign(ph,d.props||{});hit=true;}
  if(hit){try{persistSoon();}catch(_){}try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}}});

/*@block ["", ""]*/

/* v212: «Показать знакомство» is gone from the «Аа» menu (the old tour; a new one comes later) */
// v186 — the sheet's light crosses over slowly only while the day turns to night (and back), never when a sheet changes
(()=>{const b=document.body;let night=b.classList.contains('host-night')+'|'+b.classList.contains('host-eve'),t=0;
  new MutationObserver(()=>{const n=b.classList.contains('host-night')+'|'+b.classList.contains('host-eve');if(n===night)return;night=n;b.classList.add('lt-x');clearTimeout(t);t=setTimeout(()=>b.classList.remove('lt-x'),2600);})
    .observe(b,{attributes:true,attributeFilter:['class']});})();

// v187 — a new sheet (or episode, or document) is laid on top of the pile: it comes in from a little above and settles
(()=>{const lay=()=>{const a=document.getElementById('activeSheet');if(!a)return;if(Date.now()-(window.__ocNoLay||0)<2000)return;a.classList.remove('is-laid');void a.offsetWidth;a.classList.add('is-laid');setTimeout(()=>a.classList.remove('is-laid'),900);};
  const orig={addEpisode:window.addEpisode,addDocumentPage:window.addDocumentPage};
  ['addPage','addEpisode','addDocumentPage','addPageFromHost'].forEach(n=>{const f=window[n];if(typeof f!=='function')return;window[n]=function(){const r=f.apply(this,arguments);setTimeout(lay,170);return r;};});
  ['addPageBtn','newPageBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.onclick=()=>window.addPage();});
  [['newEpisodeBtn','addEpisode'],['addDocumentBtn','addDocumentPage']].forEach(([id,n])=>{const b=document.getElementById(id);if(!b||!orig[n])return;b.removeEventListener('click',orig[n]);b.addEventListener('click',()=>window[n]());});})();

// v190 — the lamp stands still: its light is laid on the sheets from one fixed place. A sheet that moves (a turn of the
// page, a turn between sections, a new sheet laid down) passes under it — dark while it is far below, lighter as it comes up.
// The place is the open sheet's place in the layout (offsets — no transform or animation moves it), so nothing flickers.
(()=>{const SEL='.sheet.active>.lt-nm,.sheet.active>.lt-ns'; // the travelling copies are kept in step by CSS (sheet.css v191)
  // v260: laid every frame only while something moves; at rest the loop sleeps (it measured the sheet every frame, always)
  let stepTill=0,stepping=false;const wakeStep=()=>{stepTill=performance.now()+1600;if(!stepping){stepping=true;requestAnimationFrame(step);}};
  ['transitionrun','animationstart','scroll','resize','input','pointerdown','wheel','keydown'].forEach(e=>addEventListener(e,wakeStep,{passive:true,capture:true}));
  new MutationObserver(wakeStep).observe(document.body,{attributes:true,attributeFilter:['class','style']});setInterval(()=>{if(!stepping)put();},500);
  const step=t=>{put();if(performance.now()<stepTill)requestAnimationFrame(step);else stepping=false;},put=()=>{const a=document.getElementById('activeSheet'),box=a?.offsetParent;if(!a||!box)return;
    const b=box.getBoundingClientRect(),L=b.left+box.clientLeft+a.offsetLeft,T=b.top+box.clientTop+a.offsetTop;
    // v207: nothing to lay again while the sheet lies still and nothing travels (it was measured every frame: a quarter of
    // each frame went on it, and the change of day and night stalled)
    {const ar=a.getBoundingClientRect(),bs=document.body.style,mv=document.querySelector('.section-scroll-viewport,.sheet.ghost.is-pulling');
      const q=[L,T,ar.left,ar.top,ar.width,ar.height,a.offsetHeight,bs.getPropertyValue('--sun-x'),bs.getPropertyValue('--sun-y'),a.className].join('|');
      if(!mv&&put._q===q)return;put._q=mv?'':q;}
    {const k=Math.round(L)+','+Math.round(T)+','+a.offsetHeight;if(put._k!==k){put._k=k;const st=document.body.style;st.setProperty('--sh-l',Math.round(L)+'px');st.setProperty('--sh-t',Math.round(T)+'px');st.setProperty('--sh-h',a.offsetHeight+'px');st.setProperty('--sh-bl',a.clientLeft+'px');st.setProperty('--sh-bt',a.clientTop+'px');st.setProperty('--sh-ph',a.clientHeight+'px');}}
    document.querySelectorAll(SEL).forEach(el=>{const r=el.parentElement.getBoundingClientRect(),x=0,y=Math.round(T-r.top),h=Math.round(r.height);// v211: across, the light goes with the sheet (it was held still and bared a white strip as the sheet slid aside); up and down it stays
      // the pool itself, the dark below it and the light above it (each laps over the pool by a few pixels: no seam)
      const v=el.classList.contains('lt-nm')?`${x}px ${y}px,${x}px ${y+h}px,${x}px ${y-3*h}px`:`${x}px ${y}px`;if(el._bp!==v){el._bp=v;el.style.backgroundPosition=v;}});
    {const st=document.body.style,sx=parseFloat(st.getPropertyValue('--sun-x'))||0,sy=parseFloat(st.getPropertyValue('--sun-y'))||0;
      document.querySelectorAll('.sheet.active>:is(.lt-dm,.lt-em),.section-scroll-viewport .section-scroll-sheet>:is(.lt-dm,.lt-em)').forEach(el=>{const r=el.getBoundingClientRect(),v=`${(sx-r.left).toFixed(1)}px ${(sy-r.top).toFixed(1)}px,`+(el.parentElement.classList.contains('section-scroll-sheet')?'0 50%':'0 0');if(el._bp!==v){el._bp=v;el.style.setProperty('background-position',v,'important');}});
      document.querySelectorAll('.sheet.ghost.is-pulling').forEach(el=>{const r=el.getBoundingClientRect();el.style.setProperty('--gx',Math.round(sx-r.left)+'px');el.style.setProperty('--gy',Math.round(sy-r.top)+'px');});}};
  // v192: a sheet put in or swapped gets its light before it is painted, not a frame later
  {const mo=new MutationObserver(put),hook=()=>{const st=document.getElementById('activeSheet')?.parentElement;if(!st)return setTimeout(hook,500);mo.observe(st,{childList:true,attributes:true,attributeFilter:['class','id'],subtree:false});[...st.children].forEach(c=>mo.observe(c,{attributes:true,attributeFilter:['class','id','style']}));};hook();}
  window.__ltPut=put;requestAnimationFrame(step);})();

// v209 — what the desk's clean stack asks of the open sheet: the book's photographs (for the contact sheet), a copy of one
// laid on the open sheet, the new episode's name / when / where, the new document's name, transcript and scan
window.OC_SHEET={
  allPhotos(){const out=[],seen=new Set(),add=r=>{if(r&&r.src&&!seen.has(r.src)){seen.add(r.src);out.push(r);}};sections.forEach(s=>(s.pages||[]).forEach(p=>(p.photos||[]).forEach(add)));albumPhotos.forEach(add);return out;},
  // v241: the album on the desk shows only the photographs not yet laid on any sheet (one taken into the book leaves it; taken off
  // the sheet again, it is back in the album)
  freePhotos(){const used=new Set();sections.forEach(s=>(s.pages||[]).forEach(p=>(p.photos||[]).forEach(r=>{if(r&&r.src)used.add(r.src);})));const out=[],seen=new Set();albumPhotos.forEach(r=>{if(r&&r.src&&!used.has(r.src)&&!seen.has(r.src)){seen.add(r.src);out.push(r);}});return out;},
  // files from the computer into the album only (no sheet gets them until one is laid there)
  addAlbumFiles(files){[...(files||[])].forEach(f=>{const r=new FileReader();r.onload=()=>{
      const rec={id:'photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),src:r.result,caption:'',year:'',place:'',people:'',source:'',story:'',photoMode:'auto',layoutPreference:'auto',status:'uploaded'};
      const probe=new Image();probe.onload=probe.onerror=()=>{rec.width=probe.naturalWidth||0;rec.height=probe.naturalHeight||0;rec.orientation=rec.width>rec.height?'landscape':rec.height>rec.width?'portrait':'square';
        albumPhotos.push(rec);persistSoon();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}};probe.src=rec.src;};r.readAsDataURL(f);});},
  canPhoto(){const p=currentPage();return !!p&&canHavePhotos(p);},
  addPhotoCopy(rec,opt){const p=currentPage();if(!p||!canHavePhotos(p)||!rec)return false;
    const n=Object.assign({},rec,{id:'photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),_newEntry:true});
    if(!Array.isArray(p.photos))p.photos=[];p.photos.push(n);try{window.LifeBookPageBlocks?.addPhoto(p,n);window.LifeBookCompositionEngine?.update(p);}catch(_){}
    // v212: a new photograph goes on top of the pile, where it is seen; the others glide down under it
    delete n._newEntry;updateContextActions();const idx=p.photos.length-1;window.__ocRelayPile(()=>{p.photoOffset=idx;},idx);persistSoon();window.__OCHERKI_EMIT_STRUCTURE?.();return true;},
  renameChapter(name){const t=String(name||'').trim();if(!t)return;chapterLabel.textContent=t;commitChapterHeading();persistSoon();window.__OCHERKI_EMIT_STRUCTURE?.();},
  newEpisode(o){addEpisode({title:o?.title,when:o?.when,where:o?.where});},
  newDocument(o){addDocumentPage({title:o?.title,text:o?.text,src:o?.src});const p=currentPage();if(p&&p.type==='document'&&p.photos?.length){try{p.photos.forEach(r=>{window.LifeBookPageBlocks?.addPhoto(p,r);});window.LifeBookCompositionEngine?.update(p);}catch(_){}renderPhotos();}}
};

// v210/v212 — the photographs of the open sheet: prints tucked under its left edge in a pile (a «+N» for the ones beneath),
// fanned out when the hand comes near. A print taken up — from the pile, or from the album on the desk — flies over the sheet
// and turns over: on its back are written who is on it, when, where, its story and its caption (the very fields the book
// prints). From the pile: «вернуть в стопку» / «удалить из главы»; from the album: «вернуть в альбом» / «положить на лист».
(()=>{const stack=document.getElementById('photoStack')||document.querySelector('.photo-stack');if(!stack)return;
  let open=null;
  // v213: the card lies in the screen's own top layer (over the desk, the album and the stack), so it flies from and back to the
  // very place of its print; the places measured in this sheet are moved by where the sheet's frame lies on the screen
  const HD=(()=>{try{return window.parent!==window&&window.frameElement?window.parent.document:document;}catch(_){return document;}})();
  const off=()=>{try{const r=window.frameElement&&HD!==document?window.frameElement.getBoundingClientRect():null;return r?{x:r.left,y:r.top}:{x:0,y:0};}catch(_){return {x:0,y:0};}};
  const persist=()=>{try{persistSoon();}catch(_){}};
  const tellHost=on=>{try{window.parent?.postMessage({type:'OCHERKI_PHOTO_CARD',open:on},'*');}catch(_){}};
  // a place on the desk as a pose of the card: its centre on the place's centre, one scale (no stretching), the place's tilt
  const poseAt=(r,ang,w,g)=>{const o=off();return `translate(${(r.left+o.x+r.width/2-(g.L+g.W/2)).toFixed(1)}px,${(r.top+o.y+r.height/2-(g.T+g.H/2)).toFixed(1)}px) rotate(${ang.toFixed(2)}deg) scale(${(w/g.W).toFixed(4)})`;};
  // v256: the print's own shape (height to width) goes with its pose: the card grows from it into its upright shape and narrows back
  // into it, all in one move (it flew as an upright card and became square at the very end — a jump)
  let poseAspect=null;
  const printPose=(c,g)=>{const r=c.getBoundingClientRect(),t=getComputedStyle(c).transform,m=new DOMMatrix(t==='none'?undefined:t);const pose=poseAt(r,Math.atan2(m.b,m.a)*180/Math.PI,c.offsetWidth||r.width,g);poseAspect=c.offsetWidth&&c.offsetHeight?c.offsetHeight/c.offsetWidth:null;return pose;};
  // v257: the shape changes by trimming the card's top and bottom (its size stays: changing the height every frame made it tremble)
  const shapeTo=(card,g,asp)=>{const h=asp?Math.min(g.H,g.W*asp):g.H,d=Math.max(0,(g.H-h)/2);card.style.clipPath=d>0.5?`inset(${d.toFixed(1)}px -80px ${d.toFixed(1)}px -80px)`:'inset(-80px -80px -80px -80px)';};
  const place=()=>{const a=document.getElementById('activeSheet'),s=a.getBoundingClientRect(),o=off();const VH=(HD.defaultView||window).innerHeight;const W=Math.round(Math.min(s.width*.9,560)),H=Math.round(Math.min(VH*.88,W*1.62));return {W,H,L:o.x+s.left+(s.width-W)/2,T:Math.round((VH-H)/2+12)};};
  // the card leaves: face up first, all the way; then to where it goes (its pose given by «to»), fading into the print there
  // v213: it comes down slowly onto its place, settles, and only then fades into the print there (the print shows again under it)
  // v258: the card sets off home while it is still turning face up (it turned, stood still, then flew — it did not feel like a
  // photograph in the hand)
  const HOME_AT=430;
  const close=(to,after)=>{if(!open)return;const o=open;open=null;o.card.classList.remove('flip');o.bg.classList.remove('on');tellHost(false);
    setTimeout(()=>{o.card.classList.add('fly','home');poseAspect=null;o.card.style.transform=to?to(o.g):o.from;shapeTo(o.card,o.g,to?poseAspect:o.fromAsp);
      // v255: the print it goes back to lies under the bar's plate: once the card has come down to about half its size on the way,
      // it goes under the plate (it flew over the plate and then blinked under it)
      const w0=o.card.getBoundingClientRect().width,t0=performance.now();const under=()=>{if(!o.card.isConnected)return;const w=o.card.getBoundingClientRect().width;
        if(w<w0*.55||performance.now()-t0>700){o.card.style.zIndex='2147483149';return;}requestAnimationFrame(under);};requestAnimationFrame(under);},HOME_AT);
    setTimeout(()=>{after&&after();o.card.classList.add('fade');},HOME_AT+900);
    setTimeout(()=>{o.card.remove();o.bg.remove();},HOME_AT+900+480);};
  const openCard=(p,from,opts)=>{if(!p||open)return;const g=place();
    // v257: the cover's photograph has no back to fill (nothing of it is printed on the cover): it is only looked at, a press puts it back
    const coverCard=!opts.album&&currentSection()?.id==='cover';
    const bg=HD.createElement('div');bg.className='ph-bg'+(opts.noVeil?' ph-bg-clear':'');HD.body.appendChild(bg);
    const card=HD.createElement('div');card.className='ph';Object.assign(card.style,{left:g.L+'px',top:g.T+'px',width:g.W+'px',height:g.H+'px'});
    card.style.setProperty('--phx',(-g.L)+'px');card.style.setProperty('--phy',(-g.T)+'px');
    const doc=!opts.album&&currentPage()?.type==='document';
    card.innerHTML=`<div class="ph-in"><div class="ph-front"><img alt=""></div><div class="ph-back"><div class="ph-h"><span>оборот фотографии</span><button type="button" class="ph-ret2">↺ лицом</button></div>
      <label><span>кто на фото</span><input data-k="people" autocomplete="off"></label><i class="ph-tip">Имена пригодятся для подписи портрета и для «Кто на фото».</i>
      <div class="ph-two"><label><span>когда</span><input data-k="year" autocomplete="off"></label><label><span>где</span><input data-k="place" autocomplete="off"></label></div><i class="ph-tip">С годом фото может попасть в «Хронологию», с городом — на карту «География семьи».</i>
      <label class="tx"><span>история</span><textarea data-k="story" rows="2"></textarea></label><i class="ph-tip">Несколько предложений — и фото может получить разворот с рассказом рядом.</i>
      <label><span>подпись в книге</span><input data-k="caption" autocomplete="off" placeholder="коротко: кто, где, когда"></label><i class="ph-tip">Печатается мелко под фото.</i>${doc?'<label class="tx"><span>пояснение к документу</span><textarea data-x="explanation" rows="2"></textarea></label>':''}
      <label><span>источник</span><input data-k="source" autocomplete="off" placeholder="семейный архив, альбом бабушки…"></label><i class="ph-tip">Откуда снимок — печатается в конце книги, в «Источниках».</i>
      <label class="ph-line"><span>тон фото</span><select data-s="photoMode"><option value="auto">как есть</option><option value="color">цветная</option><option value="bw">чёрно-белая</option></select></label>
      <label class="ph-line ph-chk"><span>портрет героя книги</span><input type="checkbox" data-b="portraitHero"></label><i class="ph-tip">Один портрет героя на главу — новый заменит прежний.</i><div class="ph-sure ph-hsure" hidden><span>В этой главе уже есть портрет героя. Один герой — одна глава: сделать портретом это фото вместо прежнего?</span><button type="button" class="ph-yes ph-hyes">да, заменить</button><button type="button" class="ph-no ph-hno">оставить прежний</button></div>
      <div class="ph-hero" hidden><div class="ph-two"><label><span>годы жизни</span><input data-k="heroYears" autocomplete="off" placeholder="1901 – 1982"></label><label><span>кто для семьи</span><input data-k="heroRole" autocomplete="off" placeholder="хранительница дома"></label></div><div class="ph-hint"></div></div>
      <div class="ph-tools">${opts.album?'':'<button type="button" class="ph-rep">заменить фото</button>'}<button type="button" class="ph-mark"></button>${opts.album?'':'<button type="button" class="ph-pair"></button>'}</div>
      <div class="ph-tipbar" aria-live="polite"></div>
      <div class="ph-act">${opts.album?'<button type="button" class="ph-ret">вернуть в альбом</button><span class="ph-st"></span><button type="button" class="ph-lay">положить на лист</button>':'<button type="button" class="ph-ret">вернуть в стопку</button><span class="ph-st"></span><button type="button" class="ph-del">удалить из главы</button>'}</div>
      ${opts.album?'<div class="ph-act ph-act2"><button type="button" class="ph-del">удалить из альбома</button></div>':''}
      <div class="ph-sure" hidden><span>${opts.album?(inBook(p)?'Удалить это фото из альбома? Оно уйдёт и с листов книги.':'Удалить это фото из альбома?'):'Удалить это фото из главы?'}</span><button type="button" class="ph-yes">да, удалить</button><button type="button" class="ph-no">нет, оставить</button></div></div></div>`;
    card.querySelector('.ph-front img').src=p.src;
    card.querySelectorAll('[data-k]').forEach(x=>{x.value=p[x.dataset.k]||'';x.addEventListener('input',()=>{p[x.dataset.k]=x.value.trim();persist();});});
    {const pg=currentPage(),x=card.querySelector('[data-x="explanation"]');if(x&&pg){x.value=pg.explanation||p.explanation||'';x.addEventListener('input',()=>{pg.explanation=x.value.trim();persist();});}}
    // v213 — all that the old card held: the source, the tone, the hero's portrait (years, who for the family), the photograph
    // replaced, the people marked, «было — стало», its state. The marker and the pair picker open over the sheet: the card steps
    // aside meanwhile and comes back with what was done
    const pageOf=currentPage();
    const hero=card.querySelector('.ph-hero'),hint=card.querySelector('.ph-hint'),chk=card.querySelector('[data-b="portraitHero"]'),tone=card.querySelector('[data-s="photoMode"]');
    const HINT='Только снимок одного человека — портрет или в полный рост. Книга откроет им главу на целый разворот; имя — из «кто на фото».';
    const heroSync=()=>{hero.hidden=!chk.checked;const im=card.querySelector('.ph-front img'),w=im.naturalWidth||0,h=im.naturalHeight||0,wide=w&&h&&w/h>1.15;
      hint.textContent=chk.checked&&wide?'Снимок горизонтальный: книга обрежет его по высоте страницы. Если на нём один человек — в книге сдвиньте фото, чтобы он оказался в центре.':HINT;hint.classList.toggle('warn',!!(chk.checked&&wide));};
    chk.checked=p.portraitHero===true;
    // v245: one hero's portrait in a chapter (as the director lays it). When the chapter has one already, the card asks plainly, as
    // it asks before a deletion: this photograph instead of the other, or keep the other
    const others=()=>{const sec=sections.find(sc=>(sc.pages||[]).some(pg=>(pg.photos||[]).includes(p)));const o=[];(sec?.pages||[]).forEach(pg=>(pg.photos||[]).forEach(q=>{if(q!==p&&q.portraitHero===true)o.push(q);}));return o;};
    const hs=card.querySelector('.ph-hsure');
    chk.addEventListener('change',()=>{if(chk.checked&&others().length){chk.checked=false;hs.hidden=false;hs.scrollIntoView?.({block:'nearest',behavior:'smooth'});return;}
      p.portraitHero=chk.checked;heroSync();persist();});
    card.querySelector('.ph-hyes').addEventListener('click',()=>{others().forEach(q=>{q.portraitHero=false;});p.portraitHero=true;chk.checked=true;hs.hidden=true;heroSync();persist();});
    card.querySelector('.ph-hno').addEventListener('click',()=>{hs.hidden=true;});card.querySelector('.ph-front img').addEventListener('load',heroSync);heroSync();
    tone.value=p.photoMode||'auto';tone.addEventListener('change',()=>{p.photoMode=tone.value;persist();});
    const tools=()=>{const m=card.querySelector('.ph-mark'),pr=card.querySelector('.ph-pair');if(m)m.textContent=markPeopleLabel(p);if(pr)pr.textContent=pairLabel(p);
      card.querySelector('.ph-st').textContent=photoStatusLabel(p);};tools();
    const aside=run=>{card.style.visibility='hidden';bg.style.visibility='hidden';run(()=>{card.style.visibility='';bg.style.visibility='';
      card.querySelectorAll('[data-k]').forEach(x=>{x.value=p[x.dataset.k]||'';});tools();});};
    card.querySelector('.ph-mark').addEventListener('click',()=>aside(back=>markPeoplePhoto(p,back)));
    card.querySelector('.ph-pair')?.addEventListener('click',()=>aside(back=>pairPhoto(p,back)));
    card.querySelector('.ph-rep')?.addEventListener('click',()=>replacePhotoFile(pageOf,p,rec=>{card.querySelector('.ph-front img').src=rec.src;tools();}));
    poseAspect=null;const fromPose=from(g),fromAsp=poseAspect;card.style.transform=fromPose;shapeTo(card,g,fromAsp);HD.body.appendChild(card);open={card,bg,p,g,from:fromPose,fromAsp,back:opts.back};tellHost(true);opts.taken?.();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{card.classList.add('fly');card.style.transform='none';shapeTo(card,g,null);bg.classList.add('on');setTimeout(()=>{if(open&&open.card===card&&!coverCard)card.classList.add('flip');},430);}));
    card.addEventListener('click',e=>e.stopPropagation());
    // the hint of the field being written in shows in one quiet line kept for it (nothing above it moves)
    {const bar=card.querySelector('.ph-tipbar');card.querySelector('.ph-back').addEventListener('focusin',e=>{const row=e.target.closest('label,.ph-two');const t=row?.closest('.ph-hero')?null:(row?.parentElement?.closest('.ph-two')||row)?.nextElementSibling;bar.textContent=t?.classList.contains('ph-tip')?t.textContent:'';});}
    if(coverCard){const rep=card.querySelector('.ph-rep');if(rep){rep.classList.add('ph-rep-front');card.querySelector('.ph-front').appendChild(rep);rep.addEventListener('click',e=>e.stopPropagation());}}card.querySelector('.ph-ret2').addEventListener('click',()=>card.classList.toggle('flip'));card.querySelector('.ph-front').addEventListener('click',()=>{if(coverCard)close(null,opts.back);else card.classList.add('flip');});
    card.querySelector('.ph-ret').addEventListener('click',()=>close(null,opts.back));bg.addEventListener('click',()=>close(null,opts.back));
    if(opts.album){card.querySelector('.ph-lay').addEventListener('click',()=>{if(!OC_SHEET.canPhoto())return close(null,opts.back);
        // laid on the sheet: it goes on top of the pile (made there first, unseen), and the card comes down onto it
        const rec=OC_SHEET.addPhotoCopy(p,{quiet:true});const top=stack.querySelector('.photo-card.p1');if(top)top.style.visibility='hidden';
        close(top?gg=>printPose(top,gg):null,()=>{if(top)top.style.visibility='';opts.laid?.();});});}
    // «удалить»: from the pile — off this sheet; from the album — out of the album and off every sheet that holds it
    {const sure=card.querySelector('.ph-sure');card.querySelector('.ph-del').addEventListener('click',()=>{sure.hidden=false;});card.querySelector('.ph-no').addEventListener('click',()=>{sure.hidden=true;});
      card.querySelector('.ph-yes').addEventListener('click',()=>{const o=open;if(!o)return;open=null;
        if(opts.album)dropEverywhere(o.p);else{const ph=currentPhotos(),i=ph.indexOf(o.p);if(i>=0)ph.splice(i,1);currentPage().photoOffset=Math.min(currentPage().photoOffset||0,Math.max(0,ph.length-1));}
        o.card.classList.add('gone');o.bg.classList.remove('on');tellHost(false);
        setTimeout(()=>{o.card.remove();o.bg.remove();renderPhotos();persist();window.__OCHERKI_EMIT_STRUCTURE?.();if(opts.album)opts.laid?.();},520);});}};
  // v220 — the solitaire: all the photographs of the sheet laid out over the desk in rows (the pile keeps the last three and
  // «+N»). A press on a print opens its card over the solitaire (it comes back there); a print dragged to another place
  // changes the order; «собрать в стопку» (or a press beside the prints) gathers them back into the pile
  let sol=null;
  // v264: each print keeps its own tilt (from its own name), so the prints that close up after one is taken away do not turn at the end
  const solTilt=(p,i)=>{const k=String(p?.id||p?.src||i);let h=0;for(let j=0;j<k.length;j+=Math.max(1,k.length>>6))h=(h*31+k.charCodeAt(j))|0;return ((Math.abs(h)%7)-3)*.6;};
  const solitaire=()=>{if(sol)return;const ph=currentPhotos();if(!ph.length)return;const pg=currentPage();
    const veil=HD.createElement('div');veil.className='sol-veil';const box=HD.createElement('div');box.className='sol';
    const a=document.getElementById('activeSheet').getBoundingClientRect(),o=off(),VW=(HD.defaultView||window).innerWidth;const W=Math.min(1100,VW-160),L=Math.max(80,o.x+a.left+a.width/2-W/2);
    Object.assign(box.style,{left:L+'px',width:W+'px'});
    const draw=()=>{const list=currentPhotos();box.querySelector('.sol-grid').innerHTML=list.map((p,i)=>`<div class="sol-pr" data-i="${i}" style="--r:${solTilt(p,i)}deg"><button type="button" class="sol-x" data-x="${i}" title="Убрать это фото с листа" aria-label="Убрать фото">×</button><i style="background-image:url('${String(p.src).replace(/'/g,'%27')}')"></i>${p.caption?`<b>${String(p.caption).replace(/[&<>]/g,'')}</b>`:''}</div>`).join('');
      box.querySelector('.sol-h span').textContent=`${list.length} ${list.length%10===1&&list.length%100!==11?'снимок':list.length%10>=2&&list.length%10<=4&&(list.length%100<12||list.length%100>14)?'снимка':'снимков'}`;};
    box.innerHTML='<div class="sol-h"><b>фото этого листа</b><span></span></div><div class="sol-grid"></div><div class="sol-bar"><button type="button" class="sol-close">собрать в стопку</button><button type="button" class="sol-add">+ добавить фото</button></div>';
    // v258: × on each print takes it off the sheet at once (each one had to be opened, turned over and deleted); «вернуть фото»
    // puts the last ones back for a few seconds
    {let taken=[],undoT=0;const bar=box.querySelector('.sol-bar');const ub=HD.createElement('button');ub.type='button';ub.className='sol-undo';ub.hidden=true;bar.appendChild(ub);
      const showUndo=()=>{ub.hidden=!taken.length;ub.textContent=taken.length>1?`вернуть ${taken.length} фото`:'вернуть фото';clearTimeout(undoT);undoT=setTimeout(()=>{taken=[];ub.hidden=true;},8000);};
      ub.addEventListener('click',()=>{const list=currentPhotos();taken.slice().reverse().forEach(t=>list.splice(Math.min(t.i,list.length),0,t.p));taken=[];ub.hidden=true;persist();renderPhotos();draw();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}});
      box.addEventListener('pointerdown',e=>{const x=e.target.closest?.('.sol-x');if(!x)return;e.stopPropagation();e.preventDefault();const pr=x.closest('.sol-pr'),i=+x.dataset.x,list=currentPhotos(),ph=list[i];if(!ph||pr.classList.contains('sol-going'))return;
        pr.classList.add('sol-going');setTimeout(()=>{const at=currentPhotos().indexOf(ph);if(at<0)return;currentPhotos().splice(at,1);const pg=currentPage();pg.photoOffset=Math.min(pg.photoOffset||0,Math.max(0,currentPhotos().length-1));taken.push({p:ph,i:at});
          persist();renderPhotos();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}flip(()=>pr.remove());setTimeout(draw,360);showUndo();},300);},true);}
    HD.body.append(veil,box);draw();sol={veil,box,draw};
    // v258: the prints are dealt out of the pile one after another, each gliding to its place (they all appeared at once)
    requestAnimationFrame(()=>{const st=stack.getBoundingClientRect(),o=off(),px=o.x+st.left+st.width/2,py=o.y+st.top+40;
      [...box.querySelectorAll('.sol-pr')].forEach((el,k)=>{const r=el.getBoundingClientRect(),dx=px-(r.left+r.width/2),dy=py-(r.top+r.height/2),opt={duration:620,delay:120+Math.min(k,18)*45,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'};
        try{el.animate([{translate:`${dx.toFixed(0)}px ${dy.toFixed(0)}px`,scale:.55},{translate:'0px 0px',scale:1}],Object.assign({},opt,{composite:'add'}));el.animate([{opacity:0},{opacity:1}],Object.assign({},opt,{duration:380}));}catch(_){}});});tellHost(true);requestAnimationFrame(()=>{veil.classList.add('on');box.classList.add('on');});
    // «собрать в стопку»: the prints come together into a heap in the middle of the solitaire, and the heap goes up under the bar,
    // to the pile it came from (as the sheets of «Рукопись» go into their stack)
    const shut=()=>{if(!sol||open)return;const S=sol;sol=null;S.veil.classList.remove('on');tellHost(false);try{renderPhotos();}catch(_){}
      const prs=[...S.box.querySelectorAll('.sol-pr')];
      if(!prs.length||matchMedia('(prefers-reduced-motion: reduce)').matches){S.box.classList.remove('on');setTimeout(()=>{S.veil.remove();S.box.remove();},450);return;}
      // v242: the prints are lifted out of the solitaire (its box clips them) and carried over everything: first they come together
      // into a heap in the middle, then one after another each goes down onto the pile, exactly where it lies, and sinks into it
      const g=S.box.querySelector('.sol-grid').getBoundingClientRect(),cx=g.left+g.width/2,cy=Math.min(g.top+g.height/2,g.top+260);
      const o=off(),top=stack.querySelector('.photo-card.p1')||stack.querySelector('.photo-card'),tr=(top||stack).getBoundingClientRect();
      const tcx=o.x+tr.left+tr.width/2,tcy=o.y+tr.top+tr.height/2,tw=tr.width||124;
      const fls=prs.map((x,k)=>{const r=x.getBoundingClientRect(),fl=x.cloneNode(true),t=getComputedStyle(x).transform;
        Object.assign(fl.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:x.offsetWidth+'px',height:x.offsetHeight+'px',margin:'0',zIndex:String(2147483295-k),transform:t,willChange:'transform,opacity',pointerEvents:'none'});
        HD.body.appendChild(fl);x.style.visibility='hidden';return {fl,mx:r.left+r.width/2,my:r.top+r.height/2,w:x.offsetWidth||r.width,t};});
      S.box.classList.remove('on');
      // (the first seven go one by one; the rest of a big heap go down together under them — quick however many there are)
      const H1=460,STEP=120,FLY=560,E='cubic-bezier(.45,.05,.3,1)';
      fls.forEach(({fl,mx,my,w,t},k)=>{const rot=((k*37)%13-6)*.9,heap=`translate(${cx-mx}px,${cy-my}px) rotate(${rot}deg) scale(.86)`,sc=tw/w;
        fl.animate([{transform:t},{transform:heap}],{duration:H1,delay:k*14,easing:E,fill:'forwards'}).finished.then(()=>{
          const a=fl.animate([{transform:heap,opacity:1},{transform:`translate(${tcx-mx}px,${tcy-my}px) rotate(-3deg) scale(${sc})`,opacity:1,offset:.86},{transform:`translate(${tcx-mx}px,${tcy-my+4}px) rotate(-3deg) scale(${sc*.98})`,opacity:0}],
            {duration:FLY,delay:Math.min(k,6)*STEP,easing:E,fill:'forwards'});a.finished.then(()=>fl.remove(),()=>fl.remove());},()=>fl.remove());});
      setTimeout(()=>{S.veil.remove();S.box.remove();},H1+Math.min(fls.length,7)*(STEP+14)+FLY+200);};
    veil.addEventListener('click',shut);box.querySelector('.sol-close').addEventListener('click',shut);
    box.querySelector('.sol-add').addEventListener('click',()=>{shut();document.getElementById('addPhotoBtn')?.click();});
    // dragging a print: the others make way for it while it is carried (each glides to where it will stand), and it settles
    // into the gap when let go
    const flip=(fn)=>{const els=[...box.querySelectorAll('.sol-pr')],r0=new Map(els.map(x=>[x,x.getBoundingClientRect()]));fn();
      els.forEach(x=>{const a=r0.get(x),b=x.getBoundingClientRect();if(!a)return;const dx=a.left-b.left,dy=a.top-b.top;if(!dx&&!dy)return;
        x.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:320,easing:'cubic-bezier(.2,.8,.3,1)'});});};
    box.addEventListener('pointerdown',e=>{const c=e.target.closest('.sol-pr');if(!c||e.button!==0)return;e.preventDefault();const r=c.getBoundingClientRect(),x0=e.clientX,y0=e.clientY;let fl=null;const grid=box.querySelector('.sol-grid');
      // the hand is followed on the whole document: the print itself moves in the grid while carried (and a moved node loses its capture)
      const mv=ev=>{const dx=ev.clientX-x0,dy=ev.clientY-y0;if(!fl&&Math.hypot(dx,dy)<6)return;
        if(!fl){fl=c.cloneNode(true);fl.classList.add('sol-fly');fl.style.willChange='transform';Object.assign(fl.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});HD.body.appendChild(fl);c.classList.add('sol-gap');}
        // v241: the print follows the hand once a frame (the moves of a fast mouse are gathered), the carried copy lets the pointer
        // through, so the print under the hand is found without hiding it
        lastEv=ev;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const e2=lastEv,ddx=e2.clientX-x0,ddy=e2.clientY-y0;
          fl.style.transform=`translate3d(${ddx}px,${ddy}px,0) rotate(3deg) scale(1.1)`;
          // the print under the hand: the gap moves before it (or after it, past its middle)
          const el=HD.elementFromPoint(e2.clientX,e2.clientY);const t=el?.closest?.('.sol-pr');
          if(t&&t!==c&&!t.classList.contains('sol-fly')){const tr=t.getBoundingClientRect(),after=e2.clientX>tr.left+tr.width/2;const ref=after?t.nextSibling:t;if(ref!==c&&ref!==c.nextSibling)flip(()=>grid.insertBefore(c,ref));}});};
      let raf=0,lastEv=null;
      const up=ev=>{cancelAnimationFrame(raf);raf=0;HD.removeEventListener('pointermove',mv);HD.removeEventListener('pointerup',up);HD.removeEventListener('pointercancel',up);
        const i=+c.dataset.i;if(!fl){if(ev.type==='pointerup')fromSolitaire(c,i);return;}
        // the print goes down into its gap, then the order is kept
        const to=c.getBoundingClientRect(),fr=fl.getBoundingClientRect();fl.style.transition='transform .32s cubic-bezier(.2,.8,.3,1)';fl.style.transform=`translate(${to.left-r.left}px,${to.top-r.top}px) rotate(0deg) scale(1)`;
        setTimeout(()=>{fl.remove();c.classList.remove('sol-gap');const order=[...grid.querySelectorAll('.sol-pr')].map(x=>+x.dataset.i);const list=currentPhotos(),copy=list.slice();
          if(order.some((v,k)=>v!==k)){order.forEach((v,k)=>{list[k]=copy[v];});pg.photoOffset=Math.min(pg.photoOffset||0,list.length-1);persist();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}}draw();},330);};
      HD.addEventListener('pointermove',mv);HD.addEventListener('pointerup',up);HD.addEventListener('pointercancel',up);});};
  // a print of the solitaire opens its card (laid over the solitaire) and comes back to its place there
  const hostPose=(c,g)=>{const r=c.getBoundingClientRect(),t=getComputedStyle(c).transform,m=new DOMMatrix(t==='none'?undefined:t);const o=off();return poseAt({left:r.left-o.x,top:r.top-o.y,width:r.width,height:r.height},Math.atan2(m.b,m.a)*180/Math.PI,c.offsetWidth||r.width,g);};
  const fromSolitaire=(c,i)=>{const p=currentPhotos()[i];if(!p)return;
    openCard(p,g=>hostPose(c,g),{noVeil:true,taken:()=>{c.style.visibility='hidden';},back:()=>{c.style.visibility='';try{updatePhotoStatus(p);}catch(_){}persist();sol?.draw();setTimeout(()=>window.__OCHERKI_EMIT_STRUCTURE?.(),460);}});};
  window.__ocSolitaire=solitaire;
  // from the pile
  window.__ocTakePhoto=(c,idx)=>{c=c||stack.querySelector(`.photo-card[data-index="${idx}"]`)||stack.querySelector('.photo-card');if(!c)return;const p=currentPhotos()[idx];
    openCard(p,g=>printPose(c,g),{taken:()=>{c.style.visibility='hidden';},back:()=>{c.style.visibility='';try{updatePhotoStatus(p);}catch(_){}persist();setTimeout(()=>window.__OCHERKI_EMIT_STRUCTURE?.(),460);}});};
  // from the album on the desk (the cell's place is given in this sheet's own coordinates)
  window.__ocAlbumCard=(p,r,done)=>openCard(p,g=>poseAt(r,0,r.width,g),{album:true,back:()=>{persist();done&&done('back');},laid:()=>{done&&done('laid');}});
  const esc=e=>{if(e.key==='Escape'&&open)close(null,open.back);};addEventListener('keydown',esc);if(HD!==document)HD.defaultView.addEventListener('keydown',esc);
  const badge=()=>{const n=currentPhotos().length-stack.querySelectorAll('.photo-card').length;let m=stack.querySelector('.ph-more');
    stack.dataset.n=stack.querySelectorAll('.photo-card').length;
    if(n>0){if(!m){m=document.createElement('button');m.type='button';m.className='ph-more';stack.appendChild(m);}m.textContent=`ещё ${n} ›`;placeTag(stack.classList.contains('fan'));}else m?.remove();};
  // v228: «ещё N» goes 14px under the lowest edge of the lowest print — reckoned from the prints' own size and tilt and where they
  // will lie (folded, or fanned under the hand), so it never lies on a print, in any browser
  const FAN=[0,104,208],REST=[0,-2,2];
  const placeTag=open=>{const m=stack.querySelector('.ph-more');if(!m)return;let low=0;
    stack.querySelectorAll('.photo-card').forEach((c,i)=>{const w=c.offsetWidth,h=c.offsetHeight,t=new DOMMatrix(getComputedStyle(c).transform),sn=t.b,cs=t.a,ox=w*.3;
      const bottom=Math.max(...[[0,h],[w,h]].map(([x,y])=>(x-ox)*sn+y*cs));low=Math.max(low,(open?FAN[i]:REST[i])+bottom);});
    // (fanned, the prints' tilt grows as they open: the tag keeps a wider margin then)
    m.style.top=Math.round(low+(open?40:14))+'px';};
  // v241: while the prints open out under the hand (or fold back) the tag follows the lowest edge as it really is on the screen,
  // so it never lies on a print, whatever their size
  let tagRun=0;const followTag=()=>{const t0=performance.now(),id=++tagRun;const step=()=>{if(id!==tagRun)return;const m=stack.querySelector('.ph-more');if(!m)return;
      const sr=stack.getBoundingClientRect();let low=0;stack.querySelectorAll('.photo-card').forEach(c=>{low=Math.max(low,c.getBoundingClientRect().bottom-sr.top);});
      const want=Math.round(low+16);stack.style.setProperty('--fanh',(want+44)+'px');m.style.transition='translate .25s ease';if(Math.abs((parseFloat(m.style.top)||0)-want)>.5)m.style.top=want+'px';if(performance.now()-t0<900)requestAnimationFrame(step);else m.style.removeProperty('transition');};requestAnimationFrame(step);};
  // v243: the pile opens under the hand and stays open while the hand is about it — it folds only half a second after the hand has
  // left the prints, the tag and the room between them (the hand can go down to «ещё N» and press it)
  let fanT=0;const fanOn=()=>{clearTimeout(fanT);if(!stack.classList.contains('fan')){stack.classList.add('fan');followTag();}};
  const fanOff=()=>{clearTimeout(fanT);fanT=setTimeout(()=>{stack.classList.remove('fan');followTag();},520);};
  stack.addEventListener('mouseenter',fanOn);stack.addEventListener('mouseleave',fanOff);stack.addEventListener('mouseover',fanOn);
  // v222: the pile hangs from the bar over the sheet — its prints' top edges 14px under the bar's lower edge
  const hang=()=>{try{const bar=HD.querySelector('.wc.wc-w:not(.bq-car)')?.getBoundingClientRect(),par=stack.offsetParent?.getBoundingClientRect();if(!bar||!bar.height||!par)return;
    const t=Math.round(bar.bottom-14-off().y-par.top);if(stack._top!==t){stack._top=t;stack.style.top=t+'px';}}catch(_){}};setInterval(hang,400);hang();
  // the pile laid out again without a jump: the prints that stay glide to their new places, a new one comes up from beneath
  window.__ocRelayPile=(mutate,riseIndex)=>{const before=new Map([...stack.querySelectorAll('.photo-card')].map(c=>[c.dataset.index,c.getBoundingClientRect()]));mutate();renderPhotos();
    stack.querySelectorAll('.photo-card').forEach(c=>{const r0=before.get(c.dataset.index);if(String(riseIndex)===c.dataset.index||!r0){c.classList.add('ph-rise');return;}
      const r1=c.getBoundingClientRect();c.style.translate=`${(r0.left-r1.left).toFixed(1)}px ${(r0.top-r1.top).toFixed(1)}px`;void c.offsetWidth;
      c.style.transition='translate .5s cubic-bezier(.2,.8,.3,1)';c.style.translate='0px 0px';setTimeout(()=>{c.style.removeProperty('transition');c.style.removeProperty('translate');},540);});};
  // the wheel over the prints riffles through them, one print for one turn of the wheel (a trackpad's run of events is one turn);
  // a press on «+N» does the same
  // v213: the turns are counted (a mouse's notch is one, a trackpad's run of small steps adds up to one), and one print goes for
  // each as soon as the one before has settled — nothing stays locked between gestures
  {let acc=0,last=0,idleT=0;stack.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();if(currentPhotos().length<=3)return;
      const d=e.deltaMode===1?e.deltaY*33:e.deltaY;acc+=d;clearTimeout(idleT);idleT=setTimeout(()=>{acc=0;},220);
      const now=performance.now();if(Math.abs(acc)<36||photoAnimating||now-last<460)return;last=now;const dir=acc>0?1:-1;acc=0;animatePhotoCarousel(dir);},{passive:false});
    stack.addEventListener('click',e=>{if(!e.target.closest('.ph-more'))return;e.stopPropagation();solitaire();});}
  window.__ocBadge=badge;
  window.__ocPhotoCardOpen=()=>!!open;})();
// v256: the sheet's foot says when this very sheet was last saved — time and date, small and quiet («Дальше» and «в книге ›» are
// gone: the book's page always lies on the right now)
(()=>{const foot=document.querySelector('.footer');if(!foot)return;const el=document.createElement('div');el.className='sv-at';foot.appendChild(el);
  const M=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const fmt=t=>{const d=new Date(t);return `сохранено ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} · ${d.getDate()} ${M[d.getMonth()]}${d.getFullYear()!==new Date().getFullYear()?' '+d.getFullYear():''}`;};
  editor.addEventListener('input',()=>{const p=currentPage();if(p){p.editedAt=Date.now();paint();}});
  const paint=()=>{const p=currentPage?.();const t=p?.editedAt||0;const s=t?fmt(t):'';if(el.textContent!==s)el.textContent=s;};setInterval(paint,1000);paint();})();
// v256: the heading of the introduction, «От автора», the afterword, the thanks and the last words is written on the sheet itself
// (it could be changed only in the bar above — not to be guessed); a quiet note above it says what it is
(()=>{const IDS={intro:'Вступление',author:'От автора',afterword:'Послесловие',thanks:'Благодарности',final:'Финал'};
  const wrap=editor.closest('.editor-wrap');if(!wrap)return;const h=document.createElement('div');h.className='sh-head';h.contentEditable='true';h.spellcheck=false;h.dataset.label='Заголовок — его можно изменить';wrap.prepend(h);
  const sync=()=>{const sec=currentSection?.(),p=currentPage?.();const on=!!(sec&&IDS[sec.id]&&p&&!pageUsesForm(p));wrap.classList.toggle('has-head',on);
    if(on&&document.activeElement!==h){const t=String(p.title||sec.title||IDS[sec.id]);if(h.textContent!==t)h.textContent=t;}
    // centred on the sheet itself (the text's column sits off the middle on these sheets: the heading stood to the right)
    if(on){const pa=wrap.closest('.paper')||wrap.parentElement,pr=pa.getBoundingClientRect(),wr=wrap.getBoundingClientRect();if(pr.width){h.style.left=Math.round(pr.left+48-wr.left)+'px';h.style.right=Math.round(wr.right-(pr.right-48))+'px';}}};
  const commit=()=>{const t=h.textContent.replace(/\s+/g,' ').trim();const sec=currentSection(),p=currentPage();if(!sec||!p)return;if(!t){sync();return;}
    if(p.title!==t){p.title=t;if((sec.pages||[]).indexOf(p)===0)sec.title=t;persistSoon();try{window.__OCHERKI_EMIT_STRUCTURE?.();}catch(_){}}};
  h.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();h.blur();}if(e.key==='Escape'){e.preventDefault();h.blur();sync();}});
  h.addEventListener('blur',commit);setInterval(sync,500);sync();})();
// v257: the chapter's name on its first sheet, written there itself (only the bar above held it, and the sheet showed the episode
// alone — «Эпизод 1» read as if the chapter were missing); a quiet note above says it can be changed
(()=>{const paper=document.querySelector('.paper');if(!paper)return;const h=document.createElement('div');h.className='ch-head';h.contentEditable='true';h.spellcheck=false;h.dataset.label='Название главы — его можно изменить';paper.appendChild(h);
  const name=sec=>String(sec?.title||'').replace(/^Глава\s+\d+[.:]?\s*/i,'').trim();
  const sync=()=>{const sec=currentSection?.(),p=currentPage?.();const on=!!(sec&&sec.type==='chapter'&&p&&(sec.pages||[]).indexOf(p)===0&&!pageUsesForm(p));paper.classList.toggle('has-ch-head',on);
    if(on&&document.activeElement!==h){const t=name(sec)||'Новая глава';if(h.textContent!==t)h.textContent=t;}};
  const commit=()=>{const t=h.textContent.replace(/\s+/g,' ').trim();const sec=currentSection();if(!sec||sec.type!=='chapter'||!t){sync();return;}if(t===name(sec))return;
    try{OC_SHEET.renameChapter(t);}catch(_){chapterLabel.textContent=t;commitChapterHeading();persistSoon();window.__OCHERKI_EMIT_STRUCTURE?.();}};
  h.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();h.blur();}if(e.key==='Escape'){e.preventDefault();sync();h.blur();}});
  h.addEventListener('blur',commit);setInterval(sync,500);sync();})();
