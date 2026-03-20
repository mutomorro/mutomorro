'use client'
import { useEffect, useRef } from 'react'

export default function CultureChange2() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let animId
    const parent = canvas.parentElement
    let W, H

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const colours = [
      { r: 128, g: 56, b: 143 },
      { r: 155, g: 81, b: 224 },
      { r: 255, g: 66, b: 121 },
      { r: 255, g: 162, b: 0 }
    ]

    function colourAt(t, alpha) {
      t = Math.max(0, Math.min(1, t))
      var idx = t * (colours.length - 1)
      var i = Math.floor(idx)
      var f = idx - i
      if (i >= colours.length - 1) { i = colours.length - 2; f = 1 }
      var a = colours[i], b = colours[i + 1]
      return 'rgba(' + Math.round(a.r + (b.r - a.r) * f) + ',' + Math.round(a.g + (b.g - a.g) * f) + ',' + Math.round(a.b + (b.b - a.b) * f) + ',' + alpha + ')'
    }

    var branches = []
    function addBranch(x1f, y1f, angle, depth, colourPos) {
      if (depth > 4) return
      var len = 0.08 + Math.random() * 0.06 - depth * 0.01
      var x2f = x1f + Math.cos(angle) * len
      var y2f = y1f + Math.sin(angle) * len
      if (x2f < 0.02 || x2f > 0.98 || y2f < 0.02 || y2f > 0.98) return
      branches.push({
        x1f: x1f, y1f: y1f, x2f: x2f, y2f: y2f,
        depth: depth, phase: Math.random() * Math.PI * 2,
        colourPos: colourPos, hasGlow: Math.random() > 0.35
      })
      var spread = 0.35 + Math.random() * 0.3
      addBranch(x2f, y2f, angle - spread, depth + 1, colourPos + 0.08)
      if (Math.random() > 0.3) addBranch(x2f, y2f, angle + spread, depth + 1, colourPos + 0.12)
    }
    addBranch(0.04, 0.25, 0.15, 0, 0)
    addBranch(0.04, 0.5, 0, 0, 0.25)
    addBranch(0.04, 0.75, -0.15, 0, 0.5)

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

    function tick(time) {
      ctx.clearRect(0, 0, W, H)

      for (var i = 0; i < branches.length; i++) {
        var b = branches[i]
        var x1 = b.x1f * W, y1 = b.y1f * H, x2 = b.x2f * W, y2 = b.y2f * H
        var breathe = Math.sin(time * 0.0004 + b.phase)
        var alpha = 0.12 + breathe * 0.04 - b.depth * 0.012
        if (alpha < 0.02) alpha = 0.02
        var lw = 2.5 - b.depth * 0.35
        if (lw < 0.5) lw = 0.5

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        var mx = (x1 + x2) / 2 + Math.sin(time * 0.0003 + b.phase) * 4
        var my = (y1 + y2) / 2 + Math.cos(time * 0.0003 + b.phase) * 4
        ctx.quadraticCurveTo(mx, my, x2, y2)
        ctx.strokeStyle = colourAt(b.colourPos, alpha)
        ctx.lineWidth = lw
        ctx.stroke()

        if (b.hasGlow) {
          var gb = Math.sin(time * 0.0005 + b.phase * 2)
          var gr = 6 + gb * 3
          var ga = 0.08 + gb * 0.05
          var grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, gr)
          grad.addColorStop(0, colourAt(b.colourPos + 0.2, ga * 1.5))
          grad.addColorStop(1, colourAt(b.colourPos + 0.2, 0))
          ctx.beginPath()
          ctx.arc(x2, y2, gr, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        }
      }

      if (rm) return
      animId = requestAnimationFrame(tick)
    }

    if (rm) {
      tick(5000)
    } else {
      animId = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
