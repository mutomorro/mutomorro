'use client'

import { useState, useEffect } from 'react'

// Type colours
const typeColours = {
  newsletter: '#9B51E0',
  social: '#2DD4BF',
  task: '#F59E0B',
  outreach: '#FF4279',
  content: '#3B82F6',
}

// Signal strength colours
const strengthColours = {
  high: '#9B51E0',
  medium: '#2DD4BF',
  low: 'rgba(255,255,255,0.25)',
}

// Pipeline statuses in order
const pipelineStatuses = [
  { key: 'new', label: 'New', colour: 'rgba(155,81,224,0.2)' },
  { key: 'researching', label: 'Researching', colour: 'rgba(155,81,224,0.35)' },
  { key: 'contacted', label: 'Contacted', colour: 'rgba(155,81,224,0.5)' },
  { key: 'in-conversation', label: 'In conversation', colour: 'rgba(155,81,224,0.7)' },
  { key: 'opportunity', label: 'Opportunity', colour: '#9B51E0' },
]

function relativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function signalLabel(type) {
  const labels = {
    'inbound-enquiry': 'Contact form',
    'template-download': 'Tool download',
    'resource-download': 'Resource download',
    'newsletter-click': 'Newsletter click',
    'newsletter-signup': 'Newsletter signup',
  }
  return labels[type] || type
}

