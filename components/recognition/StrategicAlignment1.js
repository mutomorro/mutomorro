'use client'
import { useEffect, useRef } from 'react'

export default function StrategicAlignment1() {
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

    var flock = []
    for (var i = 0; i < 60; i++) flock.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      colIdx: i % 4,
      size: 1.5 + Math.random() * 1.5
    })
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
      var alignStrength = rm ? 0.8 : Math.min(0.8, t * 0.02)
      var targetVX = 0.002, targetVY = -0.0003
      for (var i = 0; i < flock.length; i++) {
        var f = flock[i]
        if (!rm) {
          f.vx += (targetVX - f.vx) * alignStrength * 0.01
          f.vy += (targetVY - f.vy) * alignStrength * 0.01
          f.vx += Math.sin(t * 0.5 + i) * 0.00005
          f.vy += Math.cos(t * 0.4 + i) * 0.00004
          f.x += f.vx
          f.y += f.vy
          if (f.x > 1.1) f.x = -0.1
          if (f.x < -0.1) f.x = 1.1
          if (f.y > 1.1) f.y = -0.1
          if (f.y < -0.1) f.y = 1.1
        }
        var px = f.x * W, py = f.y * H
        var c = cols[f.colIdx]
        var tx = (f.x - f.vx * 8) * W, ty = (f.y - f.vy * 8) * H
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(px, py)
        ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.15)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(px, py, f.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.5)'
        ctx.fill()
      }

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
