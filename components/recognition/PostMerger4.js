'use client'
import { useEffect, useRef } from 'react'

export default function PostMerger4() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H

    var cols=[{r:128,g:56,b:143},{r:155,g:81,b:224},{r:255,g:66,b:121},{r:255,g:162,b:0}];

    var lights=[];var N=35;
    for(var i=0;i<N;i++){
      var col=cols[Math.floor(Math.random()*cols.length)];
      lights.push({x:0.05+Math.random()*0.9,y:0.1+Math.random()*0.8,col:col,
        size:2+Math.random()*3,flickerSpeed:2+Math.random()*6,flickerAmp:0.6+Math.random()*0.4,
        settleRate:0.003+Math.random()*0.005,stability:0,phase:Math.random()*Math.PI*2,
        delay:Math.random()*5});
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
      for(var i=0;i<lights.length;i++){
        var p=lights[i];
        var elapsed=Math.max(0,t-p.delay);if(elapsed>0)p.stability=Math.min(1,p.stability+p.settleRate*0.016);
        var currentFlicker=p.flickerAmp*(1-p.stability);
        var flicker=Math.sin(t*p.flickerSpeed+p.phase)*currentFlicker+Math.sin(t*p.flickerSpeed*2.3+p.phase*1.7)*currentFlicker*0.3;
        var brightness=0.3+p.stability*0.6+flicker*0.3;brightness=Math.max(0.05,Math.min(1,brightness));
        var steadyGlow=p.stability*0.4;
        var px=p.x*W,py=p.y*H;var sz=p.size*(0.7+brightness*0.3);
        var glowR=sz*(3+p.stability*5);
        var g=ctx.createRadialGradient(px,py,0,px,py,glowR);
        g.addColorStop(0,"rgba("+p.col.r+","+p.col.g+","+p.col.b+","+(brightness*0.25+steadyGlow*0.15)+")");
        g.addColorStop(0.4,"rgba("+p.col.r+","+p.col.g+","+p.col.b+","+(brightness*0.1+steadyGlow*0.05)+")");
        g.addColorStop(1,"rgba("+p.col.r+","+p.col.g+","+p.col.b+",0)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,glowR,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px,py,sz,0,Math.PI*2);
        ctx.fillStyle="rgba("+p.col.r+","+p.col.g+","+p.col.b+","+brightness+")";ctx.fill();
        if(p.stability>0.5){ctx.beginPath();ctx.arc(px,py,sz*0.4,0,Math.PI*2);
          ctx.fillStyle="rgba(255,255,255,"+(p.stability-0.5)*0.4+")";ctx.fill();}
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
