/*@block ["", ""]*/
// «Мои книги»: the bookcase lists every book; a click saves the open one
// and opens another in the editor; «+» starts a new book from the first
// steps.
(()=>{
  const frame=()=>document.getElementById('v35SheetFrame');
  const activeId=()=>{try{return localStorage.getItem('ocherkiActiveBook')||'current';}catch(_){return 'current';}};
  const saveOpenBook=async()=>{try{await frame()?.contentWindow?.__ocherkiPersistNow?.();}catch(_){}};
  document.getElementById('booksBtn')?.addEventListener('click',async()=>{
    if(window.OcherkiBookcase?.isOpen()){window.OcherkiBookcase.close();return;}
    await saveOpenBook();
    let books=[];
    try{books=await window.OcherkiStore.list();}catch(_){}
    window.OcherkiBookcase?.open({books,currentId:activeId(),currentTitle:(document.getElementById('projectTitle')?.textContent||'').trim(),
      onOpen:id=>{
        try{localStorage.setItem('ocherkiActiveBook',id);}catch(_){}
        const title=books.find(book=>book.id===id)?.title;
        if(title){const node=document.getElementById('projectTitle');if(node)node.textContent=title;}
        // the sheet reloads behind a soft fade, so no bare white frame flashes while it starts
        const sheet=frame();if(sheet){sheet.style.transition='opacity .25s ease';sheet.style.opacity='0';
          sheet.addEventListener('load',()=>setTimeout(()=>{sheet.style.transition='opacity .9s ease';sheet.style.opacity='';},700),{once:true});
          setTimeout(()=>{sheet.src=sheet.src;},260);setTimeout(()=>{if(sheet.style.opacity==='0'){sheet.style.opacity='';}},6000);}
      },
      onNew:()=>{
        try{localStorage.setItem('ocherkiActiveBook','book-'+Date.now().toString(36));localStorage.removeItem('ocherkiLifeProjectDraft');}catch(_){}
        (window.top||window).location.href='index.html';
      },
      // The open book was deleted: the editor stops saving it and the start
      // screen opens.
      onDeleteCurrent:()=>{
        try{const sheet=frame()?.contentWindow;if(sheet)sheet.__ocherkiNoSave=true;}catch(_){}
        try{localStorage.removeItem('ocherkiActiveBook');localStorage.removeItem('ocherkiLifeProjectDraft');}catch(_){}
        setTimeout(()=>{(window.top||window).location.href='index.html';},600);
      }});
  });
})();
