'use client'
import { useEffect, useRef } from 'react'

export default function CultureChange3() {
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

    var sources = []
    for (var i = 0; i < 18; i++) {
      sources.push({
        fx: 0.06 + Math.random() * 0.88,
        fy: 0.08 + Math.random() * 0.84,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0008 + Math.random() * 0.0008,
        colourPos: Math.random(),
        size: 2 + Math.random() * 3
      })
    }

    var ripples = []
    var rippleTimer = 0

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

      rippleTimer += 16
      if (rippleTimer > 180) {
        var src = sources[Math.floor(Math.random() * sources.length)]
        ripples.push({ fx: src.fx, fy: src.fy, born: time, life: 3000 + Math.random() * 2000, colourPos: src.colourPos })
        rippleTimer = 0
      }

      for (var i = ripples.length - 1; i >= 0; i--) {
        var rp = ripples[i], age = time - rp.born
        if (age > rp.life) { ripples.splice(i, 1); continue }
        var progress = age / rp.life
        var radius = progress * 70
        ctx.beginPath()
        ctx.arc(rp.fx * W, rp.fy * H, radius, 0, Math.PI * 2)
        ctx.strokeStyle = colourAt(rp.colourPos, (1 - progress) * 0.12)
        ctx.lineWidth = 1.5 * (1 - progress)
        ctx.stroke()
      }

      for (var i = 0; i < sources.length; i++) {
        var src = sources[i]
        var px = src.fx * W, py = src.fy * H
        var pulse = Math.sin(time * src.pulseSpeed + src.phase)
        var r = src.size * (0.8 + pulse * 0.4)
        var alpha = 0.2 + pulse * 0.1
        var grad = ctx.createRadialGradient(px, py, 0, px, py, r * 4)
        grad.addColorStop(0, colourAt(src.colourPos, alpha))
        grad.addColorStop(0.4, colourAt(src.colourPos, alpha * 0.4))
        grad.addColorStop(1, colourAt(src.colourPos, 0))
        ctx.beginPath()
        ctx.arc(px, py, r * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fillStyle = colourAt(src.colourPos, alpha * 1.5)
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
