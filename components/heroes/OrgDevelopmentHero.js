'use client'
import { useEffect, useRef } from 'react'

export default function OrgDevelopmentHero() {
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

    // ---- SEASONAL CYCLE ----
    var seasonSpeed = 0.00006

    function getSeason(time) {
      return ((time * seasonSpeed) % 1 + 1) % 1
    }

    function getSeasonColour(season) {
      if (season < 0.25) return 0.15
      if (season < 0.5) return 0.45
      if (season < 0.75) return 0.75
      return 0.05
    }

    function getSeasonIntensity(season) {
      if (season < 0.25) return 0.5 + (season / 0.25) * 0.3
      if (season < 0.5) return 0.8 + Math.sin((season - 0.25) / 0.25 * Math.PI) * 0.2
      if (season < 0.75) return 0.7 - (season - 0.5) / 0.25 * 0.2
      return 0.4 + Math.sin((season - 0.75) / 0.25 * Math.PI) * 0.1
    }

    // ---- GROWTH RINGS ----
    var numRings = 7
    var rings = []
    for (var i = 0; i < numRings; i++) {
      var baseRadius = 25 + i * 28
      var points = []
      var numPoints = 40
      for (var p = 0; p < numPoints; p++) {
        points.push({
          wobble: (Math.random() - 0.5) * 12,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0003 + Math.random() * 0.0003
        })
      }
      rings.push({
        baseRadius: baseRadius,
        points: points,
        colourPos: i / numRings,
        age: i / numRings,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0004 + Math.random() * 0.0004,
        breathAmount: 3 + Math.random() * 5
      })
    }

    // ---- SEASONAL PARTICLES ----
    var seasonalParticles = []
    var numSeasonal = 50
    for (var i = 0; i < numSeasonal; i++) {
      var angle = Math.random() * Math.PI * 2
      var dist = 20 + Math.random() * 180
      seasonalParticles.push({
        angle: angle,
        dist: dist,
        baseDist: dist,
        orbitSpeed: 0.0002 + Math.random() * 0.0003,
        size: 1.5 + Math.random() * 2.5,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.001 + Math.random() * 0.001,
        colourPhase: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.3,
        ringAffinity: Math.floor(Math.random() * numRings)
      })
    }

    // ---- INTER-RING FLOWS ----
    var ringFlows = []
    for (var i = 0; i < 15; i++) {
      var fromRing = Math.floor(Math.random() * (numRings - 1))
      ringFlows.push({
        fromRing: fromRing,
        toRing: fromRing + 1,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: 0.0003 + Math.random() * 0.0004,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        direction: Math.random() > 0.3 ? 1 : -1,
        size: 1 + Math.random() * 1.5,
        colourPos: (fromRing + 0.5) / numRings,
        alpha: 0.3 + Math.random() * 0.3
      })
    }

    // ---- SHEDDING PARTICLES ----
    var shedParticles = []

    // ---- EMERGENCE PARTICLES ----
    var emergeParticles = []

    // ---- TEXT LABELS ----
    var labels = [
      { text: 'what is getting stronger', ring: 0, slot: 0 },
      { text: 'where growth happens', ring: 0, slot: 1 },
      { text: 'how the system evolves', ring: 0, slot: 2 },
      { text: 'what matures', ring: 0, slot: 3 },
      { text: 'whether improvements connect', ring: 1, slot: 0 },
      { text: 'how structure supports culture', ring: 1, slot: 1 },
      { text: 'what development looks like here', ring: 1, slot: 2 },
      { text: 'how the organisation learns', ring: 1, slot: 3 },
      { text: 'what drives improvement', ring: 2, slot: 0 },
      { text: 'who stewards the growth', ring: 2, slot: 1 },
      { text: 'how crisis becomes capability', ring: 2, slot: 2 },
      { text: 'when development feels normal', ring: 2, slot: 3 },
    ]

    var labelRingRadii = [130, 215, 300]
    var ringOffsets = [0.25, Math.PI / 4 + 0.2, Math.PI / 6]
    var ringSizes = [13.5, 14, 14.5]

    var textItems = []
    for (var i = 0; i < labels.length; i++) {
      var l = labels[i]
      var angle = ringOffsets[l.ring] + (l.slot / 4) * Math.PI * 2
      textItems.push({
        text: l.text,
        baseAngle: angle,
        radius: labelRingRadii[l.ring],
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

    // ---- DRAW FUNCTIONS ----

    function drawRings(time) {
      var season = getSeason(time)
      var seasonCol = getSeasonColour(season)
      var intensity = getSeasonIntensity(season)

      for (var r = numRings - 1; r >= 0; r--) {
        var ring = rings[r]
        var breathe = Math.sin(time * ring.breathSpeed + ring.breathPhase) * ring.breathAmount
        var radius = ring.baseRadius + breathe

        ctx.beginPath()
        var n = ring.points.length
        for (var p = 0; p <= n; p++) {
          var pt = ring.points[p % n]
          var angle = (p / n) * Math.PI * 2
          var wobble = pt.wobble + Math.sin(time * pt.speed + pt.phase) * 4
          var rr = radius + wobble
          var x = cx + Math.cos(angle) * rr
          var y = cy + Math.sin(angle) * rr
          if (p === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()

        var ringColour = ring.colourPos * 0.6 + seasonCol * 0.4
        var fillAlpha = (0.02 + ring.age * 0.02) * intensity
        ctx.fillStyle = colourAt(ringColour, fillAlpha)
        ctx.fill()

        var borderAlpha = (0.06 + ring.age * 0.04) * intensity
        ctx.strokeStyle = colourAt(ringColour, borderAlpha)
        ctx.lineWidth = 0.8 + ring.age * 0.4
        ctx.stroke()
      }

      var coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
      coreGrad.addColorStop(0, colourAt(seasonCol, 0.15 * intensity))
      coreGrad.addColorStop(0.5, colourAt(seasonCol, 0.06 * intensity))
      coreGrad.addColorStop(1, colourAt(seasonCol, 0))
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()
    }

    function drawSeasonalParticles(time) {
      var season = getSeason(time)
      var seasonCol = getSeasonColour(season)
      var intensity = getSeasonIntensity(season)

      for (var i = 0; i < seasonalParticles.length; i++) {
        var sp = seasonalParticles[i]
        var breathe = Math.sin(time * sp.breathSpeed + sp.breathPhase)

        var targetDist = sp.baseDist
        var speed = sp.orbitSpeed

        if (season < 0.25) {
          targetDist = sp.baseDist * (0.7 + season * 1.2)
          speed = sp.orbitSpeed * 1.3
        } else if (season < 0.5) {
          targetDist = sp.baseDist
          speed = sp.orbitSpeed * 1.5
        } else if (season < 0.75) {
          targetDist = sp.baseDist * (1 + (season - 0.5) * 0.4)
          speed = sp.orbitSpeed * 0.8
        } else {
          var ringR = rings[sp.ringAffinity].baseRadius
          targetDist = ringR + (sp.baseDist - ringR) * 0.3
          speed = sp.orbitSpeed * 0.4
        }

        sp.dist += (targetDist - sp.dist) * 0.01
        sp.angle += speed * 16

        var x = cx + Math.cos(sp.angle) * sp.dist
        var y = cy + Math.sin(sp.angle) * sp.dist
        var size = sp.size * (0.7 + breathe * 0.3) * intensity

        var colT = sp.colourPhase / (Math.PI * 2) * 0.4 + seasonCol * 0.6

        var glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
        glowGrad.addColorStop(0, colourAt(colT, sp.alpha * 0.3 * intensity))
        glowGrad.addColorStop(1, colourAt(colT, 0))
        ctx.beginPath()
        ctx.arc(x, y, size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(colT, sp.alpha * intensity)
        ctx.fill()
      }
    }

    function drawRingFlows(time) {
      var season = getSeason(time)
      var intensity = getSeasonIntensity(season)

      for (var i = 0; i < ringFlows.length; i++) {
        var rf = ringFlows[i]
        rf.angle += rf.angleSpeed * 16
        rf.progress += rf.speed * rf.direction * 16
        if (rf.progress > 1) { rf.progress = 1; rf.direction = -1 }
        if (rf.progress < 0) { rf.progress = 0; rf.direction = 1 }

        var fromR = rings[rf.fromRing].baseRadius
        var toR = rings[rf.toRing].baseRadius
        var r = fromR + (toR - fromR) * rf.progress
        var x = cx + Math.cos(rf.angle) * r
        var y = cy + Math.sin(rf.angle) * r

        var alpha = rf.alpha * intensity

        var grad = ctx.createRadialGradient(x, y, 0, x, y, rf.size * 4)
        grad.addColorStop(0, colourAt(rf.colourPos, alpha * 0.35))
        grad.addColorStop(1, colourAt(rf.colourPos, 0))
        ctx.beginPath()
        ctx.arc(x, y, rf.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, rf.size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(rf.colourPos, alpha)
        ctx.fill()
      }
    }

    function drawSeasonalEffects(time) {
      var season = getSeason(time)

      if (season > 0.5 && season < 0.8) {
        if (Math.random() > 0.92) {
          var angle = Math.random() * Math.PI * 2
          var outerR = rings[numRings - 1].baseRadius
          shedParticles.push({
            x: cx + Math.cos(angle) * outerR,
            y: cy + Math.sin(angle) * outerR,
            vx: Math.cos(angle) * 0.3 + (Math.random() - 0.5) * 0.2,
            vy: Math.sin(angle) * 0.3 + (Math.random() - 0.5) * 0.2,
            size: 1 + Math.random() * 1.5,
            alpha: 0.3,
            colourPos: 0.7 + Math.random() * 0.25,
            life: 3000,
            born: time
          })
        }
      }

      if (season < 0.3 && season > 0.05) {
        if (Math.random() > 0.94) {
          var angle = Math.random() * Math.PI * 2
          emergeParticles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * 0.5,
            vy: Math.sin(angle) * 0.5,
            size: 1 + Math.random() * 1.5,
            alpha: 0.35,
            colourPos: 0.1 + Math.random() * 0.2,
            life: 2500,
            born: time
          })
        }
      }

      for (var i = shedParticles.length - 1; i >= 0; i--) {
        var sp = shedParticles[i]
        var age = time - sp.born
        if (age > sp.life) { shedParticles.splice(i, 1); continue }
        sp.x += sp.vx
        sp.y += sp.vy
        sp.vx *= 0.998
        sp.vy *= 0.998
        var progress = age / sp.life
        var alpha = sp.alpha * (1 - progress)
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, sp.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = colourAt(sp.colourPos, alpha)
        ctx.fill()
      }

      for (var i = emergeParticles.length - 1; i >= 0; i--) {
        var ep = emergeParticles[i]
        var age = time - ep.born
        if (age > ep.life) { emergeParticles.splice(i, 1); continue }
        ep.x += ep.vx
        ep.y += ep.vy
        ep.vx *= 0.997
        ep.vy *= 0.997
        var progress = age / ep.life
        var alpha = ep.alpha * (progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7)
        ctx.beginPath()
        ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(ep.colourPos, alpha)
        ctx.fill()
      }

      if (shedParticles.length > 40) shedParticles.splice(0, shedParticles.length - 40)
      if (emergeParticles.length > 40) emergeParticles.splice(0, emergeParticles.length - 40)
    }

    function drawSeasonWash(time) {
      var season = getSeason(time)
      var seasonCol = getSeasonColour(season)
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5)
      grad.addColorStop(0, colourAt(seasonCol, 0.02))
      grad.addColorStop(1, colourAt(seasonCol, 0))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
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

    // ---- MAIN LOOP ----
    function tick(time) {
      ctx.clearRect(0, 0, W, H)

      drawSeasonWash(time)
      drawRings(time)
      drawRingFlows(time)
      drawSeasonalParticles(time)
      drawSeasonalEffects(time)
      drawTextLabels(time)

      animId = requestAnimationFrame(tick)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(12000)
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
