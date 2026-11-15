/*@block [" id=\"write-v119-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const modal=document.getElementById('bookPreviewModal');
  const ttl=document.createElement('div');ttl.className='oc-ttl';ttl.innerHTML='<div class="k">Очерки жизни</div><div class="n"></div><div class="s">история семьи</div><div class="c"></div>';
  shell.after(ttl);
  ttl.querySelector('.n').addEventListener('click',()=>document.getElementById('booksBtn')?.click());
  const qk=document.createElement('button');qk.type='button';qk.className='oc-qk';qk.setAttribute('aria-label','Другой вопрос');qk.innerHTML='<span>?</span>';
  const acts=document.querySelector('#writingPrompt .writing-prompt-actions');if(acts)acts.appendChild(qk);
  qk.addEventListener('click',e=>{e.stopPropagation();document.getElementById('writingPromptNext')?.click();});
  const isWrite=()=>shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen')&&!shell.classList.contains('is-manuscript')&&!modal?.classList.contains('open')&&!shell.classList.contains('is-family-room');
  const root=document.documentElement.style;
  function words(){const t=(document.getElementById('projectTitle')?.textContent||'').trim();
    const n=ttl.querySelector('.n');if(n.textContent!==t){const v=t||'Очерки жизни';n.textContent=v;ttl.querySelector('.k').style.display=/^очерки жизни$/i.test(v)?'none':'';n.style.setProperty('--n',(v.length>22?36:v.length>14?44:v.length>10?52:60)+'px');}
    const c=(document.getElementById('pageCount')?.textContent||'').trim();const k=+c;
    const w=k%10===1&&k%100!==11?'лист':[2,3,4].includes(k%10)&&![12,13,14].includes(k%100)?'листа':'листов';
    ttl.querySelector('.c').textContent='';}
  let last='';
  function layout(){const on=isWrite();shell.classList.toggle('oc-w',on);ttl.classList.toggle('on',on&&!shell.classList.contains('wp-on'));if(!on)return;
    words();
    const ed=document.querySelector('.editor-paper')?.getBoundingClientRect();if(!ed||ed.width<200)return;
    const sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')||document.body).translate)||0;
    const L=ed.left-sh,R=ed.right-sh,T=Math.max(ed.top,60),H=Math.min(ed.height,innerHeight-T);
    const cx=Math.round((R+innerWidth-70)/2);
    const ty=Math.round(T+H*.34);
    // one proportion for the whole right column (title, chapter, clock): a laptop sees the same picture, only smaller
    const K=Math.max(.6,Math.min(1,innerHeight/1080,innerWidth/1920));root.setProperty('--oc-k',K.toFixed(3));
    const key=[L,R,T,H,innerWidth].map(Math.round).join();
    ttl.style.left=cx+'px';ttl.style.top=ty+'px';
    root.setProperty('--oc-cx',cx+'px');root.setProperty('--oc-ny',Math.round(ty+(ttl.offsetHeight+44)*K)+'px');
    // the clock stands under the chapter, the signature at the edge
    const nb=ty+ttl.offsetHeight+44+(document.querySelector('.write-nav')?.offsetHeight||70);
    {const bl=document.querySelector('.bottom-left'),pv=document.querySelector('.bottom-left .clock-pivot');
      const cur=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--oc-clx'))||cx-120;
      let nx=cx-120;if(pv&&shell.classList.contains('oc-w')){const pr=pv.getBoundingClientRect();if(pr.width)nx=cur+(cx-(pr.left+pr.width/2));}
      let ny=Math.min(innerHeight-300,nb+70);
      // the hands reach about 110px from the centre: the centre stands that far below the chapter's last line.
      // On a low screen everything keeps its place and the clock itself gets smaller, so it fits under the chapter whole.
      const mc=document.querySelector('.bottom-left .master-clock');
      const nv=document.querySelector('.write-nav');if(pv&&nv&&mc&&shell.classList.contains('oc-w')){const nr=nv.getBoundingClientRect();
        const k=Math.max(.5,Math.min(K,(innerHeight-14-nr.bottom)/375));
        const ok=+(mc.dataset.k||1),mr=mc.getBoundingClientRect(),pr=pv.getBoundingClientRect();
        if(pr.height&&nr.height&&mr.width){
          // the pivot's place inside the clock, unscaled — the clock shrinks around its own centre
          const ox=(pr.left+pr.width/2-mr.left)/ok,oy=(pr.top+pr.height/2-mr.top)/ok;
          if(Math.abs(k-ok)>.004){mc.style.transformOrigin=`${ox.toFixed(1)}px ${oy.toFixed(1)}px`;mc.style.scale=k.toFixed(3);mc.dataset.k=k.toFixed(3);}
          const cy=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--oc-cly'))||ny;
          ny=cy+(nr.bottom+125*k-(pr.top+pr.height/2));}}
      root.setProperty('--oc-clx',Math.round(nx)+'px');root.setProperty('--oc-cly',Math.round(ny)+'px');}
    root.setProperty('--oc-qx',Math.round(L/2)+'px');root.setProperty('--oc-qy',Math.round(T+H/2)+'px');
    // the two keys over the sheet
    const mid=(L+R)/2;root.setProperty('--oc-ky','30px');// the three keys over the sheet share its free width evenly, clear of the top bar on a small screen
    {let r0=0;document.querySelectorAll('.oct[role="navigation"] .row .k,.oct[role="navigation"] .lbx').forEach(k=>{const r=k.getBoundingClientRect();if(r.width&&r.top<140)r0=Math.max(r0,r.right);});
     // v142: equal margins at both edges of the sheet and equal gaps between the three keys, measured with their labels
     const left=Math.max(L+46,r0+28),right=R-150,span=Math.max(240,right-left);
     {const l=document.querySelector('.wp-keys.k-closed .lab');if(l)l.textContent=span<560?'в книге':'показать в книге';}
     // each key with its label: beside it when the sheet is wide enough, under it when it is narrow
     const G=[['.wp-keys.k-closed','.wp-keys.k-closed .key','.wp-keys.k-closed .lab'],['.book-design-shell.is-rail','.bd-rail-key[data-rail="tips"]','.book-design-shell.is-rail .oc-klab'],['.oc-add2','.oc-add2 [data-a="add"]','.oc-add2 .it.main .lab']]
       .map(([g,k,l])=>{const ge=document.querySelector(g),ke=document.querySelector(k),le=document.querySelector(l);if(!ge||!ke||!le)return null;const kr=ke.getBoundingClientRect();
         return{off:kr.left-ge.getBoundingClientRect().left,kw:kr.width,lw:le.scrollWidth||le.getBoundingClientRect().width};});
     const fit=tight=>{const W=G.map(g=>tight?Math.max(g.kw,g.lw):g.kw+10+g.lw);const free=(R-L)-W.reduce((x,y)=>x+y,0);let side=free/4,gap=free/4;const need=r0+28-L;if(side<need){side=need;gap=(free-2*side)/2;}return{W,side,gap};};
     if(G.every(Boolean)){let tight=false,f=fit(false);if(f.gap<18){tight=true;f=fit(true);}
       shell.classList.toggle('oc-ktight',tight);
       if(f.gap>=10){let x=L+f.side;['--oc-k1x','--oc-k2x','--oc-k3x'].forEach((v,i)=>{const g=G[i],lead=tight?(f.W[i]-g.kw)/2:0;root.setProperty(v,Math.round(x+lead-g.off)+'px');x+=f.W[i]+f.gap;});}
       else{root.setProperty('--oc-k1x',Math.round(left)+'px');root.setProperty('--oc-k2x',Math.round(left+span*.46)+'px');root.setProperty('--oc-k3x',Math.round(left+span*.86)+'px');}}
     else{root.setProperty('--oc-k1x',Math.round(left)+'px');root.setProperty('--oc-k2x',Math.round(left+span*.46)+'px');root.setProperty('--oc-k3x',Math.round(left+span*.86)+'px');}}
    if(key!==last){last=key;}}
  const kick=()=>requestAnimationFrame(layout);
  new MutationObserver(kick).observe(shell,{attributes:true,attributeFilter:['class']});
  if(modal)new MutationObserver(kick).observe(modal,{attributes:true,attributeFilter:['class']});
  const pt=document.getElementById('projectTitle');if(pt)new MutationObserver(kick).observe(pt,{childList:true,characterData:true,subtree:true});
  const pc=document.getElementById('pageCount');if(pc)new MutationObserver(kick).observe(pc,{childList:true,characterData:true,subtree:true});
  addEventListener('resize',kick);setInterval(layout,1500);[400,1500,3500,7000].forEach(t=>setTimeout(layout,t));
})();
