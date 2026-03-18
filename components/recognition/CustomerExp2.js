'use client'
import { useEffect, useRef } from 'react'

export default function CustomerExp2() {
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

    var cols = [
      { r: 128, g: 56, b: 143 },
      { r: 155, g: 81, b: 224 },
      { r: 255, g: 66, b: 121 },
      { r: 255, g: 162, b: 0 }
    ]

    var flows = []
    for (var i = 0; i < 15; i++) {
      var a = Math.random() * Math.PI * 2
      flows.push({
        angle: a,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.005,
        colIdx: i % 4,
        size: 2 + Math.random() * 2
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
      var cx = W * 0.5,
        cy = H * 0.5
      var maxR = H * 0.42

      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
      cg.addColorStop(0, 'rgba(155,81,224,0.2)')
      cg.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,162,0,0.08)'
      ctx.lineWidth = 3
      ctx.stroke()

      for (var i = 0; i < flows.length; i++) {
        var f = flows[i]
        var c = cols[f.colIdx]
        if (!rm) {
          f.progress += f.speed
          if (f.progress > 1) f.progress = 0
        }
        var r = f.progress * maxR
        var px = cx + Math.cos(f.angle) * r,
          py = cy + Math.sin(f.angle) * r

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(px, py)
        ctx.strokeStyle =
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.05)'
        ctx.lineWidth = 1
        ctx.stroke()

        var g = ctx.createRadialGradient(px, py, 0, px, py, f.size * 3)
        g.addColorStop(
          0,
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)'
        )
        g.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, f.size * 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, f.size, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.5)'
        ctx.fill()

        if (f.progress > 0.9) {
          var eb = (f.progress - 0.9) * 10
          var ex = cx + Math.cos(f.angle) * maxR,
            ey = cy + Math.sin(f.angle) * maxR
          var eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8)
          eg.addColorStop(0, 'rgba(255,162,0,' + eb * 0.3 + ')')
          eg.addColorStop(1, 'rgba(255,162,0,0)')
          ctx.fillStyle = eg
          ctx.beginPath()
          ctx.arc(ex, ey, 8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

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

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
