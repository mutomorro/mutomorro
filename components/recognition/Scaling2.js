'use client'
import { useEffect, useRef } from 'react'

export default function Scaling2() {
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

    var size = 0.1
    var maxSize = 0.4
    var saturation = 0.2
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
      if (!rm) {
        size = Math.min(maxSize, size + 0.0003)
        saturation = Math.min(1, saturation + 0.001)
      } else {
        size = 0.3
        saturation = 0.7
      }
      var r = size * H
      var breathe = rm ? 1 : 1 + Math.sin(t * 0.3) * 0.015
      r *= breathe
      for (var l = 3; l >= 0; l--) {
        var lr = r * (1 - l * 0.15)
        var lsat = saturation * (0.5 + l * 0.17)
        var alpha = 0.05 + lsat * 0.1
        ctx.beginPath()
        ctx.arc(cx, cy, lr, 0, Math.PI * 2)
        var rr = Math.round(128 + 127 * lsat), gg = Math.round(56 + 25 * lsat), bb = Math.round(143 + 81 * lsat)
        if (l < 2) { rr = Math.round(255 * lsat); gg = Math.round(66 + 96 * lsat); bb = 121 }
        if (l > 2) { rr = 255; gg = Math.round(162 * lsat); bb = Math.round(50 * lsat) }
        ctx.fillStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + alpha + ')'
        ctx.fill()
      }
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.3)
      cg.addColorStop(0, 'rgba(255,162,0,' + saturation * 0.25 + ')')
      cg.addColorStop(1, 'rgba(255,162,0,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2)
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
