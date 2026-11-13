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
.odk .pg{position:absolute;mix-blend-mode:multiply;overflow:hidden}
.odk .ln{position:absolute;left:0;right:0;transition:transform .5s cubic-bezier(.3,.7,.3,1)}
.odk .ln div{margin-top:.35em;white-space:normal;overflow-wrap:break-word;font:700 var(--fs,19px)/1.6 "Courier New",Courier,monospace;letter-spacing:.01em;color:#1a0f08;text-shadow:0 0 .7px rgba(26,15,8,.6),.3px .2px 0 rgba(26,15,8,.35)}
.odk .ln div .n{color:#5a3e28;font-weight:700}
.odk .ln div b{display:inline-block;width:0}
.odk .car{position:absolute;left:0;top:0;width:0;height:0;transition:opacity .8s}
.odk .car i{position:absolute;left:-34px;top:0;width:68px;height:22px;border-radius:11px;background:linear-gradient(180deg,#2e2219,#140d08);box-shadow:0 0 0 1px rgba(214,150,96,.35),0 8px 14px rgba(0,0,0,.6)}
.odk .car i::before,.odk .car i::after{content:"";position:absolute;top:8px;width:6px;height:6px;border-radius:50%;background:#ffb35c;box-shadow:0 0 7px #ff9a30}
.odk .car i::before{left:20px}.odk .car i::after{left:31px;background:#ff7a2a}
.odk .car b{position:absolute;left:-1.5px;top:-14px;width:3px;height:15px;background:#20140c;border-radius:2px;box-shadow:0 -2px 0 #b5651d}
.odk.lamp .car{opacity:0}
/* the objects at the edge of the desk: half in the dark, they come and go softly */
.odk .pr{position:absolute;opacity:0;transition:opacity 1.1s ease,translate 1.4s cubic-bezier(.2,.8,.3,1);translate:0 18px}
.odk .pr.on{opacity:1;translate:0 0}
.odk .pr{-webkit-mask-image:var(--shade);mask-image:var(--shade);padding:70px;margin:-70px}
.odk .pr>*{position:relative}
.odk .pr img{display:block;width:100%;height:auto;filter:drop-shadow(0 24px 30px rgba(0,0,0,.6)) brightness(.78) saturate(.9)}
.odk .pr .disc{position:relative;border-radius:50%;box-shadow:0 26px 44px rgba(0,0,0,.6)}
.odk .pr .disc img{clip-path:circle(50%);filter:brightness(.9)}
.odk .pr img.shine{position:absolute;left:70px;top:70px;width:calc(100% - 140px);height:auto;filter:none;mix-blend-mode:screen;opacity:.9;pointer-events:none}
.odk .pr .lab{position:absolute;left:28.2%;top:28.2%;width:43.6%;height:43.6%;border-radius:50%;background:center/cover;filter:sepia(.45) brightness(.78) contrast(1.05);box-shadow:inset 0 0 0 3px rgba(40,26,16,.6),inset 0 0 22px rgba(0,0,0,.35)}
.odk .pr .hole{position:absolute;left:50%;top:50%;width:3%;height:3%;translate:-50% -50%;border-radius:50%;background:#0b0705;box-shadow:0 0 0 2px rgba(255,220,180,.25)}

.odk .pr.spin .disc{animation:odkSpin 9s linear infinite}
@keyframes odkSpin{to{transform:rotate(360deg)}}
`;
const inject=()=>{if(document.getElementById('odk-css'))return;const s=document.createElement('style');s.id='odk-css';s.textContent=CSS;document.head.appendChild(s);};

const VERT='varying vec2 vU;varying vec2 vP;void main(){vU=uv;vP=(modelMatrix*vec4(position,1.)).xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
// the sheet: paper colour and relief; the desk lamp from the upper left (soft); the carriage light from the device
const SHEET=`varying vec2 vU;uniform sampler2D uC;uniform sampler2D uH;uniform vec2 uTex;uniform vec2 uSize;uniform vec2 uCar;uniform float uCarOn;uniform float uLamp;uniform float uAmp;uniform float uFade;uniform sampler2D uE;uniform vec2 uETex;uniform float uEAmp;
  void main(){vec2 uv=vU;vec3 base=texture2D(uC,uv).rgb;
    float hL=texture2D(uH,uv-vec2(uTex.x,0.)).r,hR=texture2D(uH,uv+vec2(uTex.x,0.)).r,hD=texture2D(uH,uv-vec2(0.,uTex.y)).r,hU=texture2D(uH,uv+vec2(0.,uTex.y)).r;
    vec3 N=normalize(vec3((hL-hR)*uAmp,(hD-hU)*uAmp,1.));vec2 p=uv*uSize;
    vec3 Ld=normalize(vec3(-.55,.65,.55));vec2 lq=(uv-vec2(-.12,1.12))*vec2(1.,.8);float lamp=uLamp*(.85+.15*max(dot(N,Ld),0.))*(.4+.55*exp(-dot(lq,lq)*1.1));
    vec3 Ls=vec3(uCar,9.);vec3 dv=vec3(Ls.xy-p,Ls.z);float dist=length(dv.xy);vec3 L=normalize(dv);
    vec2 dir=normalize(p-Ls.xy+vec2(0.,.001));float ang=acos(clamp(dir.y,-1.,1.));
    float core=1.-smoothstep(.85,1.28,ang),tail=.55*(1.-smoothstep(1.28,1.85,ang));float cone=mix(tail,1.,core);
    float above=smoothstep(-46.,6.,p.y-Ls.y);
    float de=length(vec2(dv.x*.45,dv.y));float fall=.16+.84/(1.+pow(de/(uSize.y*.33),1.7));fall*=(smoothstep(0.,110.,dist)*.3+.7)*.9;
    float car=uCarOn*cone*above*fall*(.95+.5*max(dot(N,L),0.));
    vec3 c=base*(vec3(.05,.035,.025)+lamp*vec3(1.,.93,.86)*1.08+car*vec3(1.,.93,.86));
    // blind emboss: a raised mark in the paper; its edges catch the light (from the device and from the lamp)
    float eL=texture2D(uE,uv-vec2(uETex.x,0.)).a,eR=texture2D(uE,uv+vec2(uETex.x,0.)).a,eD=texture2D(uE,uv-vec2(0.,uETex.y)).a,eU=texture2D(uE,uv+vec2(0.,uETex.y)).a;
    vec2 eg=vec2(eL-eR,eD-eU)*uEAmp;float es=car*dot(eg,normalize(Ls.xy-p+vec2(0.,.001)))+lamp*.7*dot(eg,normalize(vec2(-.55,.65)));
    c*=1.+clamp(es,-.24,.24);
    c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.*2.;
    gl_FragColor=vec4(c,uFade);}`;
// the desk: only the sheet's soft shadow over the night layers below (they stay the same in both lights)
const SHADOW=`varying vec2 vP;uniform vec4 uS;uniform vec2 uOff;uniform float uFade;
  float sdBox(vec2 p,vec2 c,vec2 h){vec2 d=abs(p-c)-h;return length(max(d,0.))+min(max(d.x,d.y),0.);}
  void main(){float sd=sdBox(vP,uS.xy+uOff,uS.zw);float a=.7*(1.-smoothstep(-30.,40.,sd))*uFade;gl_FragColor=vec4(0.,0.,0.,a);}`;

function create(host,o={}){
  inject();const T=window.THREE;if(!T)return null;const B=o.base||'';
  const el=document.createElement('div');el.className='odk';
  el.innerHTML=`<div class="props"></div><canvas></canvas><div class="pg"><div class="ln"></div></div><div class="car"><b></b><i></i></div>`;
  const cv=el.querySelector('canvas'),pg=el.querySelector('.pg'),ln=el.querySelector('.ln'),car=el.querySelector('.car'),props=el.querySelector('.props');
  let R;try{R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(_){return null;}
  R.setClearColor(0,0);R.setPixelRatio(Math.min(2,devicePixelRatio||1));
  const scene=new T.Scene(),cam=new T.OrthographicCamera(0,1,1,0,-10,10);
  const white=new T.DataTexture(new Uint8Array([235,224,214,255]),1,1);white.needsUpdate=true;
  const flat=new T.DataTexture(new Uint8Array([128,128,128,255]),1,1);flat.needsUpdate=true;
  const sm=new T.ShaderMaterial({transparent:true,uniforms:{uC:{value:white},uH:{value:flat},uTex:{value:new T.Vector2(1/1240,1/1754)},uSize:{value:new T.Vector2(1,1)},uCar:{value:new T.Vector2()},uCarOn:{value:1},uLamp:{value:.2},uAmp:{value:.35},uFade:{value:0},uE:{value:null},uETex:{value:new T.Vector2(1/1024,1/1448)},uEAmp:{value:2.6}},vertexShader:VERT,fragmentShader:SHEET});
  const dm=new T.ShaderMaterial({transparent:true,uniforms:{uS:{value:new T.Vector4()},uOff:{value:new T.Vector2(16,-22)},uFade:{value:0}},vertexShader:VERT,fragmentShader:SHADOW});
  const sheet=new T.Mesh(new T.PlaneGeometry(1,1),sm),desk=new T.Mesh(new T.PlaneGeometry(1,1),dm);desk.position.z=-1;scene.add(desk,sheet);
  const L=new T.TextureLoader();
  L.load(B+'assets/keeper/desk-paper.jpg',t=>{t.encoding=T.sRGBEncoding;t.anisotropy=8;sm.uniforms.uC.value=t;});
  // the emboss: our angel in its ring at the top, the studio's name at the foot — drawn once, blurred a little for a soft relief
  {const ec=document.createElement('canvas');ec.width=1024;ec.height=1448;const ex=ec.getContext('2d');const et=new T.CanvasTexture(ec);sm.uniforms.uE.value=et;
    const blank=document.createElement('canvas');blank.width=blank.height=1;sm.uniforms.uE.value=new T.CanvasTexture(blank);
    const draw=img=>{const tmp=document.createElement('canvas');tmp.width=1024;tmp.height=1448;const tx=tmp.getContext('2d');tx.fillStyle='#fff';
      if(img){const w=118,h=w*img.height/img.width;tx.drawImage(img,512-w/2,1448*.085-h/2,w,h);}
      tx.textAlign='center';tx.textBaseline='alphabetic';tx.font='38px "SignThatS","Sign That S",Georgia,serif';tx.fillText('Evstafiadi',512,1448*.952);
      try{tx.letterSpacing='5px';}catch(_){}tx.font='600 12px "Iowan Old Style",Georgia,serif';tx.fillText('МАСТЕРСКАЯ ДИЗАЙНА',512,1448*.975);
      ex.clearRect(0,0,1024,1448);ex.filter='blur(1.6px)';ex.drawImage(tmp,0,0);et.needsUpdate=true;sm.uniforms.uE.value=et;};
    const lg=new Image();lg.onload=()=>{(document.fonts?document.fonts.load('46px "SignThatS"').catch(()=>{}):Promise.resolve()).then(()=>draw(lg));};lg.onerror=()=>draw(null);lg.src=B+'assets/brand/logo-night.png';}
  L.load(B+'assets/keeper/desk-relief.jpg',t=>{t.anisotropy=8;sm.uniforms.uH.value=t;sm.uniforms.uTex.value.set(1/t.image.width,1/t.image.height);});
  // the light: «Машинка» on a computer, the desk lamp on a phone (the cone is small there and the keyboard covers the line)
  const lampOnly=o.lamp??matchMedia('(max-width:600px)').matches;el.classList.toggle('lamp',lampOnly);
  const GO={car:lampOnly?0:1,lamp:lampOnly?1:.2,fade:0};sm.uniforms.uCarOn.value=GO.car;sm.uniforms.uLamp.value=GO.lamp;
  let W=0,H=0,SX=0,SY=0,SW=0,SH=0,EM=40,FS=19,LH=30;const DROP=48;
  const workY=()=>SY+SH*.78;
  // the sheet stands between the heading the pen writes above and the keys below
  const layout=()=>{W=host.clientWidth||innerWidth;H=host.clientHeight||innerHeight;R.setSize(W,H,false);cam.right=W;cam.top=H;cam.updateProjectionMatrix();
    const top=H*.05+110,bot=H*.94-50-26;SH=Math.max(260,bot-top);SW=SH/1.414;if(SW>W-32){SW=W-32;SH=SW*1.414;}SX=(W-SW)/2;SY=top+((bot-top)-SH)/2;
    sheet.scale.set(SW,SH,1);sheet.position.set(SX+SW/2,H-(SY+SH/2),0);sm.uniforms.uSize.value.set(SW,SH);
    desk.scale.set(W,H,1);desk.position.set(W/2,H/2,-1);dm.uniforms.uS.value.set(SX+SW/2,H-(SY+SH/2),SW/2,SH/2);
    EM=Math.round(SW*.075);FS=Math.max(14,Math.min(18,Math.round(SW*.04)));LH=Math.round(FS*1.6);
    Object.assign(pg.style,{left:SX+EM+'px',top:SY+'px',width:(SW-2*EM)+'px',height:SH+'px'});pg.style.setProperty('--fs',FS+'px');
    ln.style.bottom=(SH-(workY()-SY)-LH/2)+'px';placeProps();follow(true);};
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
    vinyl:{src:'assets/keeper/desk-vinyl-disc.webp',shine:'assets/keeper/desk-vinyl-shine.webp',w:()=>SW*.9,x:()=>SX-SW*.45,y:()=>H-SW*.06,ax:.5,ay:.5,r:0,spin:1,shade:'linear-gradient(20deg,rgba(0,0,0,.15) 25%,#000 70%)'},
    phone:{src:'assets/keeper/tour-phone.webp',w:()=>SW*.62,x:()=>SX+SW+SW*.28,y:()=>SY+SH*.6,ax:.5,ay:.5,r:-14,shade:'linear-gradient(280deg,rgba(0,0,0,.1) 25%,#000 75%)'},
    letters:{src:'assets/keeper/desk-letters.webp',w:()=>SW*1.25,x:()=>SX-SW*.5,y:()=>SY+SH*.56,ax:.5,ay:.5,r:5,shade:'radial-gradient(ellipse 41% 39% at 52% 50%,#000 60%,rgba(0,0,0,.35) 84%,transparent 100%)'},
    spread:{src:'assets/keeper/desk-spread.webp',w:()=>SW*.9,x:()=>SX+SW*.9,y:()=>SY+SH*.5,ax:0,ay:.5,r:-5,shade:'linear-gradient(290deg,rgba(0,0,0,.1) 25%,#000 72%)'}};
  const prEls={};let prNow='';
  const placeProps=()=>{for(const[n,e] of Object.entries(prEls)){const p=PROPS[n],w=p.w();Object.assign(e.style,{width:w+'px',left:(p.x()-w*p.ax)+'px',top:(e.offsetHeight>140?p.y()-(e.offsetHeight-140)*p.ay:p.y()-w*.5)+'px',rotate:p.r+'deg'});}};
  const prop=name=>{if(name===prNow)return;prNow=name;Object.entries(prEls).forEach(([n,e])=>e.classList.toggle('on',n===name));
    if(name&&!prEls[name]){const p=PROPS[name];if(!p)return;const e=document.createElement('div');e.className='pr'+(p.spin?' spin':'');e.style.setProperty('--shade',p.shade);
      const im=new Image();im.src=B+p.src;im.alt='';im.onload=()=>placeProps();if(p.fl)im.style.filter='drop-shadow(0 24px 30px rgba(0,0,0,.6)) '+p.fl;if(p.spin){const dc=document.createElement('div');dc.className='disc';dc.appendChild(im);dc.insertAdjacentHTML('beforeend',`<i class="lab" style="background-image:url('${B}qa/demo-book/photos/grandma_porch.jpg')"></i><i class="hole"></i>`);e.appendChild(dc);if(p.shine){const sh=new Image();sh.className='shine';sh.alt='';sh.src=B+p.shine;e.appendChild(sh);}}else e.appendChild(im);props.appendChild(e);prEls[name]=e;placeProps();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(prNow===name)e.classList.add('on');}));}};
  // where the Keeper may stand: beside the sheet, on the side away from the object
  const rect=()=>({x:SX,y:SY,w:SW,h:SH,W,H});
  let alive=true,last=performance.now(),nod=0,spread=0;
  const frame=now=>{if(!alive)return;const dt=Math.min(.05,(now-last)/1000);last=now;
    const u=sm.uniforms,f=Math.min(1,dt*2.2),g=Math.min(1,dt*2.6);u.uCarOn.value+=(GO.car-u.uCarOn.value)*f;u.uLamp.value+=(GO.lamp-u.uLamp.value)*f;
    u.uFade.value+=(GO.fade-u.uFade.value)*g;dm.uniforms.uFade.value=u.uFade.value;
    spread+=((centred?1:0)-spread)*Math.min(1,dt*1.6);cur.x+=(tgt.x-cur.x)*Math.min(1,dt*(centred?2.2:12));const DR=DROP+14*spread;
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
