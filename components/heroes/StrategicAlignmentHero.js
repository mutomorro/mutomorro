'use client'
import { useEffect, useRef } from 'react'

export default function StrategicAlignmentHero() {
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

    // ---- THE FLOCK ----
    var numBirds = 200;
    var birds = [];

    // ---- FLOCKING RULES ----
    var separationDist = 20;
    var alignmentDist = 60;
    var cohesionDist = 80;
    var maxSpeed = 1.8;
    var minSpeed = 0.3;

    // Shared direction signal
    var sharedAngle = 0;
    var sharedAngleTarget = 0;
    var sharedAngleChangeTimer = 0;
    var sharedAngleChangeInterval = 8000;
    var alignmentStrength = 0;

    // Alignment waves
    var alignWaves = [];
    var waveTimer = 0;
    var waveInterval = 5000;

    // ---- TEXT LABELS ----
    var labels = [
      { text: 'whether teams pull together', ring: 0, slot: 0 },
      { text: 'how priorities cascade', ring: 0, slot: 1 },
      { text: 'what gets resourced', ring: 0, slot: 2 },
      { text: 'what drifts', ring: 0, slot: 3 },
      { text: 'whether structure matches strategy', ring: 1, slot: 0 },
      { text: 'how the plan meets the culture', ring: 1, slot: 1 },
      { text: 'what competing priorities cost', ring: 1, slot: 2 },
      { text: 'where energy gets scattered', ring: 1, slot: 3 },
      { text: 'how far strategy reaches', ring: 2, slot: 0 },
      { text: 'what people at the front line feel', ring: 2, slot: 1 },
      { text: 'whether daily work connects to direction', ring: 2, slot: 2 },
      { text: 'when alignment breaks', ring: 2, slot: 3 },
    ];

    var ringRadii = [120, 205, 290];
    var ringOffsets = [0.05, Math.PI / 4 - 0.1, Math.PI / 6 + 0.3];
    var ringSizes = [13.5, 14, 14.5];

    var textItems = [];

    function initBirds() {
      birds = [];
      for (var i = 0; i < numBirds; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.6 + Math.random() * 0.4;
        birds.push({
          x: cx + (Math.random() - 0.5) * W * 0.6,
          y: cy + (Math.random() - 0.5) * H * 0.6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.2 + Math.random() * 1.8,
          colourPos: Math.random(),
          alpha: 0.35 + Math.random() * 0.35,
          neighbourDist: 50 + Math.random() * 30
        });
      }
    }

    function initTextItems() {
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
      if (birds.length === 0) {
        initBirds();
        initTextItems();
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    function updateBirds(time) {
      // Update shared direction
      sharedAngleChangeTimer += 16;
      if (sharedAngleChangeTimer > sharedAngleChangeInterval) {
        sharedAngleTarget = sharedAngle + (Math.random() - 0.5) * Math.PI * 0.6;
        sharedAngleChangeTimer = 0;
      }
      sharedAngle += (sharedAngleTarget - sharedAngle) * 0.001;

      // Alignment strength oscillates
      alignmentStrength = 0.3 + Math.sin(time * 0.0002) * 0.15 + Math.sin(time * 0.00007) * 0.1;

      // Alignment waves
      waveTimer += 16;
      if (waveTimer > waveInterval) {
        alignWaves.push({
          born: time,
          life: 3000,
          x: cx + (Math.random() - 0.5) * W * 0.3,
          y: cy + (Math.random() - 0.5) * H * 0.3
        });
        waveTimer = 0;
      }

      for (var i = 0; i < numBirds; i++) {
        var bird = birds[i];

        // Flocking accumulators
        var sepX = 0, sepY = 0, sepCount = 0;
        var aliVX = 0, aliVY = 0, aliCount = 0;
        var cohX = 0, cohY = 0, cohCount = 0;

        for (var j = 0; j < numBirds; j++) {
          if (i === j) continue;
          var other = birds[j];
          var dx = other.x - bird.x;
          var dy = other.y - bird.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          // Separation
          if (dist < separationDist && dist > 0) {
            sepX -= dx / dist;
            sepY -= dy / dist;
            sepCount++;
          }

          // Alignment
          if (dist < alignmentDist) {
            aliVX += other.vx;
            aliVY += other.vy;
            aliCount++;
          }

          // Cohesion
          if (dist < cohesionDist) {
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }
        }

        // Apply separation
        if (sepCount > 0) {
          bird.vx += sepX / sepCount * 0.08;
          bird.vy += sepY / sepCount * 0.08;
        }

        // Apply alignment with neighbours
        if (aliCount > 0) {
          var avgVX = aliVX / aliCount;
          var avgVY = aliVY / aliCount;
          bird.vx += (avgVX - bird.vx) * 0.03;
          bird.vy += (avgVY - bird.vy) * 0.03;
        }

        // Apply cohesion
        if (cohCount > 0) {
          var avgX = cohX / cohCount;
          var avgY = cohY / cohCount;
          bird.vx += (avgX - bird.x) * 0.0003;
          bird.vy += (avgY - bird.y) * 0.0003;
        }

        // Shared strategic direction
        var sharedVX = Math.cos(sharedAngle) * alignmentStrength;
        var sharedVY = Math.sin(sharedAngle) * alignmentStrength;
        bird.vx += (sharedVX - bird.vx) * 0.01;
        bird.vy += (sharedVY - bird.vy) * 0.01;

        // Alignment wave boost
        for (var w = 0; w < alignWaves.length; w++) {
          var wave = alignWaves[w];
          var age = time - wave.born;
          var waveRadius = (age / wave.life) * Math.max(W, H) * 0.6;
          var dx = bird.x - wave.x;
          var dy = bird.y - wave.y;
          var distFromWave = Math.sqrt(dx * dx + dy * dy);
          var ringDist = Math.abs(distFromWave - waveRadius);
          if (ringDist < 30) {
            bird.vx += (sharedVX - bird.vx) * 0.05;
            bird.vy += (sharedVY - bird.vy) * 0.05;
          }
        }

        // Keep flock loosely centred
        bird.vx += (cx - bird.x) * 0.00003;
        bird.vy += (cy - bird.y) * 0.00003;

        // Speed limits
        var speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
        if (speed > maxSpeed) {
          bird.vx = (bird.vx / speed) * maxSpeed;
          bird.vy = (bird.vy / speed) * maxSpeed;
        }
        if (speed < minSpeed) {
          bird.vx = (bird.vx / speed) * minSpeed;
          bird.vy = (bird.vy / speed) * minSpeed;
        }

        // Update position
        bird.x += bird.vx;
        bird.y += bird.vy;

        // Soft boundary wrap
        var margin = 50;
        if (bird.x < -margin) bird.x = W + margin;
        if (bird.x > W + margin) bird.x = -margin;
        if (bird.y < -margin) bird.y = H + margin;
        if (bird.y > H + margin) bird.y = -margin;
      }

      // Clean up old waves
      for (var w = alignWaves.length - 1; w >= 0; w--) {
        if (time - alignWaves[w].born > alignWaves[w].life) {
          alignWaves.splice(w, 1);
        }
      }
    }

    function drawBirds(time) {
      for (var i = 0; i < numBirds; i++) {
        var bird = birds[i];
        var speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
        var angle = Math.atan2(bird.vy, bird.vx);

        // Colour shifts based on alignment with shared direction
        var angleDiff = Math.abs(angle - sharedAngle);
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        angleDiff = Math.abs(angleDiff);
        var alignment = 1 - angleDiff / Math.PI;
        var colT = bird.colourPos * 0.5 + alignment * 0.5;

        // Glow
        var glowSize = bird.size * (3 + alignment * 3);
        var glowGrad = ctx.createRadialGradient(bird.x, bird.y, 0, bird.x, bird.y, glowSize);
        glowGrad.addColorStop(0, colourAt(colT, bird.alpha * (0.15 + alignment * 0.15)));
        glowGrad.addColorStop(1, colourAt(colT, 0));
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Draw as small oriented triangle
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(angle);

        var len = bird.size * 2;
        var wid = bird.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(len, 0);
        ctx.lineTo(-len * 0.5, -wid);
        ctx.lineTo(-len * 0.3, 0);
        ctx.lineTo(-len * 0.5, wid);
        ctx.closePath();
        ctx.fillStyle = colourAt(colT, bird.alpha);
        ctx.fill();

        ctx.restore();
      }
    }

    function drawAlignWaves(time) {
      for (var w = 0; w < alignWaves.length; w++) {
        var wave = alignWaves[w];
        var age = time - wave.born;
        var progress = age / wave.life;
        var radius = progress * Math.max(W, H) * 0.6;
        var alpha = (1 - progress) * 0.04;

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = colourAt(0.4, alpha);
        ctx.lineWidth = 2 * (1 - progress);
        ctx.stroke();
      }
    }

    function drawDirectionHint(time) {
      var len = 60;
      var endX = cx + Math.cos(sharedAngle) * len;
      var endY = cy + Math.sin(sharedAngle) * len;

      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(sharedAngle) * 20, cy - Math.sin(sharedAngle) * 20);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = colourAt(0.4, 0.04);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      var arrLen = 8;
      var arrAngle = 0.5;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - Math.cos(sharedAngle - arrAngle) * arrLen,
        endY - Math.sin(sharedAngle - arrAngle) * arrLen
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - Math.cos(sharedAngle + arrAngle) * arrLen,
        endY - Math.sin(sharedAngle + arrAngle) * arrLen
      );
      ctx.strokeStyle = colourAt(0.4, 0.06);
      ctx.lineWidth = 1.5;
      ctx.stroke();
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

      updateBirds(time);
      drawAlignWaves(time);
      drawDirectionHint(time);
      drawBirds(time);
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
