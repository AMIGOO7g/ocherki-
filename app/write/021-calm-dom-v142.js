/*@block [" id=\"calm-dom-v142\"", ""]*/
// v142 — no-op writes no longer reach the page: removing a class that is not there, adding one that is, setting an attribute
// to the value it already has. Each such write used to count as a change, woke every observer, and they woke each other —
// a loop running every frame. Now a write happens only when something really changes.
(()=>{const T=DOMTokenList.prototype,add=T.add,rem=T.remove,tog=T.toggle,sa=Element.prototype.setAttribute;
  T.remove=function(...t){if(t.some(x=>this.contains(x)))return rem.apply(this,t);};
  T.add=function(...t){if(t.some(x=>!this.contains(x)))return add.apply(this,t);};
  T.toggle=function(t,f){if(f===undefined)return tog.call(this,t);const has=this.contains(t);if(!!f===has)return has;return tog.call(this,t,f);};
  Element.prototype.setAttribute=function(n,v){if(this.getAttribute(n)===String(v))return;return sa.call(this,n,v);};})();
