/*@block [" id=\"prompt-settle\"", ""]*/
// The question appears once everything around the sheet has settled, in its
// own place — it no longer travels while the constructor comes up.
(()=>{const shell=document.querySelector('.shell');if(!shell)return;let t=0;
  const hold=()=>{shell.classList.add('prompt-wait');clearTimeout(t);t=setTimeout(()=>{dispatchEvent(new Event('resize'));setTimeout(()=>shell.classList.remove('prompt-wait'),120);},1600);};
  let wasBoot=shell.classList.contains('ui-boot');
  new MutationObserver(()=>{const boot=shell.classList.contains('ui-boot');if(wasBoot&&!boot)hold();if(!wasBoot&&boot)shell.classList.add('prompt-wait');wasBoot=boot;}).observe(shell,{attributes:true,attributeFilter:['class']});
  if(wasBoot)shell.classList.add('prompt-wait');})();
