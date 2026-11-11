/* Хранитель историй — Three.js. The Keeper drawn from the reference: copper ribbons in space around a dark head, a pen for a foot.
   He floats and breathes, follows the cursor with his eyes, flows into the pen to write, gathers into a spark to fly away and unfolds out of it.
   Needs three.js r147 with EffectComposer, RenderPass, ShaderPass, UnrealBloomPass (assets/vendor/three/). */
window.OcherkiKeeper3D={create(canvas,opts={}){

let renderer;try{if(!window.THREE)throw 0;renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){return null;}
const MODE=null;const WORDS=opts.words||'Очерки жизни';
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x000000);   // black: the canvas is laid over the page with «screen», so black is see-through
const camera=new THREE.PerspectiveCamera(30,1,.1,200);
// multisampled target: no stair-steps on the thin edges of the ribbons
const rt=new THREE.WebGLRenderTarget(16,16,{samples:renderer.capabilities.isWebGL2?4:0});
const composer=new THREE.EffectComposer(renderer,rt);composer.addPass(new THREE.RenderPass(scene,camera));
const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(512,512),.9,.65,.2);composer.addPass(bloom);

// ——— the drawing, measured from the reference (crop 860×980), world units (1 = 100 px), y up ———
const W=(x,y,z=0)=>new THREE.Vector3((x-430)/100,-(y-470)/100,z/100);
const RIB=[ // x,y,z(toward us),width ; tw: twist (turns at start, along) ; l: light ; side: which edge burns
 {p:[[347,98,-60,1],[352,72,-50,5],[372,52,-40,8],[400,45,-30,11],[432,52,-20,14],[458,70,-10,18]],tw:[.02,.04],l:.8,side:1},
 {p:[[458,70,-10,18],[486,100,10,32],[502,142,40,46],[494,184,70,52],[458,212,95,52],[398,232,110,48],[328,252,110,44],[268,288,100,38],[224,334,85,28],[200,380,70,18],[192,420,55,9],[198,448,45,2]],tw:[0,.14],l:.95,side:-1},
 {p:[[402,236,70,4],[340,262,72,22],[282,298,70,30],[244,348,66,26],[238,398,62,18],[262,440,58,9],[304,468,54,2]],tw:[.04,.1],l:.55,side:-1},
 {p:[[478,246,40,2],[492,280,52,7],[520,316,58,11],[544,358,62,14],[550,402,64,13],[538,446,62,10],[512,478,58,6],[484,500,52,2]],tw:[0,.04],l:.8,side:1},
 {p:[[470,506,10,3],[430,507,30,24],[360,512,55,44],[272,530,75,58],[186,564,85,60],[118,604,80,50],[76,650,70,34],[64,698,55,16],[86,732,45,6],[130,746,40,1]],tw:[0,.16],l:.95,side:-1},
 {p:[[470,506,0,3],[492,548,15,22],[488,598,30,42],[452,638,45,54],[384,664,55,58],[314,694,55,54],[268,736,45,46],[256,786,35,32],[268,818,25,16],[282,830,20,4]],tw:[.04,.14],l:.95,side:1},
 {p:[[440,556,-25,3],[380,592,-15,20],[318,640,-5,32],[278,698,5,36],[264,756,10,26],[272,804,12,12],[284,826,14,3]],tw:[.08,.12],l:.65,side:-1},
];
const LOWER=5;
// the head: the drop rises into a tip that leans up and to the right, into the crest
const HEAD=[[486,170],[482,214],[478,262],[504,302],[538,346],[551,400],[536,452],[500,490],[470,506],[400,500],[322,476],[258,442],[222,396],[218,344],[246,294],[300,248],[362,222],[420,206],[460,188]];
const LOWB=[[470,506],[488,548],[484,594],[450,630],[384,656],[312,684],[266,726],[254,780],[268,816],[290,830],[306,800],[312,750],[344,700],[410,672],[440,640],[430,590],[395,550],[340,525],[400,512]];
const INK=[[150,934],[230,928],[330,906],[430,874],[520,844],[600,822],[648,822],[668,846],[690,880],[730,880],[800,860],[860,842]];