// Skeleton loader
function Skeleton({ width, height = 20 }) {
  return (
    <div style={{
      width: width || '100%',
      height,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Command Centre
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{today}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
          {!loading && data?.analytics?.activeVisitors > 0 && (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2DD4BF',
              display: 'inline-block',
              animation: 'activePulse 2s ease-in-out infinite',
            }} />
          )}
          {loading ? '-' : (data?.analytics?.activeVisitors ?? '-')} active visitors
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          label="Visitors this week"
          value={loading ? null : data?.analytics?.visitors ?? '-'}
          subtitle={!loading && data?.analytics?.pageviews ? `${data.analytics.pageviews.toLocaleString()} pageviews` : null}
        />
        <MetricCard
          label="New contacts"
          value={loading ? null : data?.contactsThisWeek?.total ?? 0}
          previousValue={loading ? null : data?.contactsThisWeek?.previousWeek}
        />
        <MetricCard
          label="Newsletter subscribers"
          value={loading ? null : data?.newsletterSubscribers ?? 0}
          subtitle={!loading && data?.newsletterNewThisWeek > 0 ? `+${data.newsletterNewThisWeek} this week` : null}
        />
        <MetricCard label="Pipeline (active)" value={loading ? null : data?.pipeline?.activeTotal ?? 0} />
      </div>

      {error && (
        <div style={{ ...cardStyle, borderLeft: '3px solid #FF4279', padding: '16px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#FF4279' }}>Failed to load dashboard data. Try refreshing.</p>
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left column: Recent signals */}
        <div style={cardStyle}>
          <h2 style={cardHeading}>Recent signals</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={44} />)}
            </div>
          ) : data?.signals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {data.signals.map((signal) => (
                <div key={signal.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  {/* Strength dot */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: strengthColours[signal.strength] || strengthColours.low,
                    marginTop: '6px',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 400, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {signal.detail || signalLabel(signal.type)}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.06)',
                        padding: '2px 7px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}>
                        {signalLabel(signal.type)}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {signal.contact
                        ? `${signal.contact.first_name || ''} ${signal.contact.last_name || ''}`.trim() + (signal.contact.organisation_name ? ` - ${signal.contact.organisation_name}` : '')
                        : 'Unknown contact'}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {relativeTime(signal.created_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={emptyText}>No signals this week</p>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* This week */}
          <div style={cardStyle}>
            <h2 style={cardHeading}>This week</h2>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} height={36} />)}
              </div>
            ) : data?.calendar?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {data.calendar.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: typeColours[item.type] || 'rgba(255,255,255,0.25)',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                        {item.scheduled_date && new Date(item.scheduled_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {item.scheduled_time && ` at ${item.scheduled_time.slice(0, 5)}`}
                        {item.status && item.status !== 'planned' && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            padding: '1px 6px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '3px',
                            color: 'rgba(255,255,255,0.5)',
                          }}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyText}>Nothing planned this week. Add something in Calendar.</p>
            )}
          </div>

          {/* Top referrers */}
          {!loading && data?.analytics?.topReferrers?.length > 0 && (
            <div style={cardStyle}>
              <h2 style={cardHeading}>Top referrers (7d)</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {data.analytics.topReferrers.map((ref, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '13px',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      {ref.referrer}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                      {ref.views}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline bar */}
          <div style={cardStyle}>
            <h2 style={cardHeading}>Organisation pipeline</h2>
            {loading ? (
              <Skeleton height={32} />
            ) : (() => {
              const counts = data?.pipeline?.counts || {}
              const total = Object.values(counts).reduce((a, b) => a + b, 0)
              if (total === 0) return <p style={emptyText}>No organisations yet</p>
              return (
                <div>
                  {/* Stacked bar */}
                  <div style={{
                    display: 'flex',
                    height: '28px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                  }}>
                    {pipelineStatuses.map((s) => {
                      const count = counts[s.key] || 0
                      if (count === 0) return null
                      const pct = (count / total) * 100
                      return (
                        <div
                          key={s.key}
                          title={`${s.label}: ${count}`}
                          style={{
                            width: `${pct}%`,
                            background: s.colour,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 400,
                            color: '#fff',
                            minWidth: count > 0 ? '24px' : 0,
                          }}
                        >
                          {count}
                        </div>
                      )
                    })}
                  </div>
                  {/* Labels */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {pipelineStatuses.map((s) => {
                      const count = counts[s.key] || 0
                      if (count === 0) return null
                      return (
                        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.colour }} />
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
          {/* Outreach summary */}
          {!loading && data?.outreach && (
            <div style={cardStyle}>
              <h2 style={cardHeading}>Outreach</h2>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Sequences</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: '#fff' }}>{data.outreach.activeSequences}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Enrolled</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: '#fff' }}>{data.outreach.totalContacts}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Replies</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: '#2DD4BF' }}>{data.outreach.totalReplies}</div>
                </div>
              </div>
              <a href="/admin/outreach" style={{ fontSize: '12px', color: '#9B51E0', textDecoration: 'none' }}>View details →</a>
            </div>
          )}

          {/* Handoffs summary */}
          {!loading && data?.handoffs && (
            <div style={cardStyle}>
              <h2 style={cardHeading}>Handoffs</h2>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Open</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.handoffs.openCount > 0 ? '#F59E0B' : '#fff' }}>{data.handoffs.openCount}</div>
                </div>
              </div>
              {data.handoffs.recent.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
                  {data.handoffs.recent.map((h) => (
                    <div key={h.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '13px',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {h.title}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', flexShrink: 0 }}>
                        {h.source_project} → {h.target_project}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <a href="/admin/handoffs" style={{ fontSize: '12px', color: '#9B51E0', textDecoration: 'none' }}>View all →</a>
            </div>
          )}

          {/* Tenders summary */}
          {!loading && data?.tenders && (
            <div style={cardStyle}>
              <h2 style={cardHeading}>Tenders</h2>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Hot</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.tenders.hot > 0 ? '#DC2626' : '#fff' }}>{data.tenders.hot}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Unreviewed</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.tenders.unreviewed > 0 ? '#D97706' : '#fff' }}>{data.tenders.unreviewed}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Deadlines &lt;7d</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.tenders.urgent > 0 ? '#DC2626' : '#fff' }}>{data.tenders.urgent}</div>
                </div>
              </div>
              <a href="/admin/tenders" style={{ fontSize: '12px', color: '#9B51E0', textDecoration: 'none' }}>View tenders →</a>
            </div>
          )}

          {/* Last newsletter send */}
          {!loading && data?.lastNewsletter && (
            <div style={cardStyle}>
              <h2 style={cardHeading}>Last newsletter</h2>
              <div style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>
                {data.lastNewsletter.subject}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>
                {new Date(data.lastNewsletter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Open rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.lastNewsletter.total_delivered > 0 && (data.lastNewsletter.total_opened / data.lastNewsletter.total_delivered * 100) > 25 ? '#2DD4BF' : '#fff' }}>
                    {data.lastNewsletter.total_delivered > 0 ? ((data.lastNewsletter.total_opened / data.lastNewsletter.total_delivered) * 100).toFixed(1) + '%' : '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Click rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: '#fff' }}>
                    {data.lastNewsletter.total_delivered > 0 ? ((data.lastNewsletter.total_clicked / data.lastNewsletter.total_delivered) * 100).toFixed(1) + '%' : '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Bounced</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.lastNewsletter.total_bounced > 0 ? '#FF4279' : '#fff' }}>
                    {data.lastNewsletter.total_bounced || 0}
                  </div>
                </div>
              </div>
              <a href="/admin/newsletter" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: '#9B51E0', textDecoration: 'none' }}>
                View details →
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes activePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="grid-template-columns: 1.4fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function MetricCard({ label, value, subtitle, previousValue }) {
  let change = null
  let isUp = null
  if (value !== null && previousValue !== null && previousValue !== undefined && previousValue > 0) {
    const pct = ((value - previousValue) / previousValue * 100).toFixed(0)
    change = Math.abs(pct) + '%'
    isUp = value >= previousValue
  }

  return (
    <div style={cardStyle}>
      <div style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      {value === null ? (
        <Skeleton width="60px" height={28} />
      ) : (
        <>
          <div style={{ fontSize: '28px', fontWeight: 500, color: '#fff' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change && (
            <div style={{ fontSize: '12px', color: isUp ? '#2DD4BF' : '#FF4279', marginTop: '4px' }}>
              {isUp ? '↑' : '↓'} {change} vs last week
            </div>
          )}
          {subtitle && !change && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  padding: '20px',
}

const cardHeading = {
  fontSize: '13px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '16px',
}

const emptyText = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.3)',
  fontStyle: 'italic',
}
