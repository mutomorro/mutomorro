'use client'
import { useEffect, useRef } from 'react'

export default function Restructuring2() {
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
    var cols = [{ r: 128, g: 56, b: 143 }, { r: 155, g: 81, b: 224 }, { r: 255, g: 66, b: 121 }, { r: 255, g: 162, b: 0 }]

    var pairs = []

    function initPairs() {
      pairs = []
      for (var i = 0; i < 10; i++) {
        var oldX = 0.05 + Math.random() * 0.25, oldY = 0.12 + Math.random() * 0.76
        var newX = 0.65 + Math.random() * 0.3, newY = 0.12 + Math.random() * 0.76
        pairs.push({
          oldX: oldX, oldY: oldY, newX: newX, newY: newY, col: cols[i % 4],
          threadProgress: 0, threadSpeed: 0.005 + Math.random() * 0.008,
          delay: i * 0.5 + Math.random(),
          pulsePhase: Math.random() * Math.PI * 2, particlePos: 0
        })
      }
    }

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
    initPairs()

    var t = 0

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i]
        var elapsed = Math.max(0, t - p.delay)
        if (!rm && elapsed > 0) p.threadProgress = Math.min(1, p.threadProgress + p.threadSpeed * 0.02)
        else if (rm) p.threadProgress = 1
        var ox = p.oldX * W, oy = p.oldY * H, nx = p.newX * W, ny = p.newY * H
        var tp = p.threadProgress
        ctx.beginPath()
        ctx.arc(ox, oy, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + p.col.r + ',' + p.col.g + ',' + p.col.b + ',0.3)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(nx, ny, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + p.col.r + ',' + p.col.g + ',' + p.col.b + ',' + tp * 0.5 + ')'
        ctx.fill()
        if (tp > 0) {
          var midX = (ox + nx) / 2, midY = (oy + ny) / 2 - 20
          var endX = ox + (nx - ox) * tp, endY = oy + (ny - oy) * tp
          var cmx = ox + (midX - ox) * tp, cmy = oy + (midY - oy) * tp
          ctx.beginPath()
          ctx.moveTo(ox, oy)
          ctx.quadraticCurveTo(cmx, cmy, endX, endY)
          ctx.strokeStyle = 'rgba(' + p.col.r + ',' + p.col.g + ',' + p.col.b + ',' + tp * 0.3 + ')'
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.strokeStyle = 'rgba(' + p.col.r + ',' + p.col.g + ',' + p.col.b + ',' + tp * 0.08 + ')'
          ctx.lineWidth = 8
          ctx.beginPath()
          ctx.moveTo(ox, oy)
          ctx.quadraticCurveTo(cmx, cmy, endX, endY)
          ctx.stroke()
          if (!rm && tp > 0.3) {
            p.particlePos = (p.particlePos + 0.008) % 1
            var pt = p.particlePos
            var px2 = (1 - pt) * (1 - pt) * ox + 2 * (1 - pt) * pt * midX + pt * pt * nx
            var py2 = (1 - pt) * (1 - pt) * oy + 2 * (1 - pt) * pt * midY + pt * pt * ny
            var pg = ctx.createRadialGradient(px2, py2, 0, px2, py2, 6)
            pg.addColorStop(0, 'rgba(255,255,255,0.4)')
            pg.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.fillStyle = pg
            ctx.beginPath()
            ctx.arc(px2, py2, 6, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(px2, py2, 1.5, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255,255,255,0.7)'
            ctx.fill()
          }
        }
        if (tp > 0.8) {
          var sg = ctx.createRadialGradient(nx, ny, 0, nx, ny, 15)
          sg.addColorStop(0, 'rgba(' + p.col.r + ',' + p.col.g + ',' + p.col.b + ',' + (tp - 0.8) * 0.5 + ')')
          sg.addColorStop(1, 'rgba(' + p.col.r + ',' + p.col.g + ',' + p.col.b + ',0)')
          ctx.fillStyle = sg
          ctx.beginPath()
          ctx.arc(nx, ny, 15, 0, Math.PI * 2)
          ctx.fill()
        }
      }
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
