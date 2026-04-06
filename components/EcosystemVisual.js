'use client'

import { useEffect, useRef } from 'react'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function EcosystemVisual({ centreLabel = 'Intentional', centreSubtitle = 'Ecosystems' }) {
  const isDesktop = useIsDesktop()
  const canvasRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    var canvas = canvasRef.current
    if (!canvas) return
    var ctx = canvas.getContext('2d')
    var svg = svgRef.current
    var dpr = window.devicePixelRatio || 1
    var W = 700, H = 612
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    var CX = W / 2, CY = H / 2 - 5
    var ORBIT = 190, NR = 26

    // EMERGENT Framework dimensions
    var dims = [
      { name: 'Embedded Strategy',     color: '#FF707C', angle: -90 },
      { name: 'Momentum through Work', color: '#FFAC51', angle: -45 },
      { name: 'Evolving Service',      color: '#FFC23B', angle: 0 },
      { name: 'Resonant Purpose',      color: '#A7D957', angle: 45 },
      { name: 'Generative Capacity',   color: '#3AD377', angle: 90 },
      { name: 'Enacted Culture',       color: '#00C3D8', angle: 135 },
      { name: 'Narrative Connections',  color: '#5A70C2', angle: 180 },
      { name: 'Tuned to Change',       color: '#d48a3a', angle: 225 },
    ]

    dims.forEach(function(d) {
      var r = (d.angle * Math.PI) / 180
      d.bx = CX + Math.cos(r) * ORBIT
      d.by = CY + Math.sin(r) * ORBIT
      d.x = d.bx; d.y = d.by
    })

    function hex2rgb(h) {
      return { r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) }
    }

    function makeParticle() {
      var p = {}
      p.reset = function() {
        p.fi = Math.floor(Math.random() * 8)
        p.ti = Math.floor(Math.random() * 8)
        while (p.ti === p.fi) p.ti = Math.floor(Math.random() * 8)
        p.t = 0
        p.spd = 0.002 + Math.random() * 0.003
        p.op = 0.4 + Math.random() * 0.4
        p.sz = 1.5 + Math.random() * 2
      }
      p.reset()
      p.t = Math.random()
      p.update = function() { p.t += p.spd; if (p.t > 1) p.reset() }
      p.draw = function() {
        var f = dims[p.fi], to = dims[p.ti], t = p.t, mt = 1 - t
        var x = mt*mt*f.x + 2*mt*t*CX + t*t*to.x
        var y = mt*mt*f.y + 2*mt*t*CY + t*t*to.y
        var fc = hex2rgb(f.color), tc = hex2rgb(to.color)
        var r = Math.round(fc.r*mt+tc.r*t), g = Math.round(fc.g*mt+tc.g*t), b = Math.round(fc.b*mt+tc.b*t)
        var a = p.op
        if (t < 0.15) a *= t/0.15
        if (t > 0.85) a *= (1-t)/0.15
        ctx.beginPath()
        ctx.arc(x, y, p.sz, 0, Math.PI*2)
        ctx.fillStyle = 'rgba('+r+','+g+','+b+','+a+')'
        ctx.fill()
      }
      return p
    }

    var particles = []
    for (var i = 0; i < 140; i++) particles.push(makeParticle())

    var gp = 0, bp = 0

    function drawConns() {
      for (var i = 0; i < 8; i++) {
        for (var j = i+1; j < 8; j++) {
          var a = dims[i], b = dims[j]
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          var cpx = CX + (a.x+b.x-2*CX)*0.15
          var cpy = CY + (a.y+b.y-2*CY)*0.15
          ctx.quadraticCurveTo(cpx, cpy, b.x, b.y)
          ctx.strokeStyle = 'rgba(13,43,47,0.06)'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    function drawGlow() {
      gp += 0.008
      var pulse = 0.7 + Math.sin(gp) * 0.3
      var r = 75 * pulse
      var og = ctx.createRadialGradient(CX, CY, 0, CX, CY, r*2.2)
      og.addColorStop(0, 'rgba(212,115,94,'+(0.12*pulse)+')')
      og.addColorStop(0.4, 'rgba(180,140,200,'+(0.06*pulse)+')')
      og.addColorStop(1, 'rgba(180,140,200,0)')
      ctx.beginPath()
      ctx.arc(CX, CY, r*2.2, 0, Math.PI*2)
      ctx.fillStyle = og
      ctx.fill()
      var ig = ctx.createRadialGradient(CX, CY, 0, CX, CY, r)
      ig.addColorStop(0, 'rgba(212,115,94,'+(0.18*pulse)+')')
      ig.addColorStop(0.5, 'rgba(212,138,58,'+(0.08*pulse)+')')
      ig.addColorStop(1, 'rgba(212,138,58,0)')
      ctx.beginPath()
      ctx.arc(CX, CY, r, 0, Math.PI*2)
      ctx.fillStyle = ig
      ctx.fill()
    }

    function drawNodes() {
      bp += 0.01
      dims.forEach(function(d, i) {
        d.x = d.bx + Math.sin(bp + i*0.8) * 3
        d.y = d.by + Math.cos(bp*0.7 + i*1.1) * 2
        var breath = 1 + Math.sin(bp + i*0.5) * 0.08
        var r = NR * breath
        var c = hex2rgb(d.color)
        var gl = ctx.createRadialGradient(d.x, d.y, r*0.3, d.x, d.y, r*2.5)
        gl.addColorStop(0, 'rgba('+c.r+','+c.g+','+c.b+',0.15)')
        gl.addColorStop(1, 'rgba('+c.r+','+c.g+','+c.b+',0)')
        ctx.beginPath()
        ctx.arc(d.x, d.y, r*2.5, 0, Math.PI*2)
        ctx.fillStyle = gl
        ctx.fill()
        ctx.beginPath()
        ctx.arc(d.x, d.y, r, 0, Math.PI*2)
        ctx.fillStyle = 'rgba('+c.r+','+c.g+','+c.b+',0.12)'
        ctx.fill()
        ctx.strokeStyle = 'rgba('+c.r+','+c.g+','+c.b+',0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(d.x, d.y, 4.5, 0, Math.PI*2)
        ctx.fillStyle = d.color
        ctx.fill()
      })
    }

    function buildLabels() {
      var s = ''
      dims.forEach(function(d) {
        var rad = (d.angle * Math.PI) / 180
        var dist = ORBIT + 52
        var lx = CX + Math.cos(rad) * dist
        var ly = CY + Math.sin(rad) * dist
        var anchor = 'middle'
        if (d.angle > -80 && d.angle < 80) anchor = 'start'
        if (d.angle > 100 || d.angle < -100) anchor = 'end'
        var parts = d.name.split(' ')
        var line1, line2
        if (parts.length === 2) { line1 = parts[0]; line2 = parts[1] }
        else if (parts.length === 3) { line1 = parts[0]; line2 = parts[1] + ' ' + parts[2] }
        else { line1 = parts[0]; line2 = parts.slice(1).join(' ') }
        s += '<text x="'+lx+'" y="'+(ly-7)+'" text-anchor="'+anchor+'" font-family="Source Sans 3, sans-serif" font-size="12" font-weight="600" fill="rgba(13,43,47,0.75)" letter-spacing="0.3">'+line1+'</text>'
        s += '<text x="'+lx+'" y="'+(ly+7)+'" text-anchor="'+anchor+'" font-family="Source Sans 3, sans-serif" font-size="11" font-weight="400" fill="rgba(13,43,47,0.45)" letter-spacing="0.3">'+line2+'</text>'
      })
      // Centre label - parameterised
      s += '<text x="'+CX+'" y="'+(CY-8)+'" text-anchor="middle" font-family="Source Sans 3, sans-serif" font-size="14" font-weight="700" fill="rgba(13,43,47,0.65)" letter-spacing="2">' + centreLabel.toUpperCase() + '</text>'
      s += '<text x="'+CX+'" y="'+(CY+10)+'" text-anchor="middle" font-family="Source Sans 3, sans-serif" font-size="11" font-weight="400" fill="rgba(13,43,47,0.35)" letter-spacing="0.5">' + centreSubtitle + '</text>'
      svg.innerHTML = s
    }
    buildLabels()

    var animId

    function animate() {
      ctx.clearRect(0, 0, W, H)
      drawConns()
      drawGlow()
      particles.forEach(function(p) { p.update(); p.draw() })
      drawNodes()
      animId = requestAnimationFrame(animate)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawConns(); drawGlow(); drawNodes()
    } else {
      animId = requestAnimationFrame(animate)
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [centreLabel, centreSubtitle])

  if (!isDesktop) return null

  return (
    <div style={{
      width: '100%',
      aspectRatio: '700 / 612',
      position: 'relative',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
        }}
      />
      <svg
        ref={svgRef}
        className="eco-labels"
        viewBox="0 0 700 612"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
