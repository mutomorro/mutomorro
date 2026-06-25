'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function EnquiriesPage() {
  const { theme } = useAdminTheme()
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ total: 0, unresponded: 0 })
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setItems(data.items || [])
      setCounts(data.counts || { total: 0, unresponded: 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleResponded(item) {
    setBusyId(item.id)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, responded: !item.responded }),
      })
      if (res.ok) {
        const updated = await res.json()
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i)))
        setCounts((prev) => ({ ...prev, unresponded: prev.unresponded + (updated.responded ? -1 : 1) }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBusyId(null)
    }
  }

  const visible = showAll ? items : items.filter((i) => !i.responded)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>Enquiries</h1>
          <p style={{ fontSize: '14px', color: theme.textMuted }}>
            {counts.unresponded} awaiting reply · {counts.total} total
          </p>
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            padding: '8px 16px', fontSize: '13px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
            color: theme.textSecondary, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px',
          }}
        >
          {showAll ? 'Show awaiting only' : 'Show all'}
        </button>
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
            {showAll ? 'No enquiries yet.' : 'Nothing awaiting a reply. 🎉'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.map((item) => (
            <EnquiryCard key={item.id} theme={theme} item={item} busy={busyId === item.id} onToggle={() => toggleResponded(item)} />
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  )
}

function EnquiryCard({ theme, item, busy, onToggle }) {
  const c = item.contact
  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${item.responded ? theme.cardBorder : theme.accentBorder}`,
      borderLeft: `3px solid ${item.responded ? theme.cardBorder : theme.accent}`,
      borderRadius: '10px',
      padding: '18px 20px',
      opacity: item.responded ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 500, color: theme.textPrimary }}>{item.name || 'Unknown'}</span>
            {c?.engaged && (
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: theme.accentBg, color: theme.accent }}>
                Engaged subscriber{c.tier ? ` · T${c.tier}` : ''}
              </span>
            )}
            {c && !c.engaged && (
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: theme.inputBg, color: theme.textMuted }}>
                Known contact
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={onToggle}
          disabled={busy}
          style={{
            padding: '7px 16px', fontSize: '13px', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', borderRadius: '6px',
            background: item.responded ? 'transparent' : theme.accent,
            color: item.responded ? theme.textSecondary : '#fff',
            border: item.responded ? `1px solid ${theme.cardBorder}` : 'none',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {item.responded ? 'Mark unresponded' : 'Mark responded'}
        </button>
        <a
          href={`mailto:${item.email}?subject=Re: your enquiry`}
          style={{ fontSize: '13px', color: theme.accent, textDecoration: 'none' }}
        >
          Reply by email →
        </a>
        {c && (
          <span style={{ fontSize: '12px', color: theme.textMuted, marginLeft: 'auto' }}>
            {c.downloadCount} download{c.downloadCount === 1 ? '' : 's'} · {c.opens} open{c.opens === 1 ? '' : 's'}
            {c.newsletterStatus ? ` · ${c.newsletterStatus}` : ''}
          </span>
        )}
        {item.responded && item.responded_at && (
          <span style={{ fontSize: '12px', color: theme.textMuted, marginLeft: c ? 0 : 'auto' }}>
            Responded {relativeTime(item.responded_at)}
          </span>
        )}
      </div>
    </div>
  )
}
