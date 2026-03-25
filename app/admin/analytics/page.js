'use client'

import { useState, useEffect } from 'react'

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/analytics?period=${period}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em' }}>
          Analytics
        </h1>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                background: period === p ? 'rgba(155,81,224,0.2)' : 'transparent',
                color: period === p ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card label="Visitors" value={loading ? null : data?.visitors} />
        <Card label="Pageviews" value={loading ? null : data?.pageviews} />
        <Card label="Bounce rate" value={loading ? null : data?.bounceRate != null ? `${data.bounceRate}%` : '-'} />
        <Card label="Avg duration" value={loading ? null : formatDuration(data?.avgDuration)} />
      </div>

      {/* Pageviews chart */}
      <div style={cardStyle}>
        <h2 style={sectionHeading}>Pageviews</h2>
        {loading ? (
          <div style={{ height: '180px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : (
          <BarChart data={data?.pageviewsByDay || []} period={period} />
        )}
      </div>

      {/* Two-column: Top pages + Top referrers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Top countries */}
        <div style={cardStyle}>
          <h2 style={sectionHeading}>Top countries</h2>
          {loading ? (
            <Skeleton />
          ) : data?.topCountries?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Country</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '60px' }}>Visitors</th>
                </tr>
              </thead>
              <tbody>
                {data.topCountries.map((c, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{c.country || 'Unknown'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>{c.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={emptyText}>No data</p>
          )}
        </div>

        {/* Top referrers */}
        <div style={cardStyle}>
          <h2 style={sectionHeading}>Top referrers</h2>
          {loading ? (
            <Skeleton />
          ) : data?.topReferrers?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Referrer</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '60px' }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topReferrers.map((r, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '280px' }}>
                        {r.referrer}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>{r.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={emptyText}>No data</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function BarChart({ data, period }) {
  if (!data || data.length === 0) {
    return <p style={emptyText}>No pageview data</p>
  }

  const maxValue = Math.max(...data.map((d) => d.y), 1)
  const barHeight = 160

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: `${barHeight + 30}px`, paddingTop: '10px' }}>
      {data.map((d, i) => {
        const height = (d.y / maxValue) * barHeight
        const date = new Date(d.x)
        const label = period === '24h'
          ? date.toLocaleTimeString('en-GB', { hour: '2-digit' })
          : date.toLocaleDateString('en-GB', { weekday: 'short' })

        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{d.y}</span>
            <div
              style={{
                width: '100%',
                height: `${Math.max(height, 2)}px`,
                background: '#9B51E0',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s ease',
              }}
            />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Card({ label, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {label}
      </div>
      {value === null ? (
        <div style={{ height: '28px', width: '60px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: '#fff' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      )}
    </div>
  )
}

function Skeleton() {
  return <div style={{ height: '120px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  padding: '20px',
}

const sectionHeading = {
  fontSize: '13px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '16px',
}

const thStyle = {
  fontSize: '11px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: '6px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  textAlign: 'left',
}

const tdStyle = {
  fontSize: '13px',
  color: 'rgba(255,255,255,0.65)',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
}

const emptyText = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.3)',
  fontStyle: 'italic',
}
