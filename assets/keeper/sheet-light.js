/* The editor's sheet: laid paper (vergé) and two lights, the same as in the Keeper's tour.
   «Лампа» — an even desk lamp from the upper left (the default, for long work);
   «Машинка» — the small typewriter light: the device rides under the line where the caret is, its soft cone lights
   that line and a few above it, the rest of the sheet stays in a quiet grey; it follows the caret wherever one clicks.
   Only the picture under the words changes: the text stays real text, nothing of this goes to print.
   OcherkiSheetLight.attach(sheetEl, {base, editor, mode, onMode}) → {mode(m), refresh(), destroy()} */
(()=>{
const CSS=`
.osl-cv{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;transition:opacity .9s ease}
.osl-on .osl-cv{opacity:1}
.sheet.active.osl-on{background:#e9e2d8!important}
.osl-on .paper::before,.osl-on .paper::after{display:none!important}
/* on the laid paper the hints read clearly: darker ink, the same italic */
.osl-on .pf-input::placeholder,.osl-on .pf-text::placeholder{color:#8a7462!important}
.osl-on .editor [data-sample],.osl-on .editor .sample-lead,.osl-on .editor .sample-body{color:#7d6656!important;opacity:.85!important}
.osl-car{position:absolute;left:0;top:0;width:0;height:0;z-index:40;pointer-events:none;opacity:0;transition:opacity .7s ease}
.osl-type .osl-car{opacity:1}
.osl-car i{position:absolute;left:-30px;top:0;width:60px;height:20px;border-radius:10px;background:linear-gradient(180deg,#d9d2c8,#a39b90 60%,#7d766d);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 0 1px rgba(0,0,0,.3),0 6px 12px rgba(0,0,0,.45)}
.osl-car i::before,.osl-car i::after{content:"";position:absolute;top:8px;width:5px;height:5px;border-radius:50%}
.osl-car i::before{left:16px;background:#6fe08a;box-shadow:0 0 5px #4fd06e}
.osl-car i::after{left:25px;background:#ffa64a;box-shadow:0 0 5px #ff8a2a,9px 0 0 #4a443e}
.osl-car b{position:absolute;left:-1.5px;top:-13px;width:3px;height:14px;background:#1c1714;border-radius:1px}
.osl-car b::before{content:"";position:absolute;left:-4px;top:0;width:11px;height:3px;background:#1c1714;border-radius:1px}
/* the two keys in the sheet's top line */
.osl-keys{display:inline-flex;gap:2px;margin-right:4px;vertical-align:middle}
.osl-keys button{width:30px;height:30px;display:inline-grid;place-items:center;border:0;border-radius:50%;background:none;color:inherit;opacity:.55;cursor:pointer;transition:opacity .3s,background .3s,box-shadow .4s}
.osl-keys button:hover{opacity:.95;background:rgba(160,110,60,.1)}
.osl-keys button.on{opacity:1;box-shadow:0 0 0 1px rgba(170,110,50,.45),0 0 10px rgba(255,170,90,.35)}
.osl-keys svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.sheet.ghost.osl-ghost{filter:brightness(.86) sepia(.12)}
`;
const VERT='varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const FRAG=`varying vec2 vU;uniform sampler2D uC;uniform sampler2D uH;uniform vec2 uTex;uniform vec2 uSize;uniform vec2 uCar;uniform float uCarOn;uniform float uLamp;uniform float uAmp;uniform float uNight;
  void main(){vec2 uv=vU;vec3 base=texture2D(uC,uv).rgb;
    float hL=texture2D(uH,uv-vec2(uTex.x,0.)).r,hR=texture2D(uH,uv+vec2(uTex.x,0.)).r,hD=texture2D(uH,uv-vec2(0.,uTex.y)).r,hU=texture2D(uH,uv+vec2(0.,uTex.y)).r;
    vec3 N=normalize(vec3((hL-hR)*uAmp,(hD-hU)*uAmp,1.));vec2 p=uv*uSize;
    // the desk lamp from the upper left: by day almost even, at night warmer and softer toward the lower right
    vec3 Ld=normalize(vec3(-.55,.65,.55));vec2 lq=(uv-vec2(-.12,1.12))*vec2(1.,.8);
    float lamp=uLamp*(.88+.12*max(dot(N,Ld),0.))*mix(1.02,(.86+.2*exp(-dot(lq,lq)*1.1)),uNight);
    // the typewriter light, as in the tour
    vec3 Ls=vec3(uCar,9.);vec3 dv=vec3(Ls.xy-p,Ls.z);float dist=length(dv.xy);vec3 L=normalize(dv);
    vec2 dir=normalize(p-Ls.xy+vec2(0.,.001));
    float cone=smoothstep(.26,.8,dir.y);float above=smoothstep(-8.,10.,p.y-Ls.y);
    float fall=1.-.5*smoothstep(0.,uSize.y*.85,dist);fall*=smoothstep(0.,26.,dist)*.25+.75;
    float car=uCarOn*above*cone*fall*(.9+.3*max(dot(N,L),0.));
    float amb=mix(lamp,.6-.08*uv.x-.1*smoothstep(0.,-120.,p.y-Ls.y),uCarOn);
    vec3 pb=mix(base,vec3(dot(base,vec3(.3,.59,.11)))*vec3(1.,.99,.95),.5*uCarOn);
    vec3 col=mix(vec3(1.),vec3(1.,.97,.92),uNight*(1.-uCarOn));
    vec3 c=pb*(vec3(.04,.038,.035)+amb*col+car*.7*vec3(1.,.95,.8));
    c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.*2.;
    gl_FragColor=vec4(c,1.);}`;
let threeP=null;
const loadThree=base=>window.THREE?Promise.resolve():threeP||(threeP=new Promise((ok,no)=>{const s=document.createElement('script');s.src=base+'assets/vendor/three/three.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s);}));
function attach(sheet,o={}){
  const B=o.base||'';if(!document.getElementById('osl-css')){const st=document.createElement('style');st.id='osl-css';st.textContent=CSS;document.head.appendChild(st);}
  const cv=document.createElement('canvas');cv.className='osl-cv';sheet.insertBefore(cv,sheet.firstChild);
  const car=document.createElement('div');car.className='osl-car';car.innerHTML='<b></b><i></i>';sheet.appendChild(car);
  let mode=o.mode||'lamp',alive=true,R=null,scene,cam,U=null,dirty=true;
  const GO={car:mode==='type'?1:0,night:document.body.classList.contains('host-night')?1:0};
  const cur={x:0,y:0},tgt={x:0,y:0};
  // where the caret is, in the sheet's own pixels (y from the top)
  const caret=()=>{const ed=o.editor||sheet.querySelector('[contenteditable="true"]');const sel=getSelection();const r=sheet.getBoundingClientRect();
    let rc=null;if(sel.rangeCount&&ed&&ed.contains(sel.anchorNode)){const rg=sel.getRangeAt(0).cloneRange();rg.collapse(true);rc=rg.getClientRects()[0];
      if(!rc){const n=sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement;rc=n&&n.getBoundingClientRect();}}
    if(!rc||!rc.height){const e=ed&&ed.getBoundingClientRect();if(!e)return null;return{x:e.left-r.left+e.width/2,y:e.top-r.top+40};}
    const sc=r.width/sheet.offsetWidth||1;return{x:(rc.left-r.left)/sc,y:(rc.bottom-r.top)/sc};};
  const follow=snap=>{const c=caret();if(!c)return;tgt.x=Math.max(30,Math.min(sheet.offsetWidth-30,c.x));tgt.y=Math.min(sheet.offsetHeight-14,c.y+20);if(snap){cur.x=tgt.x;cur.y=tgt.y;}dirty=true;};
  const onSel=()=>{if(mode==='type')follow();};document.addEventListener('selectionchange',onSel);
  const ro=new ResizeObserver(()=>{if(!R)return;R.setSize(sheet.offsetWidth,sheet.offsetHeight,false);U.uSize.value.set(sheet.offsetWidth,sheet.offsetHeight);dirty=true;follow(true);});
  const nightObs=new MutationObserver(()=>{GO.night=document.body.classList.contains('host-night')?1:0;dirty=true;});nightObs.observe(document.body,{attributes:true,attributeFilter:['class']});
  loadThree(B).then(()=>{if(!alive)return;const T=window.THREE;
    try{R=new T.WebGLRenderer({canvas:cv,antialias:false,alpha:false});}catch(_){return;}
    R.setPixelRatio(Math.min(2,devicePixelRatio||1));scene=new T.Scene();cam=new T.OrthographicCamera(-.5,.5,.5,-.5,-1,1);
    const px=new T.DataTexture(new Uint8Array([240,232,222,255]),1,1);px.needsUpdate=true;const fl=new T.DataTexture(new Uint8Array([128,128,128,255]),1,1);fl.needsUpdate=true;
    U={uC:{value:px},uH:{value:fl},uTex:{value:new T.Vector2(1/1240,1/1754)},uSize:{value:new T.Vector2(1,1)},uCar:{value:new T.Vector2()},uCarOn:{value:GO.car},uLamp:{value:1},uAmp:{value:.35},uNight:{value:GO.night}};
    scene.add(new T.Mesh(new T.PlaneGeometry(1,1),new T.ShaderMaterial({uniforms:U,vertexShader:VERT,fragmentShader:FRAG})));
    const L=new T.TextureLoader();
    L.load(B+'assets/keeper/desk-paper.jpg',t=>{t.encoding=T.sRGBEncoding;t.anisotropy=8;U.uC.value=t;dirty=true;sheet.classList.add('osl-on');});
    L.load(B+'assets/keeper/desk-relief.jpg',t=>{t.anisotropy=8;U.uH.value=t;U.uTex.value.set(1/t.image.width,1/t.image.height);dirty=true;});
    R.setSize(sheet.offsetWidth,sheet.offsetHeight,false);U.uSize.value.set(sheet.offsetWidth,sheet.offsetHeight);ro.observe(sheet);follow(true);requestAnimationFrame(frame);});
  // the ghost sheets of the pile: the same paper, a little darker
  document.querySelectorAll('.sheet.ghost').forEach(g=>{g.classList.add('osl-ghost');g.style.setProperty('background',`url('${B}assets/keeper/desk-paper.jpg') center/cover`,'important');});
  let last=performance.now();
  const frame=now=>{if(!alive)return;const dt=Math.min(.05,(now-last)/1000);last=now;
    const k=Math.min(1,dt*2.2);let moving=false;
    const st=(u,g)=>{const d=g-u.value;if(Math.abs(d)>.002){u.value+=d*k;moving=true;}else u.value=g;};
    st(U.uCarOn,GO.car);st(U.uNight,GO.night);
    const m=Math.min(1,dt*10);if(Math.abs(tgt.x-cur.x)>.3||Math.abs(tgt.y-cur.y)>.3){cur.x+=(tgt.x-cur.x)*m;cur.y+=(tgt.y-cur.y)*m;moving=true;}
    if(moving||dirty){const H=sheet.offsetHeight;U.uCar.value.set(cur.x,H-cur.y-2);R.render(scene,cam);dirty=false;car.style.transform=`translate(${cur.x}px,${cur.y}px)`;}
    requestAnimationFrame(frame);};
  const setMode=m=>{mode=m==='type'?'type':'lamp';GO.car=mode==='type'?1:0;sheet.classList.toggle('osl-type',mode==='type');if(mode==='type')follow(true);dirty=true;
    try{localStorage.setItem('ocherkiSheetLight',mode);}catch(_){}o.onMode?.(mode);};
  setMode(mode);
  return{mode:setMode,get current(){return mode;},refresh(){dirty=true;follow();},
    destroy(){alive=false;document.removeEventListener('selectionchange',onSel);ro.disconnect();nightObs.disconnect();try{R&&R.dispose();}catch(_){}cv.remove();car.remove();sheet.classList.remove('osl-on','osl-type');}};
}
window.OcherkiSheetLight={attach};
})();
