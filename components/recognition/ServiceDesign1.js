'use client'
import { useEffect, useRef } from 'react'

export default function ServiceDesign1() {
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

    var form = []
    for (var i = 0; i < 20; i++)
      form.push({
        x: 0.5,
        y: 0.15 + i * 0.035,
        baseX: 0.5,
        leftPush: 0,
        rightPush: 0
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

    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      for (var i = 0; i < form.length; i++) {
        var f = form[i]
        var lw =
          Math.sin(t * 0.5 + i * 0.5) * 0.025 +
          Math.sin(t * 0.3 + i * 0.8) * 0.015
        var rw =
          Math.sin(t * 0.4 + i * 0.6) * 0.02 +
          Math.cos(t * 0.35 + i * 0.7) * 0.015
        if (!rm) {
          f.leftPush += (lw - f.leftPush) * 0.05
          f.rightPush += (rw - f.rightPush) * 0.05
        } else {
          f.leftPush = lw
          f.rightPush = rw
        }
        f.x = f.baseX + f.leftPush - f.rightPush
      }

      ctx.beginPath()
      for (var i = 0; i < form.length; i++) {
        if (i === 0) ctx.moveTo(form[i].x * W - 15, form[i].y * H)
        else ctx.lineTo(form[i].x * W - 15, form[i].y * H)
      }
      for (var i = form.length - 1; i >= 0; i--)
        ctx.lineTo(form[i].x * W + 15, form[i].y * H)
      ctx.closePath()

      var fg = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0)
      fg.addColorStop(0, 'rgba(155,81,224,0.15)')
      fg.addColorStop(0.5, 'rgba(200,120,180,0.2)')
      fg.addColorStop(1, 'rgba(255,162,0,0.15)')
      ctx.fillStyle = fg
      ctx.fill()
      ctx.strokeStyle = 'rgba(200,140,200,0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      for (var i = 0; i < 6; i++) {
        var py = (0.2 + i * 0.07) * H
        var px = (0.25 + Math.sin(t * 0.3 + i) * 0.04) * W
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(155,81,224,0.3)'
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(form[i * 3].x * W - 15, form[i * 3].y * H)
        ctx.strokeStyle = 'rgba(155,81,224,0.06)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      for (var i = 0; i < 6; i++) {
        var py = (0.2 + i * 0.07) * H
        var px = (0.75 + Math.sin(t * 0.35 + i) * 0.04) * W
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,162,0,0.3)'
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(form[i * 3].x * W + 15, form[i * 3].y * H)
        ctx.strokeStyle = 'rgba(255,162,0,0.06)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

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

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
