'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminTheme } from '../../lib/admin-theme-context'

// Type colours
const typeColours = {
  newsletter: '#9B51E0',
  social: '#2DD4BF',
  task: '#F59E0B',
  outreach: '#FF4279',
  content: '#3B82F6',
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

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : n)

// Skeleton loader
function Skeleton({ theme, width, height = 20 }) {
  return (
    <div style={{
      width: width || '100%',
      height,
      background: theme.cardBg,
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

export default function AdminOverview() {
  const { theme } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const load = useCallback(() => {
    return fetch('/api/admin/overview')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then((d) => { setData(d); setError(null) })
      .catch((err) => setError(err.message))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = () => { setRefreshing(true); load() }

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding: '20px',
  }

  const cardHeading = {
    fontSize: '13px',
    fontWeight: 400,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
  }

  const emptyText = {
    fontSize: '14px',
    color: theme.textLabel,
    fontStyle: 'italic',
  }

  // Signal strength colours - low strength uses textLabel for theme awareness
  const strengthColours = {
    high: theme.accent,
    medium: theme.success,
    low: theme.textLabel,
  }

  const updatedAt = data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Command Centre
          </h1>
          <p style={{ fontSize: '14px', color: theme.textMuted }}>{today}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: theme.textMuted }}>
          {updatedAt && <span>Updated {updatedAt}</span>}
          <button
            onClick={refresh}
            disabled={refreshing}
            style={{
              fontFamily: 'inherit', fontSize: '13px', color: theme.textSecondary,
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
              borderRadius: '7px', padding: '7px 12px', cursor: refreshing ? 'default' : 'pointer',
              opacity: refreshing ? 0.5 : 1,
            }}
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* UK pool funnel - the two-arm model (reachable -> target / acquire) */}
      <UkPoolFunnel theme={theme} loading={loading} funnel={data?.funnel} cardStyle={cardStyle} />

      {/* Needs-attention inbox */}
      <NeedsAttentionInbox theme={theme} loading={loading} na={data?.needsAttention} cardStyle={cardStyle} />

      {error && (
        <div style={{ ...cardStyle, borderLeft: `3px solid ${theme.danger}`, padding: '16px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: theme.danger }}>Failed to load dashboard data. Try refreshing.</p>
        </div>
      )}

      {/* Secondary context strip - the operational week, deliberately de-emphasised */}
      <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          theme={theme}
          label="Visitors (7d)"
          value={loading ? null : data?.analytics?.visitors ?? '-'}
          subtitle={!loading && data?.analytics?.pageviews ? `${data.analytics.pageviews.toLocaleString()} pageviews` : null}
        />
        <MetricCard
          theme={theme}
          label="New contacts this week"
          value={loading ? null : data?.contactsThisWeek?.total ?? 0}
          previousValue={loading ? null : data?.contactsThisWeek?.previousWeek}
        />
        <MetricCard
          theme={theme}
          label="Newsletter list"
          value={loading ? null : data?.funnel?.allSubscribers ?? data?.newsletterSubscribers ?? 0}
          subtitle={!loading && data?.newsletterNewThisWeek > 0 ? `+${data.newsletterNewThisWeek} this week` : 'active subscribers'}
        />
        <MetricCard theme={theme} label="Pipeline (active)" value={loading ? null : data?.pipeline?.activeTotal ?? 0} />
      </div>

      {/* Two-column layout */}
      <div className="admin-two-col" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left column: Recent signals */}
        <div style={cardStyle}>
          <h2 style={cardHeading}>Recent signals</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} theme={theme} height={44} />)}
            </div>
          ) : data?.signals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {data.signals.map((signal) => (
                <div key={signal.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: `1px solid ${theme.rowBorder}`,
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
                      <span style={{ fontSize: '14px', fontWeight: 400, color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {signal.detail || signalLabel(signal.type)}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 400,
                        color: theme.textSecondary,
                        background: theme.cardBgHover,
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
                    <div style={{ fontSize: '13px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {signal.contact
                        ? `${signal.contact.first_name || ''} ${signal.contact.last_name || ''}`.trim() + (signal.contact.organisation_name ? ` - ${signal.contact.organisation_name}` : '')
                        : 'Unknown contact'}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textLabel, flexShrink: 0, whiteSpace: 'nowrap' }}>
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
                {[1, 2, 3].map((i) => <Skeleton key={i} theme={theme} height={36} />)}
              </div>
            ) : data?.calendar?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {data.calendar.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 0',
                    borderBottom: `1px solid ${theme.rowBorder}`,
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: typeColours[item.type] || theme.textLabel,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textMuted }}>
                        {item.scheduled_date && new Date(item.scheduled_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {item.scheduled_time && ` at ${item.scheduled_time.slice(0, 5)}`}
                        {item.status && item.status !== 'planned' && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            padding: '1px 6px',
                            background: theme.cardBgHover,
                            borderRadius: '3px',
                            color: theme.textSecondary,
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
                    borderBottom: `1px solid ${theme.rowBorder}`,
                    fontSize: '13px',
                  }}>
                    <span style={{ color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      {ref.referrer}
                    </span>
                    <span style={{ color: theme.textMuted, flexShrink: 0 }}>
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
              <Skeleton theme={theme} height={32} />
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
                          <span style={{ fontSize: '12px', color: theme.textMuted }}>{s.label}</span>
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
                  <div style={{ fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Sequences</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: theme.textPrimary }}>{data.outreach.activeSequences}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Enrolled</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: theme.textPrimary }}>{data.outreach.totalContacts}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Replies</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: theme.success }}>{data.outreach.totalReplies}</div>
                </div>
              </div>
              <a href="/admin/outreach" style={{ fontSize: '12px', color: theme.accent, textDecoration: 'none' }}>View details →</a>
            </div>
          )}

          {/* Last newsletter send */}
          {!loading && data?.lastNewsletter && (
            <div style={cardStyle}>
              <h2 style={cardHeading}>Last newsletter</h2>
              <div style={{ fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                {data.lastNewsletter.subject}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '12px' }}>
                {new Date(data.lastNewsletter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Open rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.lastNewsletter.total_delivered > 0 && (data.lastNewsletter.total_opened / data.lastNewsletter.total_delivered * 100) > 25 ? theme.success : theme.textPrimary }}>
                    {data.lastNewsletter.total_delivered > 0 ? ((data.lastNewsletter.total_opened / data.lastNewsletter.total_delivered) * 100).toFixed(1) + '%' : '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Click rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: theme.textPrimary }}>
                    {data.lastNewsletter.total_delivered > 0 ? ((data.lastNewsletter.total_clicked / data.lastNewsletter.total_delivered) * 100).toFixed(1) + '%' : '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Bounced</div>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: data.lastNewsletter.total_bounced > 0 ? theme.danger : theme.textPrimary }}>
                    {data.lastNewsletter.total_bounced || 0}
                  </div>
                </div>
              </div>
              <a href="/admin/newsletter" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: theme.accent, textDecoration: 'none' }}>
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
        @media (max-width: 768px) {
          .admin-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .admin-two-col {
            grid-template-columns: 1fr !important;
          }
          .admin-funnel-outer {
            flex-direction: column !important;
          }
          .admin-funnel {
            flex-wrap: wrap !important;
          }
          .admin-funnel-arrow, .admin-funnel-spacer {
            display: none !important;
          }
          .admin-funnel > a {
            flex-basis: 46% !important;
          }
        }
        @media (max-width: 480px) {
          .admin-metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UK pool funnel: the two-arm model. Anchors on the UK pool (the database and
// newsletter totals are noise). Reachable arm narrows by warmth
// (subscribed -> engaged -> target); acquire arm narrows by fit
// (not subscribed -> target audience). Every box deep-links to its people.
// ---------------------------------------------------------------------------
function UkPoolFunnel({ theme, loading, funnel, cardStyle }) {
  const heroCard = { ...cardStyle, padding: '24px', marginBottom: '20px' }

  if (loading || !funnel) {
    return (
      <div style={heroCard}>
        <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '18px' }}>Your UK market</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton theme={theme} height={154} width="150px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton theme={theme} height={71} />
            <Skeleton theme={theme} height={71} />
          </div>
        </div>
      </div>
    )
  }

  const f = funnel
  const base = '/admin/engagement?tab=people&filter='
  const cov = f.coverage || {}
  const pct = (n) => (f.total > 0 ? Math.round((n / f.total) * 100) : 0)

  return (
    <div style={heroCard}>
      <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
        Your UK market <span style={{ textTransform: 'none', letterSpacing: 0, color: theme.textLabel }}>· click any box to see who is in it</span>
      </div>

      <div className="admin-funnel-outer" style={{ display: 'flex', gap: '10px', alignItems: 'stretch', marginBottom: '18px' }}>
        {/* Anchor: Total UK, spanning both arms */}
        <FunnelBox theme={theme} value={f.ukTotal} label="Total UK" sub="the pool that matters" tone={theme.accent} href={`${base}uk`} big basis="150px" />

        {/* Two arms */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Reachable: subscribed -> engaged -> target */}
          <div>
            <div style={armLabel(theme.accent)}>Reachable · nurture &amp; convert</div>
            <div className="admin-funnel" style={armRow}>
              <FunnelBox theme={theme} value={f.subscribed} label="Subscribed" sub="on the list" tone={theme.accent} href={`${base}uk_subscribed`} />
              <Arrow theme={theme} />
              <FunnelBox theme={theme} value={f.engaged} label="Engaged" sub="opening / clicking" tone={theme.accent} href={`${base}uk_engaged`} />
              <Arrow theme={theme} />
              <FunnelBox theme={theme} value={f.target} label="Target" sub="warm + fit" tone={theme.accent} emphasis href={`${base}uk_target`} />
            </div>
          </div>
          {/* Acquire: not subscribed -> target audience */}
          <div>
            <div style={armLabel(theme.warningStrong)}>Not subscribed · acquire</div>
            <div className="admin-funnel" style={armRow}>
              <FunnelBox theme={theme} value={f.notSubscribed} label="Not subscribed" sub="no channel yet" tone={theme.warningStrong} href={`${base}uk_notsub`} />
              <Arrow theme={theme} />
              <FunnelBox theme={theme} value={f.targetAudience} label="Target Audience" sub={`fit + reachable · ${f.targetAudienceWarm} already warm`} tone={theme.warningStrong} emphasis href={`${base}uk_target_audience`} />
              <div className="admin-funnel-spacer" style={{ flex: 1, minWidth: 0 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Off-the-field figures (drillable) + the enrichment-coverage caveat */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'baseline', fontSize: '12px', color: theme.textMuted, lineHeight: 1.5 }}>
        <span>
          Off the field:{' '}
          <a href={`${base}uk_optedout`} style={{ color: theme.textSecondary, textDecoration: 'none', borderBottom: `1px dotted ${theme.textLabel}` }}>{fmt(f.optedOut)} opted-out</a>
          {' · '}{fmt(f.bounced)} bounced
        </span>
        <span style={{ color: theme.textLabel }}>
          Floors, not totals - location known for {pct(cov.locationKnown)}% of contacts, seniority for {pct(cov.seniorityKnown)}% ({pct(cov.freeEmail)}% use a free email), so the real UK pool is larger than shown.
        </span>
      </div>
    </div>
  )
}

const armRow = { display: 'flex', gap: '8px', alignItems: 'stretch' }
function armLabel(colour) {
  return { fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: colour, marginBottom: '6px' }
}

function Arrow({ theme }) {
  return <div className="admin-funnel-arrow" style={{ display: 'flex', alignItems: 'center', color: theme.textLabel, fontSize: '16px', flexShrink: 0 }}>→</div>
}

// One funnel box. Amber (#D97706) is too light for text on the near-white
// emphasis bg in light mode, so warning boxes use a warning-tinted background
// and the stronger AA-legible amber. Accent (purple) boxes keep their tone.
function FunnelBox({ theme, value, label, sub, tone, href, emphasis, big, basis }) {
  const isWarn = tone === theme.warning || tone === theme.warningStrong
  const bg = emphasis ? (isWarn ? theme.warningBg : theme.accentBg) : theme.cardBgHover
  const numberColour = emphasis ? (isWarn ? theme.warningStrong : tone) : theme.textPrimary
  const inner = (
    <div style={{
      width: '100%',
      padding: big ? '18px 16px' : '13px 14px',
      borderRadius: '10px',
      background: bg,
      border: `1px solid ${emphasis ? tone : theme.cardBorder}`,
      borderLeft: `3px solid ${tone}`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{ fontSize: big ? '34px' : '25px', fontWeight: 600, color: numberColour, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
        {fmt(value)}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: theme.textPrimary, marginTop: '5px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>{sub}</div>}
    </div>
  )
  const wrap = basis
    ? { flexBasis: basis, flexShrink: 0, minWidth: 0, display: 'flex', textDecoration: 'none' }
    : { flex: 1, minWidth: 0, display: 'flex', textDecoration: 'none' }
  return href
    ? <a href={href} style={wrap}>{inner}</a>
    : <div style={wrap}>{inner}</div>
}

// ---------------------------------------------------------------------------
// Needs-attention inbox: every actionable pile, one click from action.
// ---------------------------------------------------------------------------
function NeedsAttentionInbox({ theme, loading, na, cardStyle }) {
  const wrap = { ...cardStyle, marginBottom: '32px' }

  const heading = {
    fontSize: '13px', fontWeight: 400, color: theme.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px',
  }

  if (loading || !na) {
    return (
      <div style={wrap}>
        <h2 style={heading}>Needs attention</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} theme={theme} height={72} />)}
        </div>
      </div>
    )
  }

  // Build the action tiles. Order: warmest leads first, then time-sensitive, then hygiene.
  const tiles = [
    {
      count: na.enquiries, label: 'Unworked enquiries', sub: 'inbound, unanswered',
      href: '/admin/enquiries', tone: na.enquiries > 0 ? theme.success : theme.textMuted, urgent: na.enquiries > 0,
    },
    {
      count: na.tenderQueue, label: 'Tenders to triage',
      sub: na.tendersClosing7 > 0 ? `${na.tendersClosing7} closing in 7d` : (na.tendersHot > 0 ? `${na.tendersHot} hot` : 'scored, unrated'),
      href: '/admin/tenders', tone: na.tendersClosing7 > 0 ? theme.warning : theme.textSecondary, urgent: na.tendersClosing7 > 0,
    },
    {
      count: na.calendarOverdue, label: 'Overdue calendar', sub: 'past due, still open',
      href: '/admin/calendar', tone: na.calendarOverdue > 0 ? theme.danger : theme.textMuted, urgent: na.calendarOverdue > 0,
    },
    {
      count: na.handoffsOpen, label: 'Open handoffs',
      sub: na.handoffsStale > 0 ? `${na.handoffsStale} stale 14d+` : 'awaiting pickup',
      href: '/admin/handoffs', tone: na.handoffsStale > 0 ? theme.warning : theme.textSecondary, urgent: na.handoffsStale > 0,
    },
    {
      count: na.redirects, label: 'Live 404s',
      sub: na.topRedirect ? `top: ${na.topRedirect.path}` : 'real, not bots',
      href: '/admin/redirects', tone: theme.textSecondary, urgent: false,
    },
  ].filter((t) => t.count > 0)

  const allClear = tiles.length === 0 && !na.newsletterPaused

  return (
    <div style={wrap}>
      <h2 style={heading}>Needs attention</h2>

      {/* Send-engine paused banner */}
      {na.newsletterPaused && (
        <a href="/admin/newsletter" style={{
          display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
          background: theme.accentBg, border: `1px solid ${theme.warning}`,
          borderRadius: '9px', padding: '12px 14px', marginBottom: tiles.length > 0 ? '14px' : 0,
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.warning, flexShrink: 0 }} />
          <span style={{ fontSize: '13.5px', color: theme.textPrimary }}>
            <strong style={{ color: theme.warning }}>Newsletter auto-send is paused.</strong>
            <span style={{ color: theme.textSecondary }}> Sends are manual until re-enabled. Review the send engine →</span>
          </span>
        </a>
      )}

      {allClear ? (
        <p style={{ fontSize: '14px', color: theme.textLabel, fontStyle: 'italic', margin: 0 }}>All clear. Nothing needs action right now.</p>
      ) : tiles.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
          {tiles.map((t) => {
            // Amber needs the stronger token to stay legible on the hover surface.
            const numberColour = t.tone === theme.warning ? theme.warningStrong : t.tone
            return (
            <a key={t.label} href={t.href} style={{
              display: 'block', textDecoration: 'none',
              background: theme.cardBgHover, borderRadius: '9px', padding: '14px',
              border: `1px solid ${theme.cardBorder}`, borderLeft: `3px solid ${t.tone}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: 600, color: numberColour }}>{fmt(t.count)}</span>
                {t.urgent && <span style={{ fontSize: '10px', fontWeight: 600, color: numberColour, textTransform: 'uppercase', letterSpacing: '0.4px' }}>now</span>}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: theme.textPrimary, marginTop: '4px' }}>{t.label}</div>
              <div style={{ fontSize: '11.5px', color: theme.textMuted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sub}</div>
            </a>
          )})}
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ theme, label, value, subtitle, previousValue }) {
  let change = null
  let isUp = null
  if (value !== null && previousValue !== null && previousValue !== undefined && previousValue > 0) {
    const pct = ((value - previousValue) / previousValue * 100).toFixed(0)
    change = Math.abs(pct) + '%'
    isUp = value >= previousValue
  }

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding: '20px',
  }

  return (
    <div style={cardStyle}>
      <div style={{
        fontSize: '12px',
        color: theme.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      {value === null ? (
        <Skeleton theme={theme} width="60px" height={28} />
      ) : (
        <>
          <div style={{ fontSize: '28px', fontWeight: 500, color: theme.textPrimary }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change && (
            <div style={{ fontSize: '12px', color: isUp ? theme.success : theme.danger, marginTop: '4px' }}>
              {isUp ? '↑' : '↓'} {change} vs last week
            </div>
          )}
          {subtitle && !change && (
            <div style={{ fontSize: '12px', color: theme.textLabel, marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
        </>
      )}
    </div>
  )
}
