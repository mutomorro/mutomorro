'use client'
import { useEffect, useRef } from 'react'

export default function EmployeeExp2() {
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
    var cols = [{ r: 128, g: 56, b: 143 }, { r: 155, g: 81, b: 224 }, { r: 255, g: 66, b: 121 }, { r: 255, g: 162, b: 0 }]

    // Seeds growing roots and stems - spread horizontally across landscape
    var seeds = []
    var N = 9

    function initSeeds() {
      seeds = []
      for (var i = 0; i < N; i++) {
        seeds.push({
          x: 0.08 + i * (0.84 / (N - 1)),
          groundY: 0.62,
          growthProgress: 0,
          growthSpeed: 0.003 + Math.random() * 0.004,
          delay: i * 0.4 + Math.random(),
          maxHeight: 0.12 + Math.random() * 0.18,
          rootDepth: 0.06 + Math.random() * 0.08,
          rootBranches: 2 + Math.floor(Math.random() * 3),
          stemWobble: Math.random() * Math.PI * 2,
          colIdx: i % 4
        })
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
    initSeeds()

    var t = 0

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      ctx.beginPath()
      ctx.moveTo(0, H * 0.62)
      for (var x = 0; x < W; x += 5) ctx.lineTo(x, H * 0.62 + Math.sin(x * 0.02) * 2)
      ctx.strokeStyle = 'rgba(155,81,224,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()
      for (var i = 0; i < seeds.length; i++) {
        var s = seeds[i]
        var elapsed = Math.max(0, t - s.delay)
        if (!rm && elapsed > 0) s.growthProgress = Math.min(1, s.growthProgress + s.growthSpeed * 0.01)
        else if (rm) s.growthProgress = 0.8
        var col = cols[s.colIdx]
        var sx = s.x * W, gy = s.groundY * H
        var rootP = Math.min(1, s.growthProgress * 2)
        if (rootP > 0) {
          for (var r = 0; r < s.rootBranches; r++) {
            var angle = Math.PI * 0.5 + (r - s.rootBranches / 2 + 0.5) * 0.4
            var rootLen = s.rootDepth * H * rootP
            var rx = sx + Math.cos(angle) * rootLen * 0.5, ry = gy + Math.sin(angle) * rootLen
            ctx.beginPath()
            ctx.moveTo(sx, gy)
            ctx.quadraticCurveTo(sx + (rx - sx) * 0.3, gy + rootLen * 0.3, rx, ry)
            ctx.strokeStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + rootP * 0.25 + ')'
            ctx.lineWidth = 1.5 - r * 0.2
            ctx.stroke()
            var rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 5)
            rg.addColorStop(0, 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + rootP * 0.2 + ')')
            rg.addColorStop(1, 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0)')
            ctx.fillStyle = rg
            ctx.beginPath()
            ctx.arc(rx, ry, 5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        var stemP = Math.max(0, Math.min(1, (s.growthProgress - 0.2) / 0.8))
        if (stemP > 0) {
          var stemH = s.maxHeight * H * stemP
          var wobble = Math.sin(t * 0.5 + s.stemWobble) * 3 * stemP
          var topX = sx + wobble, topY = gy - stemH
          ctx.beginPath()
          ctx.moveTo(sx, gy)
          ctx.quadraticCurveTo(sx + wobble * 0.5, gy - stemH * 0.5, topX, topY)
          ctx.strokeStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + stemP * 0.4 + ')'
          ctx.lineWidth = 2
          ctx.stroke()
          var tg = ctx.createRadialGradient(topX, topY, 0, topX, topY, 8 + stemP * 8)
          tg.addColorStop(0, 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + stemP * 0.4 + ')')
          tg.addColorStop(0.5, 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + stemP * 0.1 + ')')
          tg.addColorStop(1, 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0)')
          ctx.fillStyle = tg
          ctx.beginPath()
          ctx.arc(topX, topY, 8 + stemP * 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(topX, topY, 2 + stemP * 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + stemP * 0.7 + ')'
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(sx, gy, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0.3)'
        ctx.fill()
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
