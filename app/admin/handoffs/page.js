'use client'

import { useState, useEffect, useCallback } from 'react'

const priorityColours = {
  high: '#FF4279',
  medium: '#F59E0B',
  low: '#2DD4BF',
}

const typeBadgeColours = {
  lead: { bg: 'rgba(155,81,224,0.15)', text: '#C9A4F0' },
  task: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  idea: { bg: 'rgba(45,212,191,0.15)', text: '#2DD4BF' },
  question: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA' },
}

const projectLabels = {
  'command-centre': 'Command Centre',
  website: 'Website',
  outreach: 'Outreach',
  marketing: 'Marketing',
  'tender-writer': 'Tender Writer',
  'tender-finder': 'Tender Finder',
  james: 'James',
}

const targetOptions = ['command-centre', 'website', 'outreach', 'marketing', 'tender-writer', 'tender-finder']
const sourceOptions = ['command-centre', 'website', 'outreach', 'marketing', 'tender-writer', 'tender-finder', 'james']
const typeOptions = ['lead', 'task', 'idea', 'question']
const priorityOptions = ['high', 'medium', 'low']

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

export default function HandoffsPage() {
  const [handoffs, setHandoffs] = useState([])
  const [counts, setCounts] = useState({ open: 0, pickedUp: 0, completedThisWeek: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [filterTarget, setFilterTarget] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  // Add form
  const [formOpen, setFormOpen] = useState(false)
  const [formTarget, setFormTarget] = useState('command-centre')
  const [formType, setFormType] = useState('task')
  const [formPriority, setFormPriority] = useState('medium')
  const [formTitle, setFormTitle] = useState('')
  const [formDetail, setFormDetail] = useState('')
  const [saving, setSaving] = useState(false)

  // Expanded detail
  const [expandedId, setExpandedId] = useState(null)

  const fetchHandoffs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterTarget) params.set('target', filterTarget)
      if (filterSource) params.set('source', filterSource)
      if (filterType) params.set('type', filterType)
      if (filterPriority) params.set('priority', filterPriority)
      if (showCompleted) params.set('showCompleted', 'true')

      const res = await fetch(`/api/admin/handoffs?${params}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setHandoffs(data.handoffs || [])
      setCounts(data.counts || { open: 0, pickedUp: 0, completedThisWeek: 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterTarget, filterSource, filterType, filterPriority, showCompleted])

  useEffect(() => {
    fetchHandoffs()
  }, [fetchHandoffs])

  async function handleCreate(e) {
    e.preventDefault()
    if (!formTitle.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/admin/handoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_project: 'james',
          target_project: formTarget,
          type: formType,
          priority: formPriority,
          title: formTitle.trim(),
          detail: formDetail.trim() || null,
        }),
      })

      if (res.ok) {
        setFormTitle('')
        setFormDetail('')
        setFormType('task')
        setFormPriority('medium')
        setFormOpen(false)
        fetchHandoffs()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const res = await fetch('/api/admin/handoffs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        fetchHandoffs()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Handoffs
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Cross-project tasks and leads</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <MetricCard label="Open" value={loading ? null : counts.open} colour={counts.open > 0 ? '#F59E0B' : null} />
        <MetricCard label="Picked up" value={loading ? null : counts.pickedUp} colour={counts.pickedUp > 0 ? '#9B51E0' : null} />
        <MetricCard label="Completed this week" value={loading ? null : counts.completedThisWeek} colour={counts.completedThisWeek > 0 ? '#2DD4BF' : null} />
      </div>

      {error && (
        <div style={{ ...cardStyle, borderLeft: '3px solid #FF4279', padding: '16px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#FF4279' }}>Failed to load handoffs. Try refreshing.</p>
        </div>
      )}

      {/* Add handoff (collapsible) */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <button
          onClick={() => setFormOpen(!formOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', transition: 'transform 0.2s', transform: formOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
          Add handoff
        </button>

        {formOpen && (
          <form onSubmit={handleCreate} style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row: target, type, priority */}
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Target project</label>
                  <select value={formTarget} onChange={(e) => setFormTarget(e.target.value)} style={inputStyle}>
                    {targetOptions.map((o) => <option key={o} value={o}>{projectLabels[o]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} style={inputStyle}>
                    {typeOptions.map((o) => <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} style={inputStyle}>
                    {priorityOptions.map((o) => <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  placeholder="What needs to happen?"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Detail</label>
                <textarea
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  rows={3}
                  placeholder="Any extra context..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={saving || !formTitle.trim()}
                  style={{
                    padding: '10px 24px',
                    background: '#9B51E0',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 400,
                    cursor: saving ? 'wait' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    borderRadius: '0',
                    fontFamily: 'inherit',
                    letterSpacing: '0.04em',
                  }}
                >
                  {saving ? 'Creating...' : 'Create handoff'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value)} style={filterStyle}>
          <option value="">All targets</option>
          {targetOptions.map((o) => <option key={o} value={o}>{projectLabels[o]}</option>)}
        </select>
        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} style={filterStyle}>
          <option value="">All sources</option>
          {sourceOptions.map((o) => <option key={o} value={o}>{projectLabels[o]}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={filterStyle}>
          <option value="">All types</option>
          {typeOptions.map((o) => <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={filterStyle}>
          <option value="">All priorities</option>
          {priorityOptions.map((o) => <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o}</option>)}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span
              onClick={() => setShowCompleted(!showCompleted)}
              style={{
                width: '32px',
                height: '18px',
                borderRadius: '9px',
                background: showCompleted ? '#9B51E0' : 'rgba(255,255,255,0.12)',
                display: 'inline-block',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: showCompleted ? '16px' : '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
              }} />
            </span>
            Show completed
          </label>
        </div>
      </div>

      {/* Handoffs list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} style={{ ...cardStyle, height: '72px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : handoffs.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              No open handoffs. Everything&apos;s been picked up.
            </p>
          </div>
        ) : (
          handoffs.map((h) => {
            const isDone = h.status === 'done' || h.status === 'dismissed'
            const isExpanded = expandedId === h.id

            return (
              <div
                key={h.id}
                style={{
                  ...cardStyle,
                  borderLeft: `3px solid ${priorityColours[h.priority] || '#F59E0B'}`,
                  opacity: isDone ? 0.45 : 1,
                  padding: '16px 20px',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#fff',
                      marginBottom: '6px',
                      textDecoration: isDone ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(255,255,255,0.3)',
                    }}>
                      {h.title}
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Source → Target */}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        {projectLabels[h.source_project] || h.source_project}
                        <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.2)' }}>→</span>
                        {projectLabels[h.target_project] || h.target_project}
                      </span>

                      {/* Type badge */}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 400,
                        padding: '2px 8px',
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: (typeBadgeColours[h.type] || typeBadgeColours.task).bg,
                        color: (typeBadgeColours[h.type] || typeBadgeColours.task).text,
                      }}>
                        {h.type}
                      </span>

                      {/* Contact */}
                      {h.contacts && (
                        <a
                          href={`/admin/contacts?search=${encodeURIComponent((h.contacts.first_name || '') + ' ' + (h.contacts.last_name || ''))}`}
                          style={{ fontSize: '12px', color: '#9B51E0', textDecoration: 'none' }}
                        >
                          {`${h.contacts.first_name || ''} ${h.contacts.last_name || ''}`.trim()}
                        </a>
                      )}

                      {/* Organisation */}
                      {h.organisations && (
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                          {h.organisations.name}
                        </span>
                      )}

                      {/* Time */}
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                        {relativeTime(h.created_at)}
                      </span>
                    </div>

                    {/* Detail (expandable) */}
                    {h.detail && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : h.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'inherit',
                          }}
                        >
                          {isExpanded ? 'Hide detail ▴' : 'Show detail ▾'}
                        </button>
                        {isExpanded && (
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {h.detail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status controls */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {h.status === 'open' && (
                      <>
                        <StatusButton label="Pick up" onClick={() => updateStatus(h.id, 'picked-up')} colour="#9B51E0" />
                        <StatusButton label="Dismiss" onClick={() => updateStatus(h.id, 'dismissed')} colour="rgba(255,255,255,0.15)" />
                      </>
                    )}
                    {h.status === 'picked-up' && (
                      <StatusButton label="Done" onClick={() => updateStatus(h.id, 'done')} colour="#2DD4BF" />
                    )}
                    {isDone && (
                      <StatusButton label="Reopen" onClick={() => updateStatus(h.id, 'open')} colour="rgba(255,255,255,0.15)" />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
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
          .admin-form-grid {
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

function MetricCard({ label, value, colour }) {
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
        <div style={{ width: '40px', height: '28px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 500, color: colour || '#fff' }}>
          {value}
        </div>
      )}
    </div>
  )
}

function StatusButton({ label, onClick, colour }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 400,
        background: colour,
        border: 'none',
        borderRadius: '0',
        color: '#fff',
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => { e.target.style.opacity = '0.8' }}
      onMouseLeave={(e) => { e.target.style.opacity = '1' }}
    >
      {label}
    </button>
  )
}

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  padding: '20px',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0',
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const filterStyle = {
  padding: '7px 10px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0',
  color: 'rgba(255,255,255,0.7)',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
}
