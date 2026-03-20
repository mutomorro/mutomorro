'use client'
import { useEffect, useRef } from 'react'

export default function CultureChange1() {
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

    var streams = []
    for (var i = 0; i < 10; i++) {
      streams.push({
        slotFraction: i / 9,
        amplitude: 15 + Math.random() * 25,
        frequency: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0004 + Math.random() * 0.0004,
        width: 1.5 + Math.random() * 2,
        colourPos: i / 10
      })
    }

    var sharePoints = []
    for (var i = 0; i < 16; i++) {
      sharePoints.push({
        fx: 0.05 + Math.random() * 0.9,
        fy: 0.05 + Math.random() * 0.9,
        radius: 3 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2,
        breathSpeed: 0.0006 + Math.random() * 0.0005,
        colourPos: Math.random()
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

      for (var i = 0; i < streams.length; i++) {
        var st = streams[i]
        var yBase = 20 + st.slotFraction * (H - 40)
        ctx.beginPath()
        for (var x = 0; x <= W; x += 3) {
          var progress = x / W
          var convergeFactor = 1 - Math.pow((progress - 0.5) * 2, 2) * 0.6
          var baseY = yBase + (H / 2 - yBase) * (1 - convergeFactor)
          var wave = Math.sin(progress * st.frequency * Math.PI + time * st.speed + st.phase) * st.amplitude * convergeFactor
          if (x === 0) ctx.moveTo(x, baseY + wave)
          else ctx.lineTo(x, baseY + wave)
        }
        var breathe = Math.sin(time * 0.0003 + st.phase)
        ctx.strokeStyle = colourAt(st.colourPos, 0.15 + breathe * 0.05)
        ctx.lineWidth = st.width
        ctx.stroke()
      }

      for (var i = 0; i < sharePoints.length; i++) {
        var sp = sharePoints[i]
        var breathe = Math.sin(time * sp.breathSpeed + sp.phase)
        var r = sp.radius * (0.7 + breathe * 0.3)
        var alpha = 0.12 + breathe * 0.08
        var px = sp.fx * W, py = sp.fy * H
        var grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3)
        grad.addColorStop(0, colourAt(sp.colourPos, alpha))
        grad.addColorStop(1, colourAt(sp.colourPos, 0))
        ctx.beginPath()
        ctx.arc(px, py, r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
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
