'use client'
import { useEffect, useRef } from 'react'

export default function OrgDev4() {
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

    var sparks = []
    for (var i = 0; i < 40; i++)
      sparks.push({
        x: 0.05 + Math.random() * 0.9,
        y: 0.1 + Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        targetX: 0.2 + Math.random() * 0.6,
        targetY: 0.2 + Math.random() * 0.6,
        chaos: 1,
        settleSpeed: 0.002 + Math.random() * 0.003,
        colIdx: i % 4,
        size: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
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
      for (var i = 0; i < sparks.length; i++) {
        var s = sparks[i]
        var c = cols[s.colIdx]
        if (!rm) s.chaos = Math.max(0, s.chaos - s.settleSpeed * 0.003)
        else s.chaos = 0.2
        if (!rm) {
          s.vx *= 0.98
          s.vy *= 0.98
          s.vx += (Math.random() - 0.5) * 0.002 * s.chaos
          s.vy += (Math.random() - 0.5) * 0.002 * s.chaos
          s.x += (s.targetX - s.x) * 0.005 * (1 - s.chaos)
          s.y += (s.targetY - s.y) * 0.005 * (1 - s.chaos)
          s.x += s.vx
          s.y += s.vy
          s.x = Math.max(0.03, Math.min(0.97, s.x))
          s.y = Math.max(0.05, Math.min(0.95, s.y))
        }
        var px = s.x * W,
          py = s.y * H
        var steadiness = 1 - s.chaos
        var flicker = s.chaos * Math.sin(t * 10 + s.phase) * 0.3
        var alpha = 0.3 + steadiness * 0.3 + flicker
        var glowR = s.size * (2 + steadiness * 4)
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
        ctx.arc(px, py, s.size, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')'
        ctx.fill()
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
