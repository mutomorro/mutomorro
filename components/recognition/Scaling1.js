'use client'
import { useEffect, useRef } from 'react'

export default function Scaling1() {
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

    var radius = 0.05
    var targetR = 0.4
    var t = 0

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

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      var cx = W * 0.5, cy = H * 0.5
      if (!rm) radius = Math.min(targetR, radius + 0.0003)
      else radius = 0.3
      var r = radius * H
      var breathe = rm ? 1 : 1 + Math.sin(t * 0.4) * 0.02
      r *= breathe
      ctx.beginPath()
      var steps = 50
      for (var i = 0; i <= steps; i++) {
        var a = i * (Math.PI * 2 / steps)
        var wobble = r * (1 + Math.sin(a * 5 + t * 0.5) * 0.02 + Math.sin(a * 3) * 0.01)
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * wobble, cy + Math.sin(a) * wobble)
        else ctx.lineTo(cx + Math.cos(a) * wobble, cy + Math.sin(a) * wobble)
      }
      ctx.closePath()
      var fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2)
      fg.addColorStop(0, 'rgba(255,162,0,0.12)')
      fg.addColorStop(0.4, 'rgba(255,66,121,0.08)')
      fg.addColorStop(0.8, 'rgba(155,81,224,0.05)')
      fg.addColorStop(1, 'rgba(128,56,143,0.02)')
      ctx.fillStyle = fg
      ctx.fill()
      ctx.strokeStyle = 'rgba(155,81,224,0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      for (var i = 0; i < 8; i++) {
        var a = i * (Math.PI * 2 / 8) + (rm ? 0 : t * 0.05)
        var d = r * 0.5
        var px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d
        var g = ctx.createRadialGradient(px, py, 0, px, py, 6)
        g.addColorStop(0, 'rgba(255,200,100,0.2)')
        g.addColorStop(1, 'rgba(255,200,100,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      animId = requestAnimationFrame(tick)
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
