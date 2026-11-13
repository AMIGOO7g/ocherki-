/* The desk for the Keeper's tour (hybrid view): one sheet of laid paper on the night toile, lit by a small typewriter
   light at its lower edge. The light is a cone from the device that moves with the carriage, fades upward, and leaves
   the far ends of the line dimmer but readable; the sheet's shadow on the desk moves away from the carriage.
   Each step the typewriter types one line; the paper feeds up a line before it. One object lies at the edge of the desk.
   OcherkiDesk.create(host,{base, lamp}) → {el, layout(), show(), hide(), setLines(arr), type(text), finish(), prop(name), rect(), destroy()}
   Needs window.THREE (the Keeper's three.js). */
(()=>{
const CSS=`
.odk{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1.1s ease}
.odk.in{opacity:1}
.odk canvas{position:absolute;inset:0;width:100%;height:100%}
.odk .pg{position:absolute;mix-blend-mode:multiply;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 30px);mask-image:linear-gradient(180deg,transparent 0,#000 30px)}
.odk .ln{position:absolute;left:0;right:0;transition:transform .5s cubic-bezier(.3,.7,.3,1)}
.odk .ln div{margin-top:.25em;white-space:normal;overflow-wrap:break-word;font:700 var(--fs,19px)/1.5 "Courier New",Courier,monospace;letter-spacing:.01em;color:#1a0f08;text-shadow:0 0 .7px rgba(26,15,8,.6),.3px .2px 0 rgba(26,15,8,.35)}
.odk .ln div .n{color:#5a3e28;font-weight:700}
.odk .ln div b{display:inline-block;width:0}
.odk .car{position:absolute;left:0;top:0;width:0;height:0;transition:opacity .8s}
.odk .rail{display:none;position:absolute;height:9px;border-radius:5px;background:linear-gradient(180deg,#3a3430 0%,#141110 45%,#050404 100%);box-shadow:0 1px 0 rgba(255,240,220,.08) inset,0 6px 14px rgba(0,0,0,.7);transition:opacity .8s}
.odk .rail::before,.odk .rail::after{content:"";position:absolute;top:-3px;width:12px;height:15px;border-radius:3px;background:linear-gradient(180deg,#2a2522,#0a0807)}
.odk .rail::before{left:-4px}.odk .rail::after{right:-4px}
.odk .car i{position:absolute;left:-40px;top:0;width:80px;height:26px;border-radius:13px;background:linear-gradient(180deg,#d9d2c8,#a39b90 60%,#7d766d);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 0 1px rgba(0,0,0,.35),0 8px 16px rgba(0,0,0,.55)}
.odk .car i::before,.odk .car i::after{content:"";position:absolute;top:10px;width:6px;height:6px;border-radius:50%}
.odk .car i::before{left:22px;background:#6fe08a;box-shadow:0 0 6px #4fd06e}
.odk .car i::after{left:33px;background:#ffa64a;box-shadow:0 0 6px #ff8a2a,11px 0 0 #4a443e}
.odk .car b{position:absolute;left:-2px;top:-18px;width:4px;height:19px;background:#1c1714;border-radius:1px}
.odk .car b::before{content:"";position:absolute;left:-5px;top:0;width:14px;height:4px;background:#1c1714;border-radius:1px}
.odk.lamp .rail{opacity:0}
.odk.lamp .car{opacity:0}
/* the objects at the edge of the desk: half in the dark, they come and go softly */
.odk .pr{position:absolute;opacity:0;transition:opacity 1.1s ease,translate 1.4s cubic-bezier(.2,.8,.3,1);translate:0 18px}
.odk .pr.on{opacity:1;translate:0 0}
.odk .pr .sh{position:absolute;inset:0;pointer-events:none;background:var(--shade);-webkit-mask:var(--src) center/100% 100% no-repeat;mask:var(--src) center/100% 100% no-repeat}
.odk .pr img{display:block;width:100%;height:auto;filter:drop-shadow(0 24px 30px rgba(0,0,0,.6)) brightness(.78) saturate(.9)}
.odk .pr .disc{position:relative}
.odk .pr .disc img{filter:drop-shadow(0 24px 30px rgba(0,0,0,.6)) brightness(.9)}
.odk .pr img.shine{position:absolute;left:0;top:0;width:100%;height:auto;filter:none;mix-blend-mode:screen;opacity:.9;pointer-events:none}
.odk .pr .lab{position:absolute;left:28.4%;top:28.4%;width:43.2%;height:43.2%;border-radius:50%;background:center/cover;filter:sepia(.45) brightness(.78) contrast(1.05);box-shadow:inset 0 0 0 3px rgba(40,26,16,.6),inset 0 0 22px rgba(0,0,0,.35)}
.odk .pr .hole{position:absolute;left:50%;top:50%;width:3%;height:3%;translate:-50% -50%;border-radius:50%;background:#0b0705;box-shadow:0 0 0 2px rgba(255,220,180,.25)}

.odk .pr.spin .disc{animation:odkSpin 9s linear infinite}
@keyframes odkSpin{to{transform:rotate(360deg)}}
`;
const inject=()=>{if(document.getElementById('odk-css'))return;const s=document.createElement('style');s.id='odk-css';s.textContent=CSS;document.head.appendChild(s);};

const VERT='varying vec2 vU;varying vec2 vP;void main(){vU=uv;vP=(modelMatrix*vec4(position,1.)).xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
// the sheet: paper colour and relief; the desk lamp from the upper left (soft); the carriage light from the device
const SHEET=`varying vec2 vU;uniform sampler2D uC;uniform sampler2D uH;uniform vec2 uTex;uniform vec2 uSize;uniform vec2 uCar;uniform float uCarOn;uniform float uLamp;uniform float uAmp;uniform float uFade;uniform sampler2D uE;uniform vec2 uETex;uniform float uEAmp;uniform float uRail;
  void main(){vec2 uv=vU;vec3 base=texture2D(uC,uv).rgb;
    float hL=texture2D(uH,uv-vec2(uTex.x,0.)).r,hR=texture2D(uH,uv+vec2(uTex.x,0.)).r,hD=texture2D(uH,uv-vec2(0.,uTex.y)).r,hU=texture2D(uH,uv+vec2(0.,uTex.y)).r;
    vec3 N=normalize(vec3((hL-hR)*uAmp,(hD-hU)*uAmp,1.));vec2 p=uv*uSize;
    vec3 Ld=normalize(vec3(-.55,.65,.55));vec2 lq=(uv-vec2(-.12,1.12))*vec2(1.,.8);float lamp=uLamp*(.85+.15*max(dot(N,Ld),0.))*(.4+.55*exp(-dot(lq,lq)*1.1));
    vec3 Ls=vec3(uCar,9.);vec3 dv=vec3(Ls.xy-p,Ls.z);float dist=length(dv.xy);vec3 L=normalize(dv);
    vec2 dir=normalize(p-Ls.xy+vec2(0.,.001));float ang=acos(clamp(dir.y,-1.,1.));
    float cone=smoothstep(.26,.8,dir.y);
    float above=smoothstep(-8.,10.,p.y-Ls.y);
    float fall=1.-.5*smoothstep(0.,uSize.y*.85,dist);fall*=smoothstep(0.,26.,dist)*.25+.75;
    float car=uCarOn*above*cone*fall*(.9+.3*max(dot(N,L),0.));
    // the room: in «Машинка» a quiet grey all over the sheet, a little darker under the device and toward the right
    float amb=mix(lamp*1.04,.42-.1*uv.x-.1*smoothstep(0.,-120.,p.y-Ls.y),uCarOn);
    vec3 pb=mix(base,vec3(dot(base,vec3(.3,.59,.11)))*vec3(1.,.99,.95),.55*uCarOn);
    vec3 c=pb*(vec3(.04,.038,.035)+amb*vec3(.93,.94,.92)+car*.7*vec3(1.,.95,.8));
    // blind emboss: a raised mark in the paper; its edges catch the light (from the device and from the lamp)
    float eL=texture2D(uE,uv-vec2(uETex.x,0.)).a,eR=texture2D(uE,uv+vec2(uETex.x,0.)).a,eD=texture2D(uE,uv-vec2(0.,uETex.y)).a,eU=texture2D(uE,uv+vec2(0.,uETex.y)).a;
    vec2 eg=vec2(eL-eR,eD-eU)*uEAmp;float es=car*dot(eg,normalize(Ls.xy-p+vec2(0.,.001)))+(lamp*1.6+.12)*dot(eg,normalize(vec2(-.55,.65)));
    c*=1.+clamp(es,-.3,.3);
    c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.*2.;
    gl_FragColor=vec4(c,uFade);}`;
// the desk: only the sheet's soft shadow over the night layers below (they stay the same in both lights)
const SHADOW=`varying vec2 vP;uniform vec4 uS;uniform vec2 uOff;uniform float uFade;
  float sdBox(vec2 p,vec2 c,vec2 h){vec2 d=abs(p-c)-h;return length(max(d,0.))+min(max(d.x,d.y),0.);}
  void main(){float sd=sdBox(vP,uS.xy+uOff,uS.zw);float a=.7*(1.-smoothstep(-30.,40.,sd))*uFade;gl_FragColor=vec4(0.,0.,0.,a);}`;

function create(host,o={}){
  inject();const T=window.THREE;if(!T)return null;const B=o.base||'';
  const el=document.createElement('div');el.className='odk';
  el.innerHTML=`<div class="props"></div><canvas></canvas><div class="pg"><div class="ln"></div></div><div class="rail"></div><div class="car"><b></b><i></i></div>`;
  const cv=el.querySelector('canvas'),pg=el.querySelector('.pg'),ln=el.querySelector('.ln'),car=el.querySelector('.car'),props=el.querySelector('.props'),rail=el.querySelector('.rail');
  let R;try{R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(_){return null;}
  R.setClearColor(0,0);R.setPixelRatio(Math.min(2,devicePixelRatio||1));
  const scene=new T.Scene(),cam=new T.OrthographicCamera(0,1,1,0,-10,10);
  const white=new T.DataTexture(new Uint8Array([235,224,214,255]),1,1);white.needsUpdate=true;
  const flat=new T.DataTexture(new Uint8Array([128,128,128,255]),1,1);flat.needsUpdate=true;
  const sm=new T.ShaderMaterial({transparent:true,uniforms:{uC:{value:white},uH:{value:flat},uTex:{value:new T.Vector2(1/1240,1/1754)},uSize:{value:new T.Vector2(1,1)},uCar:{value:new T.Vector2()},uCarOn:{value:1},uLamp:{value:.2},uAmp:{value:.35},uFade:{value:0},uE:{value:null},uETex:{value:new T.Vector2(1/1024,1/1448)},uEAmp:{value:3.6},uRail:{value:-10}},vertexShader:VERT,fragmentShader:SHEET});
  const dm=new T.ShaderMaterial({transparent:true,uniforms:{uS:{value:new T.Vector4()},uOff:{value:new T.Vector2(16,-22)},uFade:{value:0}},vertexShader:VERT,fragmentShader:SHADOW});
  const sheet=new T.Mesh(new T.PlaneGeometry(1,1),sm),desk=new T.Mesh(new T.PlaneGeometry(1,1),dm);desk.position.z=-1;scene.add(desk,sheet);
  const L=new T.TextureLoader();
  L.load(B+'assets/keeper/desk-paper.jpg',t=>{t.encoding=T.sRGBEncoding;t.anisotropy=8;sm.uniforms.uC.value=t;});
  // the emboss: our angel in its ring at the top, the studio's name at the foot — drawn once, blurred a little for a soft relief
  {const ec=document.createElement('canvas');ec.width=2048;ec.height=2896;const ex=ec.getContext('2d');const et=new T.CanvasTexture(ec);sm.uniforms.uE.value=et;
    const blank=document.createElement('canvas');blank.width=blank.height=1;sm.uniforms.uE.value=new T.CanvasTexture(blank);
    const draw=img=>{const tmp=document.createElement('canvas');tmp.width=2048;tmp.height=2896;const tx=tmp.getContext('2d');tx.fillStyle='#fff';
      if(img){const w=230,h=w*img.height/img.width;tx.drawImage(img,1024-w/2,2896*.07-h/2,w,h);}
      tx.textAlign='center';tx.textBaseline='alphabetic';tx.font='70px "SignThatS","Sign That S",Georgia,serif';tx.fillText('Evstafiadi',1024,2896*.142);
      try{tx.letterSpacing='9px';}catch(_){}tx.font='600 22px "Iowan Old Style",Georgia,serif';tx.fillText('МАСТЕРСКАЯ ДИЗАЙНА',1024,2896*.163);
      ex.clearRect(0,0,2048,2896);ex.filter='blur(1.2px)';ex.drawImage(tmp,0,0);et.needsUpdate=true;sm.uniforms.uE.value=et;sm.uniforms.uETex.value.set(1/2048,1/2896);};
    const lg=new Image();lg.onload=()=>{(document.fonts?document.fonts.load('46px "SignThatS"').catch(()=>{}):Promise.resolve()).then(()=>draw(lg));};lg.onerror=()=>draw(null);lg.src=B+'assets/brand/logo-night.png';}
  L.load(B+'assets/keeper/desk-relief.jpg',t=>{t.anisotropy=8;sm.uniforms.uH.value=t;sm.uniforms.uTex.value.set(1/t.image.width,1/t.image.height);});
  // the light: «Машинка» on a computer, the desk lamp on a phone (the cone is small there and the keyboard covers the line)
  const lampOnly=o.lamp??matchMedia('(max-width:600px)').matches;el.classList.toggle('lamp',lampOnly);
  const GO={car:lampOnly?0:1,lamp:lampOnly?1:.2,fade:0};sm.uniforms.uCarOn.value=GO.car;sm.uniforms.uLamp.value=GO.lamp;
  let W=0,H=0,SX=0,SY=0,SW=0,SH=0,EM=40,FS=19,LH=30;const DROP=34;
  const workY=()=>SY+SH*.64;
  // the sheet stands between the heading the pen writes above and the keys below
  const layout=()=>{W=host.clientWidth||innerWidth;H=host.clientHeight||innerHeight;R.setSize(W,H,false);cam.right=W;cam.top=H;cam.updateProjectionMatrix();
    const top=H*.05+110,bot=H*.94-50-26;SH=Math.max(260,bot-top);SW=SH/1.414;if(SW>W-32){SW=W-32;SH=SW*1.414;}SX=(W-SW)/2;SY=top+((bot-top)-SH)/2;
    sheet.scale.set(SW,SH,1);sheet.position.set(SX+SW/2,H-(SY+SH/2),0);sm.uniforms.uSize.value.set(SW,SH);
    desk.scale.set(W,H,1);desk.position.set(W/2,H/2,-1);dm.uniforms.uS.value.set(SX+SW/2,H-(SY+SH/2),SW/2,SH/2);
    EM=Math.round(SW*.075);FS=Math.max(14,Math.min(16,Math.round(SW*.037)));LH=Math.round(FS*1.5);
    const pt=SY+SH*.15;Object.assign(pg.style,{left:SX+EM+'px',top:pt+'px',width:(SW-2*EM)+'px',height:(SY+SH-pt)+'px'});pg.style.setProperty('--fs',FS+'px');
    Object.assign(rail.style,{left:(SX-16)+'px',width:(SW+32)+'px',top:(workY()+DROP+9)+'px'});sm.uniforms.uRail.value=SH-(workY()+DROP+13-SY);
    ln.style.bottom=(SY+SH-workY()-LH/2)+'px';placeProps();follow(true);};
  // the carriage: under the end of the line being typed
  const cur={x:0},tgt={x:0};
  const follow=(snap)=>{const last=ln.lastElementChild,m=last?.querySelector('b');let x=SX+SW/2;if(m){x=m.getBoundingClientRect().left-(host.getBoundingClientRect().left||0);}
    if(centred)x=SX+SW/2;tgt.x=Math.max(SX+30,Math.min(SX+SW-30,x));if(snap)cur.x=tgt.x;};
  // the lines: those of the steps before stay above; the current one is typed at the working line
  let typing=null,shown=[];
  const key=l=>Array.isArray(l)?l.join('|'):String(l);const parts=l=>Array.isArray(l)?[l[0],l[1]?' '+l[1]:'']:[String(l),''];
  const lineEl=(t,n='')=>{const d=document.createElement('div');d.appendChild(document.createTextNode(t));const sp=document.createElement('span');sp.className='n';sp.textContent=n;d.appendChild(sp);d.appendChild(document.createElement('b'));return d;};
  const setLines=arr=>{finish();centred=false;if(arr.length===shown.length&&arr.every((l,k)=>key(l)===key(shown[k])))return;ln.innerHTML='';arr.forEach(l=>ln.appendChild(lineEl(...parts(l))));shown=arr.slice();follow(true);};
  const finish=()=>{if(!typing)return;const tp=typing;typing=null;clearTimeout(tp.t);tp.d.firstChild.textContent=tp.a;tp.d.children[0].textContent=tp.b;shown.push(tp.line);follow();};
  let centred=false;
  const type=(line,onDone,speed=34)=>{finish();centred=false;const[a,b2]=parts(line),text=a+b2;
    // the paper feeds up one line first, then the letters come one by one
    const d=lineEl('');ln.appendChild(d);ln.style.transition='none';ln.style.transform=`translateY(${LH}px)`;void ln.offsetWidth;ln.style.transition='';ln.style.transform='';
    const tp={d,a,b:b2,line,k:0,t:0};typing=tp;
    const step=()=>{if(typing!==tp)return;tp.k++;d.firstChild.textContent=a.slice(0,tp.k);d.children[0].textContent=tp.k>a.length?b2.slice(0,tp.k-a.length):'';follow();nod=performance.now();
      if(tp.k>=text.length){typing=null;shown.push(line);onDone?.();return;}const ch=text[tp.k-1];tp.t=setTimeout(step,1000/speed*(/[,.—]/.test(ch)?3.2:ch===' '?1.4:1)*(.8+Math.random()*.4));};
    tp.t=setTimeout(step,520);};
  // the object at the edge of the desk for each step
  const PROPS={
    stack:{src:'assets/keeper/desk-stack.webp',w:()=>SW*1.42,x:()=>SX+SW/2,y:()=>SY+SH*.5,ax:.5,ay:.5,r:-5,shade:'none',fl:'sepia(.6) saturate(1.3) hue-rotate(-10deg) brightness(.66)'},
    vinyl:{src:'assets/keeper/desk-vinyl-disc.webp',shine:'assets/keeper/desk-vinyl-shine.webp',w:()=>SW*.9,x:()=>SX-SW*.45,y:()=>H-SW*.06,ax:.5,ay:.5,r:0,spin:1,shade:'linear-gradient(200deg,transparent 40%,rgba(8,4,2,.6) 95%)'},
    phone:{src:'assets/keeper/tour-phone.webp',w:()=>SW*.62,x:()=>SX+SW+SW*.28,y:()=>SY+SH*.6,ax:.5,ay:.5,r:-14,shade:'linear-gradient(100deg,transparent 35%,rgba(8,4,2,.7) 92%)'},
    letters:{src:'assets/keeper/desk-letters.webp',w:()=>SW*1.25,x:()=>SX-SW*.5,y:()=>SY+SH*.56,ax:.5,ay:.5,r:5,shade:'linear-gradient(260deg,transparent 40%,rgba(8,4,2,.65) 96%)'},
    spread:{src:'assets/keeper/desk-spread.webp',w:()=>SW*.9,x:()=>SX+SW*.9,y:()=>SY+SH*.5,ax:0,ay:.5,r:-5,shade:'linear-gradient(100deg,transparent 40%,rgba(8,4,2,.65) 96%)'}};
  const prEls={};let prNow='';
  const placeProps=()=>{for(const[n,e] of Object.entries(prEls)){const p=PROPS[n],w=p.w();Object.assign(e.style,{width:w+'px',left:(p.x()-w*p.ax)+'px',top:(e.offsetHeight?p.y()-e.offsetHeight*p.ay:p.y()-w*.5)+'px',rotate:p.r+'deg'});}};
  const prop=name=>{if(name===prNow)return;prNow=name;Object.entries(prEls).forEach(([n,e])=>e.classList.toggle('on',n===name));
    if(name&&!prEls[name]){const p=PROPS[name];if(!p)return;const e=document.createElement('div');e.className='pr'+(p.spin?' spin':'');e.style.setProperty('--shade',p.shade);e.style.setProperty('--src',`url('${B}${p.src}')`);
      const im=new Image();im.src=B+p.src;im.alt='';im.onload=()=>placeProps();if(p.fl)im.style.filter='drop-shadow(0 24px 30px rgba(0,0,0,.6)) '+p.fl;if(p.spin){const dc=document.createElement('div');dc.className='disc';dc.appendChild(im);dc.insertAdjacentHTML('beforeend',`<i class="lab" style="background-image:url('${B}qa/demo-book/photos/grandma_porch.jpg')"></i><i class="hole"></i>`);e.appendChild(dc);if(p.shine){const sh=new Image();sh.className='shine';sh.alt='';sh.src=B+p.shine;e.appendChild(sh);}}else e.appendChild(im);if(p.shade&&p.shade!=='none'){const o=document.createElement('i');o.className='sh';e.appendChild(o);}props.appendChild(e);prEls[name]=e;placeProps();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(prNow===name)e.classList.add('on');}));}};
  // where the Keeper may stand: beside the sheet, on the side away from the object
  const rect=()=>({x:SX,y:SY,w:SW,h:SH,W,H});
  let alive=true,last=performance.now(),nod=0,spread=0;
  const frame=now=>{if(!alive)return;const dt=Math.min(.05,(now-last)/1000);last=now;
    const u=sm.uniforms,f=Math.min(1,dt*2.2),g=Math.min(1,dt*2.6);u.uCarOn.value+=(GO.car-u.uCarOn.value)*f;u.uLamp.value+=(GO.lamp-u.uLamp.value)*f;
    u.uFade.value+=(GO.fade-u.uFade.value)*g;dm.uniforms.uFade.value=u.uFade.value;
    spread+=((centred?1:0)-spread)*Math.min(1,dt*1.6);cur.x+=(tgt.x-cur.x)*Math.min(1,dt*(centred?2.2:12));const DR=DROP;
    const t=(now-nod)/170,k=t<1?Math.pow(1-t,2):0;
    u.uCar.value.set(cur.x-SX,SH-(workY()-SY)-DR);dm.uniforms.uOff.value.set(GO.car>.5?(SX+SW/2-cur.x)*.09:16,GO.car>.5?-14:-22);
    car.style.transform=`translate(${cur.x}px,${workY()+DR+2+1.2*k}px)`;
    R.render(scene,cam);requestAnimationFrame(frame);};
  const ro=new ResizeObserver(()=>layout());ro.observe(host);layout();requestAnimationFrame(frame);
  const centre=()=>{centred=true;follow();};
  return{el,layout,rect,setLines,type,finish,prop,centre,
    get typing(){return!!typing;},
    show(){GO.fade=1;el.classList.add('in');},hide(){GO.fade=0;el.classList.remove('in');prop('');},
    destroy(){alive=false;finish();ro.disconnect();try{R.dispose();R.forceContextLoss?.();}catch(_){}el.remove();}};
}
window.OcherkiDesk={create};
})();
