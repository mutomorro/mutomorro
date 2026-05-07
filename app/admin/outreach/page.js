'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

function relativeTime(dateStr) {
  if (!dateStr) return '-'
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function pct(num, denom) {
  if (!denom || denom === 0) return '-'
  return ((num / denom) * 100).toFixed(1) + '%'
}

export default function OutreachPage() {
  const { theme } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/outreach')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const cardStyle = { background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '20px' }
  const sectionHeading = { fontSize: '13px', fontWeight: 400, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }
  const emptyText = { fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }

  const statusBadge = {
    active: { bg: 'rgba(45,212,191,0.15)', color: theme.success },
    paused: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    archived: { bg: theme.cardBgHover, color: theme.textMuted },
  }

  if (!loading && data?.noKey) {
    return (
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '16px' }}>Outreach</h1>
        <div style={{ ...cardStyle, borderLeft: `3px solid ${theme.warning}`, padding: '20px 24px' }}>
          <p style={{ color: theme.warning, fontSize: '15px', marginBottom: '8px' }}>Apollo API key not configured</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>
            Add APOLLO_API_KEY to your environment variables. You need a master API key from Apollo &gt; Settings &gt; Integrations &gt; API Keys.
          </p>
        </div>
      </div>
    )
  }

  const sequences = data?.sequences || []
  const activeSeqs = sequences.filter((s) => s.status === 'active')
  const totalContacts = activeSeqs.reduce((sum, s) => sum + s.contacts_count, 0)
  const totalReplies = sequences.reduce((sum, s) => sum + s.replies, 0)
  const crossovers = data?.crossovers || []
  const replies = data?.recentReplies || []

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '24px' }}>Outreach</h1>

      {data?.apolloError && (
        <div style={{ ...cardStyle, borderLeft: `3px solid ${theme.danger}`, padding: '12px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', color: theme.danger }}>Apollo API error: {data.apolloError}</p>
        </div>
      )}

      {/* Metric cards */}
      <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card theme={theme} label="Active sequences" value={loading ? null : activeSeqs.length} />
        <Card theme={theme} label="Contacts enrolled" value={loading ? null : totalContacts} />
        <Card theme={theme} label="Total replies" value={loading ? null : totalReplies} />
        <Card theme={theme} label="Crossover alerts" value={loading ? null : crossovers.length} accent={crossovers.length > 0} />
      </div>

      {/* Crossover alerts - the killer feature */}
      {crossovers.length > 0 && (
        <div style={{ ...cardStyle, borderLeft: `3px solid ${theme.accent}`, marginBottom: '24px', background: theme.accentBg }}>
          <h2 style={sectionHeading}>
            Crossover alerts
            <span style={{ fontSize: '11px', marginLeft: '8px', padding: '2px 8px', background: theme.accentBg, color: theme.accent, borderRadius: '10px' }}>
              {crossovers.length}
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '16px' }}>
            People in your outreach who have also engaged on the website
          </p>
          {crossovers.map((c, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${theme.cardBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 400, color: theme.textPrimary }}>{c.supabase_contact.name}</span>
                  <span style={{ fontSize: '13px', color: theme.textMuted, marginLeft: '8px' }}>{c.supabase_contact.email}</span>
                </div>
                <a
                  href={`/admin/contacts?search=${encodeURIComponent(c.supabase_contact.email)}`}
                  style={{ fontSize: '12px', color: theme.accent, textDecoration: 'none', flexShrink: 0 }}
                >
                  View contact →
                </a>
              </div>
              {c.supabase_contact.organisation && (
                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>{c.supabase_contact.organisation}</div>
              )}
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                <span style={{ color: theme.accent }}>Sequence:</span> {c.sequence_name}
              </div>
              <div style={{ fontSize: '12px', color: theme.success, marginTop: '2px' }}>{c.signal}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && crossovers.length === 0 && !data?.apolloError && (
        <div style={{ ...cardStyle, marginBottom: '24px', textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: theme.textLabel, fontStyle: 'italic' }}>
            No crossovers detected - outreach contacts haven&#39;t engaged on the website yet
          </p>
        </div>
      )}

      {/* Two columns: Sequences + Recent replies */}
      <div className="admin-outreach-cols" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Sequences */}
        <div style={cardStyle}>
          <h2 style={sectionHeading}>Sequences</h2>
          {loading ? (
            <Skeleton theme={theme} height={200} />
          ) : sequences.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '500px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.7fr', gap: '6px', padding: '6px 0', borderBottom: `1px solid ${theme.headerBorder}`, fontSize: '11px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div>Name</div>
                <div>Status</div>
                <div>Contacts</div>
                <div>Sent</div>
                <div>Replies</div>
                <div>Rate</div>
                <div>Last used</div>
              </div>
              {sequences.map((s) => {
                const badge = statusBadge[s.status] || statusBadge.archived
                const rate = pct(s.replies, s.emails_sent)
                const rateNum = parseFloat(rate)
                const rateColour = rateNum > 5 ? theme.success : rateNum > 2 ? '#F59E0B' : theme.textMuted

                return (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.7fr', gap: '6px', padding: '10px 0', borderBottom: `1px solid ${theme.rowBorder}`, fontSize: '13px', color: theme.textSecondary, alignItems: 'center' }}>
                    <div style={{ color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '3px', background: badge.bg, color: badge.color }}>{s.status}</span>
                    </div>
                    <div>{s.contacts_count}</div>
                    <div>{s.emails_sent}</div>
                    <div>{s.replies}</div>
                    <div style={{ color: rateColour }}>{rate}</div>
                    <div style={{ fontSize: '12px', color: theme.textMuted }}>{relativeTime(s.last_used)}</div>
                  </div>
                )
              })}
              </div>
            </div>
          ) : (
            <p style={emptyText}>No sequences found</p>
          )}
        </div>

        {/* Recent replies */}
        <div style={cardStyle}>
          <h2 style={sectionHeading}>Recent replies</h2>
          {loading ? (
            <Skeleton theme={theme} height={200} />
          ) : replies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {replies.map((r, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.rowBorder}` }}>
                  <div style={{ fontSize: '14px', color: theme.textPrimary, marginBottom: '2px' }}>{r.contact_name}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '2px' }}>{r.email}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: theme.textLabel }}>{r.sequence_name}</span>
                    <span style={{ color: theme.textLabel }}>{relativeTime(r.replied_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={emptyText}>No replies yet</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          .admin-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .admin-outreach-cols {
            grid-template-columns: 1fr !important;
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

function Card({ theme, label, value, accent }) {
  const cardStyle = { background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '20px' }
  return (
    <div style={{ ...cardStyle, borderLeft: accent ? `3px solid ${theme.accent}` : undefined }}>
      <div style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      {value === null ? (
        <Skeleton theme={theme} height={28} width={60} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: accent ? theme.accent : theme.textPrimary }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      )}
    </div>
  )
}

function Skeleton({ theme, height = 20, width }) {
  return <div style={{ height, width: width || '100%', background: theme.cardBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
}
