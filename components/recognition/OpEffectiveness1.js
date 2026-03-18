'use client'
import { useEffect, useRef } from 'react'

export default function OpEffectiveness1() {
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

    var particles = []
    for (var i = 0; i < 50; i++) {
      particles.push({x:Math.random(),y:0.5,speed:0.002+Math.random()*0.003,
        phase:Math.random()*Math.PI*2,amp:0.015+Math.random()*0.03,size:1.5+Math.random()*2,colT:Math.random()})
    }

    function colAt(t2, a) {
      var c = [[128,56,143],[155,81,224],[255,66,121],[255,162,0]]
      t2 = Math.max(0, Math.min(1, t2))
      var idx = t2 * (c.length - 1)
      var ii = Math.floor(idx)
      var f = idx - ii
      if (ii >= c.length - 1) { ii = c.length - 2; f = 1 }
      var c0 = c[ii], c1 = c[ii + 1]
      return 'rgba(' + Math.round(c0[0] + (c1[0] - c0[0]) * f) + ',' + Math.round(c0[1] + (c1[1] - c0[1]) * f) + ',' + Math.round(c0[2] + (c1[2] - c0[2]) * f) + ',' + a + ')'
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

      ctx.beginPath()
      for (var x = 0; x <= 1; x += 0.01) {
        var y = 0.5 + Math.sin(x * 4 + t * 0.2) * 0.05 - 0.08
        if (x === 0) ctx.moveTo(x * W, y * H); else ctx.lineTo(x * W, y * H)
      }
      ctx.strokeStyle = 'rgba(155,81,224,0.05)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      for (var x = 0; x <= 1; x += 0.01) {
        var y = 0.5 + Math.sin(x * 4 + t * 0.2) * 0.05 + 0.08
        if (x === 0) ctx.moveTo(x * W, y * H); else ctx.lineTo(x * W, y * H)
      }
      ctx.stroke()

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i]
        if (!rm) { p.x += p.speed; if (p.x > 1.1) p.x = -0.1 }
        var channelY = 0.5 + Math.sin(p.x * 4 + t * 0.2) * 0.05
        p.y = channelY + Math.sin(t * 0.8 + p.phase) * p.amp * 0.4
        var px = p.x * W, py = p.y * H
        var tx = (p.x - p.speed * 4) * W

        var tg = ctx.createLinearGradient(tx, py, px, py)
        tg.addColorStop(0, colAt(p.colT, 0))
        tg.addColorStop(1, colAt(p.colT, 0.2))
        ctx.strokeStyle = tg
        ctx.lineWidth = p.size * 0.6
        ctx.beginPath()
        ctx.moveTo(tx, py)
        ctx.lineTo(px, py)
        ctx.stroke()

        var g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3)
        g.addColorStop(0, colAt(p.colT, 0.25))
        g.addColorStop(1, colAt(p.colT, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = colAt(p.colT, 0.5)
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
