'use client'
import { useEffect, useRef } from 'react'

export default function CultureChange4() {
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

    var growths = []
    for (var i = 0; i < 7; i++) {
      growths.push({
        xf: 0.07 + (i / 6) * 0.86,
        maxHeight: 0.3 + Math.random() * 0.4,
        widthF: 0.035 + Math.random() * 0.035,
        phase: Math.random() * Math.PI * 2,
        growSpeed: 0.0002 + Math.random() * 0.0002,
        swaySpeed: 0.0003 + Math.random() * 0.0003,
        colourPos: i / 7
      })
    }

    var tenders = []
    for (var i = 0; i < 22; i++) {
      tenders.push({
        baseFx: 0.05 + Math.random() * 0.9,
        baseFy: 0.15 + Math.random() * 0.55,
        orbitRadius: 12 + Math.random() * 20,
        orbitSpeed: 0.0006 + Math.random() * 0.0006,
        phase: Math.random() * Math.PI * 2,
        size: 1.5 + Math.random() * 2,
        colourPos: Math.random(),
        trailPhase: Math.random() * Math.PI * 2
      })
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

    function tick(time) {
      ctx.clearRect(0, 0, W, H)

      // Ground line
      ctx.beginPath()
      for (var x = 0; x <= W; x += 3) {
        var y = H * 0.85 + Math.sin(x * 0.015 + time * 0.0001) * 5
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = colourAt(0.2, 0.06)
      ctx.lineWidth = 1
      ctx.stroke()

      // Growths
      for (var i = 0; i < growths.length; i++) {
        var g = growths[i]
        var gx = g.xf * W
        var gy = H * 0.85
        var growCycle = 0.7 + Math.sin(time * g.growSpeed + g.phase) * 0.3
        var height = g.maxHeight * H * growCycle
        var gw = g.widthF * W
        var sway = Math.sin(time * g.swaySpeed + g.phase) * 6

        ctx.beginPath()
        var segs = 20
        for (var s = 0; s <= segs; s++) {
          var t2 = s / segs
          var y = gy - t2 * height
          var wt = gw * (1 - t2 * 0.7) * (1 + Math.sin(t2 * 3 + time * 0.0004) * 0.15)
          var xo = sway * t2
          if (s === 0) ctx.moveTo(gx + xo - wt / 2, y)
          else ctx.lineTo(gx + xo - wt / 2, y)
        }
        for (var s = segs; s >= 0; s--) {
          var t2 = s / segs
          var y = gy - t2 * height
          var wt = gw * (1 - t2 * 0.7) * (1 + Math.sin(t2 * 3 + time * 0.0004 + 1) * 0.15)
          var xo = sway * t2
          ctx.lineTo(gx + xo + wt / 2, y)
        }
        ctx.closePath()

        var breathe = Math.sin(time * 0.0003 + g.phase)
        var alpha = 0.07 + breathe * 0.025
        var grad = ctx.createLinearGradient(gx, gy, gx, gy - height)
        grad.addColorStop(0, colourAt(g.colourPos, alpha * 1.5))
        grad.addColorStop(0.5, colourAt(g.colourPos + 0.1, alpha))
        grad.addColorStop(1, colourAt(g.colourPos + 0.2, alpha * 0.5))
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Tenders (floating particles)
      for (var i = 0; i < tenders.length; i++) {
        var td = tenders[i]
        var angle = time * td.orbitSpeed + td.phase
        var x = td.baseFx * W + Math.cos(angle) * td.orbitRadius
        var y = td.baseFy * H + Math.sin(angle) * td.orbitRadius * 0.5
        var pulse = Math.sin(time * 0.0008 + td.trailPhase)
        var alpha = 0.15 + pulse * 0.1
        var r = td.size * (0.8 + pulse * 0.3)

        var grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
        grad.addColorStop(0, colourAt(td.colourPos, alpha))
        grad.addColorStop(1, colourAt(td.colourPos, 0))
        ctx.beginPath()
        ctx.arc(x, y, r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(td.colourPos, alpha * 1.2)
        ctx.fill()
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
