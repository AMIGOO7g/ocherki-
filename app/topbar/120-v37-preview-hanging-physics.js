/*@block [" id=\"v37-preview-hanging-physics\"", ""]*/
/* The three composition controls use the same small spring motion as the
   permanent hanging controls. Bind once, even while disabled, so enabling a
   control after a build never leaves it visually inert. */
(()=>{
  const bind=el=>{
    if(!el||el.dataset.hangingSwing==='1')return;
    el.dataset.hangingSwing='1';
    const key=el.querySelector('.key');
    let angle=0,velocity=0,raf=0,lastX=null,lastPush=0,hovering=false;
    // The thread is now screen-height, so the same angular impulse used by a
    // short control would throw the key far outside its hit area. Keep this
    // long pendulum within the gentle ±0.22° movement of the upper controls.
    const gravity=.010,damping=.991,maxAngle=.07,pushForce=.008,cooldown=140;
    const apply=()=>{el.style.transform=`rotate(${angle.toFixed(2)}deg)`};
    const animate=()=>{
      velocity+=-gravity*angle;
      velocity*=damping;
      angle+=velocity;
      if(angle>maxAngle){angle=maxAngle;velocity*=-.12}
      else if(angle< -maxAngle){angle=-maxAngle;velocity*=-.12}
      apply();
      if(!hovering&&Math.abs(angle)<.006&&Math.abs(velocity)<.0012){angle=0;velocity=0;apply();raf=0;return}
      raf=requestAnimationFrame(animate);
    };
    const kick=(direction,strength=pushForce)=>{
      velocity=Math.max(-.38,Math.min(.38,velocity+direction*strength));
      if(!raf)raf=requestAnimationFrame(animate);
    };
    el.addEventListener('pointerenter',e=>{if(key?.disabled)return;hovering=true;lastX=e.clientX;kick(.014)});
    el.addEventListener('pointermove',e=>{
      if(key?.disabled)return;
      const now=performance.now();
      if(lastX==null){lastX=e.clientX;return}
      const dx=e.clientX-lastX;
      if(Math.abs(dx)>24&&now-lastPush>cooldown){lastPush=now;lastX=e.clientX;kick(dx>0?1:-1)}
    });
    el.addEventListener('pointerleave',()=>{hovering=false;lastX=null;if(!raf)raf=requestAnimationFrame(animate)});
    el.addEventListener('pointerdown',e=>{if(key?.disabled)return;const r=el.getBoundingClientRect();kick(e.clientX>=r.left+r.width/2?1:-1,.006)});
  };
  document.querySelectorAll('.book-preview-layout-hanger .book-preview-control').forEach(bind);
})();
