/*@block [" id=\"keyboard-rests-controller\"", ""]*/
(()=>{
  const shell=document.querySelector('.shell');let timer=0;
  const rest=()=>{if(!document.querySelector('#editorKeyboardWrap:hover'))shell.classList.add('is-keyboard-resting');else timer=setTimeout(rest,2000);};
  const wake=()=>{shell.classList.remove('is-keyboard-resting');clearTimeout(timer);timer=setTimeout(rest,5000);};
  window.addEventListener('message',event=>{const d=event.data||{};if(d.type==='OCHERKI_PHYSICAL_KEY'&&d.phase==='down')wake();});
  document.addEventListener('keydown',wake);
  document.getElementById('editorKeyboardWrap')?.addEventListener('pointerdown',wake);
  // After the constructor has settled it rests until the first key.
  window.addEventListener('message',event=>{if((event.data||{}).type==='OCHERKI_BOOT_START'){clearTimeout(timer);timer=setTimeout(rest,6000);}});
})();
