/*@block [" id=\"tool-plate-script\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const I=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const B=(act,tip,d,cls='')=>`<button type="button" class="${cls}" data-act="${act}" data-tip="${tip}" aria-label="${tip}">${I(d)}</button>`;
  const top=document.createElement('div');top.className='tool-top';top.setAttribute('aria-label','Инструменты листа');
  top.innerHTML=`<div class="project-key tool-plate"><i class="str" style="left:22%"></i><i class="str" style="left:78%"></i>`
   +B('photo','Добавить фото','<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>')
   +B('page','Новый лист','<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14h6"/>')
   +B('view','Посмотреть этот лист в книге','<path d="M3 5.5c3-1.4 6-1.4 9 .6 3-2 6-2 9-.6V19c-3-1.4-6-1.4-9 .6-3-2-6-2-9-.6Z"/><path d="M12 6.1v13.5"/>')
   +`<span class="sep"></span>`+B('more','Ещё','<path d="M7 10l5 5 5-5"/>','more')+`</div>`
   +`<div class="project-key tool-extra"><i class="str" style="left:22%"></i><i class="str" style="left:78%"></i>`
   +B('quote','Цитата','<path d="M5 17c2.5-1 4-3 4-6V7H5v4h4"/><path d="M14 17c2.5-1 4-3 4-6V7h-4v4h4"/>')
   +B('date','Дата','<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>')
   +B('episode','Новый эпизод','<path d="M7 3h10v18l-5-4-5 4Z"/>')
   +B('document','Архивный документ: письмо, справка, грамота','<path d="M6 3h12v18H6Z"/><path d="M9 8h6M9 12h6M9 16h4"/>')
   +`</div><span class="tool-tip"></span>`;
  shell.appendChild(top);
  const tip=top.querySelector('.tool-tip');
  const frame=()=>document.getElementById('v35SheetFrame');
  const setOpen=on=>{top.classList.toggle('is-open',on);top.querySelector('.more').dataset.tip=on?'Свернуть':'Ещё';};
  top.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;e.stopPropagation();const act=b.dataset.act;
    if(act==='more'){setOpen(!top.classList.contains('is-open'));return;}
    if(b.closest('.tool-extra'))setOpen(false);
    try{frame()?.contentWindow?.postMessage({type:'OCHERKI_SHEET_ACTION',act},'*');}catch(err){}});
  top.addEventListener('pointerover',e=>{const b=e.target.closest('button[data-act]');if(!b)return;tip.textContent=b.dataset.tip;tip.classList.toggle('is-extra',!!b.closest('.tool-extra'));
    const r=b.getBoundingClientRect(),t=top.getBoundingClientRect();tip.style.left=Math.round(r.left-t.left+r.width/2-tip.offsetWidth/2)+'px';tip.classList.add('is-on');});
  top.addEventListener('pointerout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest?.('button[data-act]'))tip.classList.remove('is-on');});
  document.addEventListener('click',e=>{if(!top.contains(e.target))setOpen(false);});
  // Which tools fit the page the author is on (no photo on the contents…).
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_SHEET_TOOLS')return;
    Object.entries(d.hidden||{}).forEach(([act,h])=>{const b=top.querySelector(`[data-act="${act}"]`);if(b)b.hidden=!!h;});});
})();
