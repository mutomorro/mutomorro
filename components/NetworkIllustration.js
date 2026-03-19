'use client'

// Network illustration SVGs for capability service steps
// Each pattern tells a visual story using nodes, connections, and the Mutomorro network language
// Deterministic - same index always produces the same illustration

function seededRandom(seed) {
  let s = seed
  return function() {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Pattern 0: Expanding awareness - rings radiating from centre, scattered nodes becoming visible
function PatternAwareness({ color, seed }) {
  const r = seededRandom(seed)
  const outerNodes = Array.from({ length: 6 }, () => ({
    x: 30 + r() * 140,
    y: 15 + r() * 110,
    size: 2 + r() * 2,
    opacity: 0.15 + r() * 0.2,
  }))
  const innerNodes = Array.from({ length: 4 }, () => ({
    x: 55 + r() * 90,
    y: 30 + r() * 80,
    size: 2.5 + r() * 1.5,
    opacity: 0.35 + r() * 0.2,
  }))

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      <circle cx="100" cy="70" r="55" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15"/>
      <circle cx="100" cy="70" r="35" fill="none" stroke={color} strokeWidth="0.5" opacity="0.25"/>
      <circle cx="100" cy="70" r="15" fill="none" stroke={color} strokeWidth="0.8" opacity="0.4"/>
      <circle cx="100" cy="70" r="5" fill={color} opacity="0.8"/>
      {innerNodes.map((n, i) => (
        <g key={`i${i}`}>
          <circle cx={n.x} cy={n.y} r={n.size} fill={color} opacity={n.opacity}/>
          <line x1="100" y1="70" x2={n.x} y2={n.y} stroke={color} strokeWidth="0.6" opacity={n.opacity * 0.5}/>
        </g>
      ))}
      {outerNodes.map((n, i) => (
        <g key={`o${i}`}>
          <circle cx={n.x} cy={n.y} r={n.size} fill={color} opacity={n.opacity}/>
          <line x1="100" y1="70" x2={n.x} y2={n.y} stroke={color} strokeWidth="0.4" opacity={n.opacity * 0.4}/>
        </g>
      ))}
    </svg>
  )
}

// Pattern 1: Reading patterns - wave/flow through connected nodes
function PatternWave({ color, seed }) {
  const r = seededRandom(seed)
  const mainNodes = [
    { x: 30, y: 95 + r() * 10 },
    { x: 65, y: 45 + r() * 15 },
    { x: 100, y: 65 + r() * 15 },
    { x: 135, y: 85 + r() * 15 },
    { x: 170, y: 35 + r() * 15 },
  ]
  const driftNodes = Array.from({ length: 5 }, () => ({
    x: 30 + r() * 140,
    y: 20 + r() * 100,
    size: 1.5 + r() * 1.5,
    opacity: 0.15 + r() * 0.15,
  }))

  const pathD = `M${mainNodes[0].x},${mainNodes[0].y} Q${(mainNodes[0].x + mainNodes[1].x)/2},${mainNodes[1].y - 20} ${mainNodes[1].x},${mainNodes[1].y} Q${(mainNodes[1].x + mainNodes[2].x)/2},${mainNodes[2].y + 15} ${mainNodes[2].x},${mainNodes[2].y} Q${(mainNodes[2].x + mainNodes[3].x)/2},${mainNodes[3].y + 10} ${mainNodes[3].x},${mainNodes[3].y} Q${(mainNodes[3].x + mainNodes[4].x)/2},${mainNodes[4].y - 15} ${mainNodes[4].x},${mainNodes[4].y}`

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" opacity="0.35"/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="0.6" opacity="0.15" strokeDasharray="3 3" transform="translate(0,-12)"/>
      {mainNodes.map((n, i) => (
        <circle key={`m${i}`} cx={n.x} cy={n.y} r={i === 2 ? 5 : 3.5} fill={color} opacity={i === 2 ? 0.8 : 0.5}/>
      ))}
      {driftNodes.map((n, i) => (
        <g key={`d${i}`}>
          <circle cx={n.x} cy={n.y} r={n.size} fill={color} opacity={n.opacity}/>
          {i < 4 && (
            <line x1={n.x} y1={n.y} x2={mainNodes[i % mainNodes.length].x} y2={mainNodes[i % mainNodes.length].y} stroke={color} strokeWidth="0.3" opacity={n.opacity * 0.6}/>
          )}
        </g>
      ))}
    </svg>
  )
}

