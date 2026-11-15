/*@block [" id=\"title-two-threads-js\"", ""]*/
(()=>{const h=document.querySelector('.project-top .project-hanger'),k=document.getElementById('projectBtn');if(!h||!k)return;
  const a=document.createElement('i'),b=document.createElement('i');a.className=b.className='title-thread';h.prepend(a,b);
  const place=()=>{const w=k.offsetWidth;a.style.left=Math.round(w*.2)+'px';b.style.left=Math.round(w*.8)+'px';};place();setTimeout(place,1500);addEventListener('resize',place);})();
