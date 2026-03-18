'use client'
import { useEffect, useRef } from 'react'

export default function Capacity3() {
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

    var threads = []
    for (var i = 0; i < 30; i++) {
      var isL = i % 2 === 0
      threads.push({
        startX: -0.05 + i * 0.035,
        isLearning: isL,
        phase: Math.random() * Math.PI * 2,
        amp: 0.025 + Math.random() * 0.03,
        freq: 2 + Math.random() * 2
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

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      for (var i = 0; i < threads.length; i++) {
        var th = threads[i]
        var col = th.isLearning ? [155, 81, 224] : [255, 162, 0]
        ctx.beginPath()
        for (var x = 0; x <= 1; x += 0.01) {
          var y =
            0.5 +
            Math.sin(
              (x + th.startX) * th.freq * Math.PI +
                (rm ? 0 : t * 0.3) +
                th.phase
            ) *
              th.amp +
            Math.sin(x * 20 + i) * 0.004
          if (x === 0) ctx.moveTo(x * W, y * H)
          else ctx.lineTo(x * W, y * H)
        }
        ctx.strokeStyle =
          'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.25)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.strokeStyle =
          'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.06)'
        ctx.lineWidth = 6
        ctx.stroke()
      }
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
