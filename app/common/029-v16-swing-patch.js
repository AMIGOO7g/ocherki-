/*@block [" id=\"v16_swing_patch\"", ""]*/
(function(){
  function attachSwing(hanger, trigger){
    if(!hanger || hanger.dataset.v16Bound==='1') return;
    hanger.dataset.v16Bound='1';
    trigger = trigger || hanger;
    let raf = null, angle = 0, velocity = 0, lastX = 0, hovering = false;
    const gravity = .010, damping = .991, maxAngle = 1.18;
    function apply(){ hanger.style.setProperty('transform', 'rotate(' + angle.toFixed(2) + 'deg)', 'important'); }
    function step(){ velocity += -gravity * angle; velocity *= damping; angle += velocity; if(angle > maxAngle){ angle = maxAngle; velocity *= -0.12; } if(angle < -maxAngle){ angle = -maxAngle; velocity *= -0.12; } apply(); if(!hovering && Math.abs(angle) < .01 && Math.abs(velocity) < .002){ angle = 0; velocity = 0; apply(); raf = null; return; } raf = requestAnimationFrame(step); }
    function push(x, amp){ let dir = 1; if(lastX) dir = x > lastX ? 1 : -1; lastX = x; velocity = velocity * .35 + (amp || .14) * dir * .72; if(!raf) raf = requestAnimationFrame(step); }
    trigger.addEventListener('pointerenter', e => { hovering = true; push(e.clientX, .16); });
    trigger.addEventListener('pointermove', e => { if(Math.abs(e.clientX - lastX) > 18) push(e.clientX, .12); });
    trigger.addEventListener('pointerleave', () => { hovering = false; lastX = 0; if(!raf) raf = requestAnimationFrame(step); });
    trigger.addEventListener('click', e => { push(e.clientX || lastX || 1, .20); });
    apply();
  }
  attachSwing(document.getElementById('projectHanger'), document.getElementById('projectBtn'));
  attachSwing(document.getElementById('pagesHanger'), document.getElementById('pagesBtn'));
})();
