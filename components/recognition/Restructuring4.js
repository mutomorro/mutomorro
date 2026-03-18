'use client'
import { useEffect, useRef } from 'react'

export default function Restructuring4() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H

    var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    var cols = [{ r: 128, g: 56, b: 143 }, { r: 155, g: 81, b: 224 }, { r: 255, g: 66, b: 121 }, { r: 255, g: 162, b: 0 }]

    var nodes = []
    var N = 18
    var connections = []

    function initNetwork() {
      nodes = []
      connections = []
      for (var i = 0; i < N; i++) {
        nodes.push({
          x: 0.08 + Math.random() * 0.84,
          y: 0.1 + Math.random() * 0.8,
          homeX: 0.08 + Math.random() * 0.84,
          homeY: 0.1 + Math.random() * 0.8,
          newHomeX: 0.08 + Math.random() * 0.84,
          newHomeY: 0.1 + Math.random() * 0.8,
          col: cols[i % 4],
          phase: Math.random() * Math.PI * 2,
          size: 2 + Math.random() * 2
        })
      }
      for (var i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
          var dx = nodes[i].homeX - nodes[j].homeX, dy = nodes[i].homeY - nodes[j].homeY
          if (Math.sqrt(dx * dx + dy * dy) < 0.3 && Math.random() < 0.4)
            connections.push({ a: i, b: j, strength: 0.3 + Math.random() * 0.4 })
        }
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
    }

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    resize()
    initNetwork()

    var t = 0, movePhase = 0

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      if (!rm) {
        movePhase = (Math.sin(t * 0.1) + 1) / 2
        for (var i = 0; i < N; i++) {
          var n = nodes[i]
          n.x = n.homeX + (n.newHomeX - n.homeX) * movePhase + Math.sin(t * 0.3 + n.phase) * 0.005
          n.y = n.homeY + (n.newHomeY - n.homeY) * movePhase + Math.cos(t * 0.25 + n.phase) * 0.003
        }
      } else {
        for (var i = 0; i < N; i++) {
          nodes[i].x = nodes[i].homeX
          nodes[i].y = nodes[i].homeY
        }
      }
      for (var i = 0; i < connections.length; i++) {
        var c = connections[i]
        var a = nodes[c.a], b = nodes[c.b]
        var pulse = rm ? 1 : 0.7 + Math.sin(t * 0.5 + i) * 0.3
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(b.x * W, b.y * H)
        ctx.strokeStyle = 'rgba(155,81,224,' + c.strength * 0.2 * pulse + ')'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(b.x * W, b.y * H)
        ctx.strokeStyle = 'rgba(155,81,224,' + c.strength * 0.05 * pulse + ')'
        ctx.lineWidth = 6
        ctx.stroke()
      }
      for (var i = 0; i < N; i++) {
        var n = nodes[i]
        var px = n.x * W, py = n.y * H
        var g = ctx.createRadialGradient(px, py, 0, px, py, n.size * 4)
        g.addColorStop(0, 'rgba(' + n.col.r + ',' + n.col.g + ',' + n.col.b + ',0.25)')
        g.addColorStop(1, 'rgba(' + n.col.r + ',' + n.col.g + ',' + n.col.b + ',0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, n.size * 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py, n.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + n.col.r + ',' + n.col.g + ',' + n.col.b + ',0.5)'
        ctx.fill()
      }
      if (!rm) animId = requestAnimationFrame(tick)
    }

    if (rm) {
      tick()
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
