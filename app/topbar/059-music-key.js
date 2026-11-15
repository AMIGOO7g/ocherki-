/*@block [" id=\"music-key\"", ""]*/
(()=>{
  const shell=document.querySelector('.shell'),btn=document.getElementById('musicBtn');
  btn?.addEventListener('click',event=>{event.stopPropagation();const open=!shell.classList.contains('is-music-open');shell.classList.toggle('is-music-open',open);btn.setAttribute('aria-expanded',String(open));});
  document.addEventListener('click',event=>{if(shell.classList.contains('is-music-open')&&!event.target.closest('.mode-controls')&&!event.target.closest('#soundPanel')){shell.classList.remove('is-music-open');btn?.setAttribute('aria-expanded','false');}});
})();
