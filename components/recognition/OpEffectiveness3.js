'use client'
import { useEffect, useRef } from 'react'

export default function OpEffectiveness3() {
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

    var linePoints = 80
    var line = []
    for (var i = 0; i < linePoints; i++) line.push({x:i/(linePoints-1),y:0.5,targetY:0.5})

    var knots = []
    for (var i = 0; i < 5; i++) knots.push({pos:0.12+i*0.18,tightness:1,untangleSpeed:0.003+Math.random()*0.005,delay:i*1.5+Math.random()*2,amplitude:0.06+Math.random()*0.05})

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

      for (var k = 0; k < knots.length; k++) {
        var kn = knots[k]
        var elapsed = Math.max(0, t - kn.delay)
        if (!rm && elapsed > 0) kn.tightness = Math.max(0, kn.tightness - kn.untangleSpeed * 0.01)
        else if (rm) kn.tightness = 0.2
      }

      for (var i = 0; i < linePoints; i++) {
        var p = line[i]
        p.targetY = 0.5
        for (var k = 0; k < knots.length; k++) {
          var kn = knots[k]
          var dx = p.x - kn.pos
          if (Math.abs(dx) < 0.1) {
            var inf = 1 - Math.abs(dx) / 0.1
            p.targetY += Math.sin(dx * 60) * kn.amplitude * kn.tightness * inf
          }
        }
        if (!rm) p.y += (p.targetY - p.y) * 0.05; else p.y = p.targetY
      }

      ctx.lineWidth = 2.5
      for (var i = 1; i < linePoints; i++) {
        var p0 = line[i - 1], p1 = line[i]
        var prog = i / linePoints
        var ci = Math.floor(prog * (cols.length - 1))
        var cf = prog * (cols.length - 1) - ci
        if (ci >= cols.length - 1) { ci = cols.length - 2; cf = 1 }
        var c0 = cols[ci], c1 = cols[ci + 1]
        var r = Math.round(c0[0] + (c1[0] - c0[0]) * cf)
        var g2 = Math.round(c0[1] + (c1[1] - c0[1]) * cf)
        var b = Math.round(c0[2] + (c1[2] - c0[2]) * cf)
        ctx.beginPath()
        ctx.moveTo(p0.x * W, p0.y * H)
        ctx.lineTo(p1.x * W, p1.y * H)
        ctx.strokeStyle = 'rgba(' + r + ',' + g2 + ',' + b + ',0.5)'
        ctx.stroke()
      }

      for (var k = 0; k < knots.length; k++) {
        var kn = knots[k]
        if (kn.tightness > 0.1) {
          var kx = kn.pos * W, ky = 0.5 * H
          var kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, 15)
          kg.addColorStop(0, 'rgba(255,100,100,' + kn.tightness * 0.15 + ')')
          kg.addColorStop(1, 'rgba(255,100,100,0)')
          ctx.fillStyle = kg
          ctx.beginPath()
          ctx.arc(kx, ky, 15, 0, Math.PI * 2)
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