// Pattern 2: Transition - scattered nodes on left becoming an organic connected system on right
function PatternTransition({ color, seed }) {
  const r = seededRandom(seed)
  const leftNodes = Array.from({ length: 4 }, () => ({
    x: 15 + r() * 55,
    y: 30 + r() * 80,
    size: 2 + r() * 1.5,
  }))
  const rightNodes = [
    { x: 135 + r() * 10, y: 40 + r() * 10 },
    { x: 160 + r() * 10, y: 65 + r() * 10 },
    { x: 140 + r() * 10, y: 90 + r() * 10 },
  ]
  const rightCenter = {
    x: rightNodes.reduce((s, n) => s + n.x, 0) / 3,
    y: rightNodes.reduce((s, n) => s + n.y, 0) / 3,
  }

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      {/* Left: scattered */}
      <rect x="15" y="30" width="65" height="80" rx="3" fill="none" stroke={color} strokeWidth="0.5" opacity="0.12" strokeDasharray="3 2"/>
      {leftNodes.map((n, i) => (
        <g key={`l${i}`}>
          <circle cx={n.x} cy={n.y} r={n.size} fill={color} opacity="0.25"/>
          {i > 0 && <line x1={leftNodes[i-1].x} y1={leftNodes[i-1].y} x2={n.x} y2={n.y} stroke={color} strokeWidth="0.3" opacity="0.1"/>}
        </g>
      ))}
      {/* Arrow/transition */}
      <path d={`M85,70 C100,70 110,65 120,60`} fill="none" stroke={color} strokeWidth="0.8" opacity="0.3" strokeDasharray="4 3"/>
      <circle cx="100" cy="68" r="2" fill={color} opacity="0.35"/>
      {/* Right: connected */}
      {rightNodes.map((n, i) => (
        <g key={`r${i}`}>
          <circle cx={n.x} cy={n.y} r="6" fill="none" stroke={color} strokeWidth="0.8" opacity="0.4"/>
          <circle cx={n.x + 5} cy={n.y + 3} r="2.5" fill={color} opacity="0.3"/>
          <line x1={n.x} y1={n.y} x2={rightNodes[(i+1)%3].x} y2={rightNodes[(i+1)%3].y} stroke={color} strokeWidth="0.7" opacity="0.25"/>
          <line x1={n.x} y1={n.y} x2={rightCenter.x} y2={rightCenter.y} stroke={color} strokeWidth="0.5" opacity="0.15"/>
        </g>
      ))}
      <circle cx={rightCenter.x} cy={rightCenter.y} r="3.5" fill={color} opacity="0.12"/>
    </svg>
  )
}

// Pattern 3: Connected web - fully connected network radiating from central leverage point
function PatternWeb({ color, seed }) {
  const r = seededRandom(seed)
  const center = { x: 100, y: 70 }
  const primary = [
    { x: 45, y: 35 + r() * 10 },
    { x: 155, y: 35 + r() * 10 },
    { x: 45, y: 95 + r() * 10 },
    { x: 155, y: 95 + r() * 10 },
  ]
  const secondary = [
    { x: 30, y: 65 + r() * 10 },
    { x: 170, y: 65 + r() * 10 },
    { x: 75 + r() * 10, y: 25 },
    { x: 125 + r() * 10, y: 115 },
  ]

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      <circle cx={center.x} cy={center.y} r="12" fill={color} opacity="0.06"/>
      <circle cx={center.x} cy={center.y} r="5" fill={color} opacity="0.9"/>
      {primary.map((n, i) => (
        <g key={`p${i}`}>
          <circle cx={n.x} cy={n.y} r="4" fill={color} opacity="0.5"/>
          <line x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={color} strokeWidth="1.2" opacity="0.35"/>
          <line x1={n.x} y1={n.y} x2={primary[(i+1)%4].x} y2={primary[(i+1)%4].y} stroke={color} strokeWidth="0.4" opacity="0.12"/>
        </g>
      ))}
      {secondary.map((n, i) => (
        <g key={`s${i}`}>
          <circle cx={n.x} cy={n.y} r="2.5" fill={color} opacity="0.3"/>
          <line x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={color} strokeWidth="0.6" opacity="0.2"/>
          <line x1={n.x} y1={n.y} x2={primary[i % 4].x} y2={primary[i % 4].y} stroke={color} strokeWidth="0.3" opacity="0.12"/>
        </g>
      ))}
      {/* Cross-connections */}
      <line x1={primary[0].x} y1={primary[0].y} x2={primary[3].x} y2={primary[3].y} stroke={color} strokeWidth="0.3" opacity="0.1"/>
      <line x1={primary[1].x} y1={primary[1].y} x2={primary[2].x} y2={primary[2].y} stroke={color} strokeWidth="0.3" opacity="0.1"/>
    </svg>
  )
}

