'use client'
import { useEffect, useRef } from 'react'

export default function CultureChangeHero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H, cx, cy

    function resize() {
      const rect = parent.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = W / 2
      cy = H / 2
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    var colours = [
      { r: 128, g: 56, b: 143 },
      { r: 155, g: 81, b: 224 },
      { r: 255, g: 66, b: 121 },
      { r: 255, g: 162, b: 0 },
    ];

    function colourAt(t, alpha) {
      t = Math.max(0, Math.min(1, t));
      var idx = t * (colours.length - 1);
      var i = Math.floor(idx);
      var f = idx - i;
      if (i >= colours.length - 1) { i = colours.length - 2; f = 1; }
      var a = colours[i], b = colours[i + 1];
      var r = Math.round(a.r + (b.r - a.r) * f);
      var g = Math.round(a.g + (b.g - a.g) * f);
      var bl = Math.round(a.b + (b.b - a.b) * f);
      return 'rgba(' + r + ',' + g + ',' + bl + ',' + alpha + ')';
    }

    var labels = [
      { text: 'everyday habits', ring: 0, slot: 0 },
      { text: 'who gets heard', ring: 0, slot: 1 },
      { text: 'how trust builds', ring: 0, slot: 2 },
      { text: 'how ideas travel', ring: 0, slot: 3 },
      { text: 'what gets celebrated', ring: 1, slot: 0 },
      { text: 'how people collaborate', ring: 1, slot: 1 },
      { text: 'what gets rewarded', ring: 1, slot: 2 },
      { text: 'what stories get told', ring: 1, slot: 3 },
      { text: 'how decisions get made', ring: 2, slot: 0 },
      { text: 'what leaders pay attention to', ring: 2, slot: 1 },
      { text: 'how conflict gets handled', ring: 2, slot: 2 },
      { text: 'what new starters learn first', ring: 2, slot: 3 },
    ];

    var ringRadii = [115, 195, 280];
    var ringOffsets = [0, Math.PI / 4, Math.PI / 6];
    var ringSizes = [13.5, 14, 14.5];
    var textItems = [];
    for (var i = 0; i < labels.length; i++) {
      var l = labels[i];
      var angle = ringOffsets[l.ring] + (l.slot / 4) * Math.PI * 2;
      textItems.push({
        text: l.text, baseAngle: angle, radius: ringRadii[l.ring],
        phase: Math.random() * Math.PI * 2,
        orbitSpeed: 0.00004 + Math.random() * 0.00003,
        breathSpeed: 0.0003 + Math.random() * 0.0003,
        breathAmount: 8 + Math.random() * 8,
        fadePhase: Math.random() * Math.PI * 2,
        fadeSpeed: 0.0003 + Math.random() * 0.0003,
        colourPos: i / labels.length,
        fontSize: ringSizes[l.ring]
      });
    }

    var shapes = [];
    for (var i = 0; i < 7; i++) {
      var angle = (i / 7) * Math.PI * 2;
      var dist = 40 + Math.random() * 60;
      shapes.push({
        ox: Math.cos(angle) * dist, oy: Math.sin(angle) * dist,
        baseRadius: 60 + Math.random() * 80,
        numPoints: 5 + Math.floor(Math.random() * 3),
        phase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0006 + Math.random() * 0.0004,
        rotSpeed: 0.00008 + (Math.random() - 0.5) * 0.00012,
        driftSpeed: 0.0002 + Math.random() * 0.0002,
        colourPos: i / 7, organicness: 0.3 + Math.random() * 0.4,
        pointPhases: [], pointSpeeds: []
      });
      for (var j = 0; j < shapes[i].numPoints; j++) {
        shapes[i].pointPhases.push(Math.random() * Math.PI * 2);
        shapes[i].pointSpeeds.push(0.0008 + Math.random() * 0.0006);
      }
    }

    var pulses = [], pulseTimer = 0, pulseInterval = 3000;
    function addPulse(time) {
      pulses.push({ born: time, life: 4000 + Math.random() * 2000, colourPos: Math.random() });
    }

    var tendrils = [];
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      tendrils.push({
        angle: a, length: 120 + Math.random() * 180, width: 1 + Math.random() * 2,
        waveMag: 15 + Math.random() * 25, waveFreq: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2, speed: 0.0003 + Math.random() * 0.0003,
        colourPos: i / 12, growPhase: Math.random() * Math.PI * 2, growSpeed: 0.0002 + Math.random() * 0.0002
      });
    }

    var fragments = [];
    for (var i = 0; i < 20; i++) {
      var a = Math.random() * Math.PI * 2, d = 100 + Math.random() * 150;
      fragments.push({
        bx: Math.cos(a) * d, by: Math.sin(a) * d, size: 4 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2, rotSpeed: 0.0003 + (Math.random() - 0.5) * 0.0006,
        phase: Math.random() * Math.PI * 2, breathSpeed: 0.0005 + Math.random() * 0.0005,
        driftPhase: Math.random() * Math.PI * 2, driftSpeed: 0.00015 + Math.random() * 0.0002,
        colourPos: Math.random(), softenPhase: Math.random() * Math.PI * 2,
        softenSpeed: 0.00008 + Math.random() * 0.00008
      });
    }

    function drawOrganicShape(shape, time) {
      var breathe = Math.sin(time * shape.breathSpeed + shape.phase);
      var radius = shape.baseRadius * (0.85 + breathe * 0.15);
      var rot = time * shape.rotSpeed;
      var dX = Math.sin(time * shape.driftSpeed + shape.phase) * 20;
      var dY = Math.cos(time * shape.driftSpeed * 0.8 + shape.phase * 1.3) * 15;
      var x = cx + shape.ox + dX, y = cy + shape.oy + dY;
      var pts = [], n = shape.numPoints;
      for (var i = 0; i < n; i++) {
        var a = rot + (i / n) * Math.PI * 2;
        var w = Math.sin(time * shape.pointSpeeds[i] + shape.pointPhases[i]) * radius * 0.25 * shape.organicness;
        pts.push({ x: x + Math.cos(a) * (radius + w), y: y + Math.sin(a) * (radius + w) });
      }
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
        if(i===0)ctx.moveTo(p1.x,p1.y);
        ctx.bezierCurveTo(p1.x+(p2.x-p0.x)*0.3,p1.y+(p2.y-p0.y)*0.3,p2.x-(p3.x-p1.x)*0.3,p2.y-(p3.y-p1.y)*0.3,p2.x,p2.y);
      }
      ctx.closePath();
      var alpha = 0.06 + breathe * 0.02;
      var grad = ctx.createRadialGradient(x,y,0,x,y,radius*1.2);
      grad.addColorStop(0,colourAt(shape.colourPos,alpha*1.5));
      grad.addColorStop(0.6,colourAt(shape.colourPos,alpha));
      grad.addColorStop(1,colourAt(shape.colourPos,0));
      ctx.fillStyle=grad;ctx.fill();
      ctx.strokeStyle=colourAt(shape.colourPos,alpha*0.8);ctx.lineWidth=1;ctx.stroke();
    }

    function drawPulses(time) {
      for(var i=pulses.length-1;i>=0;i--){
        var p=pulses[i],age=time-p.born;
        if(age>p.life){pulses.splice(i,1);continue;}
        var progress=age/p.life;
        ctx.beginPath();ctx.arc(cx,cy,progress*Math.min(W,H)*0.4,0,Math.PI*2);
        ctx.strokeStyle=colourAt(p.colourPos,(1-progress)*0.08);
        ctx.lineWidth=2*(1-progress);ctx.stroke();
      }
    }

    function drawTendrils(time) {
      for(var i=0;i<tendrils.length;i++){
        var t=tendrils[i];
        var len=t.length*(0.7+Math.sin(time*t.growSpeed+t.growPhase)*0.3);
        ctx.beginPath();
        for(var s=0;s<=40;s++){
          var p=s/40,dist=p*len;
          var wave=Math.sin(p*t.waveFreq*Math.PI+time*t.speed+t.phase)*t.waveMag*p;
          var dx=Math.cos(t.angle),dy=Math.sin(t.angle);
          var x=cx+dx*dist+(-dy)*wave,y=cy+dy*dist+dx*wave;
          if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle=colourAt(t.colourPos,0.04+Math.sin(time*0.0003+t.phase)*0.02);
        ctx.lineWidth=t.width;ctx.stroke();
      }
    }

    function drawFragments(time) {
      for(var i=0;i<fragments.length;i++){
        var f=fragments[i];
        var breathe=Math.sin(time*f.breathSpeed+f.phase);
        var size=f.size*(0.8+breathe*0.3);
        var rot=f.rotation+time*f.rotSpeed;
        var x=cx+f.bx+Math.sin(time*f.driftSpeed+f.driftPhase)*15;
        var y=cy+f.by+Math.cos(time*f.driftSpeed*0.7+f.driftPhase*1.4)*12;
        var sides=Math.round(4+(0.5+Math.sin(time*f.softenSpeed+f.softenPhase)*0.5)*12);
        ctx.beginPath();
        for(var j=0;j<=sides;j++){
          var a=rot+(j/sides)*Math.PI*2;
          if(j===0)ctx.moveTo(x+Math.cos(a)*size,y+Math.sin(a)*size);
          else ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);
        }
        ctx.closePath();
        ctx.fillStyle=colourAt(f.colourPos,0.08+breathe*0.04);ctx.fill();
      }
    }

    function drawCentreGlow(time) {
      var breathe=Math.sin(time*0.0004)*0.3;
      var radius=80+breathe*20;
      var grad=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
      grad.addColorStop(0,colourAt(0.3,0.12+breathe*0.03));
      grad.addColorStop(0.5,colourAt(0.5,0.05));
      grad.addColorStop(1,colourAt(0.7,0));
      ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
      ctx.fillStyle=grad;ctx.fill();
    }

    function drawTextLabels(time) {
      ctx.textAlign='center';ctx.textBaseline='middle';
      for(var i=0;i<textItems.length;i++){
        var t=textItems[i];
        var currentAngle=t.baseAngle+time*t.orbitSpeed;
        var radialBreath=Math.sin(time*t.breathSpeed+t.phase)*t.breathAmount;
        var currentRadius=t.radius+radialBreath;
        var x=cx+Math.cos(currentAngle)*currentRadius;
        var y=cy+Math.sin(currentAngle)*currentRadius;
        var fadeCycle=Math.sin(time*t.fadeSpeed+t.fadePhase);
        var alpha=0.45+fadeCycle*0.15;
        var tilt=Math.sin(currentAngle)*0.05;
        ctx.save();
        ctx.translate(x,y);ctx.rotate(tilt);
        ctx.shadowColor=colourAt(t.colourPos,0.5);ctx.shadowBlur=20;
        ctx.font='400 '+t.fontSize+'px "Source Sans 3","Source Sans Pro",sans-serif';
        ctx.fillStyle=colourAt(t.colourPos,alpha);
        ctx.fillText(t.text,0,0);
        ctx.shadowColor='transparent';ctx.shadowBlur=0;
        ctx.fillStyle=colourAt(t.colourPos,alpha);
        ctx.fillText(t.text,0,0);
        ctx.restore();
      }
    }

    function tick(time) {
      ctx.clearRect(0,0,W,H);
      pulseTimer+=16;
      if(pulseTimer>pulseInterval){addPulse(time);pulseTimer=0;}
      drawTendrils(time);
      drawPulses(time);
      for(var i=0;i<shapes.length;i++)drawOrganicShape(shapes[i],time);
      drawFragments(time);
      drawCentreGlow(time);
      drawTextLabels(time);
      animId = requestAnimationFrame(tick);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(20000);
    } else {
      animId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
