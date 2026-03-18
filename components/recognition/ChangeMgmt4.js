'use client'
import { useEffect, useRef } from 'react'

export default function ChangeMgmt4() {
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

    var rings=[];var maxRings=8;var ringInterval=3;

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
      var cx=W*0.5,cy=H*0.5;var maxR=H*0.42;
      var expectedRings=Math.min(maxRings,Math.floor(t/ringInterval)+1);
      while(rings.length<expectedRings){
        var idx=rings.length;rings.push({born:idx*ringInterval,col:cols[idx%cols.length],
          targetR:maxR*(0.15+idx*0.1),currentR:0,thickness:1.5+idx*0.5,alpha:0});
      }
      for(var i=rings.length-1;i>=0;i--){
        var ring=rings[i];var elapsed=t-ring.born;if(elapsed<0)continue;
        var gp=Math.min(1,elapsed*0.15);gp=gp*gp*(3-2*gp);ring.currentR=ring.targetR*gp;ring.alpha=Math.min(0.6,gp*0.6);
        var breathe=1+Math.sin(t*0.5+i*0.8)*0.02;var r=ring.currentR*breathe;
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle="rgba("+ring.col.r+","+ring.col.g+","+ring.col.b+","+ring.alpha*0.2+")";ctx.lineWidth=ring.thickness*6;ctx.stroke();
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle="rgba("+ring.col.r+","+ring.col.g+","+ring.col.b+","+ring.alpha+")";ctx.lineWidth=ring.thickness;ctx.stroke();
        var nodeCount=3+i;
        for(var n=0;n<nodeCount;n++){
          var angle=n*(Math.PI*2/nodeCount)+t*0.1*(i%2===0?1:-1);
          var nx=cx+Math.cos(angle)*r,ny=cy+Math.sin(angle)*r;
          var ng=ctx.createRadialGradient(nx,ny,0,nx,ny,4+i);
          ng.addColorStop(0,"rgba("+ring.col.r+","+ring.col.g+","+ring.col.b+","+ring.alpha*0.6+")");
          ng.addColorStop(1,"rgba("+ring.col.r+","+ring.col.g+","+ring.col.b+",0)");
          ctx.fillStyle=ng;ctx.beginPath();ctx.arc(nx,ny,4+i,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.arc(nx,ny,1.5,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,"+ring.alpha*0.5+")";ctx.fill();
        }
      }
      var cGlow=ctx.createRadialGradient(cx,cy,0,cx,cy,20);
      cGlow.addColorStop(0,"rgba(155,81,224,0.3)");cGlow.addColorStop(1,"rgba(155,81,224,0)");
      ctx.fillStyle=cGlow;ctx.beginPath();ctx.arc(cx,cy,20,0,Math.PI*2);ctx.fill();
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
