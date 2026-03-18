'use client'
import { useEffect, useRef } from 'react'

export default function ServiceDesign4() {
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
      [128, 56, 143],
      [155, 81, 224],
      [255, 66, 121],
      [255, 162, 0]
    ]

    var centre = []
    for (var i = 0; i < 8; i++)
      centre.push({
        angle: i * ((Math.PI * 2) / 8),
        dist: 0.06,
        size: 3,
        colIdx: i % 4
      })

    var edges = []
    for (var e = 0; e < 6; e++) {
      var ea = e * ((Math.PI * 2) / 6) + 0.3
      var ed = 0.25 + Math.random() * 0.12
      var members = []
      for (var m = 0; m < 5; m++)
        members.push({
          angle: m * ((Math.PI * 2) / 5),
          dist: 0.025 + Math.random() * 0.01,
          colIdx: m % 4
        })
      edges.push({
        cx: 0.5 + Math.cos(ea) * ed * 1.3,
        cy: 0.5 + Math.sin(ea) * ed,
        members: members,
        inspired: 0,
        delay: e * 1.2
      })
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
      var cx = W * 0.5,
        cy = H * 0.5
      var rot = rm ? 0 : t * 0.2

      for (var i = 0; i < centre.length; i++) {
        var p = centre[i]
        var c = cols[p.colIdx]
        var a = p.angle + rot
        var d = p.dist * H
        var px = cx + Math.cos(a) * d,
          py = cy + Math.sin(a) * d

        var g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3)
        g.addColorStop(
          0,
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.35)'
        )
        g.addColorStop(
          1,
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
        )
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.5)'
        ctx.fill()
      }

      for (var e = 0; e < edges.length; e++) {
        var ep = edges[e]
        var elapsed = Math.max(0, t - ep.delay)
        if (!rm) ep.inspired = Math.min(1, elapsed * 0.1)
        else ep.inspired = 0.7

        var ecx = ep.cx * W,
          ecy = ep.cy * H

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(ecx, ecy)
        ctx.strokeStyle =
          'rgba(200,150,220,' + ep.inspired * 0.06 + ')'
        ctx.lineWidth = 1
        ctx.stroke()

        var erot = rm ? 0 : t * 0.15 + e
        for (var m = 0; m < ep.members.length; m++) {
          var mem = ep.members[m]
          var c = cols[mem.colIdx]
          var a = mem.angle + erot
          var d = mem.dist * H * ep.inspired
          var px = ecx + Math.cos(a) * d,
            py = ecy + Math.sin(a) * d

          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fillStyle =
            'rgba(' +
            c[0] +
            ',' +
            c[1] +
            ',' +
            c[2] +
            ',' +
            ep.inspired * 0.4 +
            ')'
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
