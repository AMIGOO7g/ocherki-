/*@block [" id=\"clock-in-v140-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;let was=false;
  new MutationObserver(()=>{const on=shell.classList.contains('oc-w')&&shell.classList.contains('oc-ready');if(on&&!was){const mc=document.querySelector('.bottom-left .master-clock');if(mc){mc.classList.remove('oc-clk-in');void mc.offsetWidth;mc.classList.add('oc-clk-in');}}was=on;}).observe(shell,{attributes:true,attributeFilter:['class']});})();
