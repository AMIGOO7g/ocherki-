/*@block [" id=\"archive-v105-js\"", ""]*/
(()=>{
  window.OCHERKI_SAY=(text,action,fn)=>{let el=document.getElementById('ocSay');
    if(!el){el=document.createElement('div');el.id='ocSay';el.className='oc-say';document.body.appendChild(el);}
    el.innerHTML='';const t=document.createElement('span');t.textContent=text;el.appendChild(t);
    if(action){const b=document.createElement('b');b.textContent=action;b.addEventListener('click',()=>{el.classList.remove('on');try{fn?.();}catch(_){}});el.appendChild(b);}
    el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),action?5200:3200);};
  // Back to the start screen: a press on the book's title or on the signature.
  const home=e=>{const sh=document.querySelector('.shell');if(!sh||sh.classList.contains('is-start-screen'))return;e.preventDefault();e.stopPropagation();
    const F=window.OCHERKI_FAMILY;if(!F)return;F.closeRoom?.();
    const go=()=>F.showStart?.();
    if(sh.classList.contains('is-book-preview')||sh.classList.contains('is-manuscript')){window.OCHERKI_SET_MODE?.('write');setTimeout(go,700);}else go();};
  document.getElementById('projectBtn')?.addEventListener('click',home);
  document.querySelector('.brand-line')?.addEventListener('click',home);
})();
