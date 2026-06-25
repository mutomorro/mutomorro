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
  const [config, setConfig] = useState(null)
  const [pool, setPool] = useState(null)
  const [reconcile, setReconcile] = useState(null)

  function loadConfig() {
    return fetch('/api/admin/newsletter-config')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { setConfig(d.config); setPool(d.pool) })
      .catch((e) => console.error(e))
  }
  function loadReconcile() {
    return fetch('/api/admin/newsletter/reconcile')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setReconcile)
      .catch((e) => console.error(e))
  }

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
    loadConfig()
    loadReconcile()
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
      {/* Send-health banner — loud when the auto-send cron is paused */}
      {config && !config.enabled && (
        <SendHealthBanner theme={theme} config={config} />
      )}

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

      {/* Send health: pool gauge + settings + dedup health */}
      {config && (
        <SendHealth theme={theme} config={config} pool={pool} onSaved={loadConfig} />
      )}

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

      {/* Counter integrity — stored total_* vs recomputed source-of-truth */}
      {reconcile?.summary?.drifted > 0 && (
        <CounterIntegrity theme={theme} reconcile={reconcile} onReconciled={loadReconcile} />
      )}

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

function relTime(dateStr) {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  if (months < 12) return `${months} months ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SendHealthBanner({ theme, config }) {
  return (
    <div style={{
      background: theme.danger + '14',
      border: `1px solid ${theme.danger}55`,
      borderRadius: '10px',
      padding: '16px 18px',
      marginBottom: '24px',
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
    }}>
      <span aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1.2 }}>⏸</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: 500, color: theme.danger, marginBottom: '4px' }}>
          Auto-send is paused{config.paused_at ? ` — since ${shortDate(config.paused_at)} (${relTime(config.paused_at)})` : ''}
        </div>
        {config.paused_reason && (
          <div style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.5 }}>
            {config.paused_reason}
          </div>
        )}
        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '6px' }}>
          The daily cron will not send while paused. Manual sends from “Send a newsletter” still work. Resume in Send engine settings below.
        </div>
      </div>
    </div>
  )
}

function SendHealth({ theme, config, pool, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  function startEdit() {
    setForm({
      enabled: config.enabled,
      batch_size: config.batch_size,
      daily_cap: config.daily_cap,
      bounce_rate_threshold: config.bounce_rate_threshold,
      skip_weekends: config.skip_weekends,
      domain_exclusions_enabled: config.domain_exclusions_enabled,
      summary_email: config.summary_email || '',
    })
    setMsg(null)
    setEditing(true)
  }

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const payload = {
        enabled: !!form.enabled,
        batch_size: parseInt(form.batch_size, 10),
        daily_cap: parseInt(form.daily_cap, 10),
        bounce_rate_threshold: parseFloat(form.bounce_rate_threshold),
        skip_weekends: !!form.skip_weekends,
        domain_exclusions_enabled: !!form.domain_exclusions_enabled,
        summary_email: form.summary_email,
      }
      const r = await fetch('/api/admin/newsletter-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error('save failed')
      await onSaved()
      setEditing(false)
      setMsg({ ok: true, text: 'Settings saved.' })
    } catch (e) {
      setMsg({ ok: false, text: 'Could not save settings.' })
    } finally {
      setSaving(false)
    }
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const capMismatch = config.batch_size > config.daily_cap

  return (
    <Section theme={theme} title="Send engine" style={{ marginBottom: '24px' }}>
      {/* Pool gauge */}
      {pool && (
        <div className="admin-lastsend-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '18px' }}>
          <Metric theme={theme} label="Sendable pool" value={(pool.activeContacts || 0).toLocaleString()} sub="active + confirmed" />
          <Metric theme={theme} label="Already sent to" value={(pool.uniqueSent || 0).toLocaleString()} sub="unique contacts" />
          <Metric theme={theme} label="Remaining" value={(pool.remaining || 0).toLocaleString()} sub="never sent yet" />
          <Metric
            theme={theme}
            label="Cron"
            value={config.enabled ? 'On' : 'Paused'}
            highlight={config.enabled ? theme.success : theme.danger}
            sub={config.last_send_date ? `last ${shortDate(config.last_send_date)}` : 'never run'}
          />
        </div>
      )}

      {/* Warnings */}
      {!config.domain_exclusions_enabled && (
        <div style={{ fontSize: '12px', color: theme.warning, marginBottom: capMismatch ? '4px' : '14px' }}>
          ⚠ Domain exclusions are off — competitor / free-provider blocks won’t apply on send.
        </div>
      )}
      {capMismatch && (
        <div style={{ fontSize: '12px', color: theme.warning, marginBottom: '14px' }}>
          ⚠ Batch size ({config.batch_size}) exceeds the daily cap ({config.daily_cap}).
        </div>
      )}

      {!editing ? (
        <>
          <div className="admin-breakdown-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 28px' }}>
            <SettingRow theme={theme} label="Auto-send cron" value={config.enabled ? 'Enabled' : 'Paused'} />
            <SettingRow theme={theme} label="Batch size" value={config.batch_size} />
            <SettingRow theme={theme} label="Daily cap" value={config.daily_cap} />
            <SettingRow theme={theme} label="Bounce-rate threshold" value={`${config.bounce_rate_threshold}%`} />
            <SettingRow theme={theme} label="Skip weekends" value={config.skip_weekends ? 'Yes' : 'No'} />
            <SettingRow theme={theme} label="Domain exclusions" value={config.domain_exclusions_enabled ? 'On' : 'Off'} />
            <SettingRow theme={theme} label="Summary email" value={config.summary_email || '—'} />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={startEdit} style={btnSecondary(theme)}>Edit settings</button>
            {msg && <span style={{ fontSize: '13px', color: msg.ok ? theme.success : theme.danger }}>{msg.text}</span>}
          </div>
        </>
      ) : (
        <>
          <div className="admin-breakdown-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 28px' }}>
            <ToggleField theme={theme} label="Auto-send cron" checked={!!form.enabled} onChange={(v) => set('enabled', v)} hint={!form.enabled ? 'Enabling clears the pause reason.' : 'Daily paced drain active.'} />
            <ToggleField theme={theme} label="Skip weekends" checked={!!form.skip_weekends} onChange={(v) => set('skip_weekends', v)} />
            <NumField theme={theme} label="Batch size" value={form.batch_size} onChange={(v) => set('batch_size', v)} />
            <NumField theme={theme} label="Daily cap" value={form.daily_cap} onChange={(v) => set('daily_cap', v)} />
            <NumField theme={theme} label="Bounce-rate threshold (%)" value={form.bounce_rate_threshold} onChange={(v) => set('bounce_rate_threshold', v)} step="0.1" />
            <ToggleField theme={theme} label="Domain exclusions" checked={!!form.domain_exclusions_enabled} onChange={(v) => set('domain_exclusions_enabled', v)} />
            <TextField theme={theme} label="Summary email" value={form.summary_email} onChange={(v) => set('summary_email', v)} wide />
          </div>
          <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={save} disabled={saving} style={btnPrimary(theme, saving)}>{saving ? 'Saving…' : 'Save settings'}</button>
            <button onClick={() => { setEditing(false); setMsg(null) }} disabled={saving} style={btnSecondary(theme)}>Cancel</button>
            {msg && <span style={{ fontSize: '13px', color: msg.ok ? theme.success : theme.danger }}>{msg.text}</span>}
          </div>
        </>
      )}
    </Section>
  )
}

function CounterIntegrity({ theme, reconcile, onReconciled }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const s = reconcile.summary
  const drifted = reconcile.drifted || []

  async function backfill() {
    if (!window.confirm(`Recompute and overwrite the stored counters on ${s.drifted} send${s.drifted === 1 ? '' : 's'} to match the source-of-truth recipient rows? No email is sent.`)) return
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/admin/newsletter/reconcile', { method: 'POST' })
      if (!r.ok) throw new Error()
      const d = await r.json()
      await onReconciled()
      setMsg({ ok: true, text: `Backfilled ${d.updated} send${d.updated === 1 ? '' : 's'}.` })
    } catch (e) {
      setMsg({ ok: false, text: 'Backfill failed.' })
    } finally {
      setBusy(false)
    }
  }

  const cols = '2.4fr 1fr 1fr 1fr 1fr'
  return (
    <Section theme={theme} title="Counter integrity" style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.55, margin: '0 0 14px' }}>
        The dashboard rates above are computed live from recipient rows, so they’re correct. But the{' '}
        <strong style={{ color: theme.textPrimary, fontWeight: 500 }}>stored</strong> counters on{' '}
        <strong style={{ color: theme.textPrimary, fontWeight: 500 }}>{s.drifted}</strong> of {s.sends} sends are stale
        — stored delivered totals {s.storedDelivered.toLocaleString()} vs the true {s.realDelivered.toLocaleString()};
        opens {s.storedOpened.toLocaleString()} vs {s.realOpened.toLocaleString()}. Backfilling rewrites the stored
        columns to match (a one-off cleanup; future sends self-maintain).
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '560px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: '8px', padding: '8px 4px',
            borderBottom: `1px solid ${theme.headerBorder}`, fontSize: '11px', color: theme.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <div>Send</div><div>Delivered</div><div>Opens</div><div>Clicks</div><div>Bounces</div>
          </div>
          {drifted.slice(0, 30).map((row) => (
            <div key={row.id} style={{
              display: 'grid', gridTemplateColumns: cols, gap: '8px', padding: '12px 4px',
              borderBottom: `1px solid ${theme.rowBorder}`, fontSize: '13px', color: theme.textSecondary, alignItems: 'center',
            }}>
              <div style={{ color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.subject || '(untitled)'}
                <span style={{ fontSize: '11px', color: theme.textMuted, marginLeft: '8px' }}>{shortDate(row.createdAt)}</span>
              </div>
              <DriftCell theme={theme} stored={row.stored.delivered} real={row.real.delivered} />
              <DriftCell theme={theme} stored={row.stored.opened} real={row.real.opened} />
              <DriftCell theme={theme} stored={row.stored.clicked} real={row.real.clicked} />
              <DriftCell theme={theme} stored={row.stored.bounced} real={row.real.bounced} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button onClick={backfill} disabled={busy} style={btnPrimary(theme, busy)}>
          {busy ? 'Recomputing…' : 'Recompute stored counters'}
        </button>
        {msg && <span style={{ fontSize: '13px', color: msg.ok ? theme.success : theme.danger }}>{msg.text}</span>}
      </div>
    </Section>
  )
}

function DriftCell({ theme, stored, real }) {
  if (stored === real) {
    return <div style={{ color: theme.textMuted }}>{real.toLocaleString()}</div>
  }
  return (
    <div>
      <span style={{ color: theme.textMuted, textDecoration: 'line-through' }}>{stored.toLocaleString()}</span>
      <span style={{ color: theme.textMuted, margin: '0 5px' }}>→</span>
      <span style={{ color: theme.success, fontWeight: 500 }}>{real.toLocaleString()}</span>
    </div>
  )
}

function SettingRow({ theme, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${theme.rowBorder}`, fontSize: '13px' }}>
      <span style={{ color: theme.textSecondary }}>{label}</span>
      <span style={{ color: theme.textPrimary }}>{value}</span>
    </div>
  )
}