// Pattern 4: Growth ripples - expanding rings with nodes growing denser outward
function PatternGrowth({ color, seed }) {
  const r = seededRandom(seed)
  const rings = [8, 20, 35, 52]
  const center = { x: 100, y: 75 }
  const nodes = []
  rings.forEach((radius, ri) => {
    const count = ri + 2
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + r() * 0.8
      nodes.push({
        x: center.x + Math.cos(angle) * radius + (r() - 0.5) * 10,
        y: center.y + Math.sin(angle) * radius + (r() - 0.5) * 10,
        size: 3.5 - ri * 0.4,
        opacity: 0.7 - ri * 0.15,
        ring: ri,
      })
    }
  })

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      {rings.map((radius, i) => (
        <circle key={`ring${i}`} cx={center.x} cy={center.y} r={radius} fill="none" stroke={color} strokeWidth={0.7 - i * 0.1} opacity={0.4 - i * 0.08}/>
      ))}
      <circle cx={center.x} cy={center.y} r="4" fill={color} opacity="0.7"/>
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          <circle cx={n.x} cy={n.y} r={n.size} fill={color} opacity={n.opacity}/>
          <line x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={color} strokeWidth="0.4" opacity={n.opacity * 0.3}/>
          {i > 0 && n.ring === nodes[i-1]?.ring && (
            <line x1={nodes[i-1].x} y1={nodes[i-1].y} x2={n.x} y2={n.y} stroke={color} strokeWidth="0.3" opacity={n.opacity * 0.25}/>
          )}
        </g>
      ))}
    </svg>
  )
}

// Pattern 5: Stable structure - reinforced network with strong connections
function PatternStable({ color, seed }) {
  const r = seededRandom(seed)
  const corners = [
    { x: 55 + r() * 10, y: 40 + r() * 10 },
    { x: 135 + r() * 10, y: 40 + r() * 10 },
    { x: 55 + r() * 10, y: 90 + r() * 10 },
    { x: 135 + r() * 10, y: 90 + r() * 10 },
  ]
  const center = { x: 100, y: 70 }
  const outerNodes = Array.from({ length: 4 }, (_, i) => ({
    x: corners[i].x + (corners[i].x < 100 ? -25 : 25),
    y: corners[i].y + (corners[i].y < 70 ? -15 : 15),
  }))

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      {/* Main frame */}
      {corners.map((n, i) => (
        <g key={`c${i}`}>
          <circle cx={n.x} cy={n.y} r="4" fill={color} opacity="0.7"/>
          <circle cx={n.x} cy={n.y} r="10" fill="none" stroke={color} strokeWidth="0.5" opacity="0.12"/>
          <line x1={n.x} y1={n.y} x2={corners[(i+1)%4].x} y2={corners[(i+1)%4].y} stroke={color} strokeWidth="1" opacity="0.35"/>
          <line x1={n.x} y1={n.y} x2={center.x} y2={center.y} stroke={color} strokeWidth="0.6" opacity="0.25"/>
        </g>
      ))}
      {/* Diagonals */}
      <line x1={corners[0].x} y1={corners[0].y} x2={corners[3].x} y2={corners[3].y} stroke={color} strokeWidth="0.4" opacity="0.12"/>
      <line x1={corners[1].x} y1={corners[1].y} x2={corners[2].x} y2={corners[2].y} stroke={color} strokeWidth="0.4" opacity="0.12"/>
      {/* Centre */}
      <circle cx={center.x} cy={center.y} r="5" fill={color} opacity="0.8"/>
      <circle cx={center.x} cy={center.y} r="12" fill={color} opacity="0.05"/>
      {/* Outer tendrils */}
      {outerNodes.map((n, i) => (
        <g key={`o${i}`}>
          <circle cx={n.x} cy={n.y} r="2" fill={color} opacity="0.2"/>
          <line x1={corners[i].x} y1={corners[i].y} x2={n.x} y2={n.y} stroke={color} strokeWidth="0.3" opacity="0.12"/>
        </g>
      ))}
    </svg>
  )
}

