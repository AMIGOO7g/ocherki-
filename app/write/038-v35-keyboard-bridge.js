/*@block [" id=\"v35-keyboard-bridge\"", ""]*/
(function(){
 const frame=()=>document.getElementById('v35SheetFrame');
 function keyText(btn){
   const code=btn.dataset.code||'';
   if(code==='Backspace')return 'Backspace';
   if(code==='Enter')return 'Enter';
   if(code==='Tab')return 'Tab';
   if(code==='Space')return ' ';
   const cap=btn.querySelector('.editor-cap');
   if(!cap)return '';
   const raw=(cap.innerText||'').trim();
   // Caps on the key caps are only labels: letters are lowercase unless CAPS
   // is on or SHIFT was pressed for the next key.
   const upper=capsOn!==shiftOnce;
   if(/^Key/.test(code)) return upper?raw.charAt(0).toLocaleUpperCase('ru'):raw.charAt(0).toLocaleLowerCase('ru');
   if(/^Digit/.test(code)){const parts=raw.split(/\s+/);return (shiftOnce?parts[0]:parts.pop())||'';}
   if(code==='Comma')return ',';
   if(code==='Period')return '.';
   if(code==='Slash')return '/';
   if(code==='Semicolon')return ';';
   if(code==='Quote')return "'";
   if(code==='Minus')return '-';
   if(code==='Equal')return '=';
   return raw.charAt(0);
 }
 let capsOn=false,shiftOnce=false;
 const showModifiers=()=>{
   document.querySelectorAll('.editor-key[data-code="CapsLock"]').forEach(k=>k.classList.toggle('is-latched',capsOn));
   document.querySelectorAll('.editor-key[data-code^="Shift"]').forEach(k=>k.classList.toggle('is-latched',shiftOnce));
 };
 document.addEventListener('click',e=>{
   const b=e.target.closest('.editor-key'); if(!b)return;
   const code=b.dataset.code||'';
   if(code==='CapsLock'){capsOn=!capsOn;showModifiers();return;}
   if(/^Shift/.test(code)){shiftOnce=!shiftOnce;showModifiers();return;}
   const key=keyText(b); if(!key)return;
   try{frame()?.contentWindow?.postMessage({type:'ocherki-key',key},'*')}catch(_){}
   if(shiftOnce&&key.length===1){shiftOnce=false;showModifiers();}
 });
})();