function ToggleField({ theme, label, checked, onChange, hint }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          style={{
            width: '38px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
            background: checked ? theme.accent : theme.inputBg, position: 'relative', flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: checked ? '19px' : '3px', width: '16px', height: '16px',
            borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }} />
        </button>
        <span style={{ fontSize: '13px', color: theme.textSecondary }}>{label}</span>
      </label>
      {hint && <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', marginLeft: '48px' }}>{hint}</div>}
    </div>
  )
}

function fieldLabel(theme) {
  return { display: 'block', fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }
}
function fieldInput(theme) {
  return {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px',
    border: `1px solid ${theme.cardBorder}`, background: theme.inputBg, color: theme.textPrimary,
    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
  }
}
function NumField({ theme, label, value, onChange, step }) {
  return (
    <div>
      <label style={fieldLabel(theme)}>{label}</label>
      <input type="number" step={step || '1'} value={value} onChange={(e) => onChange(e.target.value)} style={fieldInput(theme)} />
    </div>
  )
}
function TextField({ theme, label, value, onChange, wide }) {
  return (
    <div style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <label style={fieldLabel(theme)}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={fieldInput(theme)} />
    </div>
  )
}

function btnPrimary(theme, busy) {
  return {
    padding: '9px 18px', borderRadius: '6px', border: 'none', background: theme.accent, color: '#fff',
    fontSize: '13px', fontWeight: 400, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: 'inherit',
  }
}
function btnSecondary(theme) {
  return {
    padding: '9px 18px', borderRadius: '6px', border: `1px solid ${theme.cardBorder}`, background: 'transparent',
    color: theme.textSecondary, fontSize: '13px', fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
  }
}

const emptyText = (theme) => ({ fontSize: '14px', color: theme.textMuted, fontStyle: 'italic' })
