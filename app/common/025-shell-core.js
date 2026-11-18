/*@block ["", ""]*/
(() => {
  const shell = document.getElementById('shell');
  const powerNode = document.getElementById('powerNode');
  const powerBtn = document.getElementById('powerBtn');
  const dayBtn = document.getElementById('dayBtn');
  const nightBtn = document.getElementById('nightBtn');
  const projectTitle = document.getElementById('projectTitle');
  const pageCount = document.getElementById('pageCount');
  window.OCHERKI_BOOK_META = window.OCHERKI_BOOK_META || {
    title:'Очерки жизни', subtitle:'История нашей семьи', author:'', year:new Date().getFullYear(), design:'editorial'
  };
  projectTitle.textContent = 'Очерки жизни';
  pageCount.textContent = '24';

  window.addEventListener('message',(event)=>{
    const data=event.data||{};
    if(data.type==='OCHERKI_AUDIO_FX'){
      try{
        window.parent.postMessage({type:'OCHERKI_AUDIO_FX',name:data.name},'*');
      }catch(_){}
    }
  });

  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type !== 'OCHERKI_PROJECT_CONFIG') return;
    window.OCHERKI_BOOK_META = Object.assign({}, window.OCHERKI_BOOK_META, {
      title:String(data.title || window.OCHERKI_BOOK_META.title || 'Очерки жизни'),
      subtitle:String(data.subtitle || window.OCHERKI_BOOK_META.subtitle || 'История нашей семьи'),
      author:String(data.author || window.OCHERKI_BOOK_META.author || ''),
      year:String(data.year || window.OCHERKI_BOOK_META.year || new Date().getFullYear()),
      design:String(data.design || window.OCHERKI_BOOK_META.design || 'editorial'),
      // The start wizard's text/photo balance steers the layout director.
      contentBalance:String(data.contentBalance || window.OCHERKI_BOOK_META.contentBalance || '')
    });
    if (typeof data.title === 'string' && data.title.trim()) projectTitle.textContent = data.title.trim();
    const mapSubtitle = document.querySelector('.book-map-subtitle');
    window.__ocherkiWorkMode = data.workMode || '';
    if (mapSubtitle && data.workMode) mapSubtitle.textContent = data.workMode === 'С вопросами-подсказками' ? 'с вопросами-подсказками' : 'свободное письмо';
    if (data.pageCount !== undefined && data.pageCount !== null) pageCount.textContent = String(data.pageCount);
  });

  let opened = false;
  let lightOn = false;

  function bindPress(el){
    el.addEventListener('pointerdown',()=>el.classList.add('is-pressed'));
    ['pointerup','pointerleave','pointercancel'].forEach(evt=>el.addEventListener(evt,()=>el.classList.remove('is-pressed')));
  }
  document.querySelectorAll('.key, .project-key').forEach(bindPress);

  const v35SheetFrame = document.getElementById('v35SheetFrame');
  let currentMode = 'night';
  function sendModeToSheet(){
    try{
      v35SheetFrame?.contentWindow?.postMessage({type:'OCHERKI_HOST_MODE',mode:currentMode},'*');
    }catch(_){}
  }
  function setMode(mode){
    if(mode === currentMode){
      sendModeToSheet();
      return;
    }
    currentMode = mode;
    const night = mode === 'night';

    // One class drives the complete scene. Every visual layer has the same
    // 2.8s dimmer curve, so day and night crossfade continuously.
    shell.classList.toggle('is-night', night);
    nightBtn.classList.toggle('is-active', night);
    dayBtn.classList.toggle('is-active', !night);
    sendModeToSheet();
  }
  v35SheetFrame?.addEventListener('load',sendModeToSheet);

  function removePowerCopy(){
    const copy=document.querySelector('.power-copy');
    if(!copy)return;
    copy.textContent='';
    copy.style.display='none';
    copy.style.opacity='0';
    copy.style.visibility='hidden';
    copy.remove();
  }

  // v161: the entry caption may still be present for a frame while the shell
  // switches into the constructor. Remove the real node as soon as either
  // constructor state becomes active; do not rely on a fade/visibility rule.
  const powerCopyGuard = new MutationObserver(()=>{
    if(shell.classList.contains('is-open') || shell.classList.contains('boot-started') || shell.classList.contains('has-entered')){
      removePowerCopy();
    }
  });
  powerCopyGuard.observe(shell,{attributes:true,attributeFilter:['class']});

  function turnOn(){
    // v107: switched on again, the sheet and the keys come up together with the light.
    if(!window.__OCHERKI_BOOT_POWER&&shell.classList.contains('has-entered')&&!shell.classList.contains('is-light-on')){shell.classList.add('is-power-up');clearTimeout(turnOn._t);turnOn._t=setTimeout(()=>shell.classList.remove('is-power-up'),2700);}
    opened = true;
    lightOn = true;
    shell.classList.add('is-open','is-light-on','has-entered');
    try{ ensureClockPendulum?.(); }catch(_){}
    // The startup caption belongs only to the centered entry state. Once the
    // light has been switched on for the first time it must never reappear.
    removePowerCopy();
    if(!shell.classList.contains('ui-boot')) shell.classList.add('menus-ready');
    // v191: the constructor opens in the light the author chose last time; the clock decides only the very first time
    let chosen='';try{chosen=localStorage.getItem('ocherkiLight')||'';}catch(_){}
    const hour = new Date().getHours();
    const autoMode = chosen==='day'||chosen==='night'?chosen:((hour >= 19 || hour < 7) ? 'night' : 'day');
    setMode(autoMode);
    requestAnimationFrame(()=>{
      try{ window.OCHERKI_positionMap?.(); }catch(_){}
      try{ window.OCHERKI_positionPrompt?.(); }catch(_){}
      try{ if(structure) window.OCHERKI_showPromptFromStructure?.(structure,true); }catch(_){}
    });
  }

  function turnOff(){
    lightOn = false;
    opened = false;
    shell.classList.remove('is-light-on','is-open');
    try{ stopClockPendulum?.(); }catch(_){}
    setMode('night');
  }

  const sendAudioCommand=(action,extra={})=>{
    try{ window.parent?.postMessage({type:'OCHERKI_AUDIO_COMMAND',action,...extra},'*'); }catch(_){}
  };
  window.OCHERKI_PLAY_PAGE_FX=(volume=.82)=>sendAudioCommand('fx',{name:'page',volume});
  window.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type==='OCHERKI_PAGE_TURN_FX') window.OCHERKI_PLAY_PAGE_FX?.(d.volume ?? .9);
  });

  powerBtn.addEventListener('click',()=>{
    if(!window.__OCHERKI_BOOT_POWER)sendAudioCommand('fx',{name:'light',volume:.72});// v213: the desk comes on silently at entry
    if(!opened || !lightOn){
      turnOn();
    }else{
      turnOff();
    }
  });
  dayBtn.addEventListener('click',()=>{ if(opened&&lightOn){ setMode('day'); try{localStorage.setItem('ocherkiLight','day');}catch(_){} } });

  // project action buttons: visual shell behaviour for now
  document.querySelectorAll('.project-actions .key').forEach(btn=>{
    btn.addEventListener('click',()=>{
      btn.classList.add('action-feedback');
      window.setTimeout(()=>btn.classList.remove('action-feedback'),420);
      console.log('PROJECT_ACTION', btn.id);
    });
  });



  const editorMapEN = {
    KeyQ:"Q",KeyW:"W",KeyE:"E",KeyR:"R",KeyT:"T",KeyY:"Y",KeyU:"U",KeyI:"I",KeyO:"O",KeyP:"P",
    BracketLeft:"[",BracketRight:"]",KeyA:"A",KeyS:"S",KeyD:"D",KeyF:"F",KeyG:"G",KeyH:"H",
    KeyJ:"J",KeyK:"K",KeyL:"L",Semicolon:";",Quote:"'",KeyZ:"Z",KeyX:"X",KeyC:"C",KeyV:"V",
    KeyB:"B",KeyN:"N",KeyM:"M",Comma:",",Period:"."
  };
  const editorMapRU = {
    KeyQ:"Й",KeyW:"Ц",KeyE:"У",KeyR:"К",KeyT:"Е",KeyY:"Н",KeyU:"Г",KeyI:"Ш",KeyO:"Щ",KeyP:"З",
    BracketLeft:"Х",BracketRight:"Ъ",KeyA:"Ф",KeyS:"Ы",KeyD:"В",KeyF:"А",KeyG:"П",KeyH:"Р",
    KeyJ:"О",KeyK:"Л",KeyL:"Д",Semicolon:"Ж",Quote:"Э",KeyZ:"Я",KeyX:"Ч",KeyC:"С",KeyV:"М",
    KeyB:"И",KeyN:"Т",KeyM:"Ь",Comma:"Б",Period:"Ю"
  };
  let editorLang = 'ru';
  function setEditorLang(next){
    editorLang = next;
    const src = editorLang === 'ru' ? editorMapRU : editorMapEN;
    document.querySelectorAll('.editor-key[data-code]').forEach(k => {
      const code = k.dataset.code;
      if (src[code] && !k.classList.contains('num')) {
        const cap = k.querySelector('.editor-cap');
        if (cap) cap.textContent = src[code];
      }
    });
  }
  document.querySelector('[data-action="ru"]')?.addEventListener('click',()=>setEditorLang('ru'));
  document.querySelector('[data-action="en"]')?.addEventListener('click',()=>setEditorLang('en'));

  const editorByCode = code => [...document.querySelectorAll(`.editor-key[data-code="${CSS.escape(code)}"]`)];
  window.addEventListener('message', event => {
    const d = event.data || {};
    if(d.type !== 'OCHERKI_PHYSICAL_KEY' || !d.code) return;
    const keys = editorByCode(d.code);
    if(d.phase === 'down'){
      if(d.repeat) return;
      keys.forEach(editorPressKey);
    }else if(d.phase === 'up'){
      keys.forEach(editorReleaseKey);
    }
  });
  let lastKeyFxAt=0;
  function editorPressKey(k){
    if(!k || k.classList.contains('pressed')) return;
    k.classList.remove('rebound');
    void k.offsetWidth;
    k.classList.add('pressed');
    const now=performance.now();
    if(now-lastKeyFxAt>42){
      lastKeyFxAt=now;
      /* key sound intentionally disabled */
    }
  }
  function editorReleaseKey(k){
    if(!k || !k.classList.contains('pressed')) return;
    k.classList.remove('pressed');
    k.classList.remove('rebound');
    void k.offsetWidth;
    k.classList.add('rebound');
    setTimeout(()=>k.classList.remove('rebound'),160);
  }
  document.querySelectorAll('.editor-key').forEach(k => {
    k.addEventListener('pointerdown', e => { k.setPointerCapture?.(e.pointerId); editorPressKey(k); });
    k.addEventListener('pointerup', () => editorReleaseKey(k));
    k.addEventListener('pointercancel', () => editorReleaseKey(k));
    k.addEventListener('pointerleave', e => { if(!e.buttons) editorReleaseKey(k); });
    k.addEventListener('dragstart', e => e.preventDefault());
  });
  document.addEventListener('keydown', e => {
    if(e.repeat) return;
    const code = e.code === 'NumpadEnter' ? 'Enter' : e.code;
    editorByCode(code).forEach(editorPressKey);
  });
  document.addEventListener('keyup', e => {
    const code = e.code === 'NumpadEnter' ? 'Enter' : e.code;
    editorByCode(code).forEach(editorReleaseKey);
  });
  window.addEventListener('blur', () => document.querySelectorAll('.editor-key.pressed').forEach(editorReleaseKey));
  setEditorLang('ru');


  nightBtn.addEventListener('click',()=>{ if(opened&&lightOn){ setMode('night'); try{localStorage.setItem('ocherkiLight','night');}catch(_){} } });

  // Transport controls are part of the shell now.
  // Navigation/audio wiring will be attached when the editor content is connected.
  const transportPlayBtn = document.getElementById('transportPlayBtn');
  const transportStopBtn = document.getElementById('transportStopBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const transportNextBtn = document.getElementById('transportNextBtn');
  const transportBackBtn = document.getElementById('transportBackBtn');

  transportPlayBtn?.addEventListener('click',()=>{
    sendAudioCommand('toggle');
  });
  transportStopBtn?.addEventListener('click',()=>{
    sendAudioCommand('stop');
  });
  const soundPanel=document.getElementById('soundPanel');
  soundToggleBtn?.addEventListener('click',e=>{
    e.stopPropagation();
    const open=!soundPanel?.classList.contains('open');
    soundPanel?.classList.toggle('open',open);
    soundPanel?.setAttribute('aria-hidden',open?'false':'true');
  });
  soundPanel?.querySelector('[data-sound-all]')?.addEventListener('click',()=>sendAudioCommand('muteAll'));
  soundPanel?.querySelectorAll('[data-sound-layer]').forEach(b=>b.addEventListener('click',()=>sendAudioCommand('toggleLayer',{name:b.dataset.soundLayer})));
  document.addEventListener('click',e=>{if(soundPanel?.classList.contains('open')&&!e.target.closest('#soundPanel')&&!e.target.closest('#soundToggleBtn')){soundPanel.classList.remove('open');soundPanel.setAttribute('aria-hidden','true')}});
  window.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type!=='OCHERKI_AUDIO_STATE') return;
    const playing=d.state==='playing' && !d.muted;
    transportPlayBtn?.classList.toggle('is-active',playing);
    transportPlayBtn?.setAttribute('aria-label',playing?'Пауза':'Play');
    const playSvg=transportPlayBtn?.querySelector('svg');
    if(playSvg) playSvg.innerHTML=playing
      ? '<path d="M17 14v20M31 14v20"></path>'
      : '<path d="M18 13l18 11-18 11z"></path>';
    transportStopBtn?.classList.toggle('is-active',d.state==='stopped' || !!d.muted);
    soundToggleBtn?.classList.toggle('is-active',!!d.muted);
    soundToggleBtn?.classList.toggle('sound-muted',!!d.muted);
    soundToggleBtn?.setAttribute('aria-label', d.muted ? 'Включить все звуки' : 'Выключить все звуки');
    soundPanel?.querySelector('[data-sound-all]')?.classList.toggle('off',!!d.muted);
    const layers=d.layers||{};
    soundPanel?.querySelectorAll('[data-sound-layer]').forEach(b=>b.classList.toggle('off',layers[b.dataset.soundLayer]===false));
  });
  transportNextBtn?.addEventListener('click',()=>sendAudioCommand('nextTrack'));
  transportBackBtn?.addEventListener('click',()=>sendAudioCommand('prevTrack'));
  const masterClock=document.querySelector('.master-clock');

  // Pendulum keeps the current calm visual speed independently of the original clock sound cadence.
  const clockPendulum = document.getElementById('pendulum');
  let clockPendulumSide = -1;
  let clockPendulumTimer = null;
  const stepClockPendulum=()=>{
    if(!clockPendulum)return;
    clockPendulumSide *= -1;
    clockPendulum.style.transition='transform 2.25s cubic-bezier(.45,.05,.55,.95)';
    clockPendulum.style.transform=`rotate(${clockPendulumSide*14}deg)`;
  };
  const ensureClockPendulum=()=>{
    if(clockPendulumTimer)return;
    stepClockPendulum();
    clockPendulumTimer=setInterval(stepClockPendulum,2400);
  };
  const stopClockPendulum=()=>{
    if(clockPendulumTimer){clearInterval(clockPendulumTimer);clockPendulumTimer=null;}
    if(clockPendulum){
      clockPendulum.style.transition='transform .65s ease-out';
      clockPendulum.style.transform='rotate(0deg)';
    }
  };
  window.addEventListener('message', e=>{
    const d=e.data||{};
    if(d.type==='OCHERKI_CLOCK_TICK') ensureClockPendulum();
    else if(d.type==='OCHERKI_CLOCK_STOP') stopClockPendulum();
  });
  document.getElementById('undoBtn')?.addEventListener('click',()=>{try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'undo'},'*')}catch(_){}});
  document.getElementById('redoBtn')?.addEventListener('click',()=>{try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'redo'},'*')}catch(_){}});


  function updateClock(){
    const now = new Date();
    const ms = now.getMilliseconds();
    const seconds = now.getSeconds() + ms/1000;
    const minutes = now.getMinutes() + seconds/60;
    const hours = (now.getHours()%12) + minutes/60;
    // Browser Date() uses the visitor's local device time zone.
    // Hands share one pivot; 12 o'clock is -90deg from the CSS horizontal baseline.
    document.getElementById('hourHand').style.transform = `rotate(${hours*30-90}deg)`;
    document.getElementById('minuteHand').style.transform = `rotate(${minutes*6-90}deg)`;
    // The second hand intentionally runs counter-clockwise.
    document.getElementById('secondHand').style.transform = `rotate(${-90-seconds*6}deg)`;
    requestAnimationFrame(updateClock);
  }
  requestAnimationFrame(updateClock);

  function enableSwing(el, opts={}){
    const trigger = opts.trigger || el;
    let raf = null, angle = 0, velocity = 0, lastX = 0, hovering = false;
    const maxAngle = opts.maxAngle ?? 1.65;
    const pushForce = opts.pushForce ?? .40;
    const gravity = opts.gravity ?? .0105;
    const damping = opts.damping ?? .991;

    const apply = () => { el.style.transform = `rotate(${angle.toFixed(2)}deg)`; };
    const animate = () => {
      velocity += -gravity*angle; velocity *= damping; angle += velocity;
      if(angle > maxAngle){ angle = maxAngle; velocity *= -.1; }
      if(angle < -maxAngle){ angle = -maxAngle; velocity *= -.1; }
      apply();
      if(!hovering && Math.abs(angle)<.01 && Math.abs(velocity)<.002){ angle=0; velocity=0; apply(); raf=null; return; }
      raf = requestAnimationFrame(animate);
    };
    const push = x => {
      let dir = 1; if(lastX) dir = x > lastX ? 1 : -1; lastX = x;
      velocity = velocity*.3 + pushForce*dir*.7; if(!raf) raf = requestAnimationFrame(animate);
    };
    trigger.addEventListener('pointerenter',e=>{hovering=true; push(e.clientX)});
    trigger.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-lastX)>24) push(e.clientX)});
    trigger.addEventListener('pointerleave',()=>{hovering=false; lastX=0; if(!raf) raf=requestAnimationFrame(animate)});
    trigger.addEventListener('click',()=>{velocity += (opts.clickImpulse ?? .035); if(!raf) raf=requestAnimationFrame(animate)});
    apply();
  }

  enableSwing(powerNode,{maxAngle:1.25,pushForce:.16,gravity:.010,damping:.991,clickImpulse:.03,trigger:powerBtn});
  document.querySelectorAll('.mode-controls .hanging').forEach(el=>enableSwing(el,{maxAngle:1.20,pushForce:.14,gravity:.010,damping:.991,clickImpulse:.028}));
  document.querySelectorAll('.project-actions .hanging').forEach(el=>enableSwing(el,{maxAngle:1.15,pushForce:.13,gravity:.010,damping:.991,clickImpulse:.026}));
  enableSwing(document.getElementById('projectHanger'),{maxAngle:1.20,pushForce:.14,gravity:.010,damping:.991,clickImpulse:.028});
  enableSwing(document.getElementById('pagesHanger'),{maxAngle:1.20,pushForce:.14,gravity:.010,damping:.991,clickImpulse:.028});
})();
