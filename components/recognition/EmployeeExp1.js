'use client'
import { useEffect, useRef } from 'react'

export default function EmployeeExp1() {
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

    // Unique particles in shared space - spread wide
    var baseColours = [[128,56,143],[155,81,224],[255,66,121],[255,162,0],[180,100,200],[255,120,80],[200,80,160],[220,150,50]]
    var particles = []
    var N = 30

    function initParticles() {
      particles = []
      for (var i = 0; i < N; i++) {
        var col = baseColours[i % baseColours.length]
        particles.push({
          x: 0.05 + Math.random() * 0.9,
          y: 0.1 + Math.random() * 0.8,
          col: col,
          size: 3 + Math.random() * 3,
          sides: 3 + Math.floor(Math.random() * 4),
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.01,
          phase: Math.random() * Math.PI * 2,
          orbitR: 0.02 + Math.random() * 0.04,
          orbitSpeed: 0.2 + Math.random() * 0.4,
          homeX: 0.05 + Math.random() * 0.9,
          homeY: 0.1 + Math.random() * 0.8
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
    initParticles()

    var t = 0

    function drawShape(x, y, size, sides, rotation, col, alpha) {
      ctx.beginPath()
      for (var i = 0; i <= sides; i++) {
        var a = rotation + i * (Math.PI * 2 / sides)
        var px = x + Math.cos(a) * size, py = y + Math.sin(a) * size
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')'
      ctx.fill()
    }

    function tick() {
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      ctx.lineWidth = 0.5
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = (particles[i].homeX - particles[j].homeX) * W
          var dy = (particles[i].homeY - particles[j].homeY) * H
          var dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            var a = (1 - dist / 80) * 0.08
            ctx.beginPath()
            ctx.moveTo(particles[i].homeX * W, particles[i].homeY * H)
            ctx.lineTo(particles[j].homeX * W, particles[j].homeY * H)
            ctx.strokeStyle = 'rgba(155,81,224,' + a + ')'
            ctx.stroke()
          }
        }
      }
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i]
        if (!rm) {
          p.homeX += Math.sin(t * 0.1 + p.phase) * 0.0001
          p.homeY += Math.cos(t * 0.08 + p.phase) * 0.00008
          p.homeX = Math.max(0.05, Math.min(0.95, p.homeX))
          p.homeY = Math.max(0.1, Math.min(0.9, p.homeY))
          p.x = p.homeX + Math.sin(t * p.orbitSpeed + p.phase) * p.orbitR
          p.y = p.homeY + Math.cos(t * p.orbitSpeed * 0.7 + p.phase * 1.3) * p.orbitR * 0.6
          p.rotation += p.rotSpeed
        }
        var px = p.x * W, py = p.y * H
        var g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4)
        g.addColorStop(0, 'rgba(' + p.col[0] + ',' + p.col[1] + ',' + p.col[2] + ',0.2)')
        g.addColorStop(1, 'rgba(' + p.col[0] + ',' + p.col[1] + ',' + p.col[2] + ',0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2)
        ctx.fill()
        drawShape(px, py, p.size, p.sides, p.rotation, p.col, 0.6)
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
