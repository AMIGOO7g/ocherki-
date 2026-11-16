// common — scripts in one place (v176), each in its own scope as before.

// ——— 132-contact-letter-script
(()=>{const btn=document.getElementById('contactBtn');if(!btn)return;
  const ADDRESS='I@evstafiadin.ru';
  const veil=document.createElement('div');veil.className='ct-veil';
  const card=document.createElement('div');card.className='ct-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Написать нам');
  const today=new Date().toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit'});
  card.innerHTML=`<button type="button" class="ct-x" aria-label="Закрыть">×</button>
    <img class="ct-stamp" src="assets/postcard/stamp-evstafiadi.webp" alt="Мастерская дизайна Евстафиади">
    <div class="ct-head">ПОЧТОВАЯ КАРТОЧКА</div>
    <div class="ct-sub">Напишите нам — мы читаем каждое письмо и отвечаем лично</div>
    <div class="ct-body"><div class="ct-col"><h4>Письмо</h4><textarea class="ct-letter-text" placeholder="Здравствуйте! Хочу спросить…"></textarea></div><i class="ct-rule"></i>
      <div class="ct-col ct-addr"><h4>Адрес для ответа</h4>
        <label><span>От кого</span><input class="ct-name" autocomplete="name" placeholder="Имя"></label>
        <label><span>Почта</span><input class="ct-mail" type="email" autocomplete="email" placeholder="name@mail.ru"></label>
        <label><span>Телефон</span><input class="ct-phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00"></label></div></div>
    <div class="ct-foot"><small>или напрямую: <a href="mailto:${ADDRESS}">${ADDRESS}</a></small><button type="button" class="ct-send">Отправить письмо</button><span class="ct-sent-note">Письмо в пути. Ответим в течение дня — письмом.</span></div>
    <div class="ct-postmark"><span>МАСТЕРСКАЯ ДИЗАЙНА<b>${today}</b>ЕВСТАФИАДИ</span></div>`;
  document.body.append(veil,card);
  const show=on=>{veil.classList.toggle('on',on);card.classList.toggle('on',on);if(on){card.classList.remove('is-sent');setTimeout(()=>card.querySelector('.ct-letter-text')?.focus(),400);}};
  btn.addEventListener('click',e=>{e.stopPropagation();show(true);});
  veil.addEventListener('click',()=>show(false));
  card.querySelector('.ct-x').onclick=()=>show(false);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&card.classList.contains('on'))show(false);});
  card.querySelector('.ct-send').onclick=()=>{const text=card.querySelector('.ct-letter-text').value.trim();if(!text){card.querySelector('.ct-letter-text').focus();return;}
    const name=card.querySelector('.ct-name').value.trim(),mail=card.querySelector('.ct-mail').value.trim(),phone=card.querySelector('.ct-phone').value.trim();
    const body=`${text}\n\n— ${name||'Автор книги'}${mail?`\n${mail}`:''}${phone?`\n${phone}`:''}`;
    card.classList.add('is-sent');
    setTimeout(()=>{location.href=`mailto:${ADDRESS}?subject=${encodeURIComponent('Очерки жизни — письмо')}&body=${encodeURIComponent(body)}`;},700);};
})();


// ——— 153-large-ui-key
// «Крупный интерфейс» belongs to the whole constructor: a hanging key here.
(()=>{const key=document.getElementById('largeUiKey'),shell=document.querySelector('.shell');if(!key||!shell)return;
  const sync=()=>key.classList.toggle('is-active',shell.classList.contains('is-large-ui'));
  key.addEventListener('click',e=>{e.stopPropagation();const on=!shell.classList.contains('is-large-ui');
    try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_LARGE_UI_SET',on},'*');}catch(err){}
    shell.classList.toggle('is-large-ui',on);document.body.classList.toggle('is-large-ui',on);try{localStorage.setItem('ocherkiLargeUI',on?'1':'0');}catch(err){}sync();requestAnimationFrame(()=>dispatchEvent(new Event('resize')));});
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});sync();
})();


// ——— 156-title-two-threads-js
(()=>{const h=document.querySelector('.project-top .project-hanger'),k=document.getElementById('projectBtn');if(!h||!k)return;
  const a=document.createElement('i'),b=document.createElement('i');a.className=b.className='title-thread';h.prepend(a,b);
  const place=()=>{const w=k.offsetWidth;a.style.left=Math.round(w*.2)+'px';b.style.left=Math.round(w*.8)+'px';};place();setTimeout(place,1500);addEventListener('resize',place);})();


// ——— 161-block
(()=>{const m=document.getElementById('bookPreviewModal');if(!m)return;const c=document.createElement('div');c.className='preview-catcher';m.prepend(c);})();


// ——— 164-prompt-settle
// The question appears once everything around the sheet has settled, in its
// own place — it no longer travels while the constructor comes up.
(()=>{const shell=document.querySelector('.shell');if(!shell)return;let t=0;
  const hold=()=>{shell.classList.add('prompt-wait');clearTimeout(t);t=setTimeout(()=>{dispatchEvent(new Event('resize'));setTimeout(()=>shell.classList.remove('prompt-wait'),120);},1600);};
  let wasBoot=shell.classList.contains('ui-boot');
  new MutationObserver(()=>{const boot=shell.classList.contains('ui-boot');if(wasBoot&&!boot)hold();if(!wasBoot&&boot)shell.classList.add('prompt-wait');wasBoot=boot;}).observe(shell,{attributes:true,attributeFilter:['class']});
  if(wasBoot)shell.classList.add('prompt-wait');})();


// ——— 194-tips-v136-js
(()=>{const tip=document.createElement('div');tip.className='oc-tip';document.body.appendChild(tip);let cur=null,t=0;
  const text=el=>el.getAttribute('data-oc-tip')||'';
  const hide=()=>{clearTimeout(t);cur=null;tip.classList.remove('on');};
  document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;
    // a native title becomes ours, so the browser's grey box never shows
    const el=e.target.closest?.('[title],[data-oc-tip]');if(!el||el===cur||el.tagName==='IFRAME')return;
    if(el.hasAttribute('title')){const v=el.getAttribute('title');el.removeAttribute('title');if(v)el.setAttribute('data-oc-tip',v);}
    const v=text(el);if(!v){hide();return;}
    cur=el;clearTimeout(t);t=setTimeout(()=>{if(cur!==el||!el.isConnected)return;tip.textContent=v;const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
      let x=r.left+r.width/2-w/2,y=r.bottom+10;if(y+h>innerHeight-8)y=r.top-h-10;x=Math.max(8,Math.min(innerWidth-w-8,x));
      tip.style.left=Math.round(x)+'px';tip.style.top=Math.round(y)+'px';tip.classList.add('on');},450);},true);
  document.addEventListener('pointerout',e=>{if(cur&&!cur.contains(e.relatedTarget))hide();},true);
  addEventListener('pointerdown',hide,true);addEventListener('wheel',hide,{passive:true,capture:true});
})();
