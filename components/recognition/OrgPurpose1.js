'use client'
import { useEffect, useRef } from 'react'

export default function OrgPurpose1() {
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

    var cols = [[128,56,143],[155,81,224],[255,66,121],[255,162,0]]

    var tasks = []
    for (var i = 0; i < 24; i++) {
      tasks.push({
        x: 0.05 + Math.random() * 0.9,
        y: 0.1 + Math.random() * 0.8,
        size: 4 + Math.random() * 8,
        shape: Math.floor(Math.random() * 3),
        rotation: Math.random() * Math.PI
      })
    }
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

    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      var pulse = rm ? 1 : 0.8 + Math.sin(t * 0.6) * 0.2
      var cx = 0.45 * W, cy = H * 0.5
      var pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.4 * pulse)
      pg.addColorStop(0, 'rgba(255,162,0,0.12)')
      pg.addColorStop(0.3, 'rgba(255,66,121,0.06)')
      pg.addColorStop(0.6, 'rgba(155,81,224,0.03)')
      pg.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = pg
      ctx.beginPath()
      ctx.arc(cx, cy, H * 0.4 * pulse, 0, Math.PI * 2)
      ctx.fill()
      for (var i = 0; i < tasks.length; i++) {
        var tk = tasks[i]
        var px = tk.x * W, py = tk.y * H
        var dx = tk.x - 0.45, dy = tk.y - 0.5
        var dist = Math.sqrt(dx * dx + dy * dy)
        var warmth = Math.max(0.1, 1 - dist * 2)
        var c = cols[i % 4]
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(tk.rotation)
        ctx.beginPath()
        if (tk.shape === 0) ctx.rect(-tk.size / 2, -tk.size / 2, tk.size, tk.size)
        else if (tk.shape === 1) {
          ctx.moveTo(0, -tk.size / 2)
          ctx.lineTo(tk.size / 2, tk.size / 2)
          ctx.lineTo(-tk.size / 2, tk.size / 2)
          ctx.closePath()
        } else ctx.arc(0, 0, tk.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + warmth * 0.25 + ')'
        ctx.fill()
        ctx.restore()
      }
      ctx.beginPath()
      ctx.arc(cx, cy, 4 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,200,100,0.5)'
      ctx.fill()

      if (rm) return
      animId = requestAnimationFrame(draw)
    }

    if (rm) {
      draw()
    } else {
      animId = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
