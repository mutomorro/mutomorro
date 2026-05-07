'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

const pipelineStatuses = [
  { key: 'new', label: 'New', colour: 'rgba(155,81,224,0.15)' },
  { key: 'researching', label: 'Researching', colour: 'rgba(155,81,224,0.25)' },
  { key: 'contacted', label: 'Contacted', colour: 'rgba(155,81,224,0.4)' },
  { key: 'in-conversation', label: 'In conversation', colour: 'rgba(155,81,224,0.6)' },
  { key: 'opportunity', label: 'Opportunity', colour: '#9B51E0' },
  { key: 'client', label: 'Client', colour: '#F59E0B' },
]

const interactionTypes = ['email-sent', 'email-received', 'meeting', 'note', 'call']

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

export default function PipelinePage() {
  const { theme } = useAdminTheme()
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [detailContacts, setDetailContacts] = useState([])
  const [detailInteractions, setDetailInteractions] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Interaction form state
  const [showIntForm, setShowIntForm] = useState(false)
  const [intType, setIntType] = useState('email-sent')
  const [intSummary, setIntSummary] = useState('')
  const [intNextAction, setIntNextAction] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchPipeline() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pipeline')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setOrgs(data.organisations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPipeline()
  }, [])

  async function changeStatus(orgId, newStatus) {
    try {
      const res = await fetch('/api/admin/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orgId, status: newStatus }),
      })
      if (res.ok) {
        setOrgs((prev) =>
          prev.map((o) => (o.id === orgId ? { ...o, status: newStatus } : o))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function openDetail(org) {
    if (selectedOrg?.id === org.id) {
      setSelectedOrg(null)
      return
    }
    setSelectedOrg(org)
    setDetailLoading(true)
    setShowIntForm(false)

    try {
      const [contactsRes, interactionsRes] = await Promise.all([
        fetch(`/api/admin/contacts?search=${encodeURIComponent(org.name)}&page=1`),
        fetch('/api/admin/interactions?' + new URLSearchParams({ organisation_id: String(org.id) })),
      ])

      if (contactsRes.ok) {
        const data = await contactsRes.json()
        setDetailContacts(data.contacts || [])
      }

      // Interactions endpoint may not exist yet, fall back gracefully
      if (interactionsRes.ok) {
        const data = await interactionsRes.json()
        setDetailInteractions(data.interactions || [])
      } else {
        setDetailInteractions([])
      }
    } catch {
      setDetailContacts([])
      setDetailInteractions([])
    } finally {
      setDetailLoading(false)
    }
  }

  async function logInteraction() {
    if (!intSummary.trim() || !selectedOrg) return
    setSaving(true)
    try {
      await fetch('/api/admin/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organisation_id: selectedOrg.id,
          type: intType,
          summary: intSummary.trim(),
          next_action: intNextAction.trim() || null,
        }),
      })
      setIntSummary('')
      setIntNextAction('')
      setShowIntForm(false)
      fetchPipeline()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Group orgs by status
  const grouped = {}
  pipelineStatuses.forEach((s) => { grouped[s.key] = [] })
  orgs.forEach((o) => {
    const status = o.status || 'new'
    if (grouped[status]) {
      grouped[status].push(o)
    } else {
      grouped['new'].push(o)
    }
  })

  const sectionHeading = {
    fontSize: '11px',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  }

  const miniInput = {
    padding: '6px 8px',
    background: theme.inputBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '0',
    color: theme.textPrimary,
    fontSize: '12px',
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '24px' }}>
        Pipeline
      </h1>

      {loading ? (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ flex: '1 0 140px', minWidth: '140px', height: '200px', background: theme.cardBg, borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {pipelineStatuses.map((status) => {
            const items = grouped[status.key]
            return (
              <div key={status.key} style={{ flex: '1 0 180px', minWidth: '180px' }}>
                {/* Column header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  padding: '0 4px',
                }}>
                  <span style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {status.label}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 7px',
                    background: status.colour,
                    color: '#fff',
                    borderRadius: '10px',
                  }}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => openDetail(org)}
                      style={{
                        padding: '12px',
                        background: selectedOrg?.id === org.id ? theme.accentBg : theme.cardBg,
                        border: selectedOrg?.id === org.id ? `1px solid ${theme.accentBorder}` : `1px solid ${theme.cardBorder}`,
                        borderLeft: `3px solid ${status.colour}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { if (selectedOrg?.id !== org.id) e.currentTarget.style.background = theme.cardBgHover }}
                      onMouseLeave={(e) => { if (selectedOrg?.id !== org.id) e.currentTarget.style.background = theme.cardBg }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 400, color: theme.textPrimary, marginBottom: '4px' }}>
                        {org.name}
                      </div>
                      {org.sector && (
                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>
                          {org.sector}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: theme.textLabel }}>
                          {org.contact_count} contact{org.contact_count !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: '11px', color: theme.textLabel }}>
                          {relativeTime(org.last_interaction_date)}
                        </span>
                      </div>
                      {org.contact_names && org.contact_names.length > 0 && (
                        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {org.contact_names.slice(0, 3).join(', ')}
                          {org.contact_names.length > 3 && ` +${org.contact_names.length - 3} more`}
                        </div>
                      )}
                      {org.next_action && (
                        <div style={{ fontSize: '11px', color: '#F59E0B', marginTop: '6px' }}>
                          Next: {org.next_action}
                        </div>
                      )}

                      {/* Status change */}
                      <select
                        value={org.status || 'new'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); changeStatus(org.id, e.target.value) }}
                        style={{
                          marginTop: '8px',
                          width: '100%',
                          padding: '4px 6px',
                          background: theme.cardBg,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '0',
                          color: theme.textSecondary,
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        {pipelineStatuses.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: '12px', color: theme.textLabel, fontStyle: 'italic' }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail panel */}
      {selectedOrg && (
        <div style={{
          marginTop: '24px',
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '10px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 400, color: theme.textPrimary, marginBottom: '4px' }}>{selectedOrg.name}</h2>
              <div style={{ fontSize: '13px', color: theme.textMuted, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {selectedOrg.sector && <span>{selectedOrg.sector}</span>}
                {selectedOrg.size && <span>{selectedOrg.size}</span>}
                {selectedOrg.website && <span>{selectedOrg.website}</span>}
                {selectedOrg.domain && <span>{selectedOrg.domain}</span>}
              </div>
            </div>
            <button
              onClick={() => setSelectedOrg(null)}
              style={{ background: 'none', border: 'none', color: theme.textLabel, fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ✕
            </button>
          </div>

          {selectedOrg.notes && (
            <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '16px', padding: '10px 12px', background: theme.cardBgHover, borderRadius: '4px' }}>
              {selectedOrg.notes}
            </div>
          )}

          {detailLoading ? (
            <div style={{ height: '60px', background: theme.cardBgHover, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <div className="admin-pipeline-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Contacts */}
              <div>
                <h3 style={sectionHeading}>Contacts ({detailContacts.length})</h3>
                {detailContacts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {detailContacts.slice(0, 10).map((c) => (
                      <div key={c.id} style={{ fontSize: '13px', padding: '6px 0', borderBottom: `1px solid ${theme.rowBorder}`, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.textSecondary }}>
                          {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.signup_email}
                        </span>
                        <span style={{ fontSize: '12px', color: theme.textLabel }}>{c.role || ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: theme.textLabel, fontStyle: 'italic' }}>No contacts matched</p>
                )}
              </div>

              {/* Interactions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ ...sectionHeading, marginBottom: 0 }}>Interactions</h3>
                  <button
                    onClick={() => setShowIntForm(!showIntForm)}
                    style={{
                      padding: '3px 10px',
                      background: theme.accentBg,
                      border: 'none',
                      color: theme.accent,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      borderRadius: '0',
                    }}
                  >
                    + Log
                  </button>
                </div>

                {showIntForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: theme.cardBgHover, borderRadius: '4px', marginBottom: '10px' }}>
                    <select value={intType} onChange={(e) => setIntType(e.target.value)} style={miniInput}>
                      {interactionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="text" value={intSummary} onChange={(e) => setIntSummary(e.target.value)} placeholder="Summary" style={miniInput} />
                    <input type="text" value={intNextAction} onChange={(e) => setIntNextAction(e.target.value)} placeholder="Next action (optional)" style={miniInput} />
                    <button onClick={logInteraction} disabled={saving || !intSummary.trim()} style={{ padding: '5px 12px', background: theme.accent, border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '0' }}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}

                {detailInteractions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {detailInteractions.map((int) => (
                      <div key={int.id} style={{ padding: '6px 0', borderBottom: `1px solid ${theme.rowBorder}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>
                            <span style={{ color: theme.accent, fontSize: '12px' }}>{int.type}</span>
                            <span style={{ color: theme.textSecondary, marginLeft: '8px' }}>{int.summary}</span>
                          </span>
                          <span style={{ fontSize: '11px', color: theme.textLabel, flexShrink: 0 }}>{relativeTime(int.created_at)}</span>
                        </div>
                        {int.next_action && (
                          <div style={{ fontSize: '11px', color: '#F59E0B', marginTop: '2px' }}>Next: {int.next_action}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: theme.textLabel, fontStyle: 'italic' }}>No interactions yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          .admin-pipeline-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
