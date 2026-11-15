/*@block [" id=\"tips-v136-js\"", ""]*/
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
