'use client'
import { useEffect, useRef } from 'react'

export default function CustomerExperienceHero() {
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
      // Recalculate geometry on resize
      innerRadius = Math.min(W, H) * 0.22
      outerInnerR = innerRadius * 1.15
      outerOuterR = innerRadius * 1.6
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

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

    // ---- GEOMETRY ----
    var innerRadius = 100
    var outerInnerR = 115
    var outerOuterR = 160

    resize()

    // ---- INNER WORLD (the organisation) ----
    var innerNodes = []
    var numInnerNodes = 30
    for (var i = 0; i < numInnerNodes; i++) {
      var angle = Math.random() * Math.PI * 2
      var dist = 20 + Math.random() * (innerRadius - 20)
      innerNodes.push({
        angle: angle,
        dist: dist,
        baseAngle: angle,
        orbitSpeed: 0.0001 + (Math.random() - 0.5) * 0.0002,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0008 + Math.random() * 0.001,
        size: 2 + Math.random() * 3,
        colourPos: angle / (Math.PI * 2),
        activity: 0.3 + Math.random() * 0.7,
        sectorAngle: angle
      })
    }

    // Inner connections
    var innerConnections = []
    for (var i = 0; i < numInnerNodes; i++) {
      for (var j = i + 1; j < numInnerNodes; j++) {
        var a1 = innerNodes[i].angle, d1 = innerNodes[i].dist
        var a2 = innerNodes[j].angle, d2 = innerNodes[j].dist
        var x1 = Math.cos(a1) * d1, y1 = Math.sin(a1) * d1
        var x2 = Math.cos(a2) * d2, y2 = Math.sin(a2) * d2
        var dist = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
        if (dist < innerRadius * 0.6 && Math.random() > 0.4) {
          innerConnections.push({ from: i, to: j })
        }
      }
    }

    // Inner flow particles
    var innerFlows = []
    for (var i = 0; i < 20; i++) {
      var connIdx = Math.floor(Math.random() * innerConnections.length)
      innerFlows.push({
        connIdx: connIdx,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        direction: Math.random() > 0.5 ? 1 : -1,
        size: 1 + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.3
      })
    }

    // ---- OUTER RING (customer experience) ----
    var numSectors = 24
    var sectors = []
    for (var i = 0; i < numSectors; i++) {
      var angle = (i / numSectors) * Math.PI * 2
      sectors.push({
        angle: angle,
        angleWidth: (Math.PI * 2) / numSectors,
        health: 0.5,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0006 + Math.random() * 0.0006,
        colourPos: i / numSectors
      })
    }

    // Outer touchpoint particles
    var touchpoints = []
    for (var i = 0; i < 16; i++) {
      var angle = (i / 16) * Math.PI * 2 + Math.random() * 0.2
      touchpoints.push({
        angle: angle,
        breathPhase: Math.random() * Math.PI * 2,
        breathSpeed: 0.001 + Math.random() * 0.001,
        size: 2 + Math.random() * 2.5,
        colourPos: angle / (Math.PI * 2)
      })
    }

    // ---- CAUSATION RAYS ----
    var causationPulses = []
    var causationTimer = 0
    var causationInterval = 3000

    // ---- TEXT LABELS ----
    var labels = [
      { text: 'what customers actually feel', ring: 0, slot: 0 },
      { text: 'what happens behind the scenes', ring: 0, slot: 1 },
      { text: 'where service breaks down', ring: 0, slot: 2 },
      { text: 'what front-line teams need', ring: 0, slot: 3 },
      { text: 'how internal friction becomes customer friction', ring: 1, slot: 0 },
      { text: 'what the journey map misses', ring: 1, slot: 1 },
      { text: 'where handoffs drop', ring: 1, slot: 2 },
      { text: 'whether complaints reach the cause', ring: 1, slot: 3 },
      { text: 'how teams collaborate for the customer', ring: 2, slot: 0 },
      { text: 'what information reaches the front line', ring: 2, slot: 1 },
      { text: 'how decisions affect service', ring: 2, slot: 2 },
      { text: 'whether the experience is designed or accidental', ring: 2, slot: 3 },
    ]

    var ringRadii = [120, 210, 300]
    var ringOffsets = [0.15, Math.PI / 4 + 0.1, Math.PI / 6 - 0.2]
    var ringSizes = [13, 13.5, 14]

    var textItems = []
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

    // ---- HELPER: get node position ----
    function getNodePos(node, time) {
      var a = node.baseAngle + time * node.orbitSpeed
      var breathe = Math.sin(time * node.breathSpeed + node.breathPhase)
      var d = node.dist + breathe * 5
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, angle: a }
    }

    // ---- DRAW FUNCTIONS ----

    function drawZoneBoundaries(time) {
      var breathe = Math.sin(time * 0.0003) * 3
      ctx.beginPath()
      ctx.arc(cx, cy, innerRadius + breathe, 0, Math.PI * 2)
      ctx.strokeStyle = colourAt(0.3, 0.06)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, outerInnerR + breathe * 0.5, 0, Math.PI * 2)
      ctx.strokeStyle = colourAt(0.4, 0.04)
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, outerOuterR + breathe * 0.8, 0, Math.PI * 2)
      ctx.strokeStyle = colourAt(0.5, 0.04)
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    function updateSectorHealth(time) {
      for (var s = 0; s < numSectors; s++) {
        var sector = sectors[s]
        var totalActivity = 0
        var count = 0

        for (var n = 0; n < numInnerNodes; n++) {
          var node = innerNodes[n]
          var nodeAngle = node.baseAngle + time * node.orbitSpeed
          while (nodeAngle < 0) nodeAngle += Math.PI * 2
          while (nodeAngle > Math.PI * 2) nodeAngle -= Math.PI * 2

          var angleDiff = Math.abs(nodeAngle - sector.angle)
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff

          if (angleDiff < sector.angleWidth * 2) {
            var influence = 1 - angleDiff / (sector.angleWidth * 2)
            totalActivity += node.activity * influence
            count += influence
          }
        }

        var targetHealth = count > 0 ? totalActivity / count : 0.2
        sector.health += (targetHealth - sector.health) * 0.02
      }
    }

    function drawOuterRing(time) {
      updateSectorHealth(time)

      for (var s = 0; s < numSectors; s++) {
        var sector = sectors[s]
        var breathe = Math.sin(time * sector.breathSpeed + sector.breathPhase)
        var health = sector.health

        var alpha = 0.03 + health * 0.1 + breathe * 0.02
        var warmth = health

        ctx.beginPath()
        ctx.arc(cx, cy, outerOuterR, sector.angle, sector.angle + sector.angleWidth)
        ctx.arc(cx, cy, outerInnerR, sector.angle + sector.angleWidth, sector.angle, true)
        ctx.closePath()

        var colT = sector.colourPos * 0.4 + warmth * 0.6
        ctx.fillStyle = colourAt(colT, alpha)
        ctx.fill()
      }
    }

    function drawInnerWorld(time) {
      var bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius)
      bgGrad.addColorStop(0, colourAt(0.3, 0.04))
      bgGrad.addColorStop(0.7, colourAt(0.35, 0.02))
      bgGrad.addColorStop(1, colourAt(0.4, 0))
      ctx.beginPath()
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad
      ctx.fill()

      // Connections
      for (var c = 0; c < innerConnections.length; c++) {
        var conn = innerConnections[c]
        var p1 = getNodePos(innerNodes[conn.from], time)
        var p2 = getNodePos(innerNodes[conn.to], time)
        var avgActivity = (innerNodes[conn.from].activity + innerNodes[conn.to].activity) / 2

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = colourAt(
          (innerNodes[conn.from].colourPos + innerNodes[conn.to].colourPos) / 2,
          0.03 + avgActivity * 0.06
        )
        ctx.lineWidth = 0.5 + avgActivity * 0.5
        ctx.stroke()
      }

      // Nodes
      for (var i = 0; i < numInnerNodes; i++) {
        var node = innerNodes[i]
        var pos = getNodePos(node, time)
        var breathe = Math.sin(time * node.breathSpeed + node.breathPhase)
        var size = node.size * (0.85 + breathe * 0.15)

        var glowSize = size * (2 + node.activity * 3)
        var glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowSize)
        glowGrad.addColorStop(0, colourAt(node.colourPos, 0.1 + node.activity * 0.15))
        glowGrad.addColorStop(1, colourAt(node.colourPos, 0))
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(node.colourPos, 0.4 + node.activity * 0.4)
        ctx.fill()
      }

      // Flow particles
      for (var i = 0; i < innerFlows.length; i++) {
        var fl = innerFlows[i]
        var conn = innerConnections[fl.connIdx]
        var p1 = getNodePos(innerNodes[conn.from], time)
        var p2 = getNodePos(innerNodes[conn.to], time)

        fl.progress += fl.speed * fl.direction * 16
        if (fl.progress > 1) { fl.progress = 1; fl.direction = -1 }
        if (fl.progress < 0) { fl.progress = 0; fl.direction = 1 }

        var x = p1.x + (p2.x - p1.x) * fl.progress
        var y = p1.y + (p2.y - p1.y) * fl.progress

        ctx.beginPath()
        ctx.arc(x, y, fl.size, 0, Math.PI * 2)
        var colT = (innerNodes[conn.from].colourPos + innerNodes[conn.to].colourPos) / 2
        ctx.fillStyle = colourAt(colT, fl.alpha)
        ctx.fill()
      }
    }

    function drawTouchpoints(time) {
      for (var i = 0; i < touchpoints.length; i++) {
        var tp = touchpoints[i]
        var breathe = Math.sin(time * tp.breathSpeed + tp.breathPhase)
        var r = (outerInnerR + outerOuterR) / 2
        var x = cx + Math.cos(tp.angle) * r
        var y = cy + Math.sin(tp.angle) * r

        var sectorIdx = Math.floor((tp.angle / (Math.PI * 2)) * numSectors) % numSectors
        var health = sectors[sectorIdx].health
        var size = tp.size * (0.7 + health * 0.5 + breathe * 0.15)

        var glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
        var colT = tp.colourPos * 0.4 + health * 0.6
        glowGrad.addColorStop(0, colourAt(colT, 0.15 + health * 0.15))
        glowGrad.addColorStop(1, colourAt(colT, 0))
        ctx.beginPath()
        ctx.arc(x, y, size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(colT, 0.4 + health * 0.4)
        ctx.fill()
      }
    }

    function drawCausationPulses(time) {
      causationTimer += 16
      if (causationTimer > causationInterval) {
        var nodeIdx = Math.floor(Math.random() * numInnerNodes)
        causationPulses.push({
          nodeIdx: nodeIdx,
          born: time,
          life: 2000
        })
        causationTimer = 0
      }

      for (var i = causationPulses.length - 1; i >= 0; i--) {
        var pulse = causationPulses[i]
        var age = time - pulse.born
        if (age > pulse.life) { causationPulses.splice(i, 1); continue }

        var progress = age / pulse.life
        var node = innerNodes[pulse.nodeIdx]
        var pos = getNodePos(node, time)

        var rayDist = innerRadius + progress * (outerOuterR - innerRadius)
        var angle = node.baseAngle + time * node.orbitSpeed
        var endX = cx + Math.cos(angle) * rayDist
        var endY = cy + Math.sin(angle) * rayDist

        var alpha = (1 - progress) * 0.08 * node.activity
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = colourAt(node.colourPos, alpha)
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(endX, endY, 2, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(node.colourPos, alpha * 3)
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

    // ---- MAIN LOOP ----
    function tick(time) {
      ctx.clearRect(0, 0, W, H)

      drawOuterRing(time)
      drawZoneBoundaries(time)
      drawInnerWorld(time)
      drawTouchpoints(time)
      drawCausationPulses(time)
      drawTextLabels(time)

      animId = requestAnimationFrame(tick)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(8000)
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
