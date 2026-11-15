/*@block [" id=\"write-add-v141-js\"", ""]*/
// v141 — «добавить» is the third key over the sheet, made like «показать в книге» and «До книги» and hung at the same height;
// its choices open to the right, along the top edge, never over the white page
(()=>{const shell=document.querySelector('.shell');if(!shell)return;const T=()=>window.OCHERKI_TOPBAR;
  const S='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',E='</svg>';
  const IC={add:'<path d="M12 5v14M5 12h14"/>',photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    episode:'<path d="M7 3h10v18l-5-4-5 4z"/>',document:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',quote:'<path d="M5 17c2.5-1 4-3 4-6V7H5v4h3M13 17c2.5-1 4-3 4-6V7h-4v4h3"/>',
    date:'<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>'};
  const L=[['photo','фото'],['episode','эпизод'],['document','документ'],['quote','цитата'],['date','дата'],['page','лист']];
  const box=document.createElement('div');box.className='oc-add2';
  box.innerHTML=`<div class="it main"><button type="button" class="key" data-a="add" aria-label="Добавить"><i class="oc-thr"></i><span class="cap">${S}${IC.add}${E}</span></button><span class="lab">добавить</span></div><div class="row"></div>`;
  shell.appendChild(box);
  const row=box.querySelector('.row');let hidden={};
  const draw=()=>{row.innerHTML=L.filter(m=>!hidden[m[0]]).map((m,i)=>`<div class="it sm" style="--i:${i}"><button type="button" class="key" data-a="${m[0]}" aria-label="${m[1]}"><span class="cap">${S}${IC[m[0]]}${E}</span></button><span class="lab">${m[1]}</span></div>`).join('');};
  draw();
  const key=box.querySelector('[data-a="add"]');const hang=()=>{const a=T()?.attach;if(!a){setTimeout(hang,500);return;}key.style.transformOrigin='50% calc(-1 * var(--oc-ky,30px))';a(key);};hang();
  let closeT=0;const open=on=>{clearTimeout(closeT);if(on&&!box.classList.contains('open')){draw();void row.offsetWidth;document.dispatchEvent(new CustomEvent('oc-cascade',{detail:box}));}box.classList.toggle('open',on);};
  document.addEventListener('oc-cascade',e=>{if(e.detail!==box&&box.classList.contains('open')){clearTimeout(closeT);box.classList.remove('open');}});
  box.addEventListener('pointerenter',()=>open(true));
  box.addEventListener('pointerleave',()=>{clearTimeout(closeT);closeT=setTimeout(()=>open(false),700);});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();const a=b.dataset.a;
    if(a==='add'){open(!box.classList.contains('open'));return;}
    open(false);try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_SHEET_ACTION',act:a},'*');}catch(_){}});
  document.addEventListener('click',e=>{if(!box.contains(e.target))open(false);});
  addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_SHEET_TOOLS'&&d.hidden){const k=JSON.stringify(d.hidden);if(k===box._hk)return;box._hk=k;hidden=d.hidden;if(!box.classList.contains('open'))draw();}});/* v143: the editor sends this on every key; redraw only on a real change */
})();
