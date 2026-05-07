'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

// Known acronyms for tool name formatting
const ACRONYMS = ['pestle', 'adkar', 'dmaic', 'vuca', 'pdca', 'swot', 'raci', 'smart', 'okr', 'okrs', 'kpi', 'kpis']

function formatPagePath(path) {
  if (!path || path === '/') return 'Homepage'
  if (path === '$direct') return 'Direct'
  return path
}

function formatToolName(path) {
  const slug = path.replace(/^\/tools\//, '')
  return slug
    .split('-')
    .map(word => ACRONYMS.includes(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatReferrer(domain) {
  if (!domain || domain === '$direct' || domain === 'null') return 'Direct'
  return domain
}

export default function AnalyticsPage() {
  const { theme } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => {
        console.error(err)
        setError('Failed to load analytics')
      })
      .finally(() => setLoading(false))
  }, [])

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding: '20px',
  }

  const sectionHeading = {
    fontSize: '13px',
    fontWeight: 400,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em' }}>
          Analytics
        </h1>
        <div style={{ fontSize: '13px', color: theme.textMuted }}>
          Last 30 days from PostHog
        </div>
      </div>

      {error && (
        <div style={{ ...cardStyle, borderLeft: `3px solid ${theme.danger}`, marginBottom: '24px' }}>
          <p style={{ color: theme.danger, fontSize: '14px', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Row 1 - Summary cards */}
      <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <SummaryCard theme={theme} label="Visitors today" value={loading ? null : data?.today?.visitors} colour={theme.success} />
        <SummaryCard theme={theme} label="Pageviews today" value={loading ? null : data?.today?.pageviews} colour={theme.accent} />
        <SummaryCard theme={theme} label="Downloads today" value={loading ? null : data?.today?.downloads} colour="#F59E0B" />
        <SummaryCard theme={theme} label="Signups today" value={loading ? null : data?.today?.signups} colour={theme.danger} />
      </div>

      {/* Row 2 - Visitors and pageviews chart */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <h2 style={sectionHeading}>Visitors &amp; pageviews - 30 days</h2>
        {loading ? (
          <Skeleton theme={theme} height="200px" />
        ) : (
          <DualLineChart
            theme={theme}
            visitors={data?.visitorsOverTime || []}
            pageviews={data?.pageviewsOverTime || []}
          />
        )}
      </div>

      {/* Row 3 - Two-column: Traffic split + Sources */}
      <div className="admin-analytics-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Traffic split */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Exploration traffic */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Exploration traffic</h2>
            <p style={{ fontSize: '12px', color: theme.textLabel, marginBottom: '12px', marginTop: '-8px' }}>
              People exploring what Mutomorro does
            </p>
            {loading ? <Skeleton theme={theme} /> : (
              <PageList
                theme={theme}
                pages={data?.topPagesExploration || []}
                formatter={formatPagePath}
                highlightNonHomepage
              />
            )}
          </div>

          {/* Tool traffic */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Tool traffic</h2>
            <p style={{ fontSize: '12px', color: theme.textLabel, marginBottom: '12px', marginTop: '-8px' }}>
              People who found a template via search
            </p>
            {loading ? <Skeleton theme={theme} /> : (
              <PageList
                theme={theme}
                pages={(data?.topToolPages || []).slice(0, 10)}
                formatter={(path) => formatToolName(path)}
              />
            )}
          </div>
        </div>

        {/* Right: Sources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Referrers */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Top referrers</h2>
            {loading ? <Skeleton theme={theme} /> : (
              <DataTable
                theme={theme}
                rows={(data?.referralSources || []).map(r => ({ label: formatReferrer(r.label), count: r.count }))}
                countLabel="Views"
              />
            )}
          </div>

          {/* Countries */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Top countries</h2>
            {loading ? <Skeleton theme={theme} /> : (
              <DataTable
                theme={theme}
                rows={data?.countries || []}
                countLabel="Views"
              />
            )}
          </div>

          {/* Devices */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Devices</h2>
            {loading ? <Skeleton theme={theme} /> : (
              <DeviceBar theme={theme} devices={data?.devices || []} />
            )}
          </div>
        </div>
      </div>

      {/* Row 4 - Custom events */}
      <div style={cardStyle}>
        <h2 style={sectionHeading}>Conversions - 30 days</h2>
        {loading ? <Skeleton theme={theme} height="160px" /> : (
          <CustomEventsTable theme={theme} events={data?.customEvents || []} />
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          .admin-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .admin-analytics-cols {
            grid-template-columns: 1fr !important;
          }
          .admin-conversions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .admin-metrics-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-conversions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

// --- Summary card ---
function SummaryCard({ theme, label, value, colour }) {
  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding: '20px',
  }
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {label}
      </div>
      {value === null ? (
        <div style={{ height: '28px', width: '60px', background: theme.cardBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: colour || theme.textPrimary }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      )}
    </div>
  )
}

// --- Dual line chart (visitors + pageviews) ---
function DualLineChart({ theme, visitors, pageviews }) {
  const emptyText = { fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }
  if (!visitors.length && !pageviews.length) {
    return <p style={emptyText}>No data yet</p>
  }

  const allValues = [...visitors.map(d => d.value), ...pageviews.map(d => d.value)]
  const maxValue = Math.max(...allValues, 1)
  const chartHeight = 180
  const chartWidth = 100 // percentage

  function buildPath(data) {
    if (data.length === 0) return ''
    const step = chartWidth / Math.max(data.length - 1, 1)
    return data.map((d, i) => {
      const x = (i * step).toFixed(2)
      const y = (chartHeight - (d.value / maxValue) * (chartHeight - 20)).toFixed(2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  // Show date labels - first, middle, last
  const dateLabels = visitors.length > 0 ? visitors : pageviews
  const labelIndices = [0, Math.floor(dateLabels.length / 2), dateLabels.length - 1]

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: theme.success }}>&#9644; Visitors</span>
        <span style={{ fontSize: '12px', color: theme.accent }}>&#9644; Pageviews</span>
      </div>
      <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '180px' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1="0" x2="100" y1={chartHeight - f * (chartHeight - 20)} y2={chartHeight - f * (chartHeight - 20)} stroke={theme.rowBorder} strokeWidth="0.3" />
        ))}
        {/* Pageviews line */}
        <path d={buildPath(pageviews)} fill="none" stroke={theme.accent} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        {/* Visitors line */}
        <path d={buildPath(visitors)} fill="none" stroke={theme.success} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {labelIndices.map(idx => {
          const d = dateLabels[idx]
          if (!d) return null
          return (
            <span key={idx} style={{ fontSize: '11px', color: theme.textLabel }}>
              {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// --- Page list (for traffic split) ---
function PageList({ theme, pages, formatter, highlightNonHomepage }) {
  const emptyText = { fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }
  if (!pages || pages.length === 0) {
    return <p style={emptyText}>No data yet</p>
  }

  return (
    <div>
      {pages.slice(0, 10).map((p, i) => {
        const label = String(p.label || '')
        const displayName = formatter(label)
        const isInteresting = highlightNonHomepage && label !== '/' && !label.startsWith('/tools/')
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '7px 0',
              borderBottom: `1px solid ${theme.rowBorder}`,
            }}
          >
            <span style={{
              fontSize: '13px',
              color: isInteresting ? theme.success : theme.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '80%',
            }}>
              {displayName}
            </span>
            <span style={{ fontSize: '13px', color: theme.textMuted, flexShrink: 0, marginLeft: '8px' }}>
              {p.count.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- Generic data table ---
function DataTable({ theme, rows, countLabel = 'Count' }) {
  const emptyText = { fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }
  const thStyle = {
    fontSize: '11px',
    fontWeight: 400,
    color: theme.textLabel,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '6px 0',
    borderBottom: `1px solid ${theme.headerBorder}`,
    textAlign: 'left',
  }
  const tdStyle = {
    fontSize: '13px',
    color: theme.textSecondary,
    padding: '8px 0',
    borderBottom: `1px solid ${theme.rowBorder}`,
  }

  if (!rows || rows.length === 0) {
    return <p style={emptyText}>No data yet</p>
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={thStyle}>Source</th>
          <th style={{ ...thStyle, textAlign: 'right', width: '60px' }}>{countLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {r.label || 'Unknown'}
              </span>
            </td>
            <td style={{ ...tdStyle, textAlign: 'right', color: theme.textMuted }}>
              {r.count.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// --- Device breakdown bar ---
function DeviceBar({ theme, devices }) {
  const emptyText = { fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }
  if (!devices || devices.length === 0) {
    return <p style={emptyText}>No data yet</p>
  }

  const total = devices.reduce((sum, d) => sum + d.count, 0)
  const colours = { Desktop: theme.accent, Mobile: theme.success, Tablet: '#F59E0B' }

  return (
    <div>
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
        {devices.map((d, i) => (
          <div
            key={i}
            style={{
              width: `${total > 0 ? (d.count / total) * 100 : 0}%`,
              background: colours[d.label] || theme.textLabel,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {devices.map((d, i) => (
          <span key={i} style={{ fontSize: '12px', color: theme.textSecondary }}>
            <span style={{ color: colours[d.label] || theme.textPrimary }}>&#9679;</span>{' '}
            {d.label}: {total > 0 ? Math.round((d.count / total) * 100) : 0}%
          </span>
        ))}
      </div>
    </div>
  )
}

// --- Custom events table ---
function CustomEventsTable({ theme, events }) {
  const emptyText = { fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }
  if (!events || events.length === 0) {
    return <p style={emptyText}>No conversion data yet</p>
  }

  const eventLabels = {
    tool_download: 'Tool downloads',
    resource_download: 'Resource downloads',
    newsletter_signup: 'Newsletter signups',
    contact_form_submitted: 'Contact form submissions',
  }

  const eventColours = {
    tool_download: theme.accent,
    resource_download: '#F59E0B',
    newsletter_signup: theme.success,
    contact_form_submitted: theme.danger,
  }

  return (
    <div>
      <div className="admin-conversions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {events.map((e, i) => (
          <div key={i} style={{ padding: '12px 0' }}>
            <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {eventLabels[e.event] || e.event}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 500, color: eventColours[e.event] || theme.textPrimary }}>
              {e.total.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Sparklines for each event */}
      <div className="admin-conversions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {events.map((e, i) => (
          <Sparkline key={i} data={e.days} colour={eventColours[e.event] || theme.accent} />
        ))}
      </div>
    </div>
  )
}

// --- Sparkline ---
function Sparkline({ data, colour }) {
  if (!data || data.length === 0) return null

  const values = data.map(d => d.value)
  const max = Math.max(...values, 1)
  const h = 40
  const w = 100

  const step = w / Math.max(values.length - 1, 1)
  const points = values.map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * (h - 4)).toFixed(2)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '40px' }}>
      <polyline points={points} fill="none" stroke={colour} strokeWidth="0.8" vectorEffect="non-scaling-stroke" opacity="0.6" />
    </svg>
  )
}

// --- Skeleton loader ---
function Skeleton({ theme, height = '120px' }) {
  return <div style={{ height, background: theme.cardBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
}
