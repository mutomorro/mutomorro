'use client'
import { useEffect, useRef } from 'react'

export default function OrgRestructuringHero() {
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

    function lerp(a, b, t) { return a + (b - a) * t }

    // ---- STRUCTURAL NODES ----
    var numNodes = 22
    var nodes = []

    // ---- CONNECTIONS ----
    var connections = []

    // ---- KNOWLEDGE PARTICLES ----
    var knowledgeParticles = []

    // ---- TEXT LABELS ----
    var labels = [
      { text: 'where roles land', ring: 0, slot: 0 },
      { text: 'how teams re-form', ring: 0, slot: 1 },
      { text: 'what people lose', ring: 0, slot: 2 },
      { text: 'what they gain', ring: 0, slot: 3 },
      { text: 'how knowledge survives', ring: 1, slot: 0 },
      { text: 'which relationships break', ring: 1, slot: 1 },
      { text: 'what the new chart misses', ring: 1, slot: 2 },
      { text: 'who supports the transition', ring: 1, slot: 3 },
      { text: 'whether work flows better now', ring: 2, slot: 0 },
      { text: 'how services hold up', ring: 2, slot: 1 },
      { text: 'what the informal networks lose', ring: 2, slot: 2 },
      { text: 'when it starts to feel like home', ring: 2, slot: 3 },
    ]

    var ringRadii = [120, 205, 290]
    var ringOffsets = [0.1, Math.PI / 3 + 0.2, Math.PI / 5]
    var ringSizes = [13.5, 14, 14.5]

    var textItems = []

    // ---- TRANSITION CYCLE ----
    var transitionSpeed = 0.00008

    function getTransitionT(time, stagger) {
      var raw = Math.sin(time * transitionSpeed + stagger) * 0.5 + 0.5
      return raw * raw * (3 - 2 * raw)
    }

    function initScene() {
      nodes = []
      connections = []
      knowledgeParticles = []
      textItems = []

      for (var i = 0; i < numNodes; i++) {
        var oldAngle = (i / numNodes) * Math.PI * 2
        var oldLayer = Math.floor(i / 6)
        var oldDist = 50 + oldLayer * 65
        var oldX = cx - 80 + Math.cos(oldAngle + oldLayer * 0.3) * oldDist
        var oldY = cy + Math.sin(oldAngle + oldLayer * 0.3) * oldDist * 0.7

        var newAngle = (i / numNodes) * Math.PI * 2 + Math.PI * 0.15
        var newLayer = (i % 4)
        var newDist = 60 + newLayer * 55 + (i % 3) * 20
        var newX = cx + 80 + Math.cos(newAngle - newLayer * 0.2) * newDist
        var newY = cy + Math.sin(newAngle - newLayer * 0.2) * newDist * 0.8

        nodes.push({
          oldX: oldX, oldY: oldY,
          newX: newX, newY: newY,
          x: oldX, y: oldY,
          size: 3 + Math.random() * 3,
          colourPos: i / numNodes,
          breathPhase: Math.random() * Math.PI * 2,
          breathSpeed: 0.0008 + Math.random() * 0.001,
          transitionPhase: Math.random() * 0.3,
          importance: 0.3 + Math.random() * 0.7
        })
      }

      // Old connections
      for (var i = 0; i < numNodes; i++) {
        for (var j = i + 1; j < numNodes; j++) {
          var dx = nodes[i].oldX - nodes[j].oldX
          var dy = nodes[i].oldY - nodes[j].oldY
          var dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120 && Math.random() > 0.3) {
            var newDx = nodes[i].newX - nodes[j].newX
            var newDy = nodes[i].newY - nodes[j].newY
            var newDist = Math.sqrt(newDx * newDx + newDy * newDy)

            var type = 'persist'
            if (newDist > 180) type = 'break'
            if (Math.random() > 0.7) type = 'break'

            connections.push({
              from: i, to: j,
              type: type,
              alpha: 0.12,
              colourPos: (nodes[i].colourPos + nodes[j].colourPos) / 2
            })
          }
        }
      }

      // New connections
      for (var i = 0; i < numNodes; i++) {
        for (var j = i + 1; j < numNodes; j++) {
          var dx = nodes[i].newX - nodes[j].newX
          var dy = nodes[i].newY - nodes[j].newY
          var dist = Math.sqrt(dx * dx + dy * dy)
          var exists = false
          for (var c = 0; c < connections.length; c++) {
            if ((connections[c].from === i && connections[c].to === j) ||
                (connections[c].from === j && connections[c].to === i)) {
              exists = true
              break
            }
          }
          if (!exists && dist < 100 && Math.random() > 0.5) {
            connections.push({
              from: i, to: j,
              type: 'new',
              alpha: 0.12,
              colourPos: (nodes[i].colourPos + nodes[j].colourPos) / 2
            })
          }
        }
      }

      // Knowledge particles
      for (var i = 0; i < 25; i++) {
        var connIdx = Math.floor(Math.random() * connections.length)
        knowledgeParticles.push({
          connIdx: connIdx,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
          direction: Math.random() > 0.5 ? 1 : -1,
          size: 1 + Math.random() * 1.5,
          colourPos: connections[connIdx].colourPos,
          alpha: 0.4 + Math.random() * 0.3
        })
      }

      // Text items
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
      initScene()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()

    // ---- DRAW FUNCTIONS ----

    function updateNodes(time) {
      for (var i = 0; i < numNodes; i++) {
        var node = nodes[i]
        var t = getTransitionT(time, node.transitionPhase * 20)
        var breathe = Math.sin(time * node.breathSpeed + node.breathPhase)

        node.x = lerp(node.oldX, node.newX, t) + breathe * 3
        node.y = lerp(node.oldY, node.newY, t) + Math.sin(breathe * 1.3) * 2
      }
    }

    function drawConnections(time) {
      for (var c = 0; c < connections.length; c++) {
        var conn = connections[c]
        var from = nodes[conn.from]
        var to = nodes[conn.to]
        var t = getTransitionT(time, 0)

        var alpha = conn.alpha

        if (conn.type === 'break') {
          alpha *= (1 - t)
          if (alpha < 0.01) continue

          var dashLen = 3 + t * 15
          ctx.setLineDash([dashLen, dashLen])
        } else if (conn.type === 'new') {
          alpha *= t
          if (alpha < 0.01) continue
          ctx.setLineDash([])
        } else {
          ctx.setLineDash([])
        }

        var midX = (from.x + to.x) / 2 + (Math.sin(time * 0.0003 + c) * 10)
        var midY = (from.y + to.y) / 2 + (Math.cos(time * 0.0004 + c) * 8)

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.quadraticCurveTo(midX, midY, to.x, to.y)
        ctx.strokeStyle = colourAt(conn.colourPos, alpha)
        ctx.lineWidth = 0.8
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    function drawNodes(time) {
      for (var i = 0; i < numNodes; i++) {
        var node = nodes[i]
        var breathe = Math.sin(time * node.breathSpeed + node.breathPhase)
        var size = node.size * (0.85 + breathe * 0.15)

        var glowSize = size * (3 + node.importance * 3)
        var glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize)
        glowGrad.addColorStop(0, colourAt(node.colourPos, 0.15 * node.importance))
        glowGrad.addColorStop(1, colourAt(node.colourPos, 0))
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(node.colourPos, 0.4 + node.importance * 0.35)
        ctx.fill()
      }
    }

    function drawKnowledgeParticles(time) {
      for (var i = 0; i < knowledgeParticles.length; i++) {
        var kp = knowledgeParticles[i]
        var conn = connections[kp.connIdx]

        var t = getTransitionT(time, 0)
        var connAlpha = conn.alpha
        if (conn.type === 'break') connAlpha *= (1 - t)
        if (conn.type === 'new') connAlpha *= t
        if (connAlpha < 0.03) {
          kp.connIdx = Math.floor(Math.random() * connections.length)
          kp.progress = Math.random()
          continue
        }

        var from = nodes[conn.from]
        var to = nodes[conn.to]

        kp.progress += kp.speed * kp.direction * 16
        if (kp.progress > 1) { kp.progress = 1; kp.direction = -1 }
        if (kp.progress < 0) { kp.progress = 0; kp.direction = 1 }

        var midX = (from.x + to.x) / 2 + Math.sin(time * 0.0003 + kp.connIdx) * 10
        var midY = (from.y + to.y) / 2 + Math.cos(time * 0.0004 + kp.connIdx) * 8
        var mt = 1 - kp.progress
        var x = mt * mt * from.x + 2 * mt * kp.progress * midX + kp.progress * kp.progress * to.x
        var y = mt * mt * from.y + 2 * mt * kp.progress * midY + kp.progress * kp.progress * to.y

        var grad = ctx.createRadialGradient(x, y, 0, x, y, kp.size * 5)
        grad.addColorStop(0, colourAt(kp.colourPos, kp.alpha * 0.3))
        grad.addColorStop(1, colourAt(kp.colourPos, 0))
        ctx.beginPath()
        ctx.arc(x, y, kp.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, kp.size, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(kp.colourPos, kp.alpha)
        ctx.fill()
      }
    }

    function drawTextLabels(time) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (var i = 0; i < textItems.length; i++) {
        var ti = textItems[i]
        var currentAngle = ti.baseAngle + time * ti.orbitSpeed
        var radialBreath = Math.sin(time * ti.breathSpeed + ti.phase) * ti.breathAmount
        var currentRadius = ti.radius + radialBreath
        var x = cx + Math.cos(currentAngle) * currentRadius
        var y = cy + Math.sin(currentAngle) * currentRadius
        var fadeCycle = Math.sin(time * ti.fadeSpeed + ti.fadePhase)
        var alpha = 0.4 + fadeCycle * 0.15
        var tilt = Math.sin(currentAngle) * 0.04

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(tilt)

        ctx.shadowColor = colourAt(ti.colourPos, 0.5)
        ctx.shadowBlur = 20
        ctx.font = '400 ' + ti.fontSize + 'px "Source Sans 3", "Source Sans Pro", sans-serif'
        ctx.fillStyle = colourAt(ti.colourPos, alpha)
        ctx.fillText(ti.text, 0, 0)

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.fillStyle = colourAt(ti.colourPos, alpha)
        ctx.fillText(ti.text, 0, 0)

        ctx.restore()
      }
    }

    // ---- MAIN LOOP ----
    function tick(time) {
      ctx.clearRect(0, 0, W, H)

      updateNodes(time)
      drawConnections(time)
      drawKnowledgeParticles(time)
      drawNodes(time)
      drawTextLabels(time)

      animId = requestAnimationFrame(tick)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick(10000)
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
