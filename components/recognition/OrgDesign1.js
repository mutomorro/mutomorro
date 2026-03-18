'use client'
import { useEffect, useRef } from 'react'

export default function OrgDesign1() {
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

    var frameNodes = []
    for (var i = 0; i < 14; i++) {
      var angle = i * (Math.PI * 2 / 14)
      frameNodes.push({baseX:0.5+Math.cos(angle)*0.35,baseY:0.5+Math.sin(angle)*0.38,x:0,y:0})
    }

    var flowParticles = []
    for (var i = 0; i < 20; i++) {
      flowParticles.push({x:0.25+Math.random()*0.5,y:0.2+Math.random()*0.6,
        vx:(Math.random()-0.5)*0.003,vy:(Math.random()-0.5)*0.003,phase:Math.random()*Math.PI*2,size:2+Math.random()*2})
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
        for (var i = 0; i < flowParticles.length; i++) {
          var fp = flowParticles[i]
          fp.x += fp.vx + Math.sin(t * 0.3 + fp.phase) * 0.0005
          fp.y += fp.vy + Math.cos(t * 0.25 + fp.phase) * 0.0004
          if (fp.x < 0.1 || fp.x > 0.9) fp.vx *= -1
          if (fp.y < 0.1 || fp.y > 0.9) fp.vy *= -1
          fp.x = Math.max(0.1, Math.min(0.9, fp.x))
          fp.y = Math.max(0.1, Math.min(0.9, fp.y))
        }
      }

      for (var i = 0; i < frameNodes.length; i++) {
        var fn = frameNodes[i]
        var pushX = 0, pushY = 0
        for (var j = 0; j < flowParticles.length; j++) {
          var fp = flowParticles[j]
          var dx = fp.x - fn.baseX, dy = fp.y - fn.baseY
          var dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 0.2) {
            pushX += dx * 0.05 * (1 - dist / 0.2)
            pushY += dy * 0.05 * (1 - dist / 0.2)
          }
        }
        fn.x = fn.baseX + pushX
        fn.y = fn.baseY + pushY
      }

      ctx.lineWidth = 1
      for (var i = 0; i < frameNodes.length; i++) {
        var a = frameNodes[i], b = frameNodes[(i + 1) % frameNodes.length]
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(b.x * W, b.y * H)
        ctx.strokeStyle = 'rgba(155,81,224,0.15)'
        ctx.stroke()

        ctx.strokeStyle = 'rgba(155,81,224,0.04)'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(b.x * W, b.y * H)
        ctx.stroke()
        ctx.lineWidth = 1
      }

      for (var i = 0; i < frameNodes.length; i++) {
        var fn = frameNodes[i]
        ctx.beginPath()
        ctx.arc(fn.x * W, fn.y * H, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(155,81,224,0.2)'
        ctx.fill()
      }

      for (var i = 0; i < flowParticles.length; i++) {
        var fp = flowParticles[i]
        var c = cols[i % 4]
        var px = fp.x * W, py = fp.y * H

        var g = ctx.createRadialGradient(px, py, 0, px, py, fp.size * 4)
        g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.25)')
        g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, fp.size * 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px, py, fp.size, 0, Math.PI * 2)
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
