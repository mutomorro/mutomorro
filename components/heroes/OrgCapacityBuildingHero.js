'use client'
import { useEffect, useRef } from 'react'

export default function OrgCapacityBuildingHero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H, cx, cy

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
      return 'rgba(' + Math.round(a.r + (b.r - a.r) * f) + ',' +
             Math.round(a.g + (b.g - a.g) * f) + ',' +
             Math.round(a.b + (b.b - a.b) * f) + ',' + alpha + ')';
    }

    // ---- CENTRAL ORGANISM ----
    var coreRadius = 70;
    var corePoints = 10;
    var coreShape = [];

    // ---- BUDS ----
    var buds = [];
    var numBuds = 14;

    // ---- ROOTS ----
    var roots = [];
    var numRoots = 10;

    // ---- ENERGY PULSES ----
    var energyPulses = [];
    var energyTimer = 0;
    var energyInterval = 800;

    // ---- SPORES ----
    var spores = [];

    // ---- TEXT LABELS ----
    var labels = [
      { text: 'what people can do', ring: 0, slot: 0 },
      { text: 'what they are learning', ring: 0, slot: 1 },
      { text: 'how skills spread', ring: 0, slot: 2 },
      { text: 'what knowledge stays', ring: 0, slot: 3 },
      { text: 'whether development is real or token', ring: 1, slot: 0 },
      { text: 'how teams lift each other', ring: 1, slot: 1 },
      { text: 'what leaders model', ring: 1, slot: 2 },
      { text: 'where confidence grows', ring: 1, slot: 3 },
      { text: 'how the organisation builds itself', ring: 2, slot: 0 },
      { text: 'what dependency looks like', ring: 2, slot: 1 },
      { text: 'when training becomes practice', ring: 2, slot: 2 },
      { text: 'how growth compounds', ring: 2, slot: 3 },
    ];

    var ringRadii = [135, 215, 295];
    var ringOffsets = [0.2, Math.PI / 4, Math.PI / 6 + 0.3];
    var ringSizes = [13.5, 14, 14.5];

    var textItems = [];

    function initAll() {
      // Core shape
      coreShape = [];
      for (var i = 0; i < corePoints; i++) {
        coreShape.push({
          angle: (i / corePoints) * Math.PI * 2,
          baseRadius: coreRadius * (0.85 + Math.random() * 0.3),
          breathPhase: Math.random() * Math.PI * 2,
          breathSpeed: 0.0005 + Math.random() * 0.0005,
          breathAmount: 8 + Math.random() * 10
        });
      }

      // Buds
      buds = [];
      for (var i = 0; i < numBuds; i++) {
        var angle = (i / numBuds) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        buds.push({
          angle: angle,
          growthPhase: Math.random() * Math.PI * 2,
          growthSpeed: 0.0002 + Math.random() * 0.0002,
          maxLength: 40 + Math.random() * 80,
          width: 3 + Math.random() * 5,
          bloomSize: 8 + Math.random() * 15,
          colourPos: i / numBuds,
          breathPhase: Math.random() * Math.PI * 2,
          breathSpeed: 0.001 + Math.random() * 0.001,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.0004 + Math.random() * 0.0004,
          swayAmount: 0.05 + Math.random() * 0.08
        });
      }

      // Roots
      roots = [];
      for (var i = 0; i < numRoots; i++) {
        var angle = Math.PI * 0.3 + (i / numRoots) * Math.PI * 0.4 + (Math.random() - 0.5) * 0.3;
        roots.push({
          angle: angle,
          length: 80 + Math.random() * 120,
          segments: 20,
          width: 1 + Math.random() * 2,
          waveAmount: 8 + Math.random() * 12,
          waveFreq: 2 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          growthSpeed: 0.0001 + Math.random() * 0.0001,
          colourPos: 0.05 + (i / numRoots) * 0.3,
          breathPhase: Math.random() * Math.PI * 2,
          breathSpeed: 0.0003 + Math.random() * 0.0003
        });
      }

      // Text items
      textItems = [];
      for (var i = 0; i < labels.length; i++) {
        var l = labels[i];
        var angle = ringOffsets[l.ring] + (l.slot / 4) * Math.PI * 2;
        textItems.push({
          text: l.text,
          baseAngle: angle,
          radius: ringRadii[l.ring],
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
      cx = W / 2
      cy = H / 2
      if (coreShape.length === 0) {
        initAll();
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    // ---- HELPERS ----

    function getCoreRadius(angle, time) {
      var n = coreShape.length;
      var normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      var idx = (normAngle / (Math.PI * 2)) * n;
      var i = Math.floor(idx) % n;
      var f = idx - Math.floor(idx);
      var p1 = coreShape[i];
      var p2 = coreShape[(i + 1) % n];
      var r1 = p1.baseRadius + Math.sin(time * p1.breathSpeed + p1.breathPhase) * p1.breathAmount;
      var r2 = p2.baseRadius + Math.sin(time * p2.breathSpeed + p2.breathPhase) * p2.breathAmount;
      return r1 + (r2 - r1) * f;
    }

    // ---- DRAW FUNCTIONS ----

    function drawCore(time) {
      var n = 60;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var angle = (i / n) * Math.PI * 2;
        var r = getCoreRadius(angle, time);
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 1.2);
      grad.addColorStop(0, colourAt(0.3, 0.12));
      grad.addColorStop(0.5, colourAt(0.25, 0.07));
      grad.addColorStop(1, colourAt(0.2, 0.02));
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = colourAt(0.3, 0.1);
      ctx.lineWidth = 1;
      ctx.stroke();

      var innerGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, coreRadius * 0.5);
      innerGrad.addColorStop(0, colourAt(0.35, 0.1));
      innerGrad.addColorStop(1, colourAt(0.35, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();
    }

    function drawRoots(time) {
      for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        var breathe = Math.sin(time * root.breathSpeed + root.breathPhase);
        var growPulse = 0.85 + Math.sin(time * root.growthSpeed) * 0.15;
        var len = root.length * growPulse;

        var startR = getCoreRadius(root.angle, time);
        var startX = cx + Math.cos(root.angle) * startR;
        var startY = cy + Math.sin(root.angle) * startR;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (var s = 1; s <= root.segments; s++) {
          var t = s / root.segments;
          var dist = t * len;
          var wave = Math.sin(t * root.waveFreq * Math.PI + root.phase + time * 0.0002) * root.waveAmount * t;
          var dx = Math.cos(root.angle);
          var dy = Math.sin(root.angle);
          var x = startX + dx * dist + (-dy) * wave;
          var y = startY + dy * dist + dx * wave;
          ctx.lineTo(x, y);
        }

        var grad = ctx.createLinearGradient(
          startX, startY,
          startX + Math.cos(root.angle) * len,
          startY + Math.sin(root.angle) * len
        );
        grad.addColorStop(0, colourAt(root.colourPos, 0.12 + breathe * 0.03));
        grad.addColorStop(0.5, colourAt(root.colourPos, 0.07));
        grad.addColorStop(1, colourAt(root.colourPos, 0.02));
        ctx.strokeStyle = grad;
        ctx.lineWidth = root.width * (1 + breathe * 0.2);
        ctx.stroke();

        // Tiny root tip glow
        var tipT = 1;
        var tipDist = tipT * len;
        var tipWave = Math.sin(tipT * root.waveFreq * Math.PI + root.phase + time * 0.0002) * root.waveAmount * tipT;
        var tipX = startX + Math.cos(root.angle) * tipDist + (-Math.sin(root.angle)) * tipWave;
        var tipY = startY + Math.sin(root.angle) * tipDist + Math.cos(root.angle) * tipWave;

        ctx.beginPath();
        ctx.arc(tipX, tipY, 2 + breathe, 0, Math.PI * 2);
        ctx.fillStyle = colourAt(root.colourPos, 0.15);
        ctx.fill();
      }
    }

    function drawBuds(time) {
      for (var i = 0; i < buds.length; i++) {
        var bud = buds[i];
        var breathe = Math.sin(time * bud.breathSpeed + bud.breathPhase);
        var sway = Math.sin(time * bud.swaySpeed + bud.swayPhase) * bud.swayAmount;
        var angle = bud.angle + sway;

        var growth = (Math.sin(time * bud.growthSpeed + bud.growthPhase) + 1) / 2;
        growth = growth * growth;

        var length = bud.maxLength * growth;
        if (length < 3) continue;

        var startR = getCoreRadius(angle, time);
        var startX = cx + Math.cos(angle) * startR;
        var startY = cy + Math.sin(angle) * startR;

        var endX = startX + Math.cos(angle) * length;
        var endY = startY + Math.sin(angle) * length;
        var ctrlX = startX + Math.cos(angle + 0.15) * length * 0.6;
        var ctrlY = startY + Math.sin(angle + 0.15) * length * 0.6;

        // Stem
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        var stemAlpha = 0.12 + growth * 0.15;
        ctx.strokeStyle = colourAt(bud.colourPos, stemAlpha);
        ctx.lineWidth = bud.width * (0.5 + growth * 0.5);
        ctx.stroke();

        // Bloom at tip
        if (growth > 0.4) {
          var bloomGrowth = (growth - 0.4) / 0.6;
          var bloomR = bud.bloomSize * bloomGrowth * (0.85 + breathe * 0.15);

          // Glow
          var glowGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, bloomR * 3);
          glowGrad.addColorStop(0, colourAt(bud.colourPos, 0.15 + bloomGrowth * 0.15));
          glowGrad.addColorStop(0.5, colourAt(bud.colourPos, 0.05));
          glowGrad.addColorStop(1, colourAt(bud.colourPos, 0));
          ctx.beginPath();
          ctx.arc(endX, endY, bloomR * 3, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Bloom shape - soft petals
          var petals = 5;
          ctx.beginPath();
          for (var p = 0; p <= petals * 10; p++) {
            var pa = (p / (petals * 10)) * Math.PI * 2;
            var petalR = bloomR * (0.7 + Math.sin(pa * petals) * 0.3);
            var px = endX + Math.cos(pa) * petalR;
            var py = endY + Math.sin(pa) * petalR;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = colourAt(bud.colourPos, 0.15 + bloomGrowth * 0.1);
          ctx.fill();

          // Bright centre
          ctx.beginPath();
          ctx.arc(endX, endY, bloomR * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = colourAt(bud.colourPos, 0.5 + bloomGrowth * 0.3);
          ctx.fill();

          // Spawn spores from mature blooms
          if (bloomGrowth > 0.8 && Math.random() > 0.97) {
            spores.push({
              x: endX,
              y: endY,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3 - 0.1,
              size: 1 + Math.random(),
              colourPos: bud.colourPos,
              alpha: 0.4,
              life: 3000,
              born: performance.now()
            });
          }
        }
      }
    }

    function drawEnergyPulses(time) {
      energyTimer += 16;
      if (energyTimer > energyInterval) {
        var rootIdx = Math.floor(Math.random() * numRoots);
        var budIdx = Math.floor(Math.random() * numBuds);
        energyPulses.push({
          rootIdx: rootIdx,
          budIdx: budIdx,
          born: time,
          life: 2500,
          colourPos: 0.3 + Math.random() * 0.4
        });
        energyTimer = 0;
      }

      for (var i = energyPulses.length - 1; i >= 0; i--) {
        var ep = energyPulses[i];
        var age = time - ep.born;
        if (age > ep.life) { energyPulses.splice(i, 1); continue; }

        var progress = age / ep.life;
        var alpha = (progress < 0.5 ? progress * 2 : (1 - progress) * 2) * 0.3;

        var root = roots[ep.rootIdx];
        var bud = buds[ep.budIdx];

        var x, y;
        if (progress < 0.3) {
          var t = 1 - (progress / 0.3);
          var rootR = getCoreRadius(root.angle, time);
          var rootStartX = cx + Math.cos(root.angle) * rootR;
          var rootStartY = cy + Math.sin(root.angle) * rootR;
          x = rootStartX + Math.cos(root.angle) * root.length * 0.5 * t;
          y = rootStartY + Math.sin(root.angle) * root.length * 0.5 * t;
        } else if (progress < 0.5) {
          var t = (progress - 0.3) / 0.2;
          var fromAngle = root.angle;
          var toAngle = bud.angle;
          var curAngle = fromAngle + (toAngle - fromAngle) * t;
          var r = coreRadius * 0.3;
          x = cx + Math.cos(curAngle) * r * (1 - Math.sin(t * Math.PI));
          y = cy + Math.sin(curAngle) * r * (1 - Math.sin(t * Math.PI));
        } else {
          var t = (progress - 0.5) / 0.5;
          var growth = (Math.sin(time * bud.growthSpeed + bud.growthPhase) + 1) / 2;
          growth = growth * growth;
          var sway = Math.sin(time * bud.swaySpeed + bud.swayPhase) * bud.swayAmount;
          var budAngle = bud.angle + sway;
          var budR = getCoreRadius(budAngle, time);
          var budStartX = cx + Math.cos(budAngle) * budR;
          var budStartY = cy + Math.sin(budAngle) * budR;
          x = budStartX + Math.cos(budAngle) * bud.maxLength * growth * t;
          y = budStartY + Math.sin(budAngle) * bud.maxLength * growth * t;
        }

        // Draw energy dot
        var grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
        grad.addColorStop(0, colourAt(ep.colourPos, alpha));
        grad.addColorStop(1, colourAt(ep.colourPos, 0));
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = colourAt(ep.colourPos, alpha * 2);
        ctx.fill();
      }
    }

    function drawSpores(time) {
      var now = performance.now();
      for (var i = spores.length - 1; i >= 0; i--) {
        var sp = spores[i];
        var age = now - sp.born;
        if (age > sp.life) { spores.splice(i, 1); continue; }

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy -= 0.002;
        sp.vx += (Math.random() - 0.5) * 0.02;

        var progress = age / sp.life;
        var alpha = sp.alpha * (1 - progress);
        var size = sp.size * (1 - progress * 0.5);

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, size, 0, Math.PI * 2);
        ctx.fillStyle = colourAt(sp.colourPos, alpha);
        ctx.fill();
      }

      if (spores.length > 50) spores.splice(0, spores.length - 50);
    }

    function drawTextLabels(time) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var i = 0; i < textItems.length; i++) {
        var t = textItems[i];
        var currentAngle = t.baseAngle + time * t.orbitSpeed;
        var radialBreath = Math.sin(time * t.breathSpeed + t.phase) * t.breathAmount;
        var currentRadius = t.radius + radialBreath;
        var x = cx + Math.cos(currentAngle) * currentRadius;
        var y = cy + Math.sin(currentAngle) * currentRadius;
        var fadeCycle = Math.sin(time * t.fadeSpeed + t.fadePhase);
        var alpha = 0.4 + fadeCycle * 0.15;
        var tilt = Math.sin(currentAngle) * 0.04;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);

        ctx.shadowColor = colourAt(t.colourPos, 0.5);
        ctx.shadowBlur = 20;
        ctx.font = '400 ' + t.fontSize + 'px "Source Sans 3", "Source Sans Pro", sans-serif';
        ctx.fillStyle = colourAt(t.colourPos, alpha);
        ctx.fillText(t.text, 0, 0);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = colourAt(t.colourPos, alpha);
        ctx.fillText(t.text, 0, 0);

        ctx.restore();
      }
    }

    // ---- MAIN LOOP ----
    function tick(time) {
      ctx.clearRect(0, 0, W, H);

      drawRoots(time);
      drawCore(time);
      drawBuds(time);
      drawEnergyPulses(time);
      drawSpores(time);
      drawTextLabels(time);

      animId = requestAnimationFrame(tick);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(10000);
    } else {
      animId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
