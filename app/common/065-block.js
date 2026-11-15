/*@block ["", ""]*/
(()=>{const apply=on=>{document.querySelector('.shell')?.classList.toggle('is-large-ui',!!on);document.body.classList.toggle('is-large-ui',!!on);};
try{apply(localStorage.getItem('ocherkiLargeUI')==='1');}catch(e){}
addEventListener('message',e=>{if(e.data&&e.data.type==='OCHERKI_LARGE_UI'){apply(e.data.on);requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));}});})();
