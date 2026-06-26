'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  const months = Math.floor(diffDays / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

// Dispositions, in triage order. Colour is resolved against the theme at render.
const DISPOSITIONS = [
  { key: 'lead', label: 'Lead', tone: 'success' },
  { key: 'responded', label: 'Responded', tone: 'muted' },
  { key: 'dismissed', label: 'Dismiss', tone: 'muted' },
  { key: 'spam', label: 'Spam', tone: 'danger' },
]
const FILTERS = [
  { key: 'new', label: 'New' },
  { key: 'lead', label: 'Leads' },
  { key: 'responded', label: 'Responded' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'spam', label: 'Spam' },
  { key: 'all', label: 'All' },
]

const statusOf = (i) => i.status || (i.responded ? 'responded' : 'new')

export default function EnquiriesPage() {
  const { theme } = useAdminTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('new')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const counts = useMemo(() => {
    const c = { all: items.length, new: 0, lead: 0, responded: 0, dismissed: 0, spam: 0 }
    for (const i of items) { const s = statusOf(i); if (s in c) c[s]++ }
    return c
  }, [items])

  const visible = filter === 'all' ? items : items.filter((i) => statusOf(i) === filter)

  async function setDisposition(item, status) {
    setBusyId(item.id)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBusyId(null)
    }
  }

  async function deleteEnquiry(item, alsoContact) {
    setBusyId(item.id)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, deleteContact: alsoContact }),
      })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>Enquiries</h1>
        <p style={{ fontSize: '14px', color: theme.textMuted }}>
          {counts.new} to triage · {counts.lead} lead{counts.lead === 1 ? '' : 's'} · {counts.all} total
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '20px',
              background: filter === f.key ? theme.accent : theme.cardBg,
              color: filter === f.key ? '#fff' : theme.textSecondary,
              border: `1px solid ${filter === f.key ? theme.accent : theme.cardBorder}`,
            }}
          >
            {f.label} <span style={{ opacity: 0.7 }}>{counts[f.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '120px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: theme.textLabel, fontStyle: 'italic', margin: 0 }}>
            {filter === 'new' ? 'Nothing left to triage. 🎉' : 'No enquiries here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.map((item) => (
            <EnquiryCard
              key={item.id}
              theme={theme}
              item={item}
              status={statusOf(item)}
              busy={busyId === item.id}
              onDispose={(s) => setDisposition(item, s)}
              onDelete={(alsoContact) => deleteEnquiry(item, alsoContact)}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  )
}

function EnquiryCard({ theme, item, status, busy, onDispose, onDelete }) {
  const c = item.contact
  const [confirmDel, setConfirmDel] = useState(false)
  const [alsoContact, setAlsoContact] = useState(false)

  const toneColour = { success: theme.success, danger: theme.danger, muted: theme.textMuted }
  const statusMeta = {
    new: { label: 'New', colour: theme.accent },
    lead: { label: 'Lead', colour: theme.success },
    responded: { label: 'Responded', colour: theme.textMuted },
    dismissed: { label: 'Dismissed', colour: theme.textMuted },
    spam: { label: 'Spam', colour: theme.danger },
  }[status] || { label: status, colour: theme.textMuted }

  const handled = status === 'responded' || status === 'dismissed' || status === 'spam'

  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${status === 'new' ? theme.accentBorder : status === 'lead' ? theme.success : theme.cardBorder}`,
      borderLeft: `3px solid ${statusMeta.colour}`,
      borderRadius: '10px',
      padding: '18px 20px',
      opacity: handled ? 0.72 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 500, color: theme.textPrimary }}>{item.name || 'Unknown'}</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: theme.cardBgHover, color: statusMeta.colour, fontWeight: 500 }}>
              {statusMeta.label}
            </span>
            {c?.engaged && (
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: theme.accentBg, color: theme.accent }}>
                Engaged{c.tier ? ` · T${c.tier}` : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '3px' }}>
            <a href={`mailto:${item.email}`} style={{ color: theme.textSecondary, textDecoration: 'none' }}>{item.email}</a>
            {item.organisation ? ` · ${item.organisation}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: theme.textMuted }}>{relativeTime(item.created_at)}</div>
          {item.service && (
            <div style={{ fontSize: '11px', color: theme.accent, marginTop: '4px' }}>{item.service}</div>
          )}
        </div>
      </div>

      {item.message && (
        <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6, margin: '10px 0', whiteSpace: 'pre-wrap' }}>
          {item.message}
        </p>
      )}

      {confirmDel ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap', padding: '10px 12px', background: theme.cardBgHover, borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: theme.danger }}>Delete this enquiry?</span>
          <label style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={alsoContact} onChange={(e) => setAlsoContact(e.target.checked)} style={{ cursor: 'pointer' }} />
            also remove the contact record
          </label>
          <button onClick={() => onDelete(alsoContact)} disabled={busy} style={{ padding: '6px 14px', fontSize: '13px', background: theme.danger, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {busy ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button onClick={() => setConfirmDel(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {DISPOSITIONS.map((d) => {
            const active = status === d.key
            return (
              <button
                key={d.key}
                onClick={() => onDispose(active ? 'new' : d.key)}
                disabled={busy}
                title={active ? 'Click to move back to New' : ''}
                style={{
                  padding: '6px 12px', fontSize: '13px', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', borderRadius: '6px',
                  background: active ? (toneColour[d.tone] || theme.accent) : 'transparent',
                  color: active ? '#fff' : (toneColour[d.tone] || theme.textSecondary),
                  border: `1px solid ${active ? (toneColour[d.tone] || theme.accent) : theme.cardBorder}`,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {d.label}
              </button>
            )
          })}
          <a href={`mailto:${item.email}?subject=Re: your enquiry`} style={{ fontSize: '13px', color: theme.accent, textDecoration: 'none', padding: '6px 4px' }}>
            Reply →
          </a>
          <button onClick={() => { setConfirmDel(true); setAlsoContact(false) }} disabled={busy} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: theme.textMuted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Delete
          </button>
        </div>
      )}

      {c && (
        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '10px' }}>
          {c.downloadCount} download{c.downloadCount === 1 ? '' : 's'} · {c.opens} open{c.opens === 1 ? '' : 's'}
          {c.newsletterStatus ? ` · ${c.newsletterStatus}` : ''}
        </div>
      )}
    </div>
  )
}