const world=new THREE.Group();scene.add(world);          // where he floats
const keeper=new THREE.Group();world.add(keeper);        // his body, turns and scales

const halo=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{uA:{value:1}},
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 v;uniform float uA;void main(){float d=length(v-vec2(.49,.52));gl_FragColor=vec4(vec3(.3,.085,.022)*exp(-d*d*26.)*.6*uA,1.);}',blending:THREE.AdditiveBlending}));
halo.position.z=-4;halo.renderOrder=-10;scene.add(halo);

// ribbons: soft body, one burning edge; both borders fade out over a few pixels, so nothing is ever cut hard
const ribMat=side=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  uniforms:{uS:{value:side},uA:{value:1}},
  vertexShader:`attribute float aSide;attribute float aB;varying float vS;varying float vB;void main(){vS=aSide;vB=aB;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying float vS;varying float vB;uniform float uS;uniform float uA;
   void main(){float s=vS*uS;float as=abs(vS);
     float border=smoothstep(1.,.8,as);
     float edge=smoothstep(.45,.8,s)*smoothstep(1.,.86,s);
     vec3 deep=vec3(.55,.17,.04),mid=vec3(.92,.45,.15),hot=vec3(1.,.78,.48);
     vec3 c=mix(deep,mid,.3+.45*(s*.5+.5));c=mix(c,hot,edge*.8);
     float a=(.26+.22*(s*.5+.5))*border+edge*.95;
     gl_FragColor=vec4(c*a*vB*uA,1.);}`});
const N=170;
function makeStrip(side){const g=new THREE.BufferGeometry();
  const pos=new Float32Array(N*2*3),sd=new Float32Array(N*2),br=new Float32Array(N*2),idx=[];
  for(let i=0;i<N;i++){sd[i*2]=1;sd[i*2+1]=-1;if(i<N-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aSide',new THREE.BufferAttribute(sd,1));g.setAttribute('aB',new THREE.BufferAttribute(br,1));g.setIndex(idx);
  const m=new THREE.Mesh(g,ribMat(side));m.frustumCulled=false;keeper.add(m);return m;}
const ribbons=RIB.map(d=>makeStrip(d.side));
const ink=makeStrip(0);ink.material.uniforms.uS.value=0;

function shapeOf(pts){const s=new THREE.Shape();const crv=new THREE.CatmullRomCurve3(pts.map(q=>{const v=W(q[0],q[1]);return new THREE.Vector3(v.x,v.y,0);}),true,'centripetal');const sp=crv.getPoints(160);
  s.moveTo(sp[0].x,sp[0].y);for(let i=1;i<sp.length;i++)s.lineTo(sp[i].x,sp[i].y);return s;}
const rimMat=(base,rim,op=1)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{uOp:{value:op}},
  vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:`varying vec3 vN;varying vec3 vV;uniform float uOp;void main(){float f=pow(1.-abs(dot(vN,vV)),3.);
    vec3 c=mix(vec3(${'${base}'}),vec3(${'${rim}'}),f);gl_FragColor=vec4(c,uOp);}`.replace("${base}",'BASE').replace("${rim}",'RIM')});
const rimMat2=(base,rim,op=1)=>{const m=rimMat(base,rim,op);m.fragmentShader=m.fragmentShader.replace('BASE',base).replace('RIM',rim);return m;};
const extr=(pts,d,b)=>{const g=new THREE.ExtrudeGeometry(shapeOf(pts),{depth:d,bevelEnabled:true,bevelThickness:b,bevelSize:b*.18,bevelSegments:14,curveSegments:80});g.translate(0,0,-d/2);return g;};
const head=new THREE.Mesh(extr(HEAD,.2,.32),rimMat2('.04,.011,.005','.7,.26,.07'));keeper.add(head);
const lowb=new THREE.Mesh(extr(LOWB,.16,.2),rimMat2('.04,.012,.005','.42,.15,.05',.3));lowb.position.z=.05;keeper.add(lowb);

const eyeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,uniforms:{uB:{value:1},uK:{value:1}},
  vertexShader:'varying vec2 v;void main(){v=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 v;uniform float uB;uniform float uK;void main(){vec2 p=v*vec2(1.,1./max(uB,.06));
    float up=.55-.55*p.x*p.x,lo=-.42+.42*p.x*p.x;float d=max(p.y-up,lo-p.y);
    float core=smoothstep(.07,-.05,d)*smoothstep(1.,.9,abs(p.x));
    float glow=exp(-max(d,0.)*9.)*smoothstep(1.2,.6,abs(p.x));
    vec3 c=vec3(1.,.88,.6)*core*1.15+vec3(1.,.55,.2)*glow*.55;gl_FragColor=vec4(c*uK,1.);}`});
const eyes=[[418,412,-.28],[512,404,.28]].map(([x,y,r])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.62,.5),eyeMat);m.rotation.z=r;keeper.add(m);m.userData.base=W(x,y,0);return m;});

// the pen: belongs to him — it sits at the end of the lower ribbon and writes when he lies down
const nibS=new THREE.Shape();nibS.moveTo(0,.58);nibS.bezierCurveTo(.16,.5,.22,.3,.2,.1);nibS.lineTo(.03,-.48);nibS.lineTo(0,-.54);nibS.lineTo(-.03,-.48);nibS.lineTo(-.2,.1);nibS.bezierCurveTo(-.22,.3,-.16,.5,0,.58);
const hole=new THREE.Path();hole.absarc(0,.14,.065,0,Math.PI*2,true);nibS.holes.push(hole);
const nibGeo=new THREE.ExtrudeGeometry(nibS,{depth:.04,bevelEnabled:true,bevelThickness:.03,bevelSize:.02,bevelSegments:4});nibGeo.translate(0,.54,0);
const nib=new THREE.Mesh(nibGeo,rimMat2('.8,.38,.12','1.,.84,.52'));
const slit=new THREE.Mesh(new THREE.PlaneGeometry(.022,.62),new THREE.MeshBasicMaterial({color:0x200803,transparent:true,depthTest:false}));slit.position.set(0,.33,.09);slit.renderOrder=9;nib.add(slit);
nib.scale.setScalar(1.4);world.add(nib);

// handwriting the pen leaves on the line
const tc=document.createElement('canvas');tc.width=2048;tc.height=360;const tx2=tc.getContext('2d');
const tTex=new THREE.CanvasTexture(tc);
function paintWords(w){tx2.clearRect(0,0,2048,360);tx2.font='210px '+(opts.font||'"SignThatS", "Marck Script", cursive');tx2.fillStyle='#fff';tx2.textBaseline='alphabetic';tx2.fillText(w,40,250);tTex.needsUpdate=true;
  return Math.min(2008,tx2.measureText(w).width+80)/2048;}
let wordsW=paintWords(WORDS);
if(document.fonts)document.fonts.load('210px '+(opts.font||'"SignThatS"')).then(()=>{wordsW=paintWords(WORDS);}).catch(()=>{});
const words=new THREE.Mesh(new THREE.PlaneGeometry(6.2,6.2*360/2048),new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
  uniforms:{uT:{value:tTex},uR:{value:0},uA:{value:0},uW:{value:wordsW}},
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 v;uniform sampler2D uT;uniform float uR;uniform float uA;uniform float uW;void main(){float a=texture2D(uT,v).r;
    float rx=uR*uW;float reveal=smoothstep(rx+.004,rx-.01,v.x);float fresh=exp(-max(rx-v.x,0.)*40.);
    vec3 c=mix(vec3(.95,.55,.22),vec3(1.,.86,.6),fresh);gl_FragColor=vec4(c*a*reveal*uA*1.1,1.);}`}));
world.add(words);

// the ember he becomes when he leaves, and grows from when he comes back
const ec=document.createElement('canvas');ec.width=ec.height=128;{const g=ec.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,240,210,1)');r.addColorStop(.2,'rgba(255,170,80,.9)');r.addColorStop(.55,'rgba(255,110,30,.25)');r.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=r;g.fillRect(0,0,128,128);}
const ember=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(ec),blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,transparent:true}));ember.scale.setScalar(.001);scene.add(ember);

