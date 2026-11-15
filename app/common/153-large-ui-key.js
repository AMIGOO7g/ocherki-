/*@block [" id=\"large-ui-key\"", ""]*/
// «Крупный интерфейс» belongs to the whole constructor: a hanging key here.
(()=>{const key=document.getElementById('largeUiKey'),shell=document.querySelector('.shell');if(!key||!shell)return;
  const sync=()=>key.classList.toggle('is-active',shell.classList.contains('is-large-ui'));
  key.addEventListener('click',e=>{e.stopPropagation();const on=!shell.classList.contains('is-large-ui');
    try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_LARGE_UI_SET',on},'*');}catch(err){}
    shell.classList.toggle('is-large-ui',on);document.body.classList.toggle('is-large-ui',on);try{localStorage.setItem('ocherkiLargeUI',on?'1':'0');}catch(err){}sync();requestAnimationFrame(()=>dispatchEvent(new Event('resize')));});
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});sync();
})();
