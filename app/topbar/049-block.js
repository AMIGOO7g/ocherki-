/*@block ["", ""]*/
window.LifeBookPageBlocks = {
  normalize(page){
    if(!page) return [];
    if(!Array.isArray(page.blocks)){
      page.blocks=[];
      if(page.text){
        page.blocks.push({type:"text", content:page.text});
      }
      if(Array.isArray(page.photos)){
        page.photos.forEach(photo=>{
          page.blocks.push({
            type:"photo",
            photoId:photo.id||null,
            src:photo.src||""
          });
        });
      }
    }
    return page.blocks;
  },
  add(page,type,data){
    return this.normalize(page).push(Object.assign({type:type},data||{}));
  },
  addPhoto(page,photo){
    return this.add(page,"photo",{photoId:photo?.id||null,src:photo?.src||""});
  },
  addQuote(page,text){
    return this.add(page,"quote",{content:text||""});
  },
  addCaption(page,text){
    return this.add(page,"caption",{content:text||""});
  },
  addDate(page,text){
    return this.add(page,"date",{content:text||""});
  }
};

function clampHangingTooltips(){
 document.querySelectorAll('.hanging .tooltip,.key .tooltip').forEach(t=>{
   const r=t.getBoundingClientRect();
   t.style.left='';
   t.style.right='';
   if(r.left<8) t.style.left='0';
   if(r.right>window.innerWidth-8) t.style.right='0';
 });
}
window.addEventListener('resize',clampHangingTooltips);
setTimeout(clampHangingTooltips,500);

function waitPreviewReady(cb){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(typeof bookSpreads!=="undefined" && bookSpreads.length){
      clearInterval(timer);
      cb();
    }
    if(tries>40) clearInterval(timer);
  },50);
}

