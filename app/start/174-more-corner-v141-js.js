/*@block [" id=\"more-corner-v141-js\"", ""]*/
// v141 — «Ещё» (light, large type, the tour, write to us) hangs in the corner beside the music: it belongs to the whole constructor, not to the archive
(()=>{const shell=document.querySelector('.shell');if(!shell)return;const T=()=>window.OCHERKI_TOPBAR;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={more:'<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',tour:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    mail:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/>',big:'<path d="M4 18l4.5-12L13 18M6 14h5M15 18l2.5-7 2.5 7M15.8 16h3.4"/>'};
  const box=document.createElement('div');box.className='oc-mus oc-more2 oct';
  const th=(x,y1,y2)=>`<i class="th" style="left:${x}px;top:${y1}px;height:${y2-y1}px"></i>`;
  const kb=(id,ic)=>`<button type="button" class="k" data-a="${id}" style="--s:44px"><i class="gl"></i><i class="nf"></i><span class="c">${S}${IC[ic]}${E}</span></button>`;
  const draw=()=>{const night=shell.classList.contains('is-night'),big=shell.classList.contains('is-large-ui');
    const L=[['light',night?'sun':'moon',night?'Дневной свет':'Ночной свет'],['big','big',big?'Обычный интерфейс':'Крупный интерфейс'],['tour','tour','Знакомство с Хранителем'],['mail','mail','Написать нам']];
    box.innerHTML=`<div class="sw hg" style="left:0;top:0;width:44px;height:84px">${th(22,0,40)}${kb('more','more')}</div><span class="lbx" style="left:22px;top:91px">Ещё</span>`
      +L.map((m,i)=>`<div class="mm" style="transition-delay:${i*60}ms"><div class="sw hg" style="left:0;top:${110+i*58-14}px;width:44px;height:58px">${th(22,0,14)}${kb(m[0],m[1])}</div><span class="ml" style="top:${110+i*58+22}px">${m[2]}</span></div>`).join('');
    box.querySelectorAll('.sw').forEach(x=>T()?.attach?.(x));};
  document.body.appendChild(box);draw();
  let closeT=0;const open=on=>{clearTimeout(closeT);if(on&&!box.classList.contains('open')){draw();void box.offsetWidth;document.dispatchEvent(new CustomEvent('oc-cascade',{detail:box}));}box.classList.toggle('open',on);};
  document.addEventListener('oc-cascade',e=>{if(e.detail!==box&&box.classList.contains('open')){clearTimeout(closeT);box.classList.remove('open');}});
  box.addEventListener('pointerenter',()=>open(true));
  box.addEventListener('pointerleave',()=>{clearTimeout(closeT);closeT=setTimeout(()=>open(false),700);});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();const a=b.dataset.a;
    if(a==='more'){open(!box.classList.contains('open'));return;}open(false);
    const click=id=>document.getElementById(id)?.click();
    if(a==='light')click(shell.classList.contains('is-night')?'dayBtn':'nightBtn');else if(a==='big')click('largeUiKey');else if(a==='mail')click('contactBtn');else if(a==='tour')window.OCHERKI_KEEPER?.open?.();});
  document.addEventListener('click',e=>{if(!box.contains(e.target))open(false);});
  const sync=()=>{const on=shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen');box.classList.toggle('on',on);box.classList.toggle('is-night',shell.classList.contains('is-night')||shell.classList.contains('is-family-room'));};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});sync();
})();
