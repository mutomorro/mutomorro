'use client'
import { useEffect, useRef } from 'react'

export default function Restructuring3() {
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
    var cols = [[128, 56, 143], [155, 81, 224], [255, 66, 121], [255, 162, 0]]

    var groups = []

    function initGroups() {
      groups = []
      for (var g = 0; g < 5; g++) {
        var cx2 = 0.12 + g * 0.19, cy2 = 0.35 + (g % 2) * 0.3
        var members = []
        for (var m = 0; m < 5; m++) {
          members.push({
            angle: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5,
            targetSpeed: 0.8,
            radius: 0.03 + Math.random() * 0.02,
            targetRadius: 0.04,
            phase: Math.random() * Math.PI * 2
          })
        }
        groups.push({ cx: cx2, cy: cy2, members: members, colIdx: g % 4 })
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
    initGroups()

    var t = 0

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g]
        var c = cols[grp.colIdx]
        var elapsed = Math.max(0, t - grp.colIdx * 1.5)
        var sp = rm ? 0.9 : Math.min(1, elapsed * 0.05)
        var gcx = grp.cx * W, gcy = grp.cy * H
        var gg = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, 30 * sp)
        gg.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + sp * 0.1 + ')')
        gg.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)')
        ctx.fillStyle = gg
        ctx.beginPath()
        ctx.arc(gcx, gcy, 30 * sp, 0, Math.PI * 2)
        ctx.fill()
        for (var m = 0; m < grp.members.length; m++) {
          var mem = grp.members[m]
          mem.speed += (mem.targetSpeed - mem.speed) * sp * 0.01
          mem.radius += (mem.targetRadius - mem.radius) * sp * 0.01
          if (!rm) mem.angle += mem.speed * 0.02
          var r = mem.radius * Math.min(W, H)
          var px = gcx + Math.cos(mem.angle) * r, py = gcy + Math.sin(mem.angle) * r
          var trailA = mem.angle - mem.speed * 0.06
          var tx = gcx + Math.cos(trailA) * r, ty = gcy + Math.sin(trailA) * r
          ctx.beginPath()
          ctx.moveTo(tx, ty)
          ctx.lineTo(px, py)
          ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + 0.15 * sp + ')'
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.4 + sp * 0.3) + ')'
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
