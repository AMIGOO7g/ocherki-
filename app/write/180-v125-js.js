/*@block [" id=\"v125-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  // threads that belong to the keys
  const thr=()=>{let ok=0;[document.querySelector('.wp-keys.k-closed .key'),document.querySelector('.bd-rail-key[data-rail="tips"]')].forEach(k=>{if(k){ok++;if(!k.querySelector('.oc-thr')){const t=document.createElement('i');t.className='oc-thr';k.prepend(t);}}});if(ok<2)setTimeout(thr,700);};thr();
  // the photo card on the sheet: the question steps aside, the card stays clear of the keys above
  const watch=()=>{const f=document.getElementById('v35SheetFrame');let d=null;try{d=f?.contentDocument;}catch(_){}const m=d?.getElementById('photoModal');if(!m){setTimeout(watch,900);return;}
    const sync=()=>{const open=m.classList.contains('open');shell.classList.toggle('oc-card',open);
      if(open)requestAnimationFrame(()=>{const fr=f.getBoundingClientRect(),r=m.getBoundingClientRect(),topLimit=170;const y=fr.top+r.top;if(y<topLimit){const cur=parseFloat(m.style.top)||m.offsetTop||0;m.style.top=Math.round(cur+(topLimit-y))+'px';}});};
    new MutationObserver(sync).observe(m,{attributes:true,attributeFilter:['class','style']});sync();
    f.addEventListener('load',()=>setTimeout(watch,900),{once:true});};
  watch();
  // the first opening: one turn of the second hand backwards, the years dissolving behind it
  // v141: the years come out from under the second hand. Ahead of the hand there is nothing; as it passes a place,
  // a year shows through there, brightens, and fades again as the hand moves on — one full turn, the first time only.
  let done=false,wait=0;const years=()=>{if(done||!shell.classList.contains('oc-ready')||!shell.classList.contains('oc-w'))return;
    const pv=document.querySelector('.bottom-left .clock-pivot');const pr=pv?.getBoundingClientRect();
    const mc=document.querySelector('.bottom-left .master-clock');const vis=mc&&+getComputedStyle(mc).opacity>.9;
    if(!pr||!pr.width||!vis){clearTimeout(wait);wait=setTimeout(years,400);return;}done=true;
    const KS=+(mc.dataset.k||1),R=142*KS,N=12,Y0=new Date().getFullYear(),STEP=Math.max(1,Math.round((Y0-1950)/N));
    const box=document.createElement('div');box.className='oc-years';shell.after(box);
    /* v143: the pivot is measured once (and on resize), never in every frame: a measurement per frame forced a full layout of the page 60 times a second */
    let placed=0;const place=(force)=>{const now=performance.now();if(!force&&now-placed<1000)return;placed=now;const r=pv.getBoundingClientRect();box.style.left=(r.left+r.width/2)+'px';box.style.top=(r.top+r.height/2)+'px';};place(true);addEventListener('resize',()=>place(true));
    const handDeg=()=>{const d=new Date();const sec=d.getSeconds()+d.getMilliseconds()/1000;return -90-sec*6;};   // the real second hand, counter-clockwise
    const start=handDeg();
    // twelve places on the dial, from where the hand is now, in the direction it moves
    const marks=[...Array(N)].map((_,k)=>{const i=document.createElement('i');i.textContent=Y0-k*STEP;i.style.animation='none';i.style.opacity='0';box.appendChild(i);return{el:i,at:-(k+.5)*(360/N)};});
    const t0=performance.now();
    const step=now=>{place();const gone=Math.min(360,Math.max(0,start-handDeg()+(start-handDeg()<-1?360:0)));   // degrees the hand has travelled
      marks.forEach(m=>{const d=gone+m.at;   // >0: the hand has passed this place by d degrees
        const o=d<=0?0:d<8?d/8:Math.max(0,1-(d-8)/40);/* v142: a year lives ~48°, never more than two at once */const a=(start+m.at)*Math.PI/180;
        const op=o.toFixed(2);if(op==='0.00'&&m.o==='0.00')return;m.o=op;m.el.style.left=Math.round(Math.cos(a)*R)+'px';m.el.style.top=Math.round(Math.sin(a)*R)+'px';m.el.style.opacity=op;
        m.el.style.textShadow=o>.6?`0 0 ${Math.round(8*o)}px rgba(255,190,110,${(o*.8).toFixed(2)})`:'none';});
      if(now-t0<64000&&shell.classList.contains('oc-w'))requestAnimationFrame(step);else box.remove();};
    requestAnimationFrame(step);};
  new MutationObserver(years).observe(shell,{attributes:true,attributeFilter:['class']});
})();
