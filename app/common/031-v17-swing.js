/*@block [" id=\"v17_swing\"", ""]*/
(function(){
  function attachSwing(hanger, trigger){
    if(!hanger || hanger.dataset.v17Bound==='1') return;
    hanger.dataset.v17Bound='1';
    trigger = trigger || hanger;
    let raf = null, angle = 0, velocity = 0, lastX = 0, hovering = false;
    const gravity = .0105, damping = .992, maxAngle = 1.12;
    function apply(){ hanger.style.setProperty('transform', 'rotate(' + angle.toFixed(2) + 'deg)', 'important'); }
    function step(){ velocity += -gravity * angle; velocity *= damping; angle += velocity; if(angle > maxAngle){ angle = maxAngle; velocity *= -0.14; } if(angle < -maxAngle){ angle = -maxAngle; velocity *= -0.14; } apply(); if(!hovering && Math.abs(angle) < .01 && Math.abs(velocity) < .002){ angle = 0; velocity = 0; apply(); raf = null; return; } raf = requestAnimationFrame(step); }
    function push(x, amp){ let dir = 1; if(lastX) dir = x > lastX ? 1 : -1; lastX = x; velocity = velocity * .35 + (amp || .14) * dir * .72; if(!raf) raf = requestAnimationFrame(step); }
    ['pointerenter','click'].forEach(ev => trigger.addEventListener(ev, e => { hovering = true; push(e.clientX || 1, ev==='click' ? .18 : .15); }));
    trigger.addEventListener('pointermove', e => { hovering = true; if(Math.abs(e.clientX - lastX) > 16) push(e.clientX, .11); });
    trigger.addEventListener('pointerleave', () => { hovering = false; lastX = 0; if(!raf) raf = requestAnimationFrame(step); });
    apply();
  }
  window.addEventListener('load', function(){
    attachSwing(document.getElementById('projectHanger'), document.getElementById('projectBtn'));
    attachSwing(document.getElementById('pagesHanger'), document.getElementById('pagesBtn'));
  });
})();
