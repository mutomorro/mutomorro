'use client'
import { useEffect, useRef } from 'react'

export default function StrategicAlignment3() {
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

    var layers = []
    for (var l = 0; l < 5; l++) {
      var particles = []
      for (var p = 0; p < 10; p++) particles.push({
        x: 0.05 + Math.random() * 0.9,
        baseY: 0.12 + l * 0.18,
        vx: 0.001 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2
      })
      layers.push({y: 0.12 + l * 0.18, particles: particles, colIdx: l % 4})
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
      for (var l = 0; l < layers.length; l++) {
        var ly = layers[l]
        var c = cols[ly.colIdx]
        ctx.beginPath()
        ctx.moveTo(0, ly.y * H)
        ctx.lineTo(W, ly.y * H)
        ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.04)'
        ctx.lineWidth = 1
        ctx.stroke()
        for (var p = 0; p < ly.particles.length; p++) {
          var pt = ly.particles[p]
          if (!rm) {
            pt.x += pt.vx
            if (pt.x > 1.1) pt.x = -0.1
          }
          var py = pt.baseY + Math.sin(t * 0.3 + pt.phase) * 0.008
          var px = pt.x * W, ppy = py * H
          ctx.save()
          ctx.translate(px, ppy)
          ctx.beginPath()
          ctx.moveTo(5, 0)
          ctx.lineTo(-3, -2.5)
          ctx.lineTo(-3, 2.5)
          ctx.closePath()
          ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.4)'
          ctx.fill()
          ctx.restore()
          ctx.beginPath()
          ctx.moveTo((pt.x - 0.03) * W, ppy)
          ctx.lineTo(px, ppy)
          ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.1)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
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
