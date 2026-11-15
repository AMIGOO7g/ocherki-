/*@block [" id=\"wheel-gesture\"", ""]*/
// One gesture of the wheel = one step, for the arc of spreads and the
// manuscript. A gesture is a mouse notch, or a touchpad swipe together with
// its fading momentum. A new gesture starts after a pause, on a change of
// direction, or when the motion speeds up again after it had faded. A wheel
// turned on steadily (not fading) walks on, one step at a calm pace.
window.__ocherkiWheel=()=>{let last=-1e9,sign=0,acc=0,stepped=false,lastStep=-1e9,peak=0,trough=0;
  return e=>{const t=e.timeStamp||performance.now(),k=e.deltaMode===1?40:e.deltaMode===2?800:1;
    const d=(Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX)*k;if(!d)return 0;
    const sg=Math.sign(d),a=Math.abs(d);
    const fresh=t-last>240||sg!==sign||(stepped&&t-lastStep>220&&trough<peak*.4&&a>trough*2+8);
    if(fresh){stepped=false;acc=0;peak=a;trough=a;}
    else if(a>=peak){peak=a;trough=a;}else trough=Math.min(trough,a);
    last=t;sign=sg;acc+=d;
    if(!stepped&&Math.abs(acc)>=40){stepped=true;lastStep=t;return sg;}
    if(stepped&&t-lastStep>420&&a>=peak*.8&&a>=4){lastStep=t;peak=a;trough=a;return sg;}
    return 0;};};
