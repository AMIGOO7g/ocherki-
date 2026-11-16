/*@block [" id=\"tour-v99-js\"", ""]*/
// v99: a short first look — the lamp lights one thing at a time. Each room
// (write, manuscript, book) shows its own part only on the first visit;
// «Аа → Показать знакомство» brings it back.
(()=>{const shell=document.querySelector('.shell'),modal=document.getElementById('bookPreviewModal');if(!shell)return;
  const frameDoc=()=>{try{return document.getElementById('v35SheetFrame')?.contentDocument;}catch(_){return null;}};
  const inFrame=sel=>{const f=document.getElementById('v35SheetFrame'),d=frameDoc();const el=d?.querySelector(sel);if(!el||!f)return null;const a=f.getBoundingClientRect(),r=el.getBoundingClientRect();return {left:a.left+r.left,top:a.top+r.top,width:r.width,height:r.height};};
  const box=sel=>{if(typeof sel==='function')return sel();const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height?r:null;};
  const TOURS={
    write:[
      ['.mode-switch','Три комнаты мастерской','<b>Писать</b> — лист, на котором вы рассказываете.<br><b>Рукопись</b> — все листы книги на одном столе.<br><b>Книга</b> — как это будет напечатано.'],
      ['.editor-paper','Ваш лист','Пишите как в обычном письме. Всё сохраняется само, каждую секунду.'],
      [()=>inFrame('#voiceBtn'),'Можно говорить','Нажмите микрофон и рассказывайте — слова сами лягут на лист.'],
      ['#writingPrompt','Вопросы к главе','Если не знаете, с чего начать, — ответьте на вопрос. «Дальше» покажет следующий.'],
      ['#bookMapShell','Карта книги','Главы и листы. Нажмите на главу, чтобы перейти к ней.'],
      ['.mode-controls','Свет, крупный шрифт, музыка','Ночь и день, крупный интерфейс и тихая музыка для работы.'],
      ['.rd-line','Сколько осталось до книги','Нажмите золотую линию под названием — увидите, что ещё нужно сделать, и перейдёте прямо к этому месту.'],
      ['#booksBtn','Мои книги','Здесь хранятся все ваши книги — можно вести несколько.'],
      ['#pdfBtn','Сохранить','Черновик книги в PDF — посмотреть или показать родным.'],
      ['#contactBtn','Написать нам','Вопрос, идея или помощь — открытка придёт в мастерскую.']],
    manuscript:[
      ['.ms-space','Все листы на одном столе','Колесо — листать главы. Нажмите лист — откроется для письма. Потяните — переставите.'],
      ['.mq-car','Плашка главы','‹ › — соседняя глава. Справа: новый лист, фото, «готово» для открытого листа, корзина.'],
      ['.mq-name','Название главы','Нажмите — откроется список глав, «＋ Новая глава» и разделы книги.']],
    book:[
      ['#bookPreviewSpread','Ваша книга','Так она будет напечатана. Листайте стрелками или колесом.'],
      ['#bookPreviewLayoutHanger','Композиция разворота','Стрелки меняют расположение фото и текста на этом развороте.'],
      ['.bq-car','Плашка книги','‹ ⟳ › — композиция разворота. Справа: дизайн, формат, фото в книге и PDF. Листать — за уголок страницы или по превью внизу.'],
      ['.preview-arc','Лента разворотов','Нажмите на любой разворот, чтобы перейти к нему.']]};
  const key=n=>'ocherki_tour_'+n;
  const seen=n=>{try{return localStorage.getItem(key(n))==='1';}catch(_){return true;}};
  const mark=n=>{try{localStorage.setItem(key(n),'1');}catch(_){}};
  let dim,ring,card,cur=null,idx=0,steps=[];
  function ensure(){if(dim)return;dim=document.createElement('div');dim.className='tr-dim';ring=document.createElement('div');ring.className='tr-ring';card=document.createElement('div');card.className='tr-card';document.body.append(dim,ring,card);
    // A press anywhere outside closes the tour — nothing stays blocked.
    dim.addEventListener('click',e=>{e.stopPropagation();end();});}
  function place(){const st=steps[idx];if(!st)return end();const r=box(st[0]);if(!r){idx++;return place();}
    const pad=10,cx=r.left+r.width/2,cy=r.top+r.height/2;
    dim.style.setProperty('--x',cx+'px');dim.style.setProperty('--y',cy+'px');dim.style.setProperty('--rw',Math.max(70,r.width*.62)+'px');dim.style.setProperty('--rh',Math.max(46,r.height*.75)+'px');
    ring.style.cssText=`left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+2*pad}px;height:${r.height+2*pad}px;border-radius:${Math.min(40,(r.height+2*pad)/2)}px`;ring.classList.add('on');
    const total=steps.length;card.innerHTML=`<small>Знакомство · ${idx+1} из ${total}</small><h3>${st[1]}</h3><p>${st[2]}</p><div class="tr-row"><span class="tr-dots">${steps.map((_,i)=>`<i class="${i===idx?'on':''}"></i>`).join('')}</span><span><button class="tr-skip" type="button">пропустить</button><button class="tr-btn" type="button">${idx===total-1?'Понятно':'Далее →'}</button></span></div>`;
    card.querySelector('.tr-btn').onclick=e=>{e.stopPropagation();idx++;place();};card.querySelector('.tr-skip').onclick=e=>{e.stopPropagation();end();};
    const W=360,H=card.offsetHeight||220;let left=cx-W/2,top=r.bottom+22;
    if(top+H>innerHeight-16){top=r.top-H-22;}if(top<16){top=Math.min(innerHeight-H-16,cy-H/2);left=r.right+26;if(left+W>innerWidth-16)left=r.left-W-26;}
    left=Math.max(16,Math.min(innerWidth-W-16,left));top=Math.max(16,Math.min(innerHeight-H-16,top));
    card.style.left=left+'px';card.style.top=top+'px';requestAnimationFrame(()=>{dim.classList.add('on');card.classList.add('on');});}
  function start(name,force){if(cur||(!force&&seen(name)))return;const list=TOURS[name];if(!list)return;ensure();cur=name;idx=0;steps=list;mark(name);place();}
  function end(){if(!cur)return;cur=null;dim.classList.remove('on');ring.classList.remove('on');card.classList.remove('on');}
  addEventListener('keydown',e=>{if(!cur)return;if(e.key==='Escape')end();if(e.key==='Enter'||e.key==='ArrowRight'){e.preventDefault();idx++;place();}},true);
  addEventListener('resize',()=>{if(cur)place();});
  const room=()=>shell.classList.contains('is-start-screen')||shell.classList.contains('is-family-room')?'':shell.classList.contains('is-manuscript')?'manuscript':modal?.classList.contains('open')?'book':shell.classList.contains('is-open')?'write':'';
  // Automated checks (tests) are not greeted.
  const quiet=navigator.webdriver&&!/[?&]tour=1/.test(location.search+(parent!==window?parent.location.search:''));
  let t=0;const check=()=>{if(quiet)return;clearTimeout(t);t=setTimeout(()=>{const r=room();if(r&&!cur)start(r);},r0()==='book'?2600:1500);};const r0=room;
  new MutationObserver(check).observe(shell,{attributes:true,attributeFilter:['class']});
  if(modal)new MutationObserver(check).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('message',e=>{if(e.data?.type==='OCHERKI_TOUR_AGAIN'){const r=room()||'write';end();setTimeout(()=>start(r,true),300);}});
  window.OCHERKI_TOUR={start:(n,f)=>start(n||room(),f),end};
})();
