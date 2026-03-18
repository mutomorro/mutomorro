'use client'
import { useEffect, useRef } from 'react'

export default function PostMerger2() {
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

    var points=[];var N=24;
    for(var i=0;i<N;i++){
      var fromLeft=i<N/2;var col=fromLeft?cols[Math.floor(Math.random()*2)]:cols[2+Math.floor(Math.random()*2)];
      var startX=fromLeft?0.03+Math.random()*0.18:0.79+Math.random()*0.18;
      points.push({x:startX,y:0.15+Math.random()*0.7,
        targetX:0.35+Math.random()*0.3,targetY:0.2+Math.random()*0.6,
        col:col,size:3+Math.random()*4,delay:Math.random()*8,settled:false,settleTime:0,
        phase:Math.random()*Math.PI*2,speed:0.005+Math.random()*0.01,brightness:0.6+Math.random()*0.4});
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
      var cx=W*0.5,cy=H*0.5;
      var grd=ctx.createRadialGradient(cx,cy,0,cx,cy,H*0.4);
      grd.addColorStop(0,"rgba(200,140,220,0.06)");grd.addColorStop(1,"rgba(200,140,220,0)");
      ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
      for(var i=0;i<points.length;i++){
        var p=points[i];var elapsed=Math.max(0,t-p.delay);
        var progress=Math.min(1,elapsed*p.speed*0.5);progress=progress*progress*(3-2*progress);
        p.x+=(p.targetX-p.x)*progress*0.02;p.y+=(p.targetY-p.y)*progress*0.02;
        var dx=p.x-p.targetX,dy=p.y-p.targetY;
        if(Math.abs(dx)<0.02&&Math.abs(dy)<0.02){
          if(!p.settled){p.settled=true;p.settleTime=t;}
          var st=t-p.settleTime;p.x=p.targetX+Math.sin(st*0.5+p.phase)*0.008;p.y=p.targetY+Math.cos(st*0.4+p.phase)*0.005;
        }else{p.x+=Math.sin(t*2+p.phase)*0.001;p.y+=Math.cos(t*1.5+p.phase)*0.0008;}
        var px=p.x*W,py=p.y*H;var alpha=elapsed>0?Math.min(1,elapsed*0.3):0.3;
        var glowSize=p.settled?p.size*6:p.size*4;
        var bp=p.settled?0.8+Math.sin(t*0.8+p.phase)*0.2:p.brightness;
        var g=ctx.createRadialGradient(px,py,0,px,py,glowSize);
        g.addColorStop(0,"rgba("+p.col.r+","+p.col.g+","+p.col.b+","+alpha*bp*0.35+")");
        g.addColorStop(0.5,"rgba("+p.col.r+","+p.col.g+","+p.col.b+","+alpha*bp*0.1+")");
        g.addColorStop(1,"rgba("+p.col.r+","+p.col.g+","+p.col.b+",0)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,glowSize,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(px,py,p.size*bp,0,Math.PI*2);
        ctx.fillStyle="rgba("+p.col.r+","+p.col.g+","+p.col.b+","+alpha*0.9+")";ctx.fill();
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
