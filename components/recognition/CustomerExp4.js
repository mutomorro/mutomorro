'use client'
import { useEffect, useRef } from 'react'

export default function CustomerExp4() {
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
      [128, 56, 143],
      [155, 81, 224],
      [255, 66, 121],
      [255, 162, 0]
    ]

    var points = []
    var N = 40
    for (var i = 0; i < N; i++) {
      var angle = i * 2.399
      var r = Math.sqrt(i / N) * 0.4
      points.push({
        targetX: 0.5 + Math.cos(angle) * r * 1.2,
        targetY: 0.5 + Math.sin(angle) * r * 0.85,
        x: 0.5 + (Math.random() - 0.5) * 0.8,
        y: 0.5 + (Math.random() - 0.5) * 0.7,
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
      var orderProgress = rm ? 0.8 : Math.min(1, t * 0.03)

      for (var i = 0; i < points.length; i++) {
        var p = points[i]
        var c = cols[p.colIdx]
        if (!rm) {
          p.x += (p.targetX - p.x) * orderProgress * 0.02
          p.y += (p.targetY - p.y) * orderProgress * 0.02
        } else {
          p.x = p.targetX
          p.y = p.targetY
        }

        var px = p.x * W,
          py = p.y * H
        var nearTarget =
          Math.abs(p.x - p.targetX) < 0.01 &&
          Math.abs(p.y - p.targetY) < 0.01
        var alpha = nearTarget ? 0.5 : 0.25
        var glowR = nearTarget ? p.size * 4 : p.size * 2

        var g = ctx.createRadialGradient(px, py, 0, px, py, glowR)
        g.addColorStop(
          0,
          'rgba(' +
            c[0] +
            ',' +
            c[1] +
            ',' +
            c[2] +
            ',' +
            alpha * 0.3 +
            ')'
        )
        g.addColorStop(
          1,
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
        )
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, glowR, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')'
        ctx.fill()
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
