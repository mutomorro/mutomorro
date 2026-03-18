'use client'
import { useEffect, useRef } from 'react'

export default function Capacity2() {
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

    var cols = [
      { r: 128, g: 56, b: 143 },
      { r: 155, g: 81, b: 224 },
      { r: 255, g: 66, b: 121 },
      { r: 255, g: 162, b: 0 }
    ]

    var nodes = []
    for (var i = 0; i < 12; i++)
      nodes.push({
        x: 0.08 + Math.random() * 0.84,
        baseY: 0.6,
        y: 0.6,
        lift: 0,
        phase: Math.random() * Math.PI * 2,
        colIdx: i % 4,
        size: 4 + Math.random() * 3
      })
    var links = []
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x
        if (Math.abs(dx) < 0.2)
          links.push({ a: i, b: j, strength: 0.3 + Math.random() * 0.4 })
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

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      var risingIdx = Math.floor((t * 0.3) % nodes.length)
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        var targetLift = 0
        if (i === risingIdx) targetLift = 0.12
        for (var l = 0; l < links.length; l++) {
          var lk = links[l]
          if (lk.a === i && nodes[lk.b].lift > 0.05)
            targetLift = Math.max(targetLift, nodes[lk.b].lift * lk.strength)
          if (lk.b === i && nodes[lk.a].lift > 0.05)
            targetLift = Math.max(targetLift, nodes[lk.a].lift * lk.strength)
        }
        if (!rm) n.lift += (targetLift - n.lift) * 0.03
        else n.lift = 0.05
        n.y = n.baseY - n.lift
      }
      for (var l = 0; l < links.length; l++) {
        var lk = links[l]
        var a = nodes[lk.a],
          b = nodes[lk.b]
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(b.x * W, b.y * H)
        ctx.strokeStyle =
          'rgba(155,81,224,' + (0.08 + Math.max(a.lift, b.lift) * 0.3) + ')'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        var c = cols[n.colIdx]
        var px = n.x * W,
          py = n.y * H
        var lg = n.lift * 3
        var g = ctx.createRadialGradient(px, py, 0, px, py, n.size + lg * 10)
        g.addColorStop(
          0,
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (0.2 + lg) + ')'
        )
        g.addColorStop(
          1,
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)'
        )
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, n.size + lg * 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py, n.size, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (0.4 + lg) + ')'
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

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
