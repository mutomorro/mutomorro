'use client'
import { useEffect, useRef } from 'react'

export default function OrgDev1() {
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

    var sources = []
    for (var i = 0; i < 7; i++)
      sources.push({
        x: 0.1 + Math.random() * 0.8,
        y: 0.12 + Math.random() * 0.76,
        interval: 2 + Math.random() * 3,
        timer: Math.random() * 2,
        ripples: [],
        colIdx: i % 4
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

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      for (var s = 0; s < sources.length; s++) {
        var src = sources[s]
        var c = cols[src.colIdx]
        if (!rm) {
          src.timer += 0.016
          if (src.timer > src.interval) {
            src.timer = 0
            src.ripples.push({ born: t, r: 0 })
          }
        }
        ctx.beginPath()
        ctx.arc(src.x * W, src.y * H, 3, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.3)'
        ctx.fill()
        for (var r = src.ripples.length - 1; r >= 0; r--) {
          var rip = src.ripples[r]
          var age = t - rip.born
          rip.r = age * 40
          var alpha = Math.max(0, 0.2 - age * 0.03)
          if (alpha <= 0) {
            src.ripples.splice(r, 1)
            continue
          }
          ctx.beginPath()
          ctx.arc(src.x * W, src.y * H, rip.r, 0, Math.PI * 2)
          ctx.strokeStyle =
            'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')'
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.strokeStyle =
            'rgba(' +
            c[0] +
            ',' +
            c[1] +
            ',' +
            c[2] +
            ',' +
            alpha * 0.3 +
            ')'
          ctx.lineWidth = 5
          ctx.stroke()
        }
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
