/*@block [" id=\"sheet-light-v160\"", ""]*/
// v160 — the sheet is laid paper; «Лампа» (default) or «Машинка», remembered
(()=>{const sh=document.getElementById('activeSheet');if(!sh||!window.OcherkiSheetLight)return;
  const keys=document.createElement('div');keys.className='osl-keys';keys.id='lightKeys';
  keys.innerHTML='<button type="button" data-light="lamp" title="Ровный свет лампы"><i><svg viewBox="0 0 32 32"><path d="M9 28h12"/><path d="M15 28V17"/><path d="M15 17l-5-6"/><path d="M10 11l6-5"/><path d="M14 4.5l9 3.5-3.6 7.2z"/><path d="M20.6 13c.9 1.4.6 3-.7 3.6"/></svg></i>Лампа</button><button type="button" data-light="type" title="Свет едет за строкой, как у машинки"><i><svg viewBox="0 0 32 32"><path d="M9 13V6h14v7"/><path d="M12 9h8"/><rect x="4" y="13" width="24" height="12" rx="2"/><path d="M8 17.5h.01M11.5 17.5h.01M15 17.5h.01M18.5 17.5h.01M22 17.5h.01M24 17.5h.01"/><path d="M10 21.5h12"/></svg></i>Машинка</button>';
  document.body.appendChild(keys);
  const place=()=>{const r=sh.getBoundingClientRect();keys.style.left=(r.left-90)+'px';keys.style.top=(r.top+14)+'px';keys.style.opacity=r.width?1:0;};place();addEventListener('resize',place);setInterval(place,600);
  let m='lamp';try{m=localStorage.getItem('ocherkiSheetLight')||'lamp';}catch(_){}
  const mark=v=>keys&&keys.querySelectorAll('[data-light]').forEach(b=>b.classList.toggle('on',b.dataset.light===v));
  const L=OcherkiSheetLight.attach(sh,{editor:document.getElementById('editor'),mode:m,onMode:mark});mark(m);
  keys&&keys.addEventListener('click',e=>{const b=e.target.closest('[data-light]');if(!b)return;e.preventDefault();L.mode(b.dataset.light);document.getElementById('editor')?.focus();});
  keys&&keys.addEventListener('mousedown',e=>e.preventDefault());
  window.OCHERKI_SHEET_LIGHT=L;})();
