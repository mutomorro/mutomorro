'use client'
import { useEffect, useRef } from 'react'

export default function ChangeMgmt3() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H

    var obstacles=[];
    for(var i=0;i<5;i++){
      obstacles.push({x:0.15+i*0.15,y:0.4+Math.sin(i*1.5)*0.15,
        size:6+Math.random()*10,phase:Math.random()*Math.PI*2,appearTime:i*2+Math.random()*2});
    }
    var pathPoints=80;var path=[];
    for(var i=0;i<pathPoints;i++){path.push({baseX:i/(pathPoints-1),baseY:0.5,y:0.5,targetY:0.5});}

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
      for(var i=0;i<path.length;i++){
        var pp=path[i];pp.targetY=0.5+Math.sin(t*0.3+pp.baseX*3)*0.025;
        for(var j=0;j<obstacles.length;j++){
          var ob=obstacles[j];var elapsed=t-ob.appearTime;if(elapsed<0)continue;
          var obP=Math.min(1,elapsed*0.3);var dx=pp.baseX-ob.x;var dy=pp.targetY-ob.y;
          var dist=Math.sqrt(dx*dx+dy*dy);var avoidR=ob.size/Math.min(W,H)*3;
          if(dist<avoidR){var push=(1-dist/avoidR)*0.07*obP;
            pp.targetY+=dy>0?push:-push;if(Math.abs(dy)<0.01)pp.targetY-=push;}
        }
        pp.y+=(pp.targetY-pp.y)*0.08;
      }
      for(var j=0;j<obstacles.length;j++){
        var ob=obstacles[j];var elapsed=t-ob.appearTime;if(elapsed<0)continue;
        var alpha=Math.min(0.15,elapsed*0.05);var ox=ob.x*W,oy=ob.y*H;
        var og=ctx.createRadialGradient(ox,oy,0,ox,oy,ob.size*1.5);
        og.addColorStop(0,"rgba(100,80,120,"+alpha+")");og.addColorStop(1,"rgba(100,80,120,0)");
        ctx.fillStyle=og;ctx.beginPath();ctx.arc(ox,oy,ob.size*1.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(ox,oy,ob.size*0.5,0,Math.PI*2);
        ctx.fillStyle="rgba(100,80,120,"+alpha*1.5+")";ctx.fill();
      }
      ctx.lineWidth=3;
      for(var i=1;i<path.length;i++){
        var p0=path[i-1],p1=path[i];var progress=i/(path.length-1);
        var r,g,b;
        if(progress<0.33){var tt=progress/0.33;r=128+27*tt;g=56+25*tt;b=143+81*tt;}
        else if(progress<0.66){var tt=(progress-0.33)/0.33;r=155+100*tt;g=81-15*tt;b=224-103*tt;}
        else{var tt=(progress-0.66)/0.34;r=255;g=66+96*tt;b=121-121*tt;}
        ctx.beginPath();ctx.moveTo(p0.baseX*W,p0.y*H);ctx.lineTo(p1.baseX*W,p1.y*H);
        ctx.strokeStyle="rgba("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+",0.6)";ctx.stroke();
      }
      var travelIdx=Math.floor((t*3)%path.length);var tp=path[travelIdx];
      var tpx=tp.baseX*W,tpy=tp.y*H;
      var tg=ctx.createRadialGradient(tpx,tpy,0,tpx,tpy,12);
      tg.addColorStop(0,"rgba(255,200,100,0.5)");tg.addColorStop(1,"rgba(255,200,100,0)");
      ctx.fillStyle=tg;ctx.beginPath();ctx.arc(tpx,tpy,12,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(tpx,tpy,2.5,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.8)";ctx.fill();
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
