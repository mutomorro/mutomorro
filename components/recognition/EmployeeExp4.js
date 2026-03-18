'use client'
import { useEffect, useRef } from 'react'

export default function EmployeeExp4() {
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

    // Emanating ripples - centre slightly left of middle for landscape interest
    var t = 0
    var ripples = []

    function spawnRipple() {
      ripples.push({ born: t, speed: 0.03 + Math.random() * 0.02 })
    }
    spawnRipple()

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
      var cx = W * 0.45, cy = H * 0.5
      var maxR = Math.max(W, H) * 0.55
      if (!rm && ripples.length < 8 && t - ripples[ripples.length - 1].born > 1.5) spawnRipple()
      var coreR = H * 0.1
      var pulse = rm ? 1 : 0.9 + Math.sin(t * 0.8) * 0.1
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2 * pulse)
      cg.addColorStop(0, 'rgba(255,162,0,0.2)')
      cg.addColorStop(0.3, 'rgba(255,66,121,0.1)')
      cg.addColorStop(0.6, 'rgba(155,81,224,0.05)')
      cg.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, coreR * 2 * pulse, 0, Math.PI * 2)
      ctx.fill()
      for (var i = 0; i < 8; i++) {
        var a = i * (Math.PI * 2 / 8) + (rm ? 0 : t * 0.1)
        var d = coreR * 0.5
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,162,0,0.3)'
        ctx.fill()
      }
      for (var i = ripples.length - 1; i >= 0; i--) {
        var rip = ripples[i]
        var age = t - rip.born
        var r = age * rip.speed * maxR
        if (r > maxR) { ripples.splice(i, 1); continue }
        var alpha = Math.max(0, 0.2 * (1 - r / maxR))
        var cp = r / maxR
        var cr, cg2, cb
        if (cp < 0.3) { cr = 255; cg2 = 162; cb = 0 }
        else if (cp < 0.6) { var tt = (cp - 0.3) / 0.3; cr = 255; cg2 = Math.round(162 - 96 * tt); cb = Math.round(121 * tt) }
        else { var tt = (cp - 0.6) / 0.4; cr = Math.round(255 - 100 * tt); cg2 = Math.round(66 + 15 * tt); cb = Math.round(121 + 103 * tt) }
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(' + cr + ',' + cg2 + ',' + cb + ',' + alpha + ')'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(' + cr + ',' + cg2 + ',' + cb + ',' + alpha * 0.3 + ')'
        ctx.lineWidth = 8
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(cx, cy, 4 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,200,100,0.5)'
      ctx.fill()
      if (!rm) animId = requestAnimationFrame(tick)
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
