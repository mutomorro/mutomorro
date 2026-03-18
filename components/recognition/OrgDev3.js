'use client'
import { useEffect, useRef } from 'react'

export default function OrgDev3() {
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
      var cx = W * 0.5,
        cy = H * 0.5
      for (var i = 0; i < 4; i++) {
        var phase = i * Math.PI * 0.5
        var breathe = rm ? 0.5 : 0.3 + Math.sin(t * 0.5 + phase) * 0.2
        var r = breathe * H * 0.4
        var c = cols[i]
        var g = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r)
        g.addColorStop(
          0,
          'rgba(' +
            c[0] +
            ',' +
            c[1] +
            ',' +
            c[2] +
            ',' +
            breathe * 0.15 +
            ')'
        )
        g.addColorStop(
          1,
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
        )
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle =
          'rgba(' +
          c[0] +
          ',' +
          c[1] +
          ',' +
          c[2] +
          ',' +
          breathe * 0.3 +
          ')'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      var cp = rm ? 0.5 : 0.4 + Math.sin(t * 0.5) * 0.1
      ctx.beginPath()
      ctx.arc(cx, cy, 8 * cp + 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(200,150,230,' + cp * 0.4 + ')'
      ctx.fill()
      animId = requestAnimationFrame(tick)
    }

    if (rm) {
      tick()
      cancelAnimationFrame(animId)
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
