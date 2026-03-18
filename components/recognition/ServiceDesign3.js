'use client'
import { useEffect, useRef } from 'react'

export default function ServiceDesign3() {
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

    var formW = 0.2,
      formH = 0.3,
      formX = 0.5,
      formY = 0.5,
      targetW = 0.2,
      targetH = 0.3
    var t = 0,
      testPhase = 0

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

      if (!rm) {
        testPhase = t * 0.3
        var cycle = testPhase % 4
        if (cycle < 1) {
          targetW = 0.25
          targetH = 0.22
        } else if (cycle < 2) {
          targetW = 0.15
          targetH = 0.35
        } else if (cycle < 3) {
          targetW = 0.2
          targetH = 0.25
        } else {
          targetW = 0.18
          targetH = 0.28
        }
        formW += (targetW - formW) * 0.03
        formH += (targetH - formH) * 0.03
      }

      var fx = formX * W,
        fy = formY * H,
        fw = formW * W,
        fh = formH * H

      ctx.beginPath()
      var steps = 40
      for (var i = 0; i <= steps; i++) {
        var a = i * ((Math.PI * 2) / steps)
        var rx = (fw / 2) * (1 + Math.sin(a * 3) * 0.05),
          ry = (fh / 2) * (1 + Math.cos(a * 2) * 0.05)
        if (i === 0) ctx.moveTo(fx + Math.cos(a) * rx, fy + Math.sin(a) * ry)
        else ctx.lineTo(fx + Math.cos(a) * rx, fy + Math.sin(a) * ry)
      }
      ctx.closePath()

      var fg = ctx.createRadialGradient(
        fx,
        fy,
        0,
        fx,
        fy,
        Math.max(fw, fh)
      )
      fg.addColorStop(0, 'rgba(155,81,224,0.15)')
      fg.addColorStop(0.5, 'rgba(255,66,121,0.1)')
      fg.addColorStop(1, 'rgba(255,162,0,0.05)')
      ctx.fillStyle = fg
      ctx.fill()
      ctx.strokeStyle = 'rgba(155,81,224,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      var pp = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ]
      for (var i = 0; i < pp.length; i++) {
        var px = fx + pp[i][0] * fw * 0.6,
          py = fy + pp[i][1] * fh * 0.6
        var isActive = !rm && Math.floor(testPhase % 4) === i
        var alpha = isActive ? 0.4 : 0.1

        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,162,0,' + alpha + ')'
        ctx.fill()

        if (isActive) {
          var pg = ctx.createRadialGradient(px, py, 0, px, py, 12)
          pg.addColorStop(0, 'rgba(255,162,0,0.2)')
          pg.addColorStop(1, 'rgba(255,162,0,0)')
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.arc(px, py, 12, 0, Math.PI * 2)
          ctx.fill()
        }
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
