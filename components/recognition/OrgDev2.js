'use client'
import { useEffect, useRef } from 'react'

export default function OrgDev2() {
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
      var maxR = H * 0.4
      var rot = rm ? 0 : t * 0.05
      ctx.beginPath()
      for (var i = 0; i < 150; i++) {
        var prog = i / 150
        var angle = prog * Math.PI * 6 + rot
        var r = prog * maxR
        var px = cx + Math.cos(angle) * r,
          py = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      var sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
      sg.addColorStop(0, 'rgba(128,56,143,0.4)')
      sg.addColorStop(0.3, 'rgba(155,81,224,0.35)')
      sg.addColorStop(0.6, 'rgba(255,66,121,0.3)')
      sg.addColorStop(1, 'rgba(255,162,0,0.25)')
      ctx.strokeStyle = sg
      ctx.lineWidth = 2.5
      ctx.stroke()
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15)
      cg.addColorStop(0, 'rgba(128,56,143,0.3)')
      cg.addColorStop(1, 'rgba(128,56,143,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, 15, 0, Math.PI * 2)
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
