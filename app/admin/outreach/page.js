'use client'

import { useState, useEffect } from 'react'

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

const statusBadge = {
  active: { bg: 'rgba(45,212,191,0.15)', color: '#2DD4BF' },
  paused: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  archived: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
}

export default function OutreachPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/outreach')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && data?.noKey) {
    return (
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '16px' }}>Outreach</h1>
        <div style={{ ...cardStyle, borderLeft: '3px solid #F59E0B', padding: '20px 24px' }}>
          <p style={{ color: '#F59E0B', fontSize: '15px', marginBottom: '8px' }}>Apollo API key not configured</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
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
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '24px' }}>Outreach</h1>

      {data?.apolloError && (
        <div style={{ ...cardStyle, borderLeft: '3px solid #FF4279', padding: '12px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', color: '#FF4279' }}>Apollo API error: {data.apolloError}</p>
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card label="Active sequences" value={loading ? null : activeSeqs.length} />
        <Card label="Contacts enrolled" value={loading ? null : totalContacts} />
        <Card label="Total replies" value={loading ? null : totalReplies} />
        <Card label="Crossover alerts" value={loading ? null : crossovers.length} accent={crossovers.length > 0} />
      </div>

      {/* Crossover alerts - the killer feature */}
      {crossovers.length > 0 && (
        <div style={{ ...cardStyle, borderLeft: '3px solid #9B51E0', marginBottom: '24px', background: 'rgba(155,81,224,0.04)' }}>
          <h2 style={sectionHeading}>
            Crossover alerts
            <span style={{ fontSize: '11px', marginLeft: '8px', padding: '2px 8px', background: 'rgba(155,81,224,0.2)', color: '#9B51E0', borderRadius: '10px' }}>
              {crossovers.length}
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
            People in your outreach who have also engaged on the website
          </p>
          {crossovers.map((c, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 400, color: '#fff' }}>{c.supabase_contact.name}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>{c.supabase_contact.email}</span>
                </div>
                <a
                  href={`/admin/contacts?search=${encodeURIComponent(c.supabase_contact.email)}`}
                  style={{ fontSize: '12px', color: '#9B51E0', textDecoration: 'none', flexShrink: 0 }}
                >
                  View contact →
                </a>
              </div>
              {c.supabase_contact.organisation && (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{c.supabase_contact.organisation}</div>
              )}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                <span style={{ color: '#9B51E0' }}>Sequence:</span> {c.sequence_name}
              </div>
              <div style={{ fontSize: '12px', color: '#2DD4BF', marginTop: '2px' }}>{c.signal}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && crossovers.length === 0 && !data?.apolloError && (
        <div style={{ ...cardStyle, marginBottom: '24px', textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            No crossovers detected - outreach contacts haven&#39;t engaged on the website yet
          </p>
        </div>
      )}

      {/* Two columns: Sequences + Recent replies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Sequences */}
        <div style={cardStyle}>
          <h2 style={sectionHeading}>Sequences</h2>
          {loading ? (
            <Skeleton height={200} />
          ) : sequences.length > 0 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.7fr', gap: '6px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                const rateColour = rateNum > 5 ? '#2DD4BF' : rateNum > 2 ? '#F59E0B' : 'rgba(255,255,255,0.4)'

                return (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.7fr', gap: '6px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '13px', color: 'rgba(255,255,255,0.65)', alignItems: 'center' }}>
                    <div style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '3px', background: badge.bg, color: badge.color }}>{s.status}</span>
                    </div>
                    <div>{s.contacts_count}</div>
                    <div>{s.emails_sent}</div>
                    <div>{s.replies}</div>
                    <div style={{ color: rateColour }}>{rate}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{relativeTime(s.last_used)}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={emptyText}>No sequences found</p>
          )}
        </div>

        {/* Recent replies */}
        <div style={cardStyle}>
          <h2 style={sectionHeading}>Recent replies</h2>
          {loading ? (
            <Skeleton height={200} />
          ) : replies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {replies.map((r, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{r.contact_name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{r.email}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{r.sequence_name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>{relativeTime(r.replied_at)}</span>
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
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1.5fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Card({ label, value, accent }) {
  return (
    <div style={{ ...cardStyle, borderLeft: accent ? '3px solid #9B51E0' : undefined }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      {value === null ? (
        <Skeleton height={28} width={60} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: accent ? '#9B51E0' : '#fff' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      )}
    </div>
  )
}

function Skeleton({ height = 20, width }) {
  return <div style={{ height, width: width || '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
}

const cardStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '20px' }
const sectionHeading = { fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }
const emptyText = { fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }
