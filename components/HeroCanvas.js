'use client'

import { useEffect, useRef } from 'react'

export default function HeroCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, dpr
    let nodes = []
    let animId

    let mouseX = -1000, mouseY = -1000
    let targetMouseX = -1000, targetMouseY = -1000
    let mouseActive = false

    const ACCENT = [155, 81, 224]
    const PURPLE = [128, 56, 143]
    const PINK = [255, 66, 121]
    const ORANGE = [255, 162, 0]

    const NOVA_SIZE = 200
    const MOUSE_RADIUS = 180
    const CONNECT_RADIUS = 200

    function accentCol(alpha) {
      return `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha})`
    }

    function lerpC(a, b, p) {
      return [
        Math.round(a[0] + (b[0] - a[0]) * p),
        Math.round(a[1] + (b[1] - a[1]) * p),
        Math.round(a[2] + (b[2] - a[2]) * p)
      ]
    }

    function novaRGB(t) {
      if (t < 0.35) return lerpC(ORANGE, PINK, t / 0.35)
      if (t < 0.7) return lerpC(PINK, PURPLE, (t - 0.35) / 0.35)
      return lerpC(PURPLE, ACCENT, (t - 0.7) / 0.3)
    }

    function distToMouse(x, y) {
      return Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
    }

    function nodeColour(x, y, baseAlpha) {
      if (!mouseActive || NOVA_SIZE === 0) return accentCol(baseAlpha)

      const dist = distToMouse(x, y)
      if (dist > NOVA_SIZE) return accentCol(baseAlpha)

      const t = dist / NOVA_SIZE
      const influence = 1 - t
      const nc = novaRGB(t)

      const blend = influence * influence
      const r = Math.round(ACCENT[0] + (nc[0] - ACCENT[0]) * blend)
      const g = Math.round(ACCENT[1] + (nc[1] - ACCENT[1]) * blend)
      const b = Math.round(ACCENT[2] + (nc[2] - ACCENT[2]) * blend)

      const alphaBoost = 1 + influence * 1.5
      return `rgba(${r},${g},${b},${Math.min(baseAlpha * alphaBoost, 0.85)})`
    }

    function seededRandom(seed) {
      let s = seed
      return function () {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
      }
    }

    function densityAt(x, y) {
      const nx = x / W
      const ny = y / H
      return Math.pow(Math.max(0, nx * 0.7 + ny * 0.3), 1.2)
    }

    function initNodes() {
      const sr = seededRandom(99)
      nodes = []
      let placed = 0, attempts = 0
      while (placed < 160 && attempts < 1600) {
        attempts++
        const x = sr() * W
        const y = sr() * H
        if (sr() > densityAt(x, y) * 1.2 + 0.08) continue
        nodes.push({
          bx: x, by: y, x, y,
          vx: 0, vy: 0,
          r: 2 + sr() * 5,
          phase: sr() * Math.PI * 2,
          speed: 0.3 + sr() * 0.6
        })
        placed++
      }
    }

    function resize() {
      dpr = window.devicePixelRatio || 1
      W = canvas.parentElement.clientWidth
      H = canvas.parentElement.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initNodes()
    }

    function animate(time) {
      ctx.clearRect(0, 0, W, H)

      // Smooth mouse lerp
      if (mouseActive) {
        mouseX += (targetMouseX - mouseX) * 0.12
        mouseY += (targetMouseY - mouseY) * 0.12
      }

      // Supernova ambient glow
      if (mouseActive) {
        const pulseScale = 1 + Math.sin(time * 0.002) * 0.06
        const gr = NOVA_SIZE * pulseScale

        const g3 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gr * 1.3)
        g3.addColorStop(0, `rgba(${PURPLE[0]},${PURPLE[1]},${PURPLE[2]},0.04)`)
        g3.addColorStop(0.6, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.02)`)
        g3.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(mouseX, mouseY, gr * 1.3, 0, Math.PI * 2); ctx.fillStyle = g3; ctx.fill()

        const g2 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gr * 0.7)
        g2.addColorStop(0, `rgba(${PINK[0]},${PINK[1]},${PINK[2]},0.06)`)
        g2.addColorStop(0.5, `rgba(${PURPLE[0]},${PURPLE[1]},${PURPLE[2]},0.03)`)
        g2.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(mouseX, mouseY, gr * 0.7, 0, Math.PI * 2); ctx.fillStyle = g2; ctx.fill()

        const g1 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gr * 0.25)
        g1.addColorStop(0, `rgba(${ORANGE[0]},${ORANGE[1]},${ORANGE[2]},0.08)`)
        g1.addColorStop(0.4, `rgba(${PINK[0]},${PINK[1]},${PINK[2]},0.04)`)
        g1.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(mouseX, mouseY, gr * 0.25, 0, Math.PI * 2); ctx.fillStyle = g1; ctx.fill()
      }

      // Update node positions
      const attractForce = 0.03
      const returnForce = 0.02
      const damping = 0.92

      nodes.forEach(n => {
        const ambientX = n.bx + Math.sin(time * 0.0004 * n.speed + n.phase) * 20
        const ambientY = n.by + Math.cos(time * 0.0003 * n.speed + n.phase * 1.3) * 16

        if (mouseActive) {
          const dx = mouseX - n.x
          const dy = mouseY - n.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MOUSE_RADIUS && dist > 1) {
            const force = (1 - dist / MOUSE_RADIUS)
            n.vx += (dx / dist) * force * attractForce * 60
            n.vy += (dy / dist) * force * attractForce * 60
          }
        }

        n.vx += (ambientX - n.x) * returnForce
        n.vy += (ambientY - n.y) * returnForce
        n.vx *= damping
        n.vy *= damping
        n.x += n.vx
        n.y += n.vy
      })

      // Draw connections between nodes
      const maxDist = 140
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25
            const midX = (nodes[i].x + nodes[j].x) / 2
            const midY = (nodes[i].y + nodes[j].y) / 2
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = nodeColour(midX, midY, alpha)
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Lines from cursor to nearby nodes
      if (mouseActive) {
        nodes.forEach(n => {
          const dist = distToMouse(n.x, n.y)
          if (dist < CONNECT_RADIUS) {
            const t = dist / CONNECT_RADIUS
            const alpha = (1 - t) * 0.4
            const midX = (mouseX + n.x) / 2
            const midY = (mouseY + n.y) / 2
            ctx.beginPath()
            ctx.moveTo(mouseX, mouseY)
            ctx.lineTo(n.x, n.y)
            ctx.strokeStyle = nodeColour(midX, midY, alpha)
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })

        // Cursor node
        const cp = 0.7 + Math.sin(time * 0.003) * 0.3
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ORANGE[0]},${ORANGE[1]},${ORANGE[2]},${0.5 * cp})`
        ctx.fill()

        // Cursor glow
        const cg = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 16)
        cg.addColorStop(0, `rgba(${ORANGE[0]},${ORANGE[1]},${ORANGE[2]},${0.2 * cp})`)
        cg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, 16, 0, Math.PI * 2)
        ctx.fillStyle = cg
        ctx.fill()
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 0.7 + Math.sin(time * 0.001 + n.phase) * 0.3

        let sizeBoost = 1
        if (mouseActive) {
          const mDist = distToMouse(n.x, n.y)
          if (mDist < MOUSE_RADIUS) {
            sizeBoost = 1 + (1 - mDist / MOUSE_RADIUS) * 2
          }
        }

        // Glow
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulse * 2 * sizeBoost, 0, Math.PI * 2)
        ctx.fillStyle = nodeColour(n.x, n.y, 0.06 * pulse * sizeBoost)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulse * 0.6 * Math.min(sizeBoost, 1.5), 0, Math.PI * 2)
        ctx.fillStyle = nodeColour(n.x, n.y, (0.3 + 0.2 * pulse) * Math.min(sizeBoost, 2))
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }

    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      targetMouseX = e.clientX - rect.left
      targetMouseY = e.clientY - rect.top
      if (!mouseActive) {
        mouseX = targetMouseX
        mouseY = targetMouseY
      }
      mouseActive = true
    }

    const handleMouseLeave = () => {
      mouseActive = false
      targetMouseX = -1000
      targetMouseY = -1000
      mouseX = -1000
      mouseY = -1000
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    window.addEventListener('resize', resize)
    resize()

    if (prefersReduced.matches) {
      animate(1000)
      cancelAnimationFrame(animId)
    } else {
      animate(0)
    }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  )
}
