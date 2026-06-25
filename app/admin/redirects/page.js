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
  return months === 1 ? '1mo ago' : `${months}mo ago`
}

export default function RedirectsPage() {
  const { theme } = useAdminTheme()
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ total: 0, real: 0, bot: 0, brokenInternal: 0, realHits: 0 })
  const [loading, setLoading] = useState(true)
  const [hideBots, setHideBots] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/redirects')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setItems(data.items || [])
      setCounts(data.counts || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function resolve(id, resolved_to) {
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/redirects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolved_to }),
      })
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) { console.error(err) } finally { setBusyId(null) }
  }

  async function dismiss(id) {
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/redirects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dismiss: true }),
      })
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) { console.error(err) } finally { setBusyId(null) }
  }

  const visible = hideBots ? items.filter((i) => !i.isBot) : items
  const brokenInternal = items.filter((i) => i.isInternal && !i.isBot)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>404s</h1>
          <p style={{ fontSize: '14px', color: theme.textMuted }}>
            {counts.real || 0} real misses ({(counts.realHits || 0).toLocaleString()} hits) · {counts.bot || 0} bot/scanner
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.textSecondary, cursor: 'pointer' }}>
          <input type="checkbox" checked={hideBots} onChange={(e) => setHideBots(e.target.checked)} />
          Hide bot noise
        </label>
      </div>

      {/* Broken internal links callout */}
      {brokenInternal.length > 0 && (
        <div style={{ background: theme.danger + '14', border: `1px solid ${theme.danger}55`, borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: theme.danger, marginBottom: '6px' }}>
            {brokenInternal.length} broken internal link{brokenInternal.length === 1 ? '' : 's'} — we link to these 404s from our own site
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary }}>
            {brokenInternal.slice(0, 5).map((b) => b.path).join(' · ')}
          </div>
        </div>
      )}

      {/* Note: recording vs live redirect */}
      <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '16px', lineHeight: 1.5 }}>
        Resolving records the intended target and clears the 404 from this queue. To make a redirect go live, add it to <code>next.config</code> — that wiring is a separate step.
      </p>

      {/* Table */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', overflowX: 'auto' }}>
        <div style={{ minWidth: '640px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.6fr 0.8fr 2.4fr', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${theme.headerBorder}`, fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>Path</div>
            <div style={{ textAlign: 'right' }}>Hits</div>
            <div>Last hit</div>
            <div>Resolve to</div>
          </div>

          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: '14px 16px' }}>
                <div style={{ height: '16px', background: theme.inputBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: theme.textLabel, fontSize: '14px', fontStyle: 'italic' }}>
              No 404s to triage. 🎉
            </div>
          ) : (
            visible.map((item) => (
              <RedirectRow key={item.id} theme={theme} item={item} busy={busyId === item.id} onResolve={resolve} onDismiss={dismiss} />
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  )
}

function RedirectRow({ theme, item, busy, onResolve, onDismiss }) {
  const [target, setTarget] = useState('')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 0.6fr 0.8fr 2.4fr', gap: '10px', padding: '12px 16px', borderBottom: `1px solid ${theme.rowBorder}`, alignItems: 'center', fontSize: '13px' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }} title={item.path}>
          {item.isInternal && !item.isBot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.danger, flexShrink: 0 }} title="Linked from our own site" />}
          {item.path}
        </div>
        {item.referrer && (
          <div style={{ fontSize: '11px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.referrer}>
            ← {item.referrer}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', color: item.hit_count > 10 ? theme.textPrimary : theme.textSecondary, fontWeight: item.hit_count > 10 ? 500 : 400 }}>
        {(item.hit_count || 0).toLocaleString()}
      </div>
      <div style={{ fontSize: '12px', color: theme.textMuted }}>{relativeTime(item.last_hit_at)}</div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="/correct-path"
          onKeyDown={(e) => { if (e.key === 'Enter' && target.trim()) onResolve(item.id, target.trim()) }}
          style={{
            flex: 1, minWidth: 0, padding: '5px 8px', background: theme.inputBg, border: `1px solid ${theme.cardBorder}`,
            color: theme.textPrimary, fontSize: '12px', fontFamily: 'inherit', outline: 'none', borderRadius: '4px',
          }}
        />
        <button
          onClick={() => target.trim() && onResolve(item.id, target.trim())}
          disabled={busy || !target.trim()}
          style={{ padding: '5px 10px', fontSize: '12px', background: target.trim() ? theme.accentBg : theme.cardBg, color: target.trim() ? theme.accent : theme.textLabel, border: 'none', borderRadius: '4px', cursor: target.trim() ? 'pointer' : 'default', fontFamily: 'inherit', flexShrink: 0 }}
        >
          Resolve
        </button>
        <button
          onClick={() => onDismiss(item.id)}
          disabled={busy}
          title="Dismiss as noise"
          style={{ padding: '5px 8px', fontSize: '12px', background: theme.cardBg, color: theme.textMuted, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
