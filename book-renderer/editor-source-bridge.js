(function (global) {
  'use strict';

  const BLOCKS = new Set(['P','DIV','LI','BLOCKQUOTE','H1','H2','H3','H4','H5','H6']);
  const SOFT = /\u00ad/g;

  function nodeText(node) {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) return String(node.nodeValue || '').replace(SOFT, '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    if (node.tagName === 'BR') return '\n';
    if (node.matches?.('[data-sample]')) return '';
    return [...node.childNodes].map(nodeText).join('');
  }

  // Soft browser wrapping never creates a DOM node. Only explicit BR elements
  // and top-level block boundaries become semantic newlines in the manuscript.
  function semanticText(root) {
    if (!root) return '';
    const children = [...root.childNodes];
    const hasBlocks = children.some(node => node.nodeType === Node.ELEMENT_NODE && BLOCKS.has(node.tagName));
    if (!hasBlocks) return nodeText(root).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return children.map(node => {
      if (node.nodeType === Node.TEXT_NODE) return nodeText(node).trim();
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      return nodeText(node).replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').trim();
    }).filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function textNodes(root) {
    const nodes=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node,offset=0;
    while((node=walker.nextNode())){
      const length=node.data.length;
      nodes.push({node,start:offset,end:offset+length});
      offset+=length;
    }
    return {nodes,length:offset};
  }

  function pointAt(index, map) {
    const item=map.nodes.find(part=>index>=part.start&&index<=part.end)||map.nodes.at(-1);
    return item?{node:item.node,offset:Math.max(0,Math.min(item.node.data.length,index-item.start))}:null;
  }

  function rangeRect(root,start,end,map=textNodes(root)) {
    const a=pointAt(start,map),b=pointAt(end,map);
    if(!a||!b)return null;
    const range=document.createRange();
    try{
      range.setStart(a.node,a.offset);range.setEnd(b.node,b.offset);
      const rects=[...range.getClientRects()].filter(rect=>rect.width>0&&rect.height>0);
      return rects.at(-1)||null;
    }catch(_){return null;}
  }

  function editorLineDiagnostic(root) {
    if(!root)return null;
    const style=getComputedStyle(root),box=root.getBoundingClientRect();
    const px=value=>Number.parseFloat(value)||0;
    const contentLeft=box.left+px(style.paddingLeft)+px(style.borderLeftWidth);
    const contentRight=box.right-px(style.paddingRight)-px(style.borderRightWidth);
    const contentBottom=box.bottom-parseFloat(style.paddingBottom||0)-parseFloat(style.borderBottomWidth||0);
    const value=String(root.textContent||''),semantic=semanticText(root),map=textNodes(root);
    const words=[...new Intl.Segmenter('ru',{granularity:'word'}).segment(value)].filter(item=>item.isWordLike);
    const measured=words.map(item=>({
      text:item.segment,start:item.index,end:item.index+item.segment.length,
      rect:rangeRect(root,item.index,item.index+item.segment.length,map)
    })).filter(item=>item.rect);
    const visible=measured.filter(item=>item.rect.top<contentBottom-.5);
    const last=visible.at(-1)||null;
    const next=last?measured.find(item=>item.start>=last.end&&item.rect.top>last.rect.top+1):null;
    const free=last?Math.max(0,contentRight-last.rect.right):Math.max(0,root.clientWidth);
    const nextWidth=next?next.rect.width:0;
    const reason=!next?'end-of-text':nextWidth<=free+.5?'unexpected-wrap-needs-inspection':'next-word-does-not-fit';
    const rectValue=rect=>rect?{left:Number(rect.left.toFixed(2)),right:Number(rect.right.toFixed(2)),top:Number(rect.top.toFixed(2)),bottom:Number(rect.bottom.toFixed(2)),width:Number(rect.width.toFixed(2)),height:Number(rect.height.toFixed(2))}:null;
    const visiblePoint=last&&last.rect.top>=0&&last.rect.left>=0&&last.rect.top<innerHeight&&last.rect.left<innerWidth;
    const topElement=visiblePoint?document.elementsFromPoint(Math.min(last.rect.right-1,innerWidth-1),Math.min(last.rect.bottom-1,innerHeight-1))[0]:null;
    const before=getComputedStyle(root,'::before'),after=getComputedStyle(root,'::after'),parent=root.parentElement?getComputedStyle(root.parentElement):null;
    const scaleX=root.offsetWidth?box.width/root.offsetWidth:1,scaleY=root.offsetHeight?box.height/root.offsetHeight:1;
    return {
      clientWidth:root.clientWidth,
      scrollWidth:root.scrollWidth,
      contentWidth:Number((contentRight-contentLeft).toFixed(2)),
      containerLeft:Number(contentLeft.toFixed(2)),
      containerRight:Number(contentRight.toFixed(2)),
      lineRect:rectValue(last?.rect),
      nextWordRect:rectValue(next?.rect),
      lastGlyphRight:last?Number(last.rect.right.toFixed(2)):null,
      freeSpace:Number(free.toFixed(2)),
      remainingWidth:Number(free.toFixed(2)),
      nextWord:next?.text||'',
      nextWordWidth:Number(nextWidth.toFixed(2)),
      reason,
      lang:root.lang||rootLanguage(root),
      whiteSpace:style.whiteSpace,
      wordBreak:style.wordBreak,
      overflowWrap:style.overflowWrap,
      hyphens:style.hyphens||style.webkitHyphens||'',
      padding:{top:style.paddingTop,right:style.paddingRight,bottom:style.paddingBottom,left:style.paddingLeft},
      margin:{top:style.marginTop,right:style.marginRight,bottom:style.marginBottom,left:style.marginLeft},
      border:{left:style.borderLeftWidth,right:style.borderRightWidth},
      transform:style.transform,
      zoom:style.zoom||'1',
      scale:{x:Number(scaleX.toFixed(4)),y:Number(scaleY.toFixed(4))},
      inlineWrapperCount:root.querySelectorAll('span,b,i,em,strong,a').length,
      hiddenElementCount:[...root.querySelectorAll('*')].filter(node=>{const s=getComputedStyle(node);return s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0;}).length,
      pseudoContent:{before:before.content,after:after.content},
      parentLayout:parent?{display:parent.display,width:parent.width,gridTemplateColumns:parent.gridTemplateColumns,flexBasis:parent.flexBasis}:null,
      topElementAtLastGlyph:topElement?`${topElement.tagName.toLowerCase()}${topElement.id?`#${topElement.id}`:''}`:null,
      semanticLength:semantic.length,
      domTextLength:value.replace(SOFT,'').length,
      visualWrapSerialized:/\n/.test(semantic)&&!root.querySelector('br')&&root.children.length<2
    };
  }

  function syncMeasureBox(editor,measureBox) {
    if(!editor||!measureBox)return null;
    const style=getComputedStyle(editor),rect=editor.getBoundingClientRect();
    for(const key of ['boxSizing','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','wordSpacing','whiteSpace','wordBreak','overflowWrap','hyphens','webkitHyphens','padding','border']){
      try{measureBox.style[key]=style[key];}catch(_){}
    }
    measureBox.style.width=`${rect.width}px`;
    measureBox.lang=editor.lang||rootLanguage(editor)||'ru';
    return {width:rect.width,height:rect.height};
  }

  function rootLanguage(node){return node?.closest?.('[lang]')?.lang||document.documentElement.lang||'ru';}

  global.OcherkiEditorSourceBridge=Object.freeze({semanticText,editorLineDiagnostic,syncMeasureBox});
})(window);
