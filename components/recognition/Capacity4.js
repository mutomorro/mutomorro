'use client'
import { useEffect, useRef } from 'react'

export default function Capacity4() {
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

    var layers = []
    var maxLayers = 7
    var layerInterval = 2
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
      var cx = W * 0.5,
        cy = H * 0.5
      var expected = Math.min(maxLayers, Math.floor(t / layerInterval) + 1)
      while (layers.length < expected) {
        var idx = layers.length
        layers.push({
          born: idx * layerInterval,
          radius: 0,
          targetR: (0.04 + idx * 0.05) * H,
          col: cols[idx % 4],
          thickness: 2 + idx * 0.5,
          alpha: 0
        })
      }
      for (var i = layers.length - 1; i >= 0; i--) {
        var l = layers[i]
        var elapsed = t - l.born
        if (!rm) {
          var grow = Math.min(1, elapsed * 0.2)
          grow = grow * grow * (3 - 2 * grow)
          l.radius = l.targetR * grow
          l.alpha = Math.min(0.5, grow * 0.5)
        } else {
          l.radius = l.targetR
          l.alpha = 0.4
        }
        var breathe = rm ? 1 : 1 + Math.sin(t * 0.4 + i * 0.7) * 0.015
        var r = l.radius * breathe
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle =
          'rgba(' +
          l.col[0] +
          ',' +
          l.col[1] +
          ',' +
          l.col[2] +
          ',' +
          l.alpha * 0.15 +
          ')'
        ctx.lineWidth = l.thickness * 5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle =
          'rgba(' +
          l.col[0] +
          ',' +
          l.col[1] +
          ',' +
          l.col[2] +
          ',' +
          l.alpha +
          ')'
        ctx.lineWidth = l.thickness
        ctx.stroke()
      }
      var ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
      ig.addColorStop(0, 'rgba(255,200,100,0.2)')
      ig.addColorStop(1, 'rgba(255,200,100,0)')
      ctx.fillStyle = ig
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fill()
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
