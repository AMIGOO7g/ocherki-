/*@block [" id=\"ms-done-v162-js\"", ""]*/
// a sheet can be marked «готово»: a golden ribbon lies on it, and it is remembered
(()=>{const K='ocherkiSheetsDone';const get=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}');}catch(_){return{};}};
  const keyOf=sh=>{const p=sh.querySelector('.ms-paper');return p?((p.querySelector('.ch')?.textContent||'')+'|'+(p.querySelector('.ep')?.textContent||'')).trim():'';};
  const mark=()=>{const m=get();document.querySelectorAll('.ms-sheet:not(.is-ghost):not(.is-new)').forEach(sh=>{const k=keyOf(sh);if(!k||k==='|')return;sh.classList.toggle('is-done',!!m[k]);
    if(!sh.querySelector('.ms-done-key')){const b=document.createElement('button');b.type='button';b.className='ms-done-key';sh.querySelector('.ms-float')?.appendChild(b);}
    const b=sh.querySelector('.ms-done-key');if(b)b.textContent=m[k]?'✓ готово':'отметить готовым';});};
  document.addEventListener('click',e=>{const b=e.target.closest('.ms-done-key');if(!b)return;e.preventDefault();e.stopPropagation();const sh=b.closest('.ms-sheet'),k=keyOf(sh),m=get();if(m[k])delete m[k];else m[k]=1;try{localStorage.setItem(K,JSON.stringify(m));}catch(_){}sh.classList.add('ms-anim');void sh.offsetWidth;mark();clearTimeout(sh._ma);sh._ma=setTimeout(()=>sh.classList.remove('ms-anim'),1300);},true);
  new MutationObserver(()=>{clearTimeout(mark.t);mark.t=setTimeout(mark,200);}).observe(document.body,{childList:true,subtree:true});})();
