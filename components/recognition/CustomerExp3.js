'use client'
import { useEffect, useRef } from 'react'

export default function CustomerExp3() {
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

    var signals = []
    var signalInterval = 2.5
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

      if (
        !rm &&
        (signals.length === 0 ||
          t - signals[signals.length - 1].born > signalInterval)
      ) {
        signals.push({
          angle: Math.random() * Math.PI * 2,
          progress: 0,
          speed: 0.008 + Math.random() * 0.005,
          born: t,
          colIdx: signals.length % 4
        })
      }

      ctx.beginPath()
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(200,150,220,0.06)'
      ctx.lineWidth = 2
      ctx.stroke()

      var ccg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
      ccg.addColorStop(0, 'rgba(155,81,224,0.15)')
      ccg.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = ccg
      ctx.beginPath()
      ctx.arc(cx, cy, 12, 0, Math.PI * 2)
      ctx.fill()

      for (var i = signals.length - 1; i >= 0; i--) {
        var s = signals[i]
        var c = cols[s.colIdx]
        if (!rm) s.progress += s.speed
        if (s.progress > 1.2) {
          signals.splice(i, 1)
          continue
        }

        var r = maxR * (1 - Math.min(1, s.progress))
        var px = cx + Math.cos(s.angle) * r,
          py = cy + Math.sin(s.angle) * r
        var sx = cx + Math.cos(s.angle) * maxR,
          sy = cy + Math.sin(s.angle) * maxR

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(px, py)
        ctx.strokeStyle =
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.12)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        if (s.progress <= 1) {
          var g = ctx.createRadialGradient(px, py, 0, px, py, 8)
          g.addColorStop(
            0,
            'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.4)'
          )
          g.addColorStop(
            1,
            'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
          )
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, 8, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
          ctx.fillStyle =
            'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.6)'
          ctx.fill()
        }

        if (s.progress > 0.9 && s.progress < 1.2) {
          var illum =
            s.progress > 1
              ? 1 - (s.progress - 1) * 5
              : (s.progress - 0.9) * 10
          illum = Math.max(0, illum)
          var ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25)
          ig.addColorStop(
            0,
            'rgba(' +
              c[0] +
              ',' +
              c[1] +
              ',' +
              c[2] +
              ',' +
              illum * 0.3 +
              ')'
          )
          ig.addColorStop(
            1,
            'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
          )
          ctx.fillStyle = ig
          ctx.beginPath()
          ctx.arc(cx, cy, 25, 0, Math.PI * 2)
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
