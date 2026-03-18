'use client'
import { useEffect, useRef } from 'react'

export default function Scaling4() {
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

    var trees = []
    for (var side = -1; side <= 1; side += 2) {
      for (var i = 0; i < 6; i++) {
        var depth = i / 5
        var scale = 1 - depth * 0.65
        trees.push({
          x: 0.5 + side * (0.2 - depth * 0.12),
          y: 0.82 - depth * 0.42,
          scale: scale,
          depth: depth,
          side: side,
          branches: 2 + Math.floor(Math.random() * 3),
          phase: Math.random() * Math.PI * 2,
          colIdx: i % 4,
          lean: side * (0.02 + Math.random() * 0.03)
        })
      }
    }
    var cols = [[128, 56, 143], [155, 81, 224], [255, 66, 121], [255, 162, 0]]
    var t = 0

    function drawTree(tree) {
      var px = tree.x * W, py = tree.y * H
      var h = tree.scale * H * 0.16
      var sway = rm ? 0 : Math.sin(t * 0.4 + tree.phase) * 3 * tree.scale
      var c = cols[tree.colIdx]
      var alpha = 0.15 + (1 - tree.depth) * 0.2
      var topX = px + sway + tree.lean * W, topY = py - h
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.quadraticCurveTo(px + sway * 0.4, py - h * 0.5, topX, topY)
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha * 0.6 + ')'
      ctx.lineWidth = 1.5 * tree.scale + 0.5
      ctx.stroke()
      for (var b = 0; b < tree.branches; b++) {
        var bs = 0.3 + b * 0.25
        var bsx = px + (topX - px) * bs + sway * bs * 0.3, bsy = py + (topY - py) * bs
        var spread = tree.side * (10 + b * 8) * tree.scale
        var bLen = h * (0.15 + b * 0.08)
        var bex = bsx + spread + sway * 0.5, bey = bsy - bLen * 0.5
        ctx.beginPath()
        ctx.moveTo(bsx, bsy)
        ctx.quadraticCurveTo(bsx + spread * 0.3, bsy - bLen * 0.3, bex, bey)
        ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha * 0.4 + ')'
        ctx.lineWidth = tree.scale
        ctx.stroke()
        var fg = ctx.createRadialGradient(bex, bey, 0, bex, bey, 8 * tree.scale + 4)
        fg.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha * 0.25 + ')')
        fg.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)')
        ctx.fillStyle = fg
        ctx.beginPath()
        ctx.arc(bex, bey, 8 * tree.scale + 4, 0, Math.PI * 2)
        ctx.fill()
      }
      var cg = ctx.createRadialGradient(topX, topY, 0, topX, topY, 12 * tree.scale + 6)
      cg.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha * 0.3 + ')')
      cg.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(topX, topY, 12 * tree.scale + 6, 0, Math.PI * 2)
      ctx.fill()
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

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      var hx = W * 0.5, hy = H * 0.28
      var pulse = rm ? 1 : 0.85 + Math.sin(t * 0.3) * 0.15
      var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, H * 0.35 * pulse)
      hg.addColorStop(0, 'rgba(255,200,120,0.15)')
      hg.addColorStop(0.3, 'rgba(255,162,0,0.07)')
      hg.addColorStop(0.6, 'rgba(255,66,121,0.03)')
      hg.addColorStop(1, 'rgba(155,81,224,0)')
      ctx.fillStyle = hg
      ctx.beginPath()
      ctx.arc(hx, hy, H * 0.35 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(W * 0.36, H * 0.88)
      ctx.quadraticCurveTo(W * 0.43, H * 0.58, W * 0.49, H * 0.3)
      ctx.strokeStyle = 'rgba(155,81,224,0.1)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(W * 0.64, H * 0.88)
      ctx.quadraticCurveTo(W * 0.57, H * 0.58, W * 0.51, H * 0.3)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(W * 0.36, H * 0.88)
      ctx.quadraticCurveTo(W * 0.43, H * 0.58, W * 0.49, H * 0.3)
      ctx.lineTo(W * 0.51, H * 0.3)
      ctx.quadraticCurveTo(W * 0.57, H * 0.58, W * 0.64, H * 0.88)
      ctx.closePath()
      var pg = ctx.createLinearGradient(0, H * 0.88, 0, H * 0.3)
      pg.addColorStop(0, 'rgba(200,160,220,0.03)')
      pg.addColorStop(1, 'rgba(255,200,120,0.08)')
      ctx.fillStyle = pg
      ctx.fill()
      trees.sort(function (a, b) { return a.depth - b.depth })
      for (var i = trees.length - 1; i >= 0; i--) drawTree(trees[i])
      if (!rm) {
        for (var i = 0; i < 10; i++) {
          var pp = ((t * 0.05 + i * 0.1) % 1)
          var pathY = 0.82 - pp * 0.5
          var narrow = 0.13 - pp * 0.09
          var pathX = 0.5 + Math.sin(t * 0.2 + i * 2.5) * narrow * 0.3
          var ppx = pathX * W, ppy = pathY * H
          var pa = 0.1 + (1 - Math.abs(pp - 0.5) * 2) * 0.15
          var ps = 1.5 + (1 - pp) * 1.5
          var lg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, ps * 3)
          lg.addColorStop(0, 'rgba(255,200,150,' + pa + ')')
          lg.addColorStop(1, 'rgba(255,200,150,0)')
          ctx.fillStyle = lg
          ctx.beginPath()
          ctx.arc(ppx, ppy, ps * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(ppx, ppy, ps, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,230,180,' + pa * 1.5 + ')'
          ctx.fill()
        }
      }
      ctx.beginPath()
      ctx.arc(hx, hy, 3 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,220,160,0.4)'
      ctx.fill()
      animId = requestAnimationFrame(tick)
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