// glowing dust around him
const DN=90,dg=new THREE.BufferGeometry(),dp=new Float32Array(DN*3),dph=new Float32Array(DN),dsp=new Float32Array(DN),dsz=new Float32Array(DN);
for(let i=0;i<DN;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random());dp[i*3]=Math.cos(a)*r*3.6-.2;dp[i*3+1]=Math.random()*9-4.8;dp[i*3+2]=(Math.random()-.5)*2.4;dph[i]=Math.random()*100;dsp[i]=.12+Math.random()*.25;dsz[i]=.5+Math.random()*1.1;}
dg.setAttribute('position',new THREE.BufferAttribute(dp,3));dg.setAttribute('aP',new THREE.BufferAttribute(dph,1));dg.setAttribute('aS',new THREE.BufferAttribute(dsp,1));dg.setAttribute('aZ',new THREE.BufferAttribute(dsz,1));
const dust=new THREE.Points(dg,new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uA:{value:1},uPR:{value:renderer.getPixelRatio()}},
  vertexShader:`attribute float aP;attribute float aS;attribute float aZ;uniform float uT;uniform float uPR;varying float vA;
    void main(){vec3 p=position;float y=mod(p.y+4.8+uT*aS,9.)-4.8;p.y=y;p.x+=sin(uT*.35+aP)*.22+sin(uT*.9+aP*2.)*.06;p.z+=cos(uT*.3+aP)*.15;
      float tw=.5+.5*sin(uT*(1.3+aS*3.)+aP*7.);vA=tw*tw*smoothstep(-4.8,-3.6,y)*smoothstep(4.2,2.4,y);
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=aZ*uPR*(5.+3.*tw)*(16./-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;uniform float uA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;
    gl_FragColor=vec4(vec3(1.,.72,.38)*a*vA*uA*.9,1.);}`}));
dust.renderOrder=4;world.add(dust);

