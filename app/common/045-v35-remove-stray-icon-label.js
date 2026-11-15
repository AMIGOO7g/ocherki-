/*@block [" id=\"v35-remove-stray-icon-label\"", ""]*/
/* Remove any fallback label left by a failed decorative asset. It is not
   book content and must never appear in the workshop. */
(()=>{
  const bad=/^\s*окно\s+из\s+значка\s*$/i;
  const clean=()=>{
    document.querySelectorAll('[alt],[title],[aria-label]').forEach(el=>{
      ['alt','title','aria-label'].forEach(name=>{
        const value=el.getAttribute(name)||'';
        if(!bad.test(value))return;
        /* A broken asset can still have a src and therefore keep its alt
           text visible as a browser fallback. Remove the label first; only a
           genuinely empty image node is removed entirely. */
        if(el.tagName==='IMG'){
          el.removeAttribute(name);
          if(!el.getAttribute('src'))el.remove();
        }else el.removeAttribute(name);
      });
    });
    document.querySelectorAll('body *').forEach(el=>{
      if(/^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName))return;
      if(el.children.length===0 && bad.test(el.textContent||''))el.remove();
    });
  };
  clean();
  /* v143: only the nodes that were added or relabelled are checked — scanning the whole page after every change cost a lot */
  const fix=el=>{if(!el||el.nodeType!==1||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName))return;
    ['alt','title','aria-label'].forEach(name=>{const v=el.getAttribute(name);if(v&&bad.test(v)){el.removeAttribute(name);if(el.tagName==='IMG'&&!el.getAttribute('src'))el.remove();}});
    if(el.children.length===0&&bad.test(el.textContent||''))el.remove();};
  new MutationObserver(L=>{for(const m of L){if(m.type==='attributes'){fix(m.target);continue;}
      m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;fix(n);if(!n.firstElementChild)return;n.querySelectorAll('[alt*="значка" i],[title*="значка" i],[aria-label*="значка" i]').forEach(fix);if(/значка/i.test(n.textContent||''))n.querySelectorAll('*').forEach(fix);});}
  }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['alt','title','aria-label']});
})();
