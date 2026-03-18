'use client'
import { useEffect, useRef } from 'react'

export default function OrgDesign4() {
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

    var nodes = []
    for (var i = 0; i < 16; i++) {
      nodes.push({x:0.08+Math.random()*0.84,y:0.1+Math.random()*0.8,
        targetX:0.08+Math.random()*0.84,targetY:0.1+Math.random()*0.8,colIdx:i%4,size:3+Math.random()*2,
        adjustTimer:Math.random()*5,adjustInterval:3+Math.random()*4})
    }

    var connections = []
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
        if (Math.sqrt(dx * dx + dy * dy) < 0.3) connections.push({a:i,b:j})
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

      if (!rm) {
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i]
          n.adjustTimer += 0.016
          if (n.adjustTimer > n.adjustInterval) {
            n.targetX = n.x + (Math.random() - 0.5) * 0.08
            n.targetY = n.y + (Math.random() - 0.5) * 0.06
            n.targetX = Math.max(0.05, Math.min(0.95, n.targetX))
            n.targetY = Math.max(0.08, Math.min(0.92, n.targetY))
            n.adjustTimer = 0
          }
          n.x += (n.targetX - n.x) * 0.02
          n.y += (n.targetY - n.y) * 0.02
        }
      }

      for (var i = 0; i < connections.length; i++) {
        var c = connections[i]
        var a = nodes[c.a], b = nodes[c.b]
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(b.x * W, b.y * H)
        ctx.strokeStyle = 'rgba(155,81,224,0.1)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        var c = cols[n.colIdx]
        var px = n.x * W, py = n.y * H
        var isAdj = n.adjustTimer < 0.5
        var gs = isAdj ? 12 : 6

        var g = ctx.createRadialGradient(px, py, 0, px, py, gs)
        g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (isAdj ? 0.3 : 0.15) + ')')
        g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, gs, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, n.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.5)'
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
