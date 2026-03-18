'use client'
import { useEffect, useRef } from 'react'

export default function ServiceDesign2() {
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

    var journeyPts = []
    for (var i = 0; i < 30; i++)
      journeyPts.push({
        x: 0.05 + i * 0.031,
        y: 0.5 + Math.sin(i * 0.8) * 0.12
      })

    var sysNodes = []
    for (var i = 0; i < 14; i++) {
      sysNodes.push({
        x: 0.08 + Math.random() * 0.84,
        y: 0.15 + Math.random() * 0.7,
        connections: []
      })
    }
    for (var i = 0; i < sysNodes.length; i++) {
      for (var j = i + 1; j < sysNodes.length; j++) {
        var dx = sysNodes[i].x - sysNodes[j].x,
          dy = sysNodes[i].y - sysNodes[j].y
        if (Math.sqrt(dx * dx + dy * dy) < 0.28)
          sysNodes[i].connections.push(j)
      }
    }
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

      for (var i = 0; i < sysNodes.length; i++) {
        var n = sysNodes[i]
        for (var c = 0; c < n.connections.length; c++) {
          var o = sysNodes[n.connections[c]]
          ctx.beginPath()
          ctx.moveTo(n.x * W, n.y * H)
          ctx.lineTo(o.x * W, o.y * H)
          ctx.strokeStyle = 'rgba(155,81,224,0.08)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(n.x * W, n.y * H, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(155,81,224,0.2)'
        ctx.fill()
      }

      ctx.beginPath()
      for (var i = 0; i < journeyPts.length; i++) {
        var p = journeyPts[i]
        var y = p.y + (rm ? 0 : Math.sin(t * 0.3 + i * 0.3) * 0.008)
        if (i === 0) ctx.moveTo(p.x * W, y * H)
        else ctx.lineTo(p.x * W, y * H)
      }
      ctx.strokeStyle = 'rgba(255,162,0,0.3)'
      ctx.lineWidth = 2.5
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,162,0,0.06)'
      ctx.lineWidth = 8
      ctx.stroke()

      for (var i = 0; i < journeyPts.length; i += 3) {
        var jp = journeyPts[i]
        for (var s = 0; s < sysNodes.length; s++) {
          var sn = sysNodes[s]
          if (
            Math.sqrt(
              (jp.x - sn.x) * (jp.x - sn.x) +
                (jp.y - sn.y) * (jp.y - sn.y)
            ) < 0.08
          ) {
            var ix = ((jp.x + sn.x) / 2) * W,
              iy = ((jp.y + sn.y) / 2) * H
            var ig = ctx.createRadialGradient(ix, iy, 0, ix, iy, 10)
            ig.addColorStop(0, 'rgba(220,140,180,0.2)')
            ig.addColorStop(1, 'rgba(220,140,180,0)')
            ctx.fillStyle = ig
            ctx.beginPath()
            ctx.arc(ix, iy, 10, 0, Math.PI * 2)
            ctx.fill()
          }
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
