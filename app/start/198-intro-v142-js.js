/*@block [" id=\"intro-v142-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell||!window.OcherkiTour)return;
  const ov=document.createElement('div');ov.className='okp';ov.innerHTML='<div class="kp2"><canvas class="kpc"></canvas></div>';document.body.appendChild(ov);
  const cv=ov.querySelector('.kpc');let K=null,T=null,ts=[];const later=(f,ms)=>ts.push(setTimeout(f,ms));
  const keeper=()=>OcherkiTour.loadKeeper().then(()=>{if(!K&&window.OcherkiKeeper3D)K=OcherkiKeeper3D.create(cv,{size:.3,dust:24,quick:2.6,writeSpeed:2.3,wordsScale:1.6});return K;}).catch(()=>null);
  function open(){ts.forEach(clearTimeout);ts=[];ov.classList.add('on');
    keeper().then(k=>{if(!ov.classList.contains('on'))return;
      T?.destroy();T=OcherkiTour.create(ov,{K:k,last:'Начать',onDone:close});
      if(k){k.start();k.resize();k.placeSpark(k.halfW()*.55,k.halfW()*.25);later(()=>k.moveTo(0,.2,1),300);}
      T.start();});}
  // he flies back into the ember in the corner and the dark lifts after him
  function close(){ts.forEach(clearTimeout);ts=[];T?.stop();
    if(K){const d=document.querySelector('.okh-dot'),r=d?.getBoundingClientRect();if(r&&r.width){const cr=cv.getBoundingClientRect();K.awayTo((r.left+r.width/2-cr.left)/cr.width*2-1,1-(r.top+r.height/2-cr.top)/cr.height*2);}K.lookAt(null);K.setMode('away');}
    later(()=>{ov.classList.remove('on');later(()=>{K&&K.stop();T?.destroy();T=null;},1200);const d=document.querySelector('.okh-dot');d?.classList.add('wake');setTimeout(()=>d?.classList.remove('wake'),6000);try{localStorage.setItem('ocherki_keeper_seen','1');}catch(_){}},K?1900:300);}
  window.OCHERKI_KEEPER={open,close};
  document.addEventListener('click',e=>{const m=e.target.closest?.('.oct .more [data-m="tour"]');if(m){e.stopImmediatePropagation();e.preventDefault();document.querySelector('.oct .more')?.classList.remove('on');open();}},true);
  // once the constructor has settled, the Keeper is fetched quietly so he never arrives to an empty dark screen
  const settle=setInterval(()=>{if(shell.classList.contains('oc-ready')){clearInterval(settle);setTimeout(()=>OcherkiTour.warm(),2500);}},700);
})();
