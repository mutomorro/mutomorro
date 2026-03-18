'use client'
import { useEffect, useRef } from 'react'

export default function PostMerger3() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H

    var streamA=[],streamB=[];var NA=30,NB=30;
    var colours=[[128,56,143],[155,81,224],[255,66,121],[255,162,0]];
    function makeP(yBase,colIdx){
      var c=colours[colIdx];
      return{x:Math.random(),y:yBase+((Math.random()-0.5)*0.12),
        speed:0.001+Math.random()*0.002,phase:Math.random()*Math.PI*2,
        amp:0.015+Math.random()*0.025,freq:0.8+Math.random()*0.6,
        r:c[0],g:c[1],b:c[2],size:1.5+Math.random()*2,alpha:0.4+Math.random()*0.3};
    }
    for(var i=0;i<NA;i++){streamA.push(makeP(0.3,Math.random()<0.5?0:1));}
    for(var i=0;i<NB;i++){streamB.push(makeP(0.7,Math.random()<0.5?2:3));}

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
    function drawStream(particles,yBase,mergeX){
      for(var i=0;i<particles.length;i++){
        var p=particles[i];
        p.x+=p.speed;if(p.x>1.1){p.x=-0.05;p.y=yBase+((Math.random()-0.5)*0.12);}
        var targetY;
        if(p.x<mergeX){targetY=yBase+Math.sin(t*p.freq+p.phase)*p.amp;}
        else{var mp=Math.min(1,(p.x-mergeX)/(1-mergeX));mp=mp*mp;
          var mergedY=0.5+Math.sin(t*0.6+p.phase)*0.02;
          targetY=yBase+(mergedY-yBase)*mp+Math.sin(t*p.freq+p.phase)*p.amp*(1-mp*0.7);}
        p.y+=(targetY-p.y)*0.05;
        var px=p.x*W,py=p.y*H;
        var prevX=(p.x-p.speed*3)*W;
        var g=ctx.createLinearGradient(prevX,py,px,py);
        g.addColorStop(0,"rgba("+p.r+","+p.g+","+p.b+",0)");
        g.addColorStop(1,"rgba("+p.r+","+p.g+","+p.b+","+p.alpha*0.3+")");
        ctx.strokeStyle=g;ctx.lineWidth=p.size*0.8;
        ctx.beginPath();ctx.moveTo(prevX,py);ctx.lineTo(px,py);ctx.stroke();
        var gr=ctx.createRadialGradient(px,py,0,px,py,p.size*3);
        gr.addColorStop(0,"rgba("+p.r+","+p.g+","+p.b+","+p.alpha*0.4+")");
        gr.addColorStop(1,"rgba("+p.r+","+p.g+","+p.b+",0)");
        ctx.fillStyle=gr;ctx.fillRect(px-p.size*3,py-p.size*3,p.size*6,p.size*6);
        ctx.beginPath();ctx.arc(px,py,p.size,0,Math.PI*2);
        ctx.fillStyle="rgba("+p.r+","+p.g+","+p.b+","+p.alpha+")";ctx.fill();
      }
    }

    function tick(){
      ctx.clearRect(0,0,W,H);t+=0.016;
      var mx=W*0.55,my=H*0.5;
      var mg=ctx.createRadialGradient(mx,my,0,mx,my,H*0.3);
      mg.addColorStop(0,"rgba(220,160,255,0.04)");mg.addColorStop(1,"rgba(220,160,255,0)");
      ctx.fillStyle=mg;ctx.fillRect(0,0,W,H);
      drawStream(streamA,0.3,0.55);drawStream(streamB,0.7,0.55);
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
