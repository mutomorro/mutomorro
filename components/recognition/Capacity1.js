'use client'
import { useEffect, useRef } from 'react'

export default function Capacity1() {
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

    var forms = []
    for (var i = 0; i < 10; i++)
      forms.push({
        x: 0.08 + i * 0.09,
        baseY: 0.72,
        height: 0,
        targetH: 0.15 + Math.random() * 0.2,
        growSpeed: 0.003 + Math.random() * 0.004,
        delay: i * 0.3,
        colIdx: i % 4,
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
      ctx.beginPath()
      ctx.moveTo(0, 0.72 * H)
      ctx.lineTo(W, 0.72 * H)
      ctx.strokeStyle = 'rgba(155,81,224,0.06)'
      ctx.lineWidth = 2
      ctx.stroke()
      for (var i = 0; i < forms.length; i++) {
        var f = forms[i]
        var elapsed = Math.max(0, t - f.delay)
        if (!rm && elapsed > 0)
          f.height = Math.min(f.targetH, f.height + f.growSpeed * 0.005)
        else if (rm) f.height = f.targetH * 0.8
        var col = cols[f.colIdx]
        var px = f.x * W,
          by = f.baseY * H
        var h = f.height * H
        var wobble = rm ? 0 : Math.sin(t * 0.4 + f.phase) * 3
        var topY = by - h
        ctx.beginPath()
        ctx.moveTo(px, by)
        ctx.quadraticCurveTo(px + wobble * 0.5, by - h * 0.5, px + wobble, topY)
        ctx.strokeStyle =
          'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0.3)'
        ctx.lineWidth = 2.5
        ctx.stroke()
        var gx = px + wobble,
          gy = topY
        var g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 10 + h * 0.1)
        g.addColorStop(
          0,
          'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0.3)'
        )
        g.addColorStop(
          1,
          'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0)'
        )
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(gx, gy, 10 + h * 0.1, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(gx, gy, 3, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0.5)'
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
