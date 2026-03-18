'use client'
import { useEffect, useRef } from 'react'

export default function Scaling3() {
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

    var outerR = 0.1
    var maxOuter = 0.42
    var coreR = 0.08
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
      var cx = W * 0.5, cy = H * 0.5
      if (!rm) outerR = Math.min(maxOuter, outerR + 0.0002)
      else outerR = 0.35
      var or2 = outerR * H
      var cr = coreR * H
      var breathe = rm ? 1 : 1 + Math.sin(t * 0.4) * 0.02
      ctx.beginPath()
      ctx.arc(cx, cy, or2 * breathe, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(155,81,224,0.12)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.strokeStyle = 'rgba(155,81,224,0.03)'
      ctx.lineWidth = 10
      ctx.stroke()
      for (var i = 1; i < 4; i++) {
        var ir = cr + (or2 - cr) * (i / 4)
        ctx.beginPath()
        ctx.arc(cx, cy, ir * breathe, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(155,81,224,0.04)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      var pulse = rm ? 1 : 0.9 + Math.sin(t * 0.5) * 0.1
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 2 * pulse)
      cg.addColorStop(0, 'rgba(255,200,100,0.3)')
      cg.addColorStop(0.3, 'rgba(255,162,0,0.2)')
      cg.addColorStop(0.6, 'rgba(255,66,121,0.1)')
      cg.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, cr * 2 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 5 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,220,150,0.6)'
      ctx.fill()
      animId = requestAnimationFrame(tick)
    }

    if (rm) {
      tick()
    } else {
      animId = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
