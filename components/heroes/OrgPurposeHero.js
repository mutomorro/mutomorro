'use client'
import { useEffect, useRef } from 'react'

export default function OrgPurposeHero() {
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
    ]

    function colourAt(t, alpha) {
      t = Math.max(0, Math.min(1, t))
      var idx = t * (colours.length - 1)
      var i = Math.floor(idx)
      var f = idx - i
      if (i >= colours.length - 1) { i = colours.length - 2; f = 1 }
      var a = colours[i], b = colours[i + 1]
      return 'rgba(' + Math.round(a.r + (b.r - a.r) * f) + ',' +
             Math.round(a.g + (b.g - a.g) * f) + ',' +
             Math.round(a.b + (b.b - a.b) * f) + ',' + alpha + ')'
    }

    // ---- CENTRAL PULSE (the heartbeat of purpose) ----
    var pulseSpeed = 0.0008

    // ---- RAYS radiating outward ----
    var numRays = 16
    var rays = []
    function initRays() {
      rays = []
      for (var i = 0; i < numRays; i++) {
        var angle = (i / numRays) * Math.PI * 2
        rays.push({
          angle: angle,
          length: 250 + Math.random() * 150,
          width: 1 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          breathSpeed: 0.0004 + Math.random() * 0.0004,
          colourPos: i / numRays,
          drift: 0.00002 + (Math.random() - 0.5) * 0.00002
        })
      }
    }

    // ---- FLOATING ELEMENTS that align to purpose ----
    var elements = []
    var numElements = 55
    function initElements() {
      elements = []
      for (var i = 0; i < numElements; i++) {
        var angle = Math.random() * Math.PI * 2
        var dist = 60 + Math.random() * 320
        elements.push({
          baseAngle: angle,
          baseDist: dist,
          orientation: Math.random() * Math.PI * 2,
          alignSpeed: 0.0002 + Math.random() * 0.0003,
          size: 3 + Math.random() * 6,
          aspectRatio: 1.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          breathSpeed: 0.0005 + Math.random() * 0.0005,
          orbitSpeed: 0.00003 + Math.random() * 0.00004,
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: 0.0002 + Math.random() * 0.0002,
          driftAmount: 5 + Math.random() * 15,
          colourPos: Math.random(),
          alpha: 0.15 + Math.random() * 0.25
        })
      }
    }

    // ---- ALIGNMENT PULSES (waves that ripple out, causing alignment) ----
    var alignPulses = []
    var alignPulseTimer = 0
    var alignPulseInterval = 4000

    function addAlignPulse(time) {
      alignPulses.push({
        born: time,
        life: 5000,
        colourPos: 0.3 + Math.random() * 0.3
      })
    }

    // ---- TINY ORBITING MOTES near centre ----
    var motes = []
    function initMotes() {
      motes = []
      for (var i = 0; i < 20; i++) {
        motes.push({
          angle: Math.random() * Math.PI * 2,
          dist: 20 + Math.random() * 50,
          speed: 0.001 + Math.random() * 0.001,
          size: 0.8 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          breathSpeed: 0.002 + Math.random() * 0.002,
          colourPos: 0.2 + Math.random() * 0.3
        })
      }
    }

    // ---- TEXT LABELS ----
    var labels = [
      { text: 'why we exist', ring: 0, slot: 0 },
      { text: 'what we will not compromise', ring: 0, slot: 1 },
      { text: 'what draws people in', ring: 0, slot: 2 },
      { text: 'what decisions get tested against', ring: 0, slot: 3 },
      { text: 'what stories get told', ring: 1, slot: 0 },
      { text: 'what success actually means', ring: 1, slot: 1 },
      { text: 'how purpose shows up on Monday', ring: 1, slot: 2 },
      { text: 'where it drifts', ring: 1, slot: 3 },
      { text: 'whether the website matches reality', ring: 2, slot: 0 },
      { text: 'what new starters feel', ring: 2, slot: 1 },
      { text: 'how customers describe us', ring: 2, slot: 2 },
      { text: 'what we would fight to protect', ring: 2, slot: 3 },
    ]

    var ringRadii = [115, 200, 285]
    var ringOffsets = [0.3, Math.PI / 4 + 0.1, Math.PI / 5]
    var ringSizes = [13.5, 14, 14.5]

    var textItems = []
    function initTextItems() {
      textItems = []
      for (var i = 0; i < labels.length; i++) {
        var l = labels[i]
        var angle = ringOffsets[l.ring] + (l.slot / 4) * Math.PI * 2
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
        })
      }
    }

    // ---- DRAW FUNCTIONS ----

    function drawCentralPulse(time) {
      var pulse = 0.6 + Math.sin(time * pulseSpeed) * 0.4
      var pulse2 = 0.7 + Math.sin(time * pulseSpeed * 0.7 + 1) * 0.3

      var r1 = 90 * pulse2
      var grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1)
      grad1.addColorStop(0, colourAt(0.3, 0.15 * pulse))
      grad1.addColorStop(0.4, colourAt(0.35, 0.08 * pulse))
      grad1.addColorStop(1, colourAt(0.4, 0))
      ctx.beginPath()
      ctx.arc(cx, cy, r1, 0, Math.PI * 2)
      ctx.fillStyle = grad1
      ctx.fill()

      var r2 = 40 * pulse
      var grad2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r2)
      grad2.addColorStop(0, colourAt(0.35, 0.25 * pulse))
      grad2.addColorStop(0.5, colourAt(0.4, 0.1 * pulse))
      grad2.addColorStop(1, colourAt(0.45, 0))
      ctx.beginPath()
      ctx.arc(cx, cy, r2, 0, Math.PI * 2)
      ctx.fillStyle = grad2
      ctx.fill()

      var r3 = 8 + pulse * 4
      var grad3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r3)
      grad3.addColorStop(0, colourAt(0.4, 0.7 * pulse))
      grad3.addColorStop(0.5, colourAt(0.35, 0.3 * pulse))
      grad3.addColorStop(1, colourAt(0.3, 0))
      ctx.beginPath()
      ctx.arc(cx, cy, r3, 0, Math.PI * 2)
      ctx.fillStyle = grad3
      ctx.fill()
    }

    function drawRays(time) {
      for (var i = 0; i < rays.length; i++) {
        var ray = rays[i]
        var breathe = Math.sin(time * ray.breathSpeed + ray.phase)
        var len = ray.length * (0.7 + breathe * 0.3)
        var angle = ray.angle + time * ray.drift

        var segments = 30
        ctx.beginPath()
        for (var s = 0; s <= segments; s++) {
          var t = s / segments
          var dist = t * len
          var wave = Math.sin(t * Math.PI * 2 + time * 0.0003 + ray.phase) * 3 * t
          var dx = Math.cos(angle)
          var dy = Math.sin(angle)
          var x = cx + dx * dist + (-dy) * wave
          var y = cy + dy * dist + dx * wave
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        var rayGrad = ctx.createLinearGradient(
          cx, cy,
          cx + Math.cos(angle) * len,
          cy + Math.sin(angle) * len
        )
        rayGrad.addColorStop(0, colourAt(ray.colourPos, 0.12 + breathe * 0.04))
        rayGrad.addColorStop(0.3, colourAt(ray.colourPos, 0.06))
        rayGrad.addColorStop(0.7, colourAt(ray.colourPos, 0.03))
        rayGrad.addColorStop(1, colourAt(ray.colourPos, 0))
        ctx.strokeStyle = rayGrad
        ctx.lineWidth = ray.width * (1 + breathe * 0.2)
        ctx.stroke()
      }
    }

    function drawElements(time) {
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i]

        var angle = el.baseAngle + time * el.orbitSpeed
        var drift = Math.sin(time * el.driftSpeed + el.driftPhase) * el.driftAmount
        var dist = el.baseDist + drift
        var x = cx + Math.cos(angle) * dist
        var y = cy + Math.sin(angle) * dist

        var angleToCenter = Math.atan2(cy - y, cx - x)
        var diff = angleToCenter - el.orientation
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        el.orientation += diff * el.alignSpeed * 16

        for (var p = 0; p < alignPulses.length; p++) {
          var pulse = alignPulses[p]
          var age = time - pulse.born
          var pulseRadius = (age / pulse.life) * Math.min(W, H) * 0.5
          var distFromPulse = Math.abs(dist - pulseRadius)
          if (distFromPulse < 30) {
            el.orientation += diff * 0.05
          }
        }

        var breathe = Math.sin(time * el.breathSpeed + el.phase)
        var size = el.size * (0.8 + breathe * 0.2)

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(el.orientation)

        var glowR = size * 3
        var glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR)
        glowGrad.addColorStop(0, colourAt(el.colourPos, el.alpha * 0.3))
        glowGrad.addColorStop(1, colourAt(el.colourPos, 0))
        ctx.beginPath()
        ctx.arc(0, 0, glowR, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        ctx.beginPath()
        ctx.ellipse(0, 0, size * el.aspectRatio, size, 0, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(el.colourPos, el.alpha)
        ctx.fill()

        ctx.restore()
      }
    }

    function drawAlignPulses(time) {
      for (var i = alignPulses.length - 1; i >= 0; i--) {
        var p = alignPulses[i]
        var age = time - p.born
        if (age > p.life) { alignPulses.splice(i, 1); continue }
        var progress = age / p.life
        var radius = progress * Math.min(W, H) * 0.5
        var alpha = (1 - progress) * 0.06

        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = colourAt(p.colourPos, alpha)
        ctx.lineWidth = 2 * (1 - progress)
        ctx.stroke()
      }
    }

    function drawMotes(time) {
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i]
        var angle = m.angle + time * m.speed
        var breathe = Math.sin(time * m.breathSpeed + m.phase)
        var dist = m.dist + breathe * 8
        var x = cx + Math.cos(angle) * dist
        var y = cy + Math.sin(angle) * dist
        var size = m.size * (0.7 + breathe * 0.3)

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(m.colourPos, 0.4 + breathe * 0.2)
        ctx.fill()
      }
    }

    function drawTextLabels(time) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (var i = 0; i < textItems.length; i++) {
        var t = textItems[i]
        var currentAngle = t.baseAngle + time * t.orbitSpeed
        var radialBreath = Math.sin(time * t.breathSpeed + t.phase) * t.breathAmount
        var currentRadius = t.radius + radialBreath
        var x = cx + Math.cos(currentAngle) * currentRadius
        var y = cy + Math.sin(currentAngle) * currentRadius
        var fadeCycle = Math.sin(time * t.fadeSpeed + t.fadePhase)
        var alpha = 0.4 + fadeCycle * 0.15
        var tilt = Math.sin(currentAngle) * 0.04

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(tilt)

        ctx.shadowColor = colourAt(t.colourPos, 0.5)
        ctx.shadowBlur = 20
        ctx.font = '400 ' + t.fontSize + 'px "Source Sans 3", "Source Sans Pro", sans-serif'
        ctx.fillStyle = colourAt(t.colourPos, alpha)
        ctx.fillText(t.text, 0, 0)

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.fillStyle = colourAt(t.colourPos, alpha)
        ctx.fillText(t.text, 0, 0)

        ctx.restore()
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
      initRays()
      initElements()
      initMotes()
      initTextItems()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    // ---- MAIN LOOP ----
    function tick(time) {
      ctx.clearRect(0, 0, W, H)

      alignPulseTimer += 16
      if (alignPulseTimer > alignPulseInterval) {
        addAlignPulse(time)
        alignPulseTimer = 0
      }

      drawRays(time)
      drawAlignPulses(time)
      drawElements(time)
      drawCentralPulse(time)
      drawMotes(time)
      drawTextLabels(time)

      animId = requestAnimationFrame(tick)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(6000)
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