// ——— soft springs: every move eases in, overshoots a little, settles ———
const spring=(v,k=10,z=.82)=>({v,t:v,vel:0,k,z});
function step(s,dt){const a=s.k*(s.t-s.v)-2*s.z*Math.sqrt(s.k)*s.vel;s.vel+=a*dt;s.v+=s.vel*dt;}
const S={x:spring(0,5,.8),y:spring(0,5,.8),sc:spring(1,6,.72),yaw:spring(0,4,.9),pitch:spring(0,4,.9),form:spring(1,3,1),emb:spring(0,6,.85),ex:spring(0,3,.85),ey:spring(.3,3,.85)};
const tmpV=new THREE.Vector3(),T_=new THREE.Vector3(),B0=new THREE.Vector3(),N0=new THREE.Vector3(),OFF=new THREE.Vector3(),RN=new THREE.Vector3(),Z=new THREE.Vector3(0,0,1);
const inkCurve=new THREE.CatmullRomCurve3(INK.map(q=>W(q[0],q[1],20)),false,'centripetal');const inkPts=inkCurve.getSpacedPoints(80);
const inkDef={p:INK.map(q=>[q[0],q[1],20,8]),tw:[0,0],l:1,side:0};
const curves=[];const PEN=new THREE.Vector3(-1.3,-3.9,.2),SPARK=new THREE.Vector3(-.2,.9,.3);let NIBL=PEN;   // where he flows to (the pen, or the spark), in his own coordinates
function widthAt(def,t){const n=def.p.length,x=t*(n-1),i=Math.min(n-2,Math.floor(x)),k=x-i;return def.p[i][3]*(1-k)+def.p[i+1][3]*k;}
function updateRibbon(mesh,def,ri,T,f,isInk){
  const pos=mesh.geometry.attributes.position.array,br=mesh.geometry.attributes.aB.array;const n=def.p.length;
  const P=def.p.map((q,j)=>{const a=j/(n-1);const v=W(q[0]+Math.sin(T*.7+ri*1.3+a*2.2)*12*a,q[1]+Math.cos(T*.55+ri+a*1.7)*8*a,q[2]+Math.sin(T*.45+ri*2+a*3)*30*a);
    if(!isInk&&f<1){const dx=v.x-NIBL.x,dy=v.y-NIBL.y,dz=v.z-NIBL.z,dd=Math.sqrt(dx*dx+dy*dy+dz*dz);
      const lag=Math.min(.55,dd/14);const ff=Math.max(0,Math.min(1,(f-lag)/(1-lag)));const e=ff*ff*(3-2*ff);
      const ang=(1-e)*2.6,ca=Math.cos(ang),sa=Math.sin(ang);
      v.set(NIBL.x+(dx*ca-dy*sa)*e,NIBL.y+(dx*sa+dy*ca)*e,NIBL.z+dz*e);}return v;});
  const curve=new THREE.CatmullRomCurve3(P,false,'centripetal');if(!isInk)curves[ri]=curve;const pts=curve.getSpacedPoints(N-1);
  const q=keeper.quaternion;
  for(let i=0;i<N;i++){const t=i/(N-1);curve.getTangentAt(Math.min(.995,Math.max(.005,t)),T_);
    B0.crossVectors(T_,Z);if(B0.lengthSq()<1e-6)B0.set(1,0,0);B0.normalize();N0.crossVectors(B0,T_).normalize();
    // twist stays well short of edge-on, so the strip never folds over itself
    let tw=(def.tw[0]+def.tw[1]*t)*Math.PI*2+(isInk?0:Math.sin(T*.6+ri)*.3);tw=1.05*Math.tanh(tw/1.05);
    OFF.copy(B0).multiplyScalar(Math.cos(tw)).addScaledVector(N0,Math.sin(tw));
    const tp=Math.pow(Math.sin(Math.PI*t),isInk?.8:.6);
    const ww=(isInk?(3.5+4.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.6)),2)*(1-t*.7))/100:widthAt(def,t)/100*1.5*Math.pow(f,.7))*tp;
    const p=pts[i];
    pos[i*6]=p.x+OFF.x*ww*.5;pos[i*6+1]=p.y+OFF.y*ww*.5;pos[i*6+2]=p.z+OFF.z*ww*.5;
    pos[i*6+3]=p.x-OFF.x*ww*.5;pos[i*6+4]=p.y-OFF.y*ww*.5;pos[i*6+5]=p.z-OFF.z*ww*.5;
    RN.crossVectors(T_,OFF).normalize().applyQuaternion(q);const face=Math.abs(RN.z);
    const sheen=Math.pow(1-face,3)*.45,pulse=.82+.18*Math.sin(T*1.3-t*5+ri*1.7);
    br[i*2]=br[i*2+1]=(def.l*(.62+.38*face)+sheen)*pulse*Math.pow(tp,.3)*(isInk?(1.5-.7*t)*(1.3-.4*f):1);}
  mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.attributes.aB.needsUpdate=true;
  // draw order instead of depth: ribbons behind the head first, the head, then those in front — no hard cuts where they cross
}
const BEHIND=[0,6];ribbons.forEach((m,i)=>m.renderOrder=BEHIND.includes(i)?1:5);head.renderOrder=3;lowb.renderOrder=2;eyes.forEach(e=>e.renderOrder=6);ink.renderOrder=0;words.renderOrder=7;
const soul=new THREE.Sprite(new THREE.SpriteMaterial({map:ember.material.map,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,transparent:true}));soul.renderOrder=11;world.add(soul);nib.renderOrder=8;ember.renderOrder=10;

// ——— what he does ———
let px=0,py=0,tx=0,ty=0;
const onMove=e=>{const r=canvas.getBoundingClientRect();if(!r.width)return;tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2;};addEventListener('pointermove',onMove,{passive:true});
const tip={classList:{add(){},remove(){},contains(){return true;}}};let lookAt=null,talkUntil=0;
let mode='idle',modeAt=0,clock=0,writeP=0;
const aspectK=()=>Math.min(1,camera.aspect/0.75);
// where he stands for each thing he does
const VW=()=>canvas.clientWidth||innerWidth,VH=()=>canvas.clientHeight||innerHeight;
function halfW(){const fov=camera.fov*Math.PI/180;return camera.position.z*Math.tan(fov/2)*camera.aspect;}
function placeOf(m){const narrow=VW()<640;
  if(m==='aside')return narrow?{x:0,y:2.6,sc:.42}:{x:-halfW()*.66,y:-.6,sc:.5};
  if(m==='hint')return{x:narrow?0:-2.3*aspectK(),y:narrow?2.2:1.2,sc:narrow?.55:.6};
  return{x:0,y:0,sc:1};}