// Pattern 6: Clustering - distinct groups connected by bridges
function PatternCluster({ color, seed }) {
  const r = seededRandom(seed)
  const clusters = [
    { cx: 50, cy: 55, nodes: Array.from({ length: 3 }, () => ({ dx: (r()-0.5)*25, dy: (r()-0.5)*25 })) },
    { cx: 150, cy: 55, nodes: Array.from({ length: 3 }, () => ({ dx: (r()-0.5)*25, dy: (r()-0.5)*25 })) },
    { cx: 100, cy: 105, nodes: Array.from({ length: 3 }, () => ({ dx: (r()-0.5)*25, dy: (r()-0.5)*25 })) },
  ]

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      {/* Bridge connections */}
      <line x1="50" y1="55" x2="150" y2="55" stroke={color} strokeWidth="0.5" opacity="0.15" strokeDasharray="4 3"/>
      <line x1="50" y1="55" x2="100" y2="105" stroke={color} strokeWidth="0.5" opacity="0.15" strokeDasharray="4 3"/>
      <line x1="150" y1="55" x2="100" y2="105" stroke={color} strokeWidth="0.5" opacity="0.15" strokeDasharray="4 3"/>
      {clusters.map((cl, ci) => (
        <g key={`cl${ci}`}>
          <circle cx={cl.cx} cy={cl.cy} r="4.5" fill={color} opacity="0.7"/>
          {cl.nodes.map((n, ni) => (
            <g key={`n${ni}`}>
              <circle cx={cl.cx + n.dx} cy={cl.cy + n.dy} r={2 + r()} fill={color} opacity={0.25 + r() * 0.15}/>
              <line x1={cl.cx} y1={cl.cy} x2={cl.cx + n.dx} y2={cl.cy + n.dy} stroke={color} strokeWidth="0.5" opacity="0.2"/>
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

// Pattern 7: Convergence - many paths leading to a focal point
function PatternConvergence({ color, seed }) {
  const r = seededRandom(seed)
  const focal = { x: 140, y: 70 }
  const sources = Array.from({ length: 6 }, (_, i) => ({
    x: 20 + r() * 50,
    y: 15 + (i * 20) + r() * 10,
    size: 2 + r() * 2,
    opacity: 0.3 + r() * 0.2,
  }))
  const midpoints = sources.map(s => ({
    x: s.x + (focal.x - s.x) * (0.4 + r() * 0.2),
    y: s.y + (focal.y - s.y) * (0.4 + r() * 0.2),
  }))

  return (
    <svg width="100%" viewBox="0 0 200 140" style={{ display: 'block' }}>
      <circle cx={focal.x} cy={focal.y} r="7" fill={color} opacity="0.8"/>
      <circle cx={focal.x} cy={focal.y} r="18" fill={color} opacity="0.05"/>
      <circle cx={focal.x} cy={focal.y} r="30" fill="none" stroke={color} strokeWidth="0.4" opacity="0.1"/>
      {sources.map((s, i) => (
        <g key={`s${i}`}>
          <circle cx={s.x} cy={s.y} r={s.size} fill={color} opacity={s.opacity}/>
          <circle cx={midpoints[i].x} cy={midpoints[i].y} r="1.5" fill={color} opacity={s.opacity * 0.5}/>
          <path
            d={`M${s.x},${s.y} Q${midpoints[i].x},${midpoints[i].y} ${focal.x},${focal.y}`}
            fill="none" stroke={color} strokeWidth="0.6" opacity={s.opacity * 0.5}
          />
        </g>
      ))}
    </svg>
  )
}

const PATTERNS = [
  PatternAwareness,
  PatternWave,
  PatternTransition,
  PatternWeb,
  PatternGrowth,
  PatternStable,
  PatternCluster,
  PatternConvergence,
]

export default function NetworkIllustration({ index = 0, color = '#9B51E0', slug = '' }) {
  // Use slug to create a unique seed per service, so different services get different variations
  const slugSeed = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const seed = (index + 1) * 1000 + slugSeed

  const Pattern = PATTERNS[index % PATTERNS.length]

  return (
    <div style={{ width: '100%', maxWidth: '200px', opacity: 0.85 }}>
      <Pattern color={color} seed={seed} />
    </div>
  )
}
