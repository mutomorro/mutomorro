'use client'
import { useEffect, useRef } from 'react'

export default function OrgPurpose4() {
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

    var rings = []
    for (var i = 0; i < 6; i++) rings.push({radius: 0.06 + i * 0.06, saturation: 0.2, targetSat: 0.8, speed: 0.005 + Math.random() * 0.005, delay: i * 0.5})
    var cols = [[128,56,143],[155,81,224],[255,66,121],[255,162,0]]
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
      var cx = W * 0.5, cy = H * 0.5
      for (var i = rings.length - 1; i >= 0; i--) {
        var r = rings[i]
        var elapsed = Math.max(0, t - r.delay)
        if (!rm && elapsed > 0) r.saturation = Math.min(r.targetSat, r.saturation + r.speed * 0.005)
        else if (rm) r.saturation = 0.7
        var breathe = rm ? 1 : 1 + Math.sin(t * 0.3 + i) * 0.02
        var rad = r.radius * H * breathe
        var s = r.saturation
        var rr = Math.round(155 + 100 * s), gg = Math.round(81 - 20 * s), bb = Math.round(224 - 80 * s)
        if (i > 2) { rr = 255; gg = Math.round(66 + 96 * s); bb = 121 }
        if (i > 4) { rr = 255; gg = 162; bb = Math.round(50 * s) }
        var alpha = 0.1 + s * 0.2
        ctx.beginPath()
        ctx.arc(cx, cy, rad, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + alpha * 0.3 + ')'
        ctx.lineWidth = 10
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, rad, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + alpha + ')'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      var ccg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rings[0].radius * H)
      ccg.addColorStop(0, 'rgba(255,200,100,' + rings[0].saturation * 0.3 + ')')
      ccg.addColorStop(1, 'rgba(255,200,100,0)')
      ctx.fillStyle = ccg
      ctx.beginPath()
      ctx.arc(cx, cy, rings[0].radius * H, 0, Math.PI * 2)
      ctx.fill()

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