let pending=null,grownAt=0;
const sparkWorld=()=>({x:world.position.x+SPARK.x*keeper.scale.x,y:world.position.y+SPARK.y*keeper.scale.x});
function setMode(m){
  // from the ember he never jumps: the spark first glides to where he is needed, kindles there, and he grows out of it
  if((mode==='away'||mode==='come')&&m!=='away'){pending=m;if(mode!=='come'){mode='come';modeAt=clock;grownAt=0;}
    const P=placeOf(m);S.ex.t=P.x;S.ey.t=P.y+.3;tip.classList.remove('on');return;}
  mode=m;modeAt=clock;tip.classList.remove('on');
  const P=placeOf(m);
  if(m==='idle'){S.x.t=P.x;S.y.t=P.y;S.sc.t=1;S.form.t=1;S.emb.t=0;if(S.form.v>.98)NIBL=PEN;}
  if(m==='aside'){S.x.t=P.x;S.y.t=P.y;S.sc.t=P.sc;S.form.t=1;S.emb.t=0;if(S.form.v>.98)NIBL=PEN;}
  if(m==='hint'){S.x.t=P.x;S.y.t=P.y;S.sc.t=P.sc;S.form.t=1;S.emb.t=0;if(S.form.v>.98)NIBL=PEN;}
  if(m==='away'){NIBL=SPARK;S.form.t=0;S.emb.t=1;const sp=sparkWorld();S.ex.v=S.ex.t=sp.x;S.ey.v=S.ey.t=sp.y;S.ex.vel=0;S.ey.vel=0;}
  if(m==='write'){NIBL=PEN;S.form.t=0;S.x.t=P.x;S.y.t=P.y;S.sc.t=1;S.emb.t=0;}}


function fit(){const w=VW(),h=VH();renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;
  const needH=11.6/(opts.size||1),needW=9.8/(opts.size||1);const fov=camera.fov*Math.PI/180;const dH=needH/2/Math.tan(fov/2),dW=needW/2/Math.tan(fov/2)/camera.aspect;
  const ly=-.35-(opts.lift||0);camera.position.set(0,ly,Math.max(dH,dW));camera.lookAt(0,ly,0);camera.updateProjectionMatrix();}
addEventListener('resize',fit);fit();

