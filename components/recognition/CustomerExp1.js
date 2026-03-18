'use client'
import { useEffect, useRef } from 'react'

export default function CustomerExp1() {
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

    var innerNodes = []
    for (var i = 0; i < 12; i++) {
      var a = i * ((Math.PI * 2) / 12)
      innerNodes.push({
        x: 0.5 + Math.cos(a) * 0.12,
        y: 0.5 + Math.sin(a) * 0.18,
        activity: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        colIdx: i % 4
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

      var avgAct = 0
      for (var i = 0; i < innerNodes.length; i++) avgAct += innerNodes[i].activity
      avgAct /= innerNodes.length

      var outerB = rm ? 0.6 : avgAct * (0.7 + Math.sin(t * 0.3) * 0.1)
      var outerR = H * 0.42

      ctx.beginPath()
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,162,0,' + outerB * 0.2 + ')'
      ctx.lineWidth = 12
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,162,0,' + outerB * 0.4 + ')'
      ctx.lineWidth = 2
      ctx.stroke()

      var ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.2)
      ig.addColorStop(0, 'rgba(155,81,224,0.06)')
      ig.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = ig
      ctx.beginPath()
      ctx.arc(cx, cy, H * 0.2, 0, Math.PI * 2)
      ctx.fill()

      for (var i = 0; i < innerNodes.length; i++) {
        var n = innerNodes[i]
        var c = cols[n.colIdx]
        if (!rm)
          n.activity =
            0.4 +
            Math.sin(t * 0.3 + n.phase) * 0.3 +
            Math.sin(t * 0.7 + n.phase * 2) * 0.15
        var px = n.x * W,
          py = n.y * H

        var g = ctx.createRadialGradient(px, py, 0, px, py, 8)
        g.addColorStop(
          0,
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + n.activity * 0.4 + ')'
        )
        g.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + n.activity * 0.6 + ')'
        ctx.fill()

        var outerAngle = Math.atan2(n.y - 0.5, n.x - 0.5)
        var ox = cx + Math.cos(outerAngle) * outerR,
          oy = cy + Math.sin(outerAngle) * outerR
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(ox, oy)
        ctx.strokeStyle =
          'rgba(' +
          c.r +
          ',' +
          c.g +
          ',' +
          c.b +
          ',' +
          n.activity * 0.08 +
          ')'
        ctx.lineWidth = 1
        ctx.stroke()
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
