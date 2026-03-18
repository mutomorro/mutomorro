'use client'
import { useEffect, useRef } from 'react'

export default function ChangeMgmt2() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H

    var points=[];var N=12;
    for(var i=0;i<N;i++){
      points.push({x:0.08+Math.random()*0.84,y:0.12+Math.random()*0.76,
        size:3+Math.random()*5,phase:Math.random()*Math.PI*2,
        transformSpeed:0.01+Math.random()*0.02,progress:0,
        delay:i*0.8+Math.random()*2,pulseSpeed:2+Math.random()*3});
    }
    function lerpCol(progress){
      if(progress<0.4){var t2=progress/0.4;return{r:Math.round(220-40*t2),g:Math.round(60+80*t2),b:Math.round(60+20*t2)};}
      else if(progress<0.7){var t2=(progress-0.4)/0.3;return{r:Math.round(180-25*t2),g:Math.round(140+40*t2),b:Math.round(80+80*t2)};}
      else{var t2=(progress-0.7)/0.3;return{r:155,g:Math.round(180-100*t2+81*t2),b:Math.round(160+64*t2)};}
    }

    function resize() {
      const rect = parent.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    var t=0;
    function tick(){
      ctx.clearRect(0,0,W,H);t+=0.016;
      for(var i=0;i<points.length;i++){
        var p=points[i];
        var elapsed=Math.max(0,t-p.delay);if(elapsed>0)p.progress=Math.min(1,p.progress+p.transformSpeed*0.005);
        var col=lerpCol(p.progress);var px=p.x*W,py=p.y*H;
        var tensionPulse=1+(1-p.progress)*Math.sin(t*p.pulseSpeed+p.phase)*0.3;var sz=p.size*tensionPulse;
        if(p.progress>0.3){var ug=(p.progress-0.3)/0.7;
          var gr=ctx.createRadialGradient(px,py,0,px,py,sz*8*ug);
          gr.addColorStop(0,"rgba("+col.r+","+col.g+","+col.b+","+0.15*ug+")");
          gr.addColorStop(0.5,"rgba("+col.r+","+col.g+","+col.b+","+0.05*ug+")");
          gr.addColorStop(1,"rgba("+col.r+","+col.g+","+col.b+",0)");
          ctx.fillStyle=gr;ctx.beginPath();ctx.arc(px,py,sz*8*ug,0,Math.PI*2);ctx.fill();}
        var cg=ctx.createRadialGradient(px,py,0,px,py,sz*3);
        cg.addColorStop(0,"rgba("+col.r+","+col.g+","+col.b+",0.5)");cg.addColorStop(1,"rgba("+col.r+","+col.g+","+col.b+",0)");
        ctx.fillStyle=cg;ctx.beginPath();ctx.arc(px,py,sz*3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px,py,sz,0,Math.PI*2);
        ctx.fillStyle="rgba("+col.r+","+col.g+","+col.b+",0.8)";ctx.fill();
        if(p.progress>0.6){var bright=(p.progress-0.6)/0.4;ctx.beginPath();ctx.arc(px,py,sz*0.4,0,Math.PI*2);
          ctx.fillStyle="rgba(255,255,240,"+bright*0.5+")";ctx.fill();}
      }
      animId=requestAnimationFrame(tick);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(20000)
    } else {
      animId = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
