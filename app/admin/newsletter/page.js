'use client'

import { useState, useEffect } from 'react'

function pct(num, denom) {
  if (!denom || denom === 0) return '-'
  return ((num / denom) * 100).toFixed(1) + '%'
}

function relativeDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function relativeTime(dateStr) {
  if (!dateStr) return '-'
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const statusBadge = {
  sending: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  complete: { bg: 'rgba(45,212,191,0.15)', color: '#2DD4BF' },
  draft: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
}

export default function NewsletterPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSendId, setSelectedSendId] = useState(null)
  const [sendDetail, setSendDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  async function loadSendDetail(id) {
    if (selectedSendId === id) {
      setSelectedSendId(null)
      setSendDetail(null)
      return
    }
    setSelectedSendId(id)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`)
      if (res.ok) setSendDetail(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  const subs = data?.subscribers || {}

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '24px' }}>
        Newsletter
      </h1>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card label="Active subscribers" value={loading ? null : subs.active} />
        <Card label="New this week" value={loading ? null : subs.newThisWeek} />
        <Card label="New this month" value={loading ? null : subs.newThisMonth} />
        <Card label="Unsubscribed" value={loading ? null : subs.unsubscribed} />
      </div>

      {/* Send history */}
      <div style={cardStyle}>
        <h2 style={sectionHeading}>Send history</h2>
        {loading ? (
          <Skeleton height={200} />
        ) : data?.sends?.length > 0 ? (
          <div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.6fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Subject</div>
              <div>Date</div>
              <div>Sent</div>
              <div>Opened</div>
              <div>Clicked</div>
              <div>Bounced</div>
              <div>Status</div>
            </div>

            {/* Rows - grouped by subject for multi-batch sends */}
            {(() => {
              // Group sends by subject
              const grouped = []
              const subjectMap = {}
              data.sends.forEach((send) => {
                const key = send.subject
                if (!subjectMap[key]) {
                  subjectMap[key] = { sends: [], index: grouped.length }
                  grouped.push({ subject: key, sends: [] })
                }
                grouped[subjectMap[key].index].sends.push(send)
              })

              return grouped.map((group) => {
                const hasSummary = group.sends.length > 1
                const summaryRow = hasSummary ? {
                  total_sent: group.sends.reduce((s, b) => s + (b.total_sent || 0), 0),
                  total_opened: group.sends.reduce((s, b) => s + (b.total_opened || 0), 0),
                  total_clicked: group.sends.reduce((s, b) => s + (b.total_clicked || 0), 0),
                  total_bounced: group.sends.reduce((s, b) => s + (b.total_bounced || 0), 0),
                  total_delivered: group.sends.reduce((s, b) => s + (b.total_delivered || 0), 0),
                } : null

                return (
                  <div key={group.subject}>
                    {/* Summary row for multi-batch */}
                    {hasSummary && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.6fr',
                        gap: '8px',
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.8)',
                        background: 'rgba(155,81,224,0.04)',
                        alignItems: 'center',
                      }}>
                        <div style={{ color: '#fff', fontWeight: 400 }}>
                          {group.subject}
                          <span style={{ fontSize: '11px', marginLeft: '8px', color: 'rgba(255,255,255,0.35)' }}>
                            {group.sends.length} batches combined
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          {relativeTime(group.sends[0].created_at)}
                        </div>
                        <div>{summaryRow.total_sent}</div>
                        <div>
                          {summaryRow.total_opened}
                          <span style={{ fontSize: '11px', marginLeft: '4px', color: parseFloat(pct(summaryRow.total_opened, summaryRow.total_delivered)) > 25 ? '#2DD4BF' : 'rgba(255,255,255,0.3)' }}>
                            {pct(summaryRow.total_opened, summaryRow.total_delivered)}
                          </span>
                        </div>
                        <div>
                          {summaryRow.total_clicked}
                          <span style={{ fontSize: '11px', marginLeft: '4px', color: parseFloat(pct(summaryRow.total_clicked, summaryRow.total_delivered)) > 3 ? '#2DD4BF' : 'rgba(255,255,255,0.3)' }}>
                            {pct(summaryRow.total_clicked, summaryRow.total_delivered)}
                          </span>
                        </div>
                        <div style={{ color: summaryRow.total_bounced > 0 ? '#FF4279' : 'rgba(255,255,255,0.7)' }}>
                          {summaryRow.total_bounced}
                        </div>
                        <div />
                      </div>
                    )}

                    {/* Individual batch rows */}
                    {group.sends.map((send) => {
                      const openRate = pct(send.total_opened, send.total_delivered)
                      const clickRate = pct(send.total_clicked, send.total_delivered)
                      const bounceRate = pct(send.total_bounced, send.total_sent)
                      const badge = statusBadge[send.status] || statusBadge.draft
                      const isSelected = selectedSendId === send.id

                      return (
                        <div key={send.id}>
                          <div
                            onClick={() => loadSendDetail(send.id)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2.5fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.6fr',
                              gap: '8px',
                              padding: hasSummary ? '10px 0 10px 16px' : '12px 0',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              fontSize: '13px',
                              color: hasSummary ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.7)',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(155,81,224,0.06)' : 'transparent',
                              alignItems: 'center',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                          >
                            <div style={{ color: hasSummary ? 'rgba(255,255,255,0.6)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {hasSummary ? `Batch ${group.sends.indexOf(send) + 1}` : send.subject}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                              {relativeTime(send.created_at)}
                            </div>
                            <div>{send.total_sent || 0}</div>
                            <div>
                              {send.total_opened || 0}
                              <span style={{ fontSize: '11px', marginLeft: '4px', color: parseFloat(openRate) > 25 ? '#2DD4BF' : 'rgba(255,255,255,0.3)' }}>
                                {openRate}
                              </span>
                            </div>
                            <div>
                              {send.total_clicked || 0}
                              <span style={{ fontSize: '11px', marginLeft: '4px', color: parseFloat(clickRate) > 3 ? '#2DD4BF' : 'rgba(255,255,255,0.3)' }}>
                                {clickRate}
                              </span>
                            </div>
                            <div style={{ color: parseFloat(bounceRate) > 5 ? '#FF4279' : 'rgba(255,255,255,0.7)' }}>
                              {send.total_bounced || 0}
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: badge.bg, color: badge.color }}>
                                {send.status}
                              </span>
                            </div>
                          </div>

                          {/* Send detail panel */}
                          {isSelected && (
                            <SendDetailPanel detail={sendDetail} loading={detailLoading} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })
            })()}
          </div>
        ) : (
          <p style={emptyText}>No sends yet</p>
        )}
      </div>

      {/* Breakdown panels */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          {/* By tier */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Subscribers by tier</h2>
            {data?.byTier?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.byTier.map((t) => {
                  const maxCount = Math.max(...data.byTier.map((x) => x.count))
                  const barWidth = (t.count / maxCount) * 100
                  return (
                    <div key={t.tier} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', width: '50px', flexShrink: 0 }}>{t.tier}</span>
                      <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: 'rgba(155,81,224,0.4)', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', width: '50px', textAlign: 'right', flexShrink: 0 }}>{t.count.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={emptyText}>No tier data</p>
            )}
          </div>

          {/* By source */}
          <div style={cardStyle}>
            <h2 style={sectionHeading}>Subscribers by source</h2>
            {data?.bySource?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {data.bySource.map((s) => (
                  <div key={s.source} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{s.source}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>{s.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyText}>No source data</p>
            )}
          </div>
        </div>
      )}

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

function SendDetailPanel({ detail, loading }) {
  if (loading) return <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}><Skeleton height={80} /></div>
  if (!detail) return null

  const { send, statusBreakdown, engaged, bounced } = detail

  return (
    <div style={{ padding: '20px 0', background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid rgba(155,81,224,0.2)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>{send.subject}</h3>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          {relativeDate(send.created_at)}
          {send.preview_text && <span style={{ marginLeft: '12px' }}>{send.preview_text}</span>}
        </p>
      </div>

      {/* Status breakdown */}
      {Object.keys(statusBreakdown).length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} style={{ fontSize: '13px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{status}: </span>
              <span style={{ color: '#fff' }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Engaged recipients */}
      {engaged.length > 0 && (
        <div>
          <h4 style={{ ...sectionHeading, marginBottom: '8px' }}>Who engaged</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 0.6fr 0.8fr', gap: '8px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>Name</div>
            <div>Email</div>
            <div>Organisation</div>
            <div>Action</div>
            <div>When</div>
          </div>
          {engaged.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 0.6fr 0.8fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ color: '#fff' }}>
                {r.contact ? `${r.contact.first_name || ''} ${r.contact.last_name || ''}`.trim() : '-'}
              </div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.contact?.organisation_name || '-'}</div>
              <div>
                <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '3px', background: r.clicked_at ? 'rgba(155,81,224,0.15)' : 'rgba(45,212,191,0.15)', color: r.clicked_at ? '#9B51E0' : '#2DD4BF' }}>
                  {r.clicked_at ? 'clicked' : 'opened'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                {relativeTime(r.clicked_at || r.opened_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {engaged.length === 0 && bounced.length === 0 && (
        <p style={emptyText}>No engagement data yet</p>
      )}
    </div>
  )
}

function Card({ label, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      {value === null ? (
        <Skeleton height={28} width={60} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: '#fff' }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
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
