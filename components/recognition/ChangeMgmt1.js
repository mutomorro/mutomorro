'use client'
import { useEffect, useRef } from 'react'

export default function ChangeMgmt1() {
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

    var people=[];var N=40;
    for(var i=0;i<N;i++){
      var col=cols[Math.floor(Math.random()*cols.length)];
      people.push({x:0.05+Math.random()*0.6,y:0.1+Math.random()*0.8,
        speed:0.0002+Math.random()*0.0006,col:col,size:2+Math.random()*2,
        lightSize:1+Math.random()*2,lightPhase:Math.random()*Math.PI*2,
        yDrift:Math.random()*Math.PI*2,yAmp:0.004+Math.random()*0.01});
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
      var rg=ctx.createLinearGradient(W*0.7,0,W,0);
      rg.addColorStop(0,"rgba(255,162,0,0)");rg.addColorStop(1,"rgba(255,162,0,0.02)");
      ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
      for(var i=0;i<people.length;i++){
        var p=people[i];
        p.x+=p.speed;p.y+=Math.sin(t*0.3+p.yDrift)*p.yAmp*0.01;if(p.x>1.05)p.x=-0.05;
        var px=p.x*W,py=p.y*H;
        ctx.beginPath();ctx.arc(px,py,p.size,0,Math.PI*2);
        ctx.fillStyle="rgba("+p.col.r+","+p.col.g+","+p.col.b+",0.5)";ctx.fill();
        var lightX=px+p.size*1.5,lightY=py-p.size*2.5;
        var pulse=0.7+Math.sin(t*1.2+p.lightPhase)*0.3;
        var lg=ctx.createRadialGradient(lightX,lightY,0,lightX,lightY,p.lightSize*5*pulse);
        lg.addColorStop(0,"rgba("+p.col.r+","+p.col.g+","+p.col.b+","+0.4*pulse+")");
        lg.addColorStop(0.3,"rgba("+p.col.r+","+p.col.g+","+p.col.b+","+0.15*pulse+")");
        lg.addColorStop(1,"rgba("+p.col.r+","+p.col.g+","+p.col.b+",0)");
        ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lightX,lightY,p.lightSize*5*pulse,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(lightX,lightY,p.lightSize*pulse,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,"+0.6*pulse+")";ctx.fill();
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
