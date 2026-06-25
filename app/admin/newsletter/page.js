'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

function pct(num, denom) {
  if (!denom || denom === 0) return null
  return (num / denom) * 100
}

function fmtPct(num, denom) {
  const v = pct(num, denom)
  if (v === null) return '—'
  return v.toFixed(1) + '%'
}

function shortDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fullDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function NewsletterPage() {
  const { theme } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const subs = data?.subscribers || {}
  const lastSend = data?.lastSend || null
  const sends = data?.sends || []
  const unknownSources = useMemo(() => {
    if (!data?.bySource) return 0
    const u = data.bySource.find(s => s.source === 'unknown' || s.source == null || s.source === '')
    return u ? u.count : 0
  }, [data])

  return (
    <div>
      {/* Header + primary action */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 400,
          color: theme.textPrimary,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          Newsletter
        </h1>
        <a
          href="/admin/newsletter/send"
          style={{
            padding: '12px 22px',
            borderRadius: '6px',
            background: theme.accent,
            color: '#fff',
            fontSize: '14px',
            fontWeight: 400,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          Send a newsletter →
        </a>
      </div>

      {/* Subscriber health cards */}
      <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card theme={theme} label="Active subscribers" value={loading ? null : subs.active} />
        <Card theme={theme} label="New this week" value={loading ? null : subs.newThisWeek} />
        <Card theme={theme} label="New this month" value={loading ? null : subs.newThisMonth} />
        <Card theme={theme} label="Unsubscribed" value={loading ? null : subs.unsubscribed} />
      </div>

      {/* Last send summary */}
      <Section theme={theme} title="Last send" style={{ marginBottom: '24px' }}>
        {loading ? (
          <Skeleton theme={theme} height={100} />
        ) : !lastSend ? (
          <p style={emptyText(theme)}>No newsletters sent yet.</p>
        ) : (
          <LastSendSummary theme={theme} send={lastSend} />
        )}
      </Section>

      {/* Send history */}
      <Section theme={theme} title="Send history" style={{ marginBottom: '24px' }}>
        {loading ? (
          <Skeleton theme={theme} height={200} />
        ) : sends.length === 0 ? (
          <p style={emptyText(theme)}>No sends yet.</p>
        ) : (
          <SendHistory theme={theme} sends={sends} expanded={expanded} setExpanded={setExpanded} />
        )}
      </Section>

      {/* Subscriber composition */}
      {!loading && (
        <div className="admin-breakdown-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Section theme={theme} title="Subscribers by tier">
            {data?.byTier?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.byTier.map((t) => {
                  const maxCount = Math.max(...data.byTier.map(x => x.count))
                  const barWidth = (t.count / maxCount) * 100
                  return (
                    <div key={t.tier} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: theme.textSecondary, width: '50px', flexShrink: 0 }}>{t.tier}</span>
                      <div style={{ flex: 1, height: '20px', background: theme.inputBg, borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: 'rgba(155,81,224,0.45)', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: theme.textMuted, width: '50px', textAlign: 'right', flexShrink: 0 }}>
                        {t.count.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={emptyText(theme)}>No tier data</p>
            )}
          </Section>

          <Section theme={theme} title="Subscribers by source">
            {data?.bySource?.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {data.bySource.map((s) => (
                    <div key={s.source || 'unknown'} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                      borderBottom: `1px solid ${theme.rowBorder}`,
                      fontSize: '13px',
                    }}>
                      <span style={{ color: theme.textSecondary }}>{s.source || 'unknown'}</span>
                      <span style={{ color: theme.textMuted }}>{s.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {unknownSources > 100 && (
                  <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '12px', fontStyle: 'italic' }}>
                    {unknownSources.toLocaleString()} contacts with no source attribution
                  </p>
                )}
              </>
            ) : (
              <p style={emptyText(theme)}>No source data</p>
            )}
          </Section>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          .admin-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-breakdown-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .admin-metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Components ─────────────────────────────────────────────────────

function Section({ theme, title, children, style }) {
  return (
    <section style={{
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: '10px',
      padding: '20px 22px',
      ...style,
    }}>
      <h2 style={{
        fontSize: '13px',
        fontWeight: 400,
        color: theme.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '16px',
        marginTop: 0,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Card({ theme, label, value }) {
  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: '10px',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '12px',
        color: theme.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
      }}>{label}</div>
      {value === null ? (
        <Skeleton theme={theme} height={28} width={60} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: theme.textPrimary }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      )}
    </div>
  )
}

function Skeleton({ theme, height = 20, width }) {
  return (
    <div style={{
      height,
      width: width || '100%',
      background: theme.inputBg,
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function LastSendSummary({ theme, send }) {
  const openRate = pct(send.opened, send.delivered)
  const clickRate = pct(send.clicked, send.delivered)
  const bounceRate = pct(send.bounced, send.delivered)
  const bounceHigh = bounceRate !== null && bounceRate > 2

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '17px', color: theme.textPrimary, fontWeight: 400, lineHeight: 1.4 }}>
          {send.subject}
        </div>
        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>
          {fullDate(send.createdAt)}{send.batchCount > 1 ? ` · ${send.batchCount} batches` : ''}
        </div>
      </div>

      <div className="admin-lastsend-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Metric theme={theme} label="Sent" value={send.delivered.toLocaleString()} />
        <Metric
          theme={theme}
          label="Open rate"
          value={openRate !== null ? openRate.toFixed(1) + '%' : '—'}
          sub={`${send.opened.toLocaleString()} opens`}
        />
        <Metric
          theme={theme}
          label="Click rate"
          value={clickRate !== null ? clickRate.toFixed(1) + '%' : '—'}
          sub={`${send.clicked.toLocaleString()} clicks`}
        />
        <Metric
          theme={theme}
          label="Bounce rate"
          value={bounceRate !== null ? bounceRate.toFixed(1) + '%' : '—'}
          sub={`${send.bounced.toLocaleString()} bounces`}
          highlight={bounceHigh ? theme.danger : null}
        />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-lastsend-metrics { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

function Metric({ theme, label, value, sub, highlight }) {
  return (
    <div>
      <div style={{
        fontSize: '11px',
        color: theme.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px',
      }}>{label}</div>
      <div style={{
        fontSize: '24px',
        fontWeight: 400,
        color: highlight || theme.textPrimary,
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function SendHistory({ theme, sends, expanded, setExpanded }) {
  const cols = '2.4fr 0.6fr 0.7fr 0.8fr 0.8fr 0.7fr 0.7fr 0.3fr'

  function toggle(key) {
    setExpanded({ ...expanded, [key]: !expanded[key] })
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: '720px' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: '8px',
          padding: '8px 4px',
          borderBottom: `1px solid ${theme.headerBorder}`,
          fontSize: '11px',
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <div>Subject</div>
          <div>Date</div>
          <div>Sent</div>
          <div>Open rate</div>
          <div>Click rate</div>
          <div>Bounces</div>
          <div>Status</div>
          <div></div>
        </div>

        {sends.map((g) => {
          const isOpen = !!expanded[g.key]
          const canExpand = g.batchCount > 1
          const openRate = pct(g.opened, g.delivered)
          const clickRate = pct(g.clicked, g.delivered)
          const bounceRate = pct(g.bounced, g.delivered)
          const bounceHigh = bounceRate !== null && bounceRate > 2

          return (
            <div key={g.key}>
              <div
                onClick={() => canExpand && toggle(g.key)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: cols,
                  gap: '8px',
                  padding: '14px 4px',
                  borderBottom: `1px solid ${theme.rowBorder}`,
                  fontSize: '13px',
                  color: theme.textSecondary,
                  cursor: canExpand ? 'pointer' : 'default',
                  alignItems: 'center',
                  transition: 'background 0.1s',
                  background: isOpen ? theme.accentBg : 'transparent',
                }}
                onMouseEnter={(e) => { if (canExpand && !isOpen) e.currentTarget.style.background = theme.cardBgHover }}
                onMouseLeave={(e) => { if (canExpand && !isOpen) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.subject}
                  {g.batchCount > 1 && (
                    <span style={{ fontSize: '11px', marginLeft: '8px', color: theme.textMuted }}>
                      {g.batchCount} batches
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>
                  {shortDate(g.createdAt)}
                </div>
                <div>{g.delivered.toLocaleString()}</div>
                <div>
                  {openRate !== null ? openRate.toFixed(1) + '%' : '—'}
                  <span style={{ fontSize: '11px', marginLeft: '4px', color: theme.textMuted }}>
                    {g.opened.toLocaleString()}
                  </span>
                </div>
                <div>
                  {clickRate !== null ? clickRate.toFixed(1) + '%' : '—'}
                  <span style={{ fontSize: '11px', marginLeft: '4px', color: theme.textMuted }}>
                    {g.clicked.toLocaleString()}
                  </span>
                </div>
                <div style={{ color: g.bounced > 0 ? theme.danger : theme.textSecondary, fontWeight: bounceHigh ? 400 : 300 }}>
                  {g.bounced.toLocaleString()}
                </div>
                <div>
                  <StatusBadge theme={theme} status={g.status} />
                </div>
                <div style={{ textAlign: 'right', color: theme.textMuted, fontSize: '12px' }}>
                  {canExpand ? (isOpen ? '▾' : '▸') : ''}
                </div>
              </div>

              {isOpen && canExpand && (
                <div style={{ background: theme.inputBg, padding: '4px 0' }}>
                  {g.batches.map((b, i) => {
                    const bOpen = pct(b.opened, b.total)
                    const bClick = pct(b.clicked, b.total)
                    return (
                      <div key={b.id} style={{
                        display: 'grid',
                        gridTemplateColumns: cols,
                        gap: '8px',
                        padding: '10px 4px 10px 24px',
                        fontSize: '12px',
                        color: theme.textMuted,
                        borderBottom: i < g.batches.length - 1 ? `1px solid ${theme.rowBorder}` : 'none',
                      }}>
                        <div>Batch {g.batches.length - i}</div>
                        <div>{shortDate(b.createdAt)}</div>
                        <div>{b.total.toLocaleString()}</div>
                        <div>{bOpen !== null ? bOpen.toFixed(1) + '%' : '—'}</div>
                        <div>{bClick !== null ? bClick.toFixed(1) + '%' : '—'}</div>
                        <div style={{ color: b.bounced > 0 ? theme.danger : theme.textMuted }}>{b.bounced}</div>
                        <div><StatusBadge theme={theme} status={b.status} small /></div>
                        <div></div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ theme, status, small }) {
  // Build a faint background from the foreground colour so badges work
  // in both light and dark themes without inspecting the mode.
  function tint(hex) {
    return hex + '22' // ~13% alpha
  }
  const palette = {
    complete: { bg: tint(theme.success), fg: theme.success },
    sending: { bg: tint(theme.warning), fg: theme.warning },
    failed: { bg: tint(theme.danger), fg: theme.danger },
    queued: { bg: theme.inputBg, fg: theme.textMuted },
    draft: { bg: theme.inputBg, fg: theme.textMuted },
  }
  const p = palette[status] || palette.draft
  return (
    <span style={{
      fontSize: small ? '10px' : '11px',
      padding: small ? '1px 6px' : '2px 8px',
      borderRadius: '3px',
      background: p.bg,
      color: p.fg,
      textTransform: 'lowercase',
      letterSpacing: '0.02em',
    }}>
      {status}
    </span>
  )
}

const emptyText = (theme) => ({ fontSize: '14px', color: theme.textMuted, fontStyle: 'italic' })