let last=performance.now(),blinkAt=1.5;
if(MODE)setTimeout(()=>setMode(MODE),10);
const lerp=(a,b,k)=>a+(b-a)*k;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;const T=clock;
  const mt=clock-modeAt;
  // the write cycle: he lies down into the line, the pen writes the words, they glow and fade, he rises
  if(mode==='write'){writeP=mt<1.9?0:Math.min(1,(mt-1.9)/3.3);if(mt>6.9)S.form.t=1;if(mt>9.4)setMode('idle');}
  if(mode==='come'){const P=placeOf(pending||'idle');
    // the body rides with the spark, so nothing jumps when he appears
    S.sc.v=S.sc.t=P.sc;S.x.v=S.ex.v-SPARK.x*P.sc;S.y.v=S.ey.v-SPARK.y*P.sc;S.x.vel=S.y.vel=0;S.x.t=P.x;S.y.t=P.y;
    S.ex.t=P.x+SPARK.x*P.sc;S.ey.t=P.y+SPARK.y*P.sc;
    if(!grownAt&&Math.hypot(S.ex.v-S.ex.t,S.ey.v-S.ey.t)<.15&&Math.hypot(S.ex.vel,S.ey.vel)<.5){grownAt=clock;S.form.t=1;S.emb.t=0;}
    if(grownAt&&clock-grownAt>2.4){const m=pending||'idle';pending=null;mode='_';setMode(m);}}
  // away: once he is gathered into the spark, it lifts off and drifts to its corner
  if(mode==='away'&&mt>1.3){S.ex.t=3.2*aspectK();S.ey.t=3.8;}
  if(mode==='hint'&&mt>1.1&&!tip.classList.contains('on'))tip.classList.add('on');
  for(const k in S)step(S[k],dt);
  const f=Math.max(0,Math.min(1,S.form.v));
  {let lx=tx,ly=ty;if(lookAt){lx=lookAt[0];ly=lookAt[1];}px+=(lx-px)*.035;py+=(ly-py)*.035;}
  // floating: a slow breath up and down, a little drift; he turns toward you, softly
  const fx=Math.sin(T*.43)*.08,fy=Math.sin(T*.7)*.12;
  world.position.set(S.x.v+fx*f,S.y.v+fy*f,0);
  S.yaw.t=Math.sin(T*.38)*.28+Math.sin(T*.15)*.1+px*.3;S.pitch.t=Math.sin(T*.27)*.05+py*.1;
  keeper.rotation.y=S.yaw.v;keeper.rotation.x=S.pitch.v;keeper.rotation.z=Math.sin(T*.5)*.025;
  const sc=Math.max(.001,S.sc.v)*(1+Math.sin(T*1.1)*.012);keeper.scale.setScalar(sc);dust.scale.setScalar(sc);
  keeper.updateMatrix();
  RIB.forEach((d,i)=>updateRibbon(ribbons[i],d,i,T,f,false));
  const inSpark=NIBL===SPARK;
  updateRibbon(ink,inkDef,0,T,1,true);ink.material.uniforms.uA.value=Math.min(1,Math.max(0,S.sc.v)*1.2)*(inSpark?f:(.15+.85*f));
  ribbons.forEach(r=>r.material.uniforms.uA.value=Math.min(1,Math.max(0,S.sc.v)*1.4));
  {const hf=Math.max(0,Math.min(1,(f-.25)/.75)),he=hf*hf*(3-2*hf);head.scale.setScalar(Math.max(.001,he));head.position.set(NIBL.x*(1-he),NIBL.y*(1-he),0);head.rotation.z=(1-he)*2.2;
   const lf=Math.max(0,Math.min(1,(f-.15)/.85));lowb.scale.setScalar(Math.max(.001,lf));lowb.position.set(NIBL.x*(1-lf),NIBL.y*(1-lf),.05);lowb.rotation.z=(1-lf)*2;}
  let bl=1;const ph=(T-blinkAt);if(ph>0&&ph<.24)bl=1-Math.sin(ph/.24*Math.PI)*.94;if(ph>=.24){blinkAt=T+2.6+((Math.sin(T*12.9)*.5+.5)*3.6);}
  const talking=clock<talkUntil;eyeMat.uniforms.uB.value=talking?Math.max(bl,.8+.2*Math.sin(clock*9)):bl;eyeMat.uniforms.uK.value=(talking?1.3:1)*Math.max(0,(f-.75)/.25)*Math.min(1,Math.max(0,S.sc.v)*1.5);
  eyes.forEach(e=>{const b=e.userData.base;e.position.set(b.x+px*.09,b.y-py*.06,.62);});
  // the pen: at the end of the lower ribbon, along its direction; while he lies in the line it walks along the words, writing
  const c=curves[LOWER];
  if(c){c.getPointAt(1,tmpV);c.getTangentAt(.99,T_);const end=tmpV.clone().applyMatrix4(keeper.matrix);const dir=T_.clone().applyQuaternion(keeper.quaternion).normalize();
    // the nib continues the ribbon: its body sits on the ribbon's end, its tip points on along the same direction
    const L=1.12*1.05*sc;let nx=end.x+dir.x*L,ny=end.y+dir.y*L,rot=Math.atan2(-dir.y,-dir.x)-Math.PI/2;
    if(mode==='write'&&mt>1.6&&mt<7.4){const wx=-3.25+writeP*wordsW*6.2,wy=-4.12+Math.sin(writeP*90)*.07*(writeP<1?1:0)+Math.sin(writeP*17)*.04;
      const k=Math.min(1,(mt-1.6)/.9)*(mt>6.4?Math.max(0,1-(mt-6.4)):1);const kk=k*k*(3-2*k);nx=lerp(nx,wx,kk);ny=lerp(ny,wy,kk);rot=lerp(rot,.62,kk);}
    const u=nib.userData;u.x=u.x==null?nx:lerp(u.x,nx,Math.min(1,dt*10));u.y=u.y==null?ny:lerp(u.y,ny,Math.min(1,dt*10));u.r=u.r==null?rot:lerp(u.r,rot,Math.min(1,dt*6));
    nib.position.set(u.x,u.y,.4);nib.rotation.z=u.r;nib.scale.setScalar(1.05*Math.max(.001,S.sc.v)*(inSpark?Math.max(.001,(f-.4)/.6):(1+(1-f)*.25)));
    // the Keeper inside the pen: a spark on the nib while he writes
    soul.position.set(u.x,u.y+.35,.5);soul.scale.setScalar(Math.max(.001,inSpark?0:(1-f)*.9)*(.9+.15*Math.sin(clock*7)));}
  words.position.set(-.15,-4.0,.3);
  words.material.uniforms.uW.value=wordsW;words.material.uniforms.uR.value=writeP;
  const wa=words.material.uniforms.uA;wa.value=mode==='write'?Math.min(1,Math.max(0,mt-1.7)/.4)*(mt>6.2?Math.max(0,1-(mt-6.2)/1.6):1):Math.max(0,wa.value-dt);
  // the ember: where he was, it lifts off and drifts; on «come» it glides back and he grows out of it
  {const drift=(mode==='away'&&mt>1.3)?1:0;const sw=sparkWorld();
   if(mode==='away'||mode==='come')ember.position.set(S.ex.v+Math.sin(clock*1.7)*.08*drift,S.ey.v+Math.sin(clock*1.3)*.15*drift,1);else ember.position.set(sw.x,sw.y,1);}
  ember.scale.setScalar(Math.max(.001,S.emb.v)*(.9+.12*Math.sin(clock*5.3)));
  halo.material.uniforms.uA.value=(inSpark?f:(.55+.45*f))*Math.min(1,Math.max(0,S.sc.v)*1.3);
  dust.material.uniforms.uT.value=clock;dust.material.uniforms.uA.value=inSpark?f:1;

  composer.render();raf=running?requestAnimationFrame(loop):0;}
