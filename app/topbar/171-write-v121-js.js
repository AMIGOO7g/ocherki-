/*@block [" id=\"write-v121-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const T=()=>window.OCHERKI_TOPBAR;
  // ——— calm loading: the side texts appear once they stand where they belong ———
  let readyT=0;const arm=()=>{if(!shell.classList.contains('oc-w')){if(shell.classList.contains('oc-ready'))shell.classList.remove('oc-ready');clearTimeout(readyT);readyT=0;return;}
    if(shell.classList.contains('ui-boot'))return;
    if(!shell.classList.contains('oc-ready')&&!readyT){dispatchEvent(new Event('resize'));readyT=setTimeout(()=>{dispatchEvent(new Event('resize'));requestAnimationFrame(()=>{shell.classList.add('oc-ready');readyT=0;});},450);}};
  new MutationObserver(arm).observe(shell,{attributes:true,attributeFilter:['class']});arm();
  // ——— the sway for «в книге», the lamp and «?» ———
  const hang=()=>{const a=T()?.attach;if(!a){setTimeout(hang,500);return;}
    const w=document.querySelector('.wp-keys.k-closed .wp-item .key');if(w&&!w._push){w.style.transformOrigin='50% calc(-1 * var(--oc-ky,30px))';a(w);}
    const q=document.querySelector('.oc-qk');if(q&&!q._push){q.style.transformOrigin='50% -40px';a(q);}
    if(!w)setTimeout(hang,800);};
  hang();

  // ——— the angel on the pendulum ———
  const bob=document.querySelector('.master-clock .logo-bob');if(bob&&!bob.querySelector('.oc-bob')){const k=document.createElement('span');k.className='oc-bob';k.innerHTML='<i class="nf"></i>';bob.appendChild(k);}
  // ——— music in the corner ———
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={note:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',next:'<path d="M6 6l8 6-8 6z"/><path d="M17 6v12"/>',prev:'<path d="M18 6l-8 6 8 6z"/><path d="M7 6v12"/>',play:'<path d="M8 5l11 7-11 7z"/>',pause:'<path d="M9 5v14M15 5v14"/>',mute:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/>',snd:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>'};
  const mus=document.createElement('div');mus.className='oc-mus oct';mus.style.cssText='position:fixed;left:auto;right:46px;top:0;width:44px;height:0;transform:none';
  const th=(x,y1,y2)=>`<i class="th" style="left:${x}px;top:${y1}px;height:${y2-y1}px"></i>`;
  const kb=(id,ic,s)=>`<button type="button" class="k" data-a="${id}" style="--s:${s}px"><i class="gl"></i><i class="nf"></i><span class="c">${S}${IC[ic]}${E}</span></button>`;
  let playing=false,muted=false;
  const draw=()=>{const L=[['next','next','Следующий трек'],['toggle',playing?'pause':'play',playing?'Пауза':'Играть'],['prev','prev','Предыдущий трек'],[muted?'mute':'mute',muted?'mute':'snd',muted?'Звуки выключены':'Звуки включены']];
    mus.innerHTML=`<div class="sw hg" style="left:0;top:0;width:44px;height:84px">${th(22,0,40)}${kb('music','note',44)}</div><span class="lbx" style="left:22px;top:91px">Музыка</span>`
      +L.map((m,i)=>`<div class="mm" style="transition-delay:${i*60}ms"><div class="sw hg" style="left:0;top:${110+i*58-14}px;width:44px;height:58px">${th(22,0,14)}${kb(m[0],m[1],44)}</div><span class="ml" style="top:${110+i*58+22}px">${m[2]}</span></div>`).join('');
    mus.querySelectorAll('.sw').forEach(x=>T()?.attach?.(x));
    mus.querySelector('[data-a="music"]')?.classList.toggle('glow',playing);
};
  document.body.appendChild(mus);
  const send=a=>{try{window.parent?.postMessage({type:'OCHERKI_AUDIO_COMMAND',action:a},'*');}catch(_){}};
  let closeT=0;
  mus.addEventListener('pointerenter',()=>{clearTimeout(closeT);if(!mus.classList.contains('open')){draw();void mus.offsetWidth;document.dispatchEvent(new CustomEvent('oc-cascade',{detail:mus}));mus.classList.add('open');}});
  document.addEventListener('oc-cascade',e=>{if(e.detail!==mus&&mus.classList.contains('open')){clearTimeout(closeT);mus.classList.remove('open');}});
  mus.addEventListener('pointerleave',()=>{clearTimeout(closeT);closeT=setTimeout(()=>mus.classList.remove('open'),700);});
  mus.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();const a=b.dataset.a;
    if(a==='music'||a==='toggle'){send('toggle');}else if(a==='next'){send('nextTrack');}else if(a==='prev'){send('prevTrack');}else if(a==='mute')send('muteAll');});
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_AUDIO_STATE')return;const p=d.state==='playing'&&!d.muted;
    if(!!d.muted!==muted){muted=!!d.muted;const t=mus.querySelector('[data-a="mute"]');if(t){t.querySelector('.c').innerHTML=S+IC[muted?'mute':'snd']+E;t.closest('.mm').querySelector('.ml').textContent=muted?'Звуки выключены':'Звуки включены';t.classList.toggle('is-off',muted);}}if(p!==playing){playing=p;const t=mus.querySelector('[data-a="toggle"]');if(t){t.querySelector('.c').innerHTML=S+IC[p?'pause':'play']+E;t.closest('.mm').querySelector('.ml').textContent=p?'Пауза':'Играть';}}
    mus.querySelector('[data-a="music"]')?.classList.toggle('glow',p);});
  draw();
  const sync=()=>{const open=shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen');mus.classList.toggle('on',open);mus.classList.toggle('is-night',shell.classList.contains('is-night')||shell.classList.contains('is-family-room'));};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});sync();
})();
