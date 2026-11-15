/*@block [" id=\"v30-hanging-tooltip-controller\"", ""]*/
(()=>{
  const tip=document.createElement('div');
  tip.className='hanging-tip';
  document.body.appendChild(tip);
  let timer=0;

  let autoHide=0;
  function place(btn,show=true){
    clearTimeout(timer);clearTimeout(autoHide);
    autoHide=setTimeout(()=>{if(!btn.matches(':hover'))tip.classList.remove('show');},2500);
    if(btn.id==='powerBtn'||btn.closest('.hanging,.bd-rail-item')?.querySelector('.oc-klab')){tip.classList.remove('show');tip.textContent='';return;}
    const r=btn.getBoundingClientRect();
    tip.textContent=btn.getAttribute('aria-label')||'';
    tip.style.left=(r.left+r.width/2)+'px';
    tip.style.top=(r.bottom+14)+'px';
    tip.style.transform='translate(-50%,6px)';
    requestAnimationFrame(()=>{
      const tr=tip.getBoundingClientRect();
      const pad=14;
      let dx=0;
      if(tr.left<pad) dx=pad-tr.left;
      else if(tr.right>innerWidth-pad) dx=(innerWidth-pad)-tr.right;
      tip.style.left=(r.left+r.width/2+dx)+'px';
      if(show) requestAnimationFrame(()=>tip.classList.add('show'));
    });
  }

  // Every hanging key, including the ones that appear later (composition
  // keys in the book, «Написать нам»), gets the same quiet caption.
  let hoverKey=null;
  document.addEventListener('mouseover',e=>{const btn=e.target.closest?.('.hanging .key[aria-label]');if(!btn||btn===hoverKey||btn.dataset.tipBound==='1')return;hoverKey=btn;place(btn,true);setTimeout(()=>place(btn,true),120);});
  document.addEventListener('mouseout',e=>{const btn=e.target.closest?.('.hanging .key[aria-label]');if(!btn||btn.dataset.tipBound==='1'||btn.contains(e.relatedTarget))return;hoverKey=null;tip.classList.remove('show');timer=setTimeout(()=>{tip.textContent=''},430);});
  document.querySelectorAll('.hanging .key[aria-label]').forEach(btn=>{btn.dataset.tipBound='1';
    btn.addEventListener('mouseenter',()=>{place(btn,true);setTimeout(()=>place(btn,true),120);});
    btn.addEventListener('mouseleave',()=>{
      tip.classList.remove('show');
      timer=setTimeout(()=>{tip.textContent=''},430);
    });
    btn.addEventListener('focus',()=>place(btn,true));
    btn.addEventListener('click',()=>{tip.classList.remove('show');});
    btn.addEventListener('blur',()=>tip.classList.remove('show'));
  });
  addEventListener('resize',()=>{
    if(tip.classList.contains('show')) tip.classList.remove('show');
  });
})();
