// The entry: before the desk, the desk itself in the dark, and a brass padlock hanging on a ring from a small bracket at the top. Under
// it a dark plate: the e-mail, «Получить код», then the six figures of the code from the letter and «Открыть». With the right code
// the shackle clicks open, the lock goes up and away, the dark lifts — the desk is there under it. A wrong code: the lock gives a
// short jerk, and a quiet line says so.
// Once in (or «без входа»), the lock is not shown again on this computer. It is not shown under automated tests (navigator.webdriver)
// unless asked for with ?lock=1; ?kob=1 keeps the old start page.
// The sign-in is the server's (server/server.js): /api/me, /api/auth/request, /api/auth/verify.
(()=>{const H=document.documentElement,Q=location.search;
  if(/[?&]kob=1/.test(Q))return;
  const forced=/[?&]lock=1/.test(Q);
  const mem=k=>{try{return localStorage.getItem(k);}catch(_){return null;}};
  const keep=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  if(!forced&&(navigator.webdriver||mem('ocherki_lock_open')==='1'))return;
  const night=(mem('ocherkiLight')||'')==='night'||(!mem('ocherkiLight')&&(new Date().getHours()>=20||new Date().getHours()<7));
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const el=document.createElement('div');el.id='ocLock';el.className='ol'+(night?' ol-night':'');el.setAttribute('role','dialog');el.setAttribute('aria-label','Вход в мастерскую');
  el.innerHTML=`<div class="ol-room"></div><div class="ol-dark"></div><div class="ol-glow"></div>
<div class="ol-hang"><svg class="ol-svg" viewBox="0 0 300 470" aria-hidden="true">
<defs>
  <linearGradient id="olRod" x1="0" x2="1"><stop offset="0" stop-color="#4a3020"/><stop offset=".3" stop-color="#b8875a"/><stop offset=".48" stop-color="#f6e4c2"/><stop offset=".62" stop-color="#c6955f"/><stop offset="1" stop-color="#3e2818"/></linearGradient>
  <linearGradient id="olLegL" gradientUnits="userSpaceOnUse" x1="94" x2="116"><stop offset="0" stop-color="#3e2818"/><stop offset=".35" stop-color="#d9ab76"/><stop offset=".5" stop-color="#f8e8c8"/><stop offset=".75" stop-color="#a87547"/><stop offset="1" stop-color="#3a2414"/></linearGradient>
  <linearGradient id="olLegR" gradientUnits="userSpaceOnUse" x1="184" x2="206"><stop offset="0" stop-color="#3e2818"/><stop offset=".35" stop-color="#d9ab76"/><stop offset=".5" stop-color="#f8e8c8"/><stop offset=".75" stop-color="#a87547"/><stop offset="1" stop-color="#3a2414"/></linearGradient>
  <radialGradient id="olArc" gradientUnits="userSpaceOnUse" cx="150" cy="150" r="57"><stop offset=".58" stop-color="#3a2414"/><stop offset=".7" stop-color="#c6955f"/><stop offset=".79" stop-color="#f8e8c8"/><stop offset=".9" stop-color="#a87547"/><stop offset="1" stop-color="#3a2414"/></radialGradient>
  <linearGradient id="olRing" x1="0" x2="1"><stop offset="0" stop-color="#3e2818"/><stop offset=".45" stop-color="#e9c48e"/><stop offset=".6" stop-color="#f8e8c8"/><stop offset="1" stop-color="#4a3020"/></linearGradient>
  <radialGradient id="olBody" cx=".32" cy=".22" r=".95"><stop offset="0" stop-color="#fbe8c6"/><stop offset=".22" stop-color="#e2b47c"/><stop offset=".55" stop-color="#b07c4a"/><stop offset=".85" stop-color="#6f4a2a"/><stop offset="1" stop-color="#4a301c"/></radialGradient>
  <linearGradient id="olBevel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2d8" stop-opacity=".95"/><stop offset=".5" stop-color="#c9955c" stop-opacity=".2"/><stop offset="1" stop-color="#2a1a0e" stop-opacity=".8"/></linearGradient>
  <radialGradient id="olEsc" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f3dcb2"/><stop offset=".5" stop-color="#b88651"/><stop offset="1" stop-color="#5e3f26"/></radialGradient>
  <radialGradient id="olRivet" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff0d0"/><stop offset=".45" stop-color="#c39058"/><stop offset="1" stop-color="#4e331e"/></radialGradient>
  <filter id="olSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="olDrop" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="6" dy="14" stdDeviation="9" flood-color="#000" flood-opacity=".55"/></filter>
</defs>
<g class="ol-mount"><rect x="122" y="-4" width="56" height="34" rx="6" fill="url(#olBody)" stroke="#3a2412" stroke-opacity=".4"/><circle cx="134" cy="14" r="3.5" fill="url(#olRivet)"/><circle cx="166" cy="14" r="3.5" fill="url(#olRivet)"/>
  <rect x="145" y="26" width="10" height="44" rx="4" fill="url(#olRod)"/></g>
<g class="ol-swing">
  <ellipse class="ol-cast" cx="162" cy="452" rx="96" ry="12" fill="#000" opacity=".45" filter="url(#olSoft)"/>
  <path d="M150 70 a11 30 0 0 1 0 60" fill="none" stroke="url(#olRing)" stroke-width="9"/>
  <g class="ol-lock" filter="url(#olDrop)">
    <g class="ol-shackle"><path d="M105 270 V150" stroke="url(#olLegL)" stroke-width="22"/><path d="M195 270 V150" stroke="url(#olLegR)" stroke-width="22"/>
      <path d="M105 151 a45 45 0 0 1 90 0" fill="none" stroke="url(#olArc)" stroke-width="22"/></g>
    <rect x="60" y="252" width="180" height="168" rx="30" fill="url(#olBody)"/>
    <rect x="60" y="252" width="180" height="168" rx="30" fill="none" stroke="url(#olBevel)" stroke-width="5"/>
    <rect x="74" y="266" width="152" height="140" rx="22" fill="none" stroke="#3a2412" stroke-opacity=".35" stroke-width="1.5"/>
    <rect x="75" y="267" width="150" height="138" rx="21" fill="none" stroke="#fff3da" stroke-opacity=".35" stroke-width="1"/>
    <rect x="88" y="252" width="34" height="10" rx="5" fill="#2a180a" opacity=".35"/><rect x="178" y="252" width="34" height="10" rx="5" fill="#2a180a" opacity=".35"/>
    <path d="M150 300 c20 0 30 14 30 30 c0 22 -18 40 -30 52 c-12 -12 -30 -30 -30 -52 c0 -16 10 -30 30 -30z" fill="url(#olEsc)" stroke="#4a2e16" stroke-opacity=".5"/>
    <circle cx="150" cy="328" r="8" fill="#1a0f07"/><path d="M146 332 h8 l3 22 h-14z" fill="#1a0f07"/>
    <circle cx="86" cy="280" r="5" fill="url(#olRivet)"/><circle cx="214" cy="280" r="5" fill="url(#olRivet)"/><circle cx="86" cy="392" r="5" fill="url(#olRivet)"/><circle cx="214" cy="392" r="5" fill="url(#olRivet)"/>
    <ellipse cx="112" cy="282" rx="40" ry="12" fill="#fff8e8" opacity=".28" transform="rotate(-12 112 282)"/>
  </g>
  <path d="M150 130 a11 30 0 0 1 0 -60" fill="none" stroke="url(#olRing)" stroke-width="9" filter="url(#olDrop)"/>
</g></svg></div>
<form class="ol-plate" novalidate>
  <h1>Очерки жизни</h1><p class="ol-kick">вход в мастерскую</p>
  <p class="ol-lead">Введите почту — мы пришлём код. Пароль не нужен.</p>
  <input class="ol-f ol-email" type="email" autocomplete="email" placeholder="почта" aria-label="Почта">
  <input class="ol-f ol-code" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="код из письма" aria-label="Код из письма" hidden>
  <label class="ol-consent"><input type="checkbox"> <span>согласен на обработку данных по <a href="privacy.html" target="_blank" rel="noopener">политике</a></span></label>
  <button class="ol-go" type="submit">Получить код</button>
  <div class="ol-say" aria-live="polite"></div>
  <div class="ol-more"><button type="button" class="ol-again" hidden disabled>прислать ещё раз</button><button type="button" class="ol-other" hidden>другая почта</button><button type="button" class="ol-guest">без входа</button></div>
</form>`;
  const put=()=>{document.body.appendChild(el);H.classList.add('ol-on');requestAnimationFrame(()=>el.classList.add('ol-in'));};
  if(document.body)put();else document.addEventListener('DOMContentLoaded',put);

  const $=s=>el.querySelector(s),form=$('.ol-plate'),email=$('.ol-email'),code=$('.ol-code'),go=$('.ol-go'),say=$('.ol-say'),lead=$('.ol-lead'),consent=$('.ol-consent'),
    again=$('.ol-again'),other=$('.ol-other'),guest=$('.ol-guest'),lock=$('.ol-lock');
  email.value=mem('ocherki_auth_email')||'';
  // signed in already (the server knows this computer): the lock opens by itself
  fetch('/api/me',{credentials:'same-origin'}).then(r=>{if(r.ok)setTimeout(open,700);}).catch(()=>{});
  const call=async(path,body)=>{try{const r=await fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Ocherki':'1'},body:JSON.stringify(body)});let d={};try{d=await r.json();}catch(_){}return{ok:r.ok,status:r.status,d};}catch(_){return{ok:false,status:0,d:{}};}};
  let sentTo='',timer=0;
  const countdown=s=>{clearInterval(timer);let left=Math.max(1,+s||60);const t=()=>{if(left<=0){clearInterval(timer);again.disabled=false;again.textContent='прислать ещё раз';return;}again.disabled=true;again.textContent=`ещё раз через 0:${String(left).padStart(2,'0')}`;left--;};t();timer=setInterval(t,1000);};
  const ask=async to=>{say.textContent='отправляем код…';const r=await call('/api/auth/request',{email:to});
    if([0,404,405,501].includes(r.status)){say.textContent='вход сейчас недоступен — можно продолжить без входа, книга сохранится на этом компьютере';return false;}
    if(r.d.retryIn)countdown(r.d.retryIn);if(!r.ok){say.textContent=r.d.error||'не удалось отправить код';return false;}say.textContent='';return true;};
  const toEmail=()=>{sentTo='';clearInterval(timer);code.hidden=true;again.hidden=true;other.hidden=true;consent.hidden=false;email.readOnly=false;code.value='';go.textContent='Получить код';
    lead.textContent='Введите почту — мы пришлём код. Пароль не нужен.';say.textContent='';email.focus();};
  const jerk=()=>{lock.classList.remove('ol-jerk');void lock.getBBox();lock.classList.add('ol-jerk');};
  form.addEventListener('submit',async e=>{e.preventDefault();
    if(!sentTo){const to=email.value.trim();if(!to){say.textContent='введите почту';return;}if(!consent.querySelector('input').checked){say.textContent='отметьте согласие';return;}
      if(!await ask(to))return;sentTo=to;code.hidden=false;again.hidden=false;other.hidden=false;consent.hidden=true;email.readOnly=true;go.textContent='Открыть';
      lead.innerHTML=`Код отправлен на ${esc(to)}. Он действует 10 минут.`;setTimeout(()=>code.focus(),40);return;}
    const c=code.value.replace(/\D/g,'');if(c.length!==6){say.textContent='в коде шесть цифр';jerk();return;}
    say.textContent='проверяем…';const r=await call('/api/auth/verify',{email:sentTo,code:c});
    if(!r.ok){say.textContent=(r.d.error||'код не подошёл').replace(/\.$/,'').toLowerCase();jerk();return;}
    keep('ocherki_auth_email',sentTo);say.textContent='';open();});
  again.addEventListener('click',async()=>{if(sentTo&&await ask(sentTo)){say.textContent='новый код отправлен';code.focus();}});
  other.addEventListener('click',toEmail);
  guest.addEventListener('click',()=>open());
  // the lock opens: the shackle clicks up, the lock goes up and away, the plate sinks, the dark lifts — the desk is there
  function open(){if(el.classList.contains('ol-open'))return;keep('ocherki_lock_open','1');el.classList.add('ol-click');
    setTimeout(()=>el.classList.add('ol-open'),420);setTimeout(()=>{el.remove();H.classList.remove('ol-on');},2200);}
  window.OCHERKI_LOCK={open,shown:()=>document.body.contains(el)};
})();
