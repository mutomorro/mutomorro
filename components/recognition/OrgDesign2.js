'use client'
import { useEffect, useRef } from 'react'

export default function OrgDesign2() {
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

    var clusters = []
    for (var c = 0; c < 4; c++) {
      var cx2 = 0.15 + c * 0.23, cy2 = 0.3 + (c % 2) * 0.35
      var members = []
      for (var m = 0; m < 7; m++) {
        members.push({x:cx2+(Math.random()-0.5)*0.1,y:cy2+(Math.random()-0.5)*0.15,
          homeX:cx2+(Math.random()-0.5)*0.1,homeY:cy2+(Math.random()-0.5)*0.15,
          phase:Math.random()*Math.PI*2,speed:0.3+Math.random()*0.5})
      }
      clusters.push({cx:cx2,cy:cy2,members:members,colIdx:c})
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

      for (var a = 0; a < clusters.length; a++) {
        for (var b = a + 1; b < clusters.length; b++) {
          for (var ma = 0; ma < clusters[a].members.length; ma++) {
            for (var mb = 0; mb < clusters[b].members.length; mb++) {
              var pa = clusters[a].members[ma], pb = clusters[b].members[mb]
              var dx = (pa.x - pb.x) * W, dy = (pa.y - pb.y) * H
              var dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 70) {
                var al = (1 - dist / 70) * 0.12
                ctx.beginPath()
                ctx.moveTo(pa.x * W, pa.y * H)
                ctx.lineTo(pb.x * W, pb.y * H)
                ctx.strokeStyle = 'rgba(200,150,220,' + al + ')'
                ctx.lineWidth = 1
                ctx.stroke()
              }
            }
          }
        }
      }

      for (var c = 0; c < clusters.length; c++) {
        var cl = clusters[c]
        var col = cols[cl.colIdx]
        for (var m = 0; m < cl.members.length; m++) {
          var p = cl.members[m]
          if (!rm) {
            p.x = p.homeX + Math.sin(t * p.speed + p.phase) * 0.035
            p.y = p.homeY + Math.cos(t * p.speed * 0.7 + p.phase) * 0.025
          }
          var px = p.x * W, py = p.y * H

          var g = ctx.createRadialGradient(px, py, 0, px, py, 8)
          g.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.25)')
          g.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, 8, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
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