let running=false,raf=0;
// where a point of the keeper is on the page (for text that stands beside him)
const screenOf=(x,y)=>{const v=new THREE.Vector3(x,y,0).applyMatrix4(keeper.matrixWorld).project(camera);const r=canvas.getBoundingClientRect();return{x:r.left+(v.x*.5+.5)*r.width,y:r.top+(-v.y*.5+.5)*r.height};};
return{
  start(){if(!running){running=true;fit();last=performance.now();raf=requestAnimationFrame(loop);}},
  stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=0;},
  setMode(m){setMode(m);},
  get mode(){return mode;},
  // jump straight to a state without animation (e.g. start as a spark in a corner)
  placeSpark(x,y){mode='away';modeAt=clock-9;NIBL=SPARK;S.form.v=S.form.t=0;S.emb.v=S.emb.t=1;S.ex.v=S.ex.t=x;S.ey.v=S.ey.t=y;S.sc.v=S.sc.t=1;},
  halfW,
  get state(){return{mode,pending,grownAt,form:S.form.v,formT:S.form.t,ex:S.ex.v,ey:S.ey.v,ext:S.ex.t,eyt:S.ey.t,vx:S.ex.vel,vy:S.ey.vel,emb:S.emb.v};},
  lookAt(nx,ny){lookAt=nx==null?null:[nx,ny];},
  talk(ms){talkUntil=clock+ms/1000;},
  screenOf,
  resize:fit,
  destroy(){this.stop();removeEventListener('pointermove',onMove);removeEventListener('resize',fit);renderer.dispose();}
};

}};
