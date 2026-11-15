/*@block [" id=\"book-v124-js\"", ""]*/
(()=>{const modal=document.getElementById('bookPreviewModal');if(!modal)return;
  const place=()=>{const on=modal.classList.contains('open');modal.classList.toggle('oc-bk',on);if(!on){modal._ip=0;modal.classList.remove('bk-ip');return;}
    const st=modal.querySelector('.book-preview-stage'),sp=document.getElementById('bookPreviewSpread'),info=document.getElementById('bookPreviewInfo'),hg=document.getElementById('bookPreviewLayoutHanger');
    if(!st||!sp||!hg)return;const S=st.getBoundingClientRect(),P=sp.getBoundingClientRect();if(!P.width)return;
    const k=S.width?st.offsetWidth/S.width:1;
    modal.style.setProperty('--bk-ky',Math.round((P.bottom-S.top)*k+22)+'px');
    const y=Math.round(P.top-36);if(info&&modal.classList.contains('bk-ip'))modal.style.setProperty('--bk-iy',y+'px');
    // «Разворот N из M» shows only once the book has stopped moving (it opens and grows first): the line is set above
    // the finished spread and only then fades in — it never appears on the book itself and never travels up to its place
    if(!modal._ip){modal._ip=1;let last=null,still=0,n=0;const watch=()=>{if(!modal.classList.contains('open')){modal._ip=0;return;}
      const R=sp.getBoundingClientRect(),yy=Math.round(R.top-36);modal.style.setProperty('--bk-iy',yy+'px');
      // the line itself must already stand there (while the window still opens, everything in it is carried along)
      const iy=info?Math.round(info.getBoundingClientRect().top):yy,key=yy+':'+Math.round(R.width)+':'+iy;still=(key===last&&Math.abs(iy-yy)<3)?still+1:0;last=key;n++;
      if(R.width&&(still>=10||n>420)){modal.classList.add('bk-ip');return;}requestAnimationFrame(watch);};requestAnimationFrame(watch);}};
  new MutationObserver(()=>requestAnimationFrame(place)).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>requestAnimationFrame(place));setInterval(()=>{if(modal.classList.contains('open'))place();},700);
})();
