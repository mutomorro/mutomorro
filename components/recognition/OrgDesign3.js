'use client'
import { useEffect, useRef } from 'react'

export default function OrgDesign3() {
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

    var cols = [[128,56,143],[155,81,224],[255,66,121],[255,162,0]]

    var channels = []
    for (var i = 0; i < 5; i++) {
      var y = 0.15 + i * 0.17
      channels.push({y:y,particles:[]})
      for (var p = 0; p < 8; p++)
        channels[i].particles.push({x:Math.random(),speed:0.001+Math.random()*0.003,yOff:0,phase:Math.random()*Math.PI*2})
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

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      for (var c = 0; c < channels.length; c++) {
        var ch = channels[c]
        var col = cols[c % 4]

        ctx.beginPath()
        for (var x = 0; x <= 1; x += 0.02) {
          var y = (ch.y - 0.05) * H + Math.sin(x * 5 + t * 0.2) * 2
          if (x === 0) ctx.moveTo(x * W, y); else ctx.lineTo(x * W, y)
        }
        ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.06)'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.beginPath()
        for (var x = 0; x <= 1; x += 0.02) {
          var y = (ch.y + 0.05) * H + Math.sin(x * 5 + t * 0.2) * 2
          if (x === 0) ctx.moveTo(x * W, y); else ctx.lineTo(x * W, y)
        }
        ctx.stroke()

        for (var p = 0; p < ch.particles.length; p++) {
          var pt = ch.particles[p]
          if (!rm) { pt.x += pt.speed; if (pt.x > 1.1) pt.x = -0.1 }
          pt.yOff = Math.sin(t * 0.5 + pt.phase) * 0.025
          var px = pt.x * W, py = (ch.y + pt.yOff) * H

          var g = ctx.createRadialGradient(px, py, 0, px, py, 6)
          g.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.3)')
          g.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, 6, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.5)'
          ctx.fill()
        }
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
