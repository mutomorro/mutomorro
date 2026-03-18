'use client'
import { useEffect, useRef } from 'react'

export default function OpEffectiveness4() {
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

      var cx = W * 0.5, cy = H * 0.5
      var maxR = H * 0.38
      var rotation = rm ? 0 : t * 0.1

      ctx.beginPath()
      for (var i = 0; i < 200; i++) {
        var progress = i / 200
        var r = maxR * (1 - progress * 0.85)
        var angle = progress * Math.PI * 8 + rotation
        var wobble = rm ? 0 : Math.sin(angle * 3 + t) * 2 * (1 - progress * 0.3)
        var px = cx + Math.cos(angle) * (r + wobble), py = cy + Math.sin(angle) * (r + wobble)
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }

      var sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
      sg.addColorStop(0, 'rgba(255,162,0,0.5)')
      sg.addColorStop(0.3, 'rgba(255,66,121,0.4)')
      sg.addColorStop(0.7, 'rgba(155,81,224,0.3)')
      sg.addColorStop(1, 'rgba(128,56,143,0.2)')
      ctx.strokeStyle = sg
      ctx.lineWidth = 2
      ctx.stroke()

      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
      cg.addColorStop(0, 'rgba(255,162,0,0.3)')
      cg.addColorStop(1, 'rgba(255,162,0,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, 20, 0, Math.PI * 2)
      ctx.fill()

      if (!rm) {
        var ti = Math.floor((t * 15) % 200)
        var tp = ti / 200
        var tr = maxR * (1 - tp * 0.85)
        var ta = tp * Math.PI * 8 + rotation
        var tpx = cx + Math.cos(ta) * tr, tpy = cy + Math.sin(ta) * tr
        ctx.beginPath()
        ctx.arc(tpx, tpy, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fill()

        var tg = ctx.createRadialGradient(tpx, tpy, 0, tpx, tpy, 10)
        tg.addColorStop(0, 'rgba(255,200,100,0.3)')
        tg.addColorStop(1, 'rgba(255,200,100,0)')
        ctx.fillStyle = tg
        ctx.beginPath()
        ctx.arc(tpx, tpy, 10, 0, Math.PI * 2)
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

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
