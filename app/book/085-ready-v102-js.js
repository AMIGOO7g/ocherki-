/*@block [" id=\"ready-v102-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  let state=null;addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_STRUCTURE_STATE'){state=d.payload;paint();}});
  const words=t=>String(t||'').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(w=>/\p{L}/u.test(w)).length;
  const own=p=>p&&!p.sample;
  const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem('ocherki_ready_'+k);localStorage.setItem('ocherki_ready_'+k,v);}catch(_){return null;}};
  function steps(){const S=state?.sections||[],out=[];
    const cover=S.find(s=>s.type==='cover'),cp=(cover?.pages||[])[0];
    out.push({t:'обложка: название и автор',ok:!!(cp&&own(cp)&&words(cp.text)>=2),go:cover&&{sectionId:cover.id},how:'Впишите на обложке название книги и автора — пункт отметится сам'});
    const ch=S.filter(s=>s.type==='chapter'&&s.included!==false&&!s.sample);
    const wc=ch.map(s=>({s,n:(s.pages||[]).filter(own).reduce((a,p)=>a+words(p.text),0)}));
    const full=wc.filter(x=>x.n>=300).length;
    {const short=wc.find(x=>x.n<300);out.push({t:`три главы по 300 слов`,e:full<3?`готово ${full} из 3`:'',ok:full>=3,go:short&&{sectionId:short.s.id},how:'Пишите главы: когда в трёх будет по 300 слов, пункт отметится сам'});}
    const photos=S.flatMap(s=>(s.pages||[]).flatMap(p=>(p.photos||[]).map(ph=>({ph,s,p}))));
    out.push({t:'портрет героя',e:'в карточке фото — «портрет героя»',ok:photos.some(x=>x.ph.portraitHero),go:photos[0]&&{sectionId:photos[0].s.id,pageUid:photos[0].p.uid||photos[0].p.id},how:'Откройте карточку фото героя и отметьте «портрет героя»'});
    const ded=S.find(s=>s.type==='dedication');out.push({t:'посвящение',ok:!!(ded&&ded.included!==false&&(ded.pages||[]).some(p=>own(p)&&words(p.text)>=2)),go:ded&&{sectionId:ded.id},how:'Напишите пару строк посвящения — кому эта книга'});
    const unc=photos.filter(x=>!String(x.ph.caption||x.ph.people||'').trim());
    out.push({t:unc.length?`подписать ${unc.length} фото`:'все фото подписаны',e:unc.length?'кто на них и какой год':'',ok:!unc.length,go:unc[0]&&{sectionId:unc[0].s.id,pageUid:unc[0].p.uid||unc[0].p.id},how:'Откройте фото на листе и напишите в карточке, кто на нём и какой год — пункт отметится сам'});
    wc.filter(x=>x.n>0&&x.n<300).slice(0,2).forEach(x=>out.push({t:`глава «${String(x.s.title||'').replace(/^Глава\s+\d+\.\s*/,'')}» — расскажите ещё`,e:`пока ${x.n} слов`,ok:false,go:{sectionId:x.s.id},how:'Допишите главу — хотя бы до 300 слов'}));
    out.push({t:'вычитать текст',e:'нажмите, когда перечитали всю книгу',ok:store('proof')==='1',proof:1});
    // v107: the book's own advice (the lamp used to show it apart) joins the same list.
    document.querySelectorAll('#bdSpreadRows .bd-book-tips li').forEach(li=>{const t=String(li.textContent||'').trim();if(t)out.push({t,ok:false,tip:1});});
    return out;}
  const line=document.createElement('div');line.className='rd-line';line.innerHTML='<b></b><span class="rd-tip">что осталось до книги</span>';
  const veil=document.createElement('div');veil.className='rd-veil';const box=document.createElement('div');box.className='rd-box';
  document.querySelector('.mode-switch')?document.body.append(line,veil,box):document.body.append(line,veil,box);
  // v108: the panel stands still in the middle of the screen (it no longer follows the swinging lamp).
  const place=()=>{};
  const lamp=()=>document.querySelector('.bd-rail-key[data-rail="tips"]');
  let lastLeft=-1;
  function dressLamp(st){const k=lamp();if(!k)return;const done=st.filter(x=>x.ok).length,left=st.length-done;
    let ring=k.querySelector('.rd-ring');if(!ring){ring=document.createElementNS('http://www.w3.org/2000/svg','svg');ring.setAttribute('class','rd-ring');ring.setAttribute('viewBox','0 0 60 60');ring.innerHTML='<circle class="bg" cx="30" cy="30" r="27"/><circle class="fg" cx="30" cy="30" r="27" pathLength="100"/>';k.appendChild(ring);
      k.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();box.classList.contains('on')?close():open();},true);}
    ring.querySelector('.fg').style.strokeDasharray=`${Math.round(100*done/Math.max(1,st.length))} 100`;
    k.classList.toggle('rd-glow',left>0);k.setAttribute('aria-label',left?`До книги — ${left}`:'Книга готова');
    let badge=k.querySelector('.bd-rail-badge');if(!left){badge?.remove();}else{if(!badge){badge=document.createElement('span');badge.className='bd-rail-badge';k.appendChild(badge);}badge.textContent=String(left);}
    lastLeft=left;}
  window.__ocherkiReadyLeft=()=>lastLeft;
  function paint(){const st=steps(),done=st.filter(x=>x.ok).length;line.querySelector('b').style.width=Math.round(100*done/st.length)+'%';dressLamp(st);
    if(!box.classList.contains('on'))return;const left=st.length-done,ru=n=>n===1?'шаг':n<5?'шага':'шагов';
    const hint=x=>x.e&&!x.ok?x.e:(x.how&&!x.ok?x.how:'');
    const li=(x,i)=>`<li class="${x.ok?'ok':''} ${x.tip?'is-tip':''}" ${x.go||x.proof||x.tip?`data-i="${i}" data-go="1"`:''}><i class="mk"></i><div><span>${x.t}</span>${hint(x)?`<em>${hint(x)}</em>`:''}</div></li>`;
    const todo=st.map((x,i)=>[x,i]).filter(([x])=>!x.ok),have=st.map((x,i)=>[x,i]).filter(([x])=>x.ok);
    const frac=Math.round(100*done/Math.max(1,st.length));
    // v127: no panel — the room darkens and blurs, and the steps lie on it as one list with dots.
    const next=st.findIndex(x=>!x.ok);
    const li2=(x,i)=>`<li class="${x.ok?'ok':''} ${i===next?'is-next':''} ${x.tip?'is-tip':''}" ${x.go||x.proof||x.tip?`data-i="${i}" data-go="1"`:''}><i class="dot"></i><div><span>${x.t}</span>${hint(x)?`<em>${hint(x)}</em>`:''}</div></li>`;
    const html=`<span class="rd3-x" data-close="1" aria-label="Закрыть">×</span>
      <div class="rd3-k">до книги</div><h4>${left?`Осталось ${left} ${ru(left)}`:'Книга готова'}</h4><div class="rd3-s">${done} из ${st.length} уже готово</div>
      <ul class="rd3-list">${st.map((x,i)=>li2(x,i)).join('')}</ul>
      <div class="rd3-foot"><span class="oc-btn go ${left?'':'ready is-main'}">Заказать печать</span></div>`;
    // v142: rebuilt only when something changed — the list no longer re-cascades every few seconds
    if(box._html!==html){box._html=html;box.innerHTML=html;}
    box._st=st;}
  const open=()=>{box._html='';box.classList.add('on');veil.classList.add('on');paint();place();};
  setInterval(()=>{if(!document.hidden)paint();},4000);
  const close=()=>{box.classList.remove('on');veil.classList.remove('on');};
  line.addEventListener('click',open);veil.addEventListener('click',close);addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('on'))close();});
  box.addEventListener('click',e=>{if(e.target.closest('[data-close]')){close();return;}const li=e.target.closest('li[data-go]');if(li){const x=box._st?.[+li.dataset.i];if(!x)return;
      if(x.proof){const on=store('proof')!=='1';store('proof',on?'1':'0');paint();window.OCHERKI_SAY?.(on?'Отмечено: текст вычитан. Нажмите ещё раз, чтобы снять отметку':'Отметка снята');return;}
      if(x.tip){close();try{window.OCHERKI_SAY?.(x.t);}catch(_){}return;}
      close();if(window.OCHERKI_MANUSCRIPT?.isOpen?.())window.OCHERKI_SET_MODE?.('write');
      try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'select',...x.go},'*');}catch(_){}
      if(x.how)setTimeout(()=>window.OCHERKI_SAY?.(x.how),500);return;}
    if(e.target.closest('.go.ready'))try{window.OCHERKI_SHOW_TOAST?.('Заказ печати откроется после подключения сервера');}catch(_){}});
  // The line follows the title smoothly frame by frame (no late jumps when the keys move).

  // Once, the first time it appears: it glows and says what it is.
  try{if(!localStorage.getItem('ocherki_ready_hinted')){setTimeout(()=>{line.classList.add('hint');localStorage.setItem('ocherki_ready_hinted','1');setTimeout(()=>line.classList.remove('hint'),6000);},4000);}}catch(_){}
  window.OCHERKI_READY={open,close};
})();
