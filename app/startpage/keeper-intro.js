/*@block [" id=\"kob-v142-js\"", ""]*/
(()=>{const ov=document.getElementById('kob');const html=document.documentElement;
  const off=()=>html.classList.remove('kob-wait');
  if(!ov)return off();
  // v207: for now the constructor opens straight away — the Keeper's greeting, the e-mail and the steps are not shown
  if(!/[?&]kob=1/.test(location.search)){ov.remove();off();return;}
  if(/[?&]classic=1/.test(location.search)||navigator.webdriver&&!/[?&]kob=1/.test(location.search)){ov.remove();off();return;}
  const $=id=>document.getElementById(id),cv=ov.querySelector('canvas');
  // the steps after the tour: the e-mail (unless already signed in), the start, and the three questions — one dot for each
  const NAMES={auth:'вход',books:'начало',who:'герой',how:'рассказ',book:'книга'};
  let noBooks=false;const toBooks=()=>{const L=window.OcherkiStore?.list?.();if(L&&L.then)L.then(b=>{noBooks=!(b&&b.length);if(noBooks){window.__ocherkiCreatingBook=true;go('who');}else go('books');}).catch(()=>go('books'));else go('books');};
  let viaAuth=false;const steps=()=>{if(cur==='auth')viaAuth=true;const L=!viaAuth&&known()?['books','who','how','book']:['auth','books','who','how','book'];return noBooks?L.filter(x=>x!=='books'):L;};
  let K=null,T=null,cur='',ts=[];const later=(f,ms)=>ts.push(setTimeout(f,ms));
  // he stands to the left of the words and turns to them
  const SPOT={auth:[-.72,-.05],books:[-.74,-.08],shelf:[-.84,.1],who:[-.76,.02],how:[-.74,-.08],book:[-.76,.02]};
  const MOOD={auth:'calm',books:'joy',shelf:'tender',who:'curious',how:'focus',book:'wonder'};
  const place=s=>{if(!K)return;const sp=SPOT[s]||[-.6,0];K.moveTo(sp[0],sp[1],.8,{fold:true});K.mood?.(MOOD[s]||'calm');K.face(1);K.lookAt(.95,-sp[1]*.5);};
  const headAt=()=>{const H=ov.clientHeight||innerHeight;return[0,1-2*((H*.05+38)/H)];};
  let gt=0;const pen=s=>{if(!K)return;const t=++gt,st=ov.querySelector(`.st[data-s="${s}"]`),h=st?.querySelector('h2');K.clearWords();st?.classList.remove('s1','s2','s3');
    const stage=(c,ms)=>later(()=>{if(t===gt)st?.classList.add(c);},ms);const done=280+(2.5+3.3)/2.3*1000;stage('s1',done-150);stage('s2',done+250);stage('s3',done+650);
    later(()=>{if(t!==gt)return;K.write(h?.textContent||'',{at:headAt(),px:64,hold:true});
      later(()=>{if(t!==gt)return;const sp=SPOT[s]||[-.6,0];K.rest(sp[0],sp[1],.8);K.face(1);K.lookAt(.9,0);K.mood?.(MOOD[s]||'calm');},1100);},280);};
  function go(s){if(s===cur)return;cur=s;
    if(s==='tour'){ov.querySelectorAll('.st').forEach(x=>x.classList.remove('on'));ov.classList.remove('steps');tour(true);return;}
    ov.querySelectorAll('.st').forEach(x=>x.classList.toggle('on',x.dataset.s===s));
    {const L=steps(),n=L.indexOf(s),dots=ov.querySelector(':scope>.dots');ov.classList.toggle('steps',n>=0);
      if(dots.children.length!==L.length)dots.innerHTML=L.map(()=>'<i></i>').join('');[...dots.children].forEach((d,j)=>d.classList.toggle('on',j<=n));
      const k=ov.querySelector(`.st[data-s="${s}"] .k`);if(k&&n>=0)k.textContent=`шаг ${n+1} из ${L.length} · ${NAMES[s]}`;}
    if(s==='shelf')fillShelf();if(K&&ov.classList.contains('pen'))pen(s);else place(s);}
  const known=()=>{try{return!!(localStorage.getItem('ocherki_auth_email')||sessionStorage.getItem('ocherki_auth_guest'));}catch(_){return false;}};
  // the tour: he greets, shows the five things the constructor does, and only then the e-mail and the books
  function tour(again){T?.destroy();
    T=OcherkiTour.create(ov,{K,view:/[?&]tour=photo/.test(location.search)?'photo':'hybrid',greeting:!again,last:known()?'К моим книгам':'Войти и начать',skipLabel:again?'Назад':'Пропустить',onDone:()=>{const t=T;setTimeout(()=>t?.destroy(),1200);T=null;cur='';if(known())toBooks();else go('auth');}});
    if(K){K.moveTo(0,.34,1);K.lookAt(null);}T.start();}
  // answers go into the old steps underneath
  const sel=(stepEl,card)=>{const step=+stepEl.dataset.step;stepEl.querySelectorAll('.cd').forEach(c=>c.classList.toggle('on',c===card));
    const real=[...document.querySelectorAll(`#cardsGrid${step} .format-card`)].find(c=>c.getAttribute('onclick')?.includes(`'${card.dataset.v}'`));
    try{window.selectCard?.(step,card.dataset.v,real||card);}catch(_){}
    if(K){const r=card.getBoundingClientRect();K.lookAt((r.left+r.width/2)/innerWidth*2-1,1-(r.top+r.height/2)/innerHeight*2);K.talk(700);K.mood?.('joy',1300,MOOD[cur]||'calm');}
    if(step===2){const l=$('kobHeroL');if(l)l.textContent=card.dataset.v==='История семьи'?'фамилия семьи или главный человек рода':card.dataset.v==='Моя жизнь'?'ваше имя и фамилия':'имя и фамилия героя';}};
  ov.querySelectorAll('.cards[data-step]').forEach(g=>g.addEventListener('click',e=>{const c=e.target.closest('.cd');if(c)sel(g,c);}));
  ov.querySelectorAll('input[data-into]').forEach(inp=>{const t=$(inp.dataset.into);if(t&&t.value)inp.value=t.value;inp.addEventListener('input',()=>{const t=$(inp.dataset.into);if(t){t.value=inp.value;t.dispatchEvent(new Event('input',{bubbles:true}));}});});
  const ok=need=>{const sec=ov.querySelector(`.st[data-s="${need}"]`);if(!sec.querySelector('.cd.on'))return'Выберите один из вариантов';
    if(need==='who'&&!sec.querySelector('[data-into="heroNameInput"]').value.trim())return'Впишите имя героя — его можно изменить потом';
    if(need==='book'&&!sec.querySelector('[data-into="bookTitleInput"]').value.trim())return'Как назовём книгу?';return'';};
  ov.addEventListener('click',e=>{const b=e.target.closest('.st [data-go]');if(!b)return;const g=b.dataset.go;
    if(b.dataset.need){const m=ok(b.dataset.need);if(m){b.animate([{translate:'-4px 0'},{translate:'4px 0'},{translate:'0 0'}],{duration:260});K&&K.talk(900);const sec=b.closest('.st');let st=sec.querySelector('.status');if(!st){st=document.createElement('div');st.className='status';sec.querySelector('.acts').before(st);}st.textContent=m;return;}}
    if(g==='guest'){try{$('startAuthGuest')?.click();sessionStorage.setItem('ocherki_auth_guest','1');}catch(_){}toBooks();return;}
    if(g==='who'||g==='new'){window.__ocherkiCreatingBook=true;try{localStorage.removeItem('ocherkiLifeProjectDraft');}catch(_){}if(g==='new'){go('who');return;}}
    // v188: «Мои книги» is the same bookcase as in the constructor (the showcase and the one-book card), not the old leather shelf
    if(g==='shelf'&&window.OcherkiBookcase){window.OCHERKI_SHELF_HOOKS={onOpen:id=>openBook(id),
        onNew:()=>{window.__ocherkiCreatingBook=true;try{localStorage.removeItem('ocherkiLifeProjectDraft');}catch(_){}go('who');}};
      window.OcherkiBookcase.open();return;}
    if(g==='open'){openBook(b.dataset.id);return;}
    if(g==='finish'){finish();return;}
    go(g);});
  // the e-mail: the old form does the work, its answer shows here
  $('kobSend').addEventListener('click',()=>{const em=$('startAuthEmail'),cb=$('startAuthConsent'),code=$('startAuthCode');
    if(!$('kobConsent').checked){$('kobStatus').textContent='Отметьте согласие на обработку данных';return;}
    if(em)em.value=$('kobEmail').value;if(cb)cb.checked=true;if(code&&$('kobCode').value)code.value=$('kobCode').value;
    try{$('startAuthForm')?.requestSubmit?$('startAuthForm').requestSubmit():$('startAuthSubmit')?.click();}catch(_){}
    const watch=n=>{const st=$('startAuthStatus')?.textContent||'';if(st)$('kobStatus').textContent=st;const cf=$('startAuthCodeField');if(cf&&!cf.hidden){$('kobCodeL').hidden=false;$('kobSend').textContent='Войти';}
      let inn=false;try{inn=!!localStorage.getItem('ocherki_auth_email');}catch(_){}if(inn){toBooks();return;}if(n>0)later(()=>watch(n-1),400);};watch(20);});
  // «Мои книги» right here, on the same dark stage
  const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // when the book was last saved: «сегодня, 21:40», «вчера, 09:15», «3 ноября, 18:02», «3 ноября 2025, 18:02»
  const when=t=>{if(!t)return'';try{const d=new Date(t),n=new Date(),hm=d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    const day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(),dd=(day(n)-day(d))/864e5;
    if(dd===0)return'сегодня, '+hm;if(dd===1)return'вчера, '+hm;
    return d.toLocaleDateString('ru-RU',d.getFullYear()===n.getFullYear()?{day:'numeric',month:'long'}:{day:'numeric',month:'long',year:'numeric'})+', '+hm;}catch(_){return'';}};
  // «Мои книги»: the books stand on a lit shelf, the newest first; each shows when it was saved; open or delete (asked once more)
  async function fillShelf(){const box=$('kobShelf');box.innerHTML='<div class="empty">Ищу ваши книги…</div>';let books=[];try{books=await window.OcherkiStore.list();}catch(_){}
    if(cur!=='shelf')return;
    if(!books.length){box.innerHTML='<div class="empty">Пока на полке пусто — начните первую книгу кнопкой «Создать книгу».</div>';return;}
    const rows=[];for(let k=0;k<books.length;k+=3)rows.push(books.slice(k,k+3));
    // four real covers; the face of each (where the title goes) measured on the picture; on the light one the title is pressed dark
    const COVERS=[{n:'wine2',ar:620/882,fx:21,fw:64},{n:'olive',ar:620/921,fx:21,fw:64},{n:'navy',ar:620/912,fx:21,fw:64},{n:'terra',ar:620/882,fx:21,fw:64}];
    const cover=id=>COVERS[[...String(id)].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%COVERS.length];
    box.innerHTML=rows.map(r=>`<div class="row">${r.map((b,k)=>`<div class="bk" data-id="${esc(b.id)}" style="--tilt:${[-1.2,.9,-.5][k]}deg">
        ${(()=>{const cv=cover(b.id);return `<div class="tag"><strong>${esc(b.title||'Книга без названия')}</strong><span>сохранена ${esc(when(b.savedAt)||'—')}${b.pages?` · ${b.pages} стр.`:''}</span></div>
        <div class="cov" data-go="open" data-id="${esc(b.id)}" style="--ar:${cv.ar};--fx:${cv.fx}%;--fw:${cv.fw}%;${cv.dark?'--ink:linear-gradient(180deg,#6b4a22,#3e2a12 60%,#7a5428);--ink2:#7a5428;--sh:rgba(255,240,210,.5);':''}--fs:${(()=>{const t=String(b.title||''),w=Math.max(...t.split(/\s+/).map(x=>x.length),1);return Math.max(12,Math.min(24,Math.floor(100/(w*.7)),t.length>26?17:24));})()}px"><img src="assets/keeper/cover-${cv.n}.webp?v=20261107-v267" alt=""><div class="face"><b>книга</b><strong>${esc(b.title||'Книга без названия')}</strong></div></div>`;})()}
        <div class="ops"><button type="button" class="op" data-go="open" data-id="${esc(b.id)}">Открыть</button><button type="button" class="op del" data-del="${esc(b.id)}">Удалить</button></div>
        <div class="ask"><span>Удалить «${esc(b.title||'книгу')}» навсегда?</span><button type="button" class="op del" data-del-yes="${esc(b.id)}">Удалить</button><button type="button" class="op" data-del-no>Оставить</button></div></div>`).join('')}</div>`).join('');}
  $('kobShelf').addEventListener('click',async e=>{const d=e.target.closest('[data-del]');if(d){e.stopPropagation();d.closest('.bk')?.classList.add('asking');return;}
    if(e.target.closest('[data-del-no]')){e.stopPropagation();e.target.closest('.bk')?.classList.remove('asking');return;}
    const y=e.target.closest('[data-del-yes]');if(y){e.stopPropagation();const bk=y.closest('.bk');bk.classList.add('gone');
      try{await window.OcherkiStore.remove(y.dataset.delYes);}catch(_){}try{if(localStorage.getItem('ocherkiActiveBook')===y.dataset.delYes)localStorage.removeItem('ocherkiActiveBook');}catch(_){}
      setTimeout(()=>fillShelf(),600);}});
  // the music key shows once the music has started; a press stops it (and it stays off next time) or plays it again
  {const mb=$('kobMusic');let seen=false;const sync=()=>{const A=window.OcherkiAudio;if(!A||!document.body.contains(ov))return;const st=A.state();if(st==='playing')seen=true;
      mb.classList.toggle('on',seen);mb.classList.toggle('playing',st==='playing'&&!A.muted());};setInterval(sync,500);
    mb.addEventListener('click',e=>{e.stopPropagation();const A=window.OcherkiAudio;if(!A)return;if(A.state()==='playing'&&!A.muted())A.stop();else A.start('manual');setTimeout(sync,200);});}
  function openBook(id){try{localStorage.setItem('ocherkiActiveBook',id);}catch(_){}window.OCHERKI_PRELOAD_SHELL?.();
    const st=$('lbStart'),entry=$('constructorEntry');st?.classList.add('is-leaving-for-entry');
    leave(()=>{entry?.classList.add('is-visible');entry?.setAttribute('aria-hidden','false');if(st)st.style.visibility='hidden';});}
  // the end: he writes the book's title with his pen, gathers into a spark, and the constructor comes up
  function finish(){const title=ov.querySelector('[data-into="bookTitleInput"]').value.trim()||'Очерки жизни';
    ov.querySelectorAll('.st').forEach(x=>x.classList.remove('on'));ov.classList.remove('steps');
    if(K){K.lookAt(null);K.mood?.('joy');K.write('С этой строки начинается книга!',{at:[0,.1],px:Math.round(Math.min(72,((ov.clientWidth||innerWidth)-60)/(.6*30))),hold:true,fly:[-.94,-.92],flyHold:2.4});later(()=>leave(start),(5.95/2.3)*1000+2400+1100);}else leave(start);}
  const start=()=>{const b=$('startConstructorBtn');if(b){b.disabled=false;b.click();}};
  function leave(then){if(K&&K.mode!=='away'){if(K.flyAway)K.flyAway(-.94,-.92);else{K.awayTo(-.94,-.92);K.setMode('away');}}
    later(()=>{const ls=$('lbStart');if(ls)ls.style.visibility='hidden';then&&then();ov.classList.add('gone');later(()=>{K&&K.stop();T?.destroy();ov.remove();
      // the old start key underneath never shows on the way into the constructor (it used to drop in for a moment)
      const st=$('lbStart');if(st)st.style.visibility='hidden';off();},1500);},K?900:0);}
  // the stage comes up softly; returning people go straight to their books
  requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.add('in')));
  const back=known();
  if(back){const h=ov.querySelector('.st[data-s="books"] h2');if(h)h.textContent='С возвращением!';}
  const boot=k=>{K=k;if(K){ov.classList.add('pen');K.start();K.resize();K.placeSpark(K.halfW()*.6,K.halfW()*.3);}
    if(back){later(()=>toBooks(),K?500:200);}else{later(()=>K&&K.moveTo(0,.34,1),300);cur='tour';tour(false);}};
  window.OCHERKI_KOB={get K(){return K;},go};
  if(!window.OcherkiTour){off();ov.remove();return;}
  OcherkiTour.loadKeeper().then(()=>boot(window.OcherkiKeeper3D?OcherkiKeeper3D.create(cv,{size:.3,dust:24,quick:2.6,writeSpeed:2.3,wordsScale:1.6}):null)).catch(()=>boot(null));
})();
