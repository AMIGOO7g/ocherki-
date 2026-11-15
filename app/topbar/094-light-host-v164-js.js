/*@block [" id=\"light-host-v164-js\"", ""]*/
(()=>{const fr=document.getElementById('v35SheetFrame');let keys=[];const sh=document.querySelector('.shell');
  addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='OCHERKI_LIGHT'||!fr)return;sh?.classList.toggle('osl-typing',!!d.on);
    if(!keys.length)keys=[...document.querySelectorAll('.oct button.k,.oct button.pl')];
    const r=fr.getBoundingClientRect(),x=r.left+d.x,y=r.top+d.y;
    keys.forEach(k=>{const b=k.getBoundingClientRect();if(!b.width)return;const dd=Math.hypot(b.left+b.width/2-x,b.top+b.height/2-y),g=d.on?Math.max(0,1-dd/760):0;
      k.style.filter=g>.02?`brightness(${(1+g*.35).toFixed(2)}) drop-shadow(0 0 ${(4+g*12).toFixed(0)}px rgba(255,190,120,${(g*.6).toFixed(2)}))`:'';});});})();
