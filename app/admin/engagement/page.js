'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

// Initial state from the URL (deep-links, e.g. from the Overview pool cards).
function paramFrom(key, allowed, fallback) {
  if (typeof window === 'undefined') return fallback
  const v = new URLSearchParams(window.location.search).get(key)
  return v && allowed.includes(v) ? v : fallback
}

// Deep-link-only filters (from the Overview UK-funnel boxes). Not shown as chips
// to avoid clutter; when one is active a labelled, clearable pill is shown instead.
const DEEP_LINK_FILTERS = {
  uk_subscribed: 'UK · subscribed',
  uk_engaged: 'UK · subscribed + engaged',
  uk_target: 'UK · Target (warm + fit)',
  uk_notsub: 'UK · not subscribed',
  uk_target_audience: 'Target Audience (fit, reachable)',
  uk_optedout: 'UK · opted-out',
}

const PEOPLE_FILTERS = [
  { value: 'golden', label: '★ Golden ticket' },
  { value: 'engaged', label: 'Engaged (warm)' },
  { value: 'all', label: 'Most engaged' },
  { value: 'uk', label: 'UK-based' },
  { value: 'recent', label: 'Recently active' },
  { value: 'decision_makers', label: 'Decision-makers' },
  { value: 'repeat', label: 'Repeat downloaders' },
  { value: 'clickers', label: 'Clicked a link' },
  { value: 'enquirers', label: 'Enquired' },
]

const DEFAULT_WEIGHTS = { wClick: 8, wOpen: 1, wDownload: 1.5, wRecent30: 20, wRecent90: 10, wSignal: 15, wDm: 12, wOrg: 6, wUk: 18 }
const WEIGHT_FIELDS = [
  { key: 'wUk', label: 'UK-based', max: 40, step: 1 },
  { key: 'wDm', label: 'Decision-maker', max: 40, step: 1 },
  { key: 'wClick', label: 'Newsletter click', max: 20, step: 1 },
  { key: 'wSignal', label: 'Enquiry / high signal', max: 40, step: 1 },
  { key: 'wRecent30', label: 'Downloaded in 30 days', max: 40, step: 1 },
  { key: 'wRecent90', label: 'Downloaded in 90 days', max: 40, step: 1 },
  { key: 'wOrg', label: 'Work email', max: 20, step: 1 },
  { key: 'wOpen', label: 'Newsletter open', max: 10, step: 0.5 },
  { key: 'wDownload', label: 'Each download', max: 10, step: 0.5 },
]

function relativeTime(dateStr) {
  if (!dateStr) return null
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  const months = Math.floor(diffDays / 30)
  return months === 1 ? '1mo ago' : `${months}mo ago`
}

function titleCase(s) {
  if (!s) return ''
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── CSV export ─────────────────────────────────────────────────────
function csvEscape(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
function downloadCsv(filename, cols, rows) {
  const lines = [cols.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
const PEOPLE_CSV_COLS = ['First Name', 'Last Name', 'Email', 'Company', 'Title', 'Seniority', 'Tier', 'Score', 'Clicks', 'Opens', 'Downloads', 'Last Download', 'Decision Maker', 'Domain']
function peopleCsvRow(p) {
  return [p.firstName, p.lastName, p.email || '', p.organisation || '', p.role || '', p.seniority || '', p.tier || '', p.score, p.clicks, p.opens, p.downloads, p.lastDownload ? new Date(p.lastDownload).toISOString().slice(0, 10) : '', p.isDecisionMaker ? 'yes' : '', p.domain || '']
}
const ORG_CSV_COLS = ['Organisation', 'Domain', 'People', 'Downloaders', 'Opens', 'Clicks', 'Decision Makers', 'Active 90d', 'Score']
function orgCsvRow(o) {
  return [o.orgName || '', o.domain, o.people, o.downloaders, o.opens, o.clicks, o.decisionMakers, o.active90d, o.score]
}

export default function EngagementPage() {
  const { theme } = useAdminTheme()
  const [tab, setTab] = useState(() => paramFrom('tab', ['people', 'orgs'], 'people'))

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>Engagement</h1>
        <p style={{ fontSize: '14px', color: theme.textMuted }}>Who and which organisations are actually engaging — ranked, so the signal stops getting lost.</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: `1px solid ${theme.headerBorder}` }}>
        {[['people', 'People'], ['orgs', 'Organisations']].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            style={{
              padding: '10px 16px', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: tab === v ? theme.textPrimary : theme.textMuted,
              borderBottom: tab === v ? `2px solid ${theme.accent}` : '2px solid transparent', marginBottom: '-1px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'people' ? <PeopleTab theme={theme} /> : <OrgsTab theme={theme} />}
    </div>
  )
}

function PeopleTab({ theme }) {
  const [filter, setFilter] = useState(() => paramFrom('filter', [...PEOPLE_FILTERS.map((f) => f.value), ...Object.keys(DEEP_LINK_FILTERS)], 'all'))
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
  const [showWeights, setShowWeights] = useState(false)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(() => new Set())
  const [tagInput, setTagInput] = useState('')
  const [tagging, setTagging] = useState(false)
  const [tagMsg, setTagMsg] = useState(null)

  // Hydrate saved weights once.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('engagementWeights')
      if (saved) setWeights({ ...DEFAULT_WEIGHTS, ...JSON.parse(saved) })
    } catch { /* ignore */ }
  }, [])

  // Debounced load whenever filter or weights change.
  useEffect(() => {
    let active = true
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({ view: 'people', filter })
        for (const k of Object.keys(DEFAULT_WEIGHTS)) qs.set(k, String(weights[k]))
        const res = await fetch(`/api/admin/engagement?${qs}`)
        if (!res.ok) throw new Error('Failed')
        const d = await res.json()
        if (active) { setPeople(d.people || []); setSelected(new Set()) }
      } catch (e) {
        console.error(e)
      } finally {
        if (active) setLoading(false)
      }
    }, 250)
    return () => { active = false; clearTimeout(t) }
  }, [filter, weights])

  function setWeight(key, val) {
    setWeights((prev) => {
      const next = { ...prev, [key]: val }
      try { localStorage.setItem('engagementWeights', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }
  function resetWeights() {
    setWeights(DEFAULT_WEIGHTS)
    try { localStorage.removeItem('engagementWeights') } catch { /* ignore */ }
  }
  const customised = Object.keys(DEFAULT_WEIGHTS).some((k) => weights[k] !== DEFAULT_WEIGHTS[k])

  function toggleSelect(id) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function toggleAll() {
    setSelected((prev) => (prev.size === people.length ? new Set() : new Set(people.map((p) => p.id))))
  }

  async function applyTag() {
    const tag = tagInput.trim()
    if (!tag || selected.size === 0) return
    setTagging(true); setTagMsg(null)
    try {
      const res = await fetch('/api/admin/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], tag }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setTagMsg({ ok: true, text: `Tagged ${d.tagged} contact${d.tagged === 1 ? '' : 's'} “${tag}”. Filter by it in Contacts.` })
      setTagInput(''); setSelected(new Set())
    } catch (e) {
      setTagMsg({ ok: false, text: 'Tagging failed.' })
    } finally {
      setTagging(false)
    }
  }

  function exportCsv() {
    const rows = selected.size > 0 ? people.filter((p) => selected.has(p.id)) : people
    downloadCsv('engaged-people.csv', PEOPLE_CSV_COLS, rows.map(peopleCsvRow))
  }

  return (
    <div>
      {/* Filter chips + scoring/export controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        {DEEP_LINK_FILTERS[filter] && (
          <button
            onClick={() => setFilter('all')}
            title="Clear this view"
            style={{
              padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '20px',
              background: theme.accent, color: '#fff', border: `1px solid ${theme.accent}`,
            }}
          >
            {DEEP_LINK_FILTERS[filter]} ✕
          </button>
        )}
        {PEOPLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '20px',
              background: filter === f.value ? theme.accent : theme.cardBg,
              color: filter === f.value ? '#fff' : theme.textSecondary,
              border: `1px solid ${filter === f.value ? theme.accent : theme.cardBorder}`,
            }}
          >
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowWeights((v) => !v)} style={ghostBtn(theme, customised)}>
            {showWeights ? 'Hide scoring' : customised ? 'Scoring ✱' : 'Adjust scoring'}
          </button>
          <button onClick={exportCsv} style={ghostBtn(theme)}>Export CSV</button>
        </div>
      </div>

      {showWeights && (
        <WeightsPanel theme={theme} weights={weights} onChange={setWeight} onReset={resetWeights} customised={customised} />
      )}

      {/* Selection action bar */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px 16px', marginBottom: '12px', background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: 500 }}>{selected.size} selected</span>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyTag()}
            placeholder="Tag / segment name…"
            style={{ padding: '6px 10px', fontSize: '13px', background: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontFamily: 'inherit', borderRadius: '4px', outline: 'none' }}
          />
          <button onClick={applyTag} disabled={tagging || !tagInput.trim()} style={{ ...solidBtn(theme), opacity: tagging || !tagInput.trim() ? 0.6 : 1 }}>
            {tagging ? 'Tagging…' : 'Add tag'}
          </button>
          <button onClick={exportCsv} style={ghostBtn(theme)}>Export selected</button>
          <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
          {tagMsg && <span style={{ fontSize: '13px', color: tagMsg.ok ? theme.success : theme.danger, width: '100%' }}>{tagMsg.text}</span>}
        </div>
      )}
      {tagMsg && selected.size === 0 && (
        <div style={{ fontSize: '13px', color: tagMsg.ok ? theme.success : theme.danger, marginBottom: '12px' }}>{tagMsg.text}</div>
      )}

      {loading ? (
        <SkeletonList theme={theme} />
      ) : people.length === 0 ? (
        <EmptyCard theme={theme} text="No one matches this filter yet." />
      ) : (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', overflow: 'hidden' }}>
          {/* Select-all header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 18px', borderBottom: `1px solid ${theme.headerBorder}` }}>
            <input type="checkbox" checked={selected.size === people.length && people.length > 0} onChange={toggleAll} style={{ cursor: 'pointer' }} />
            <span style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {people.length} people · ranked by score
            </span>
          </div>
          {people.map((p, i) => (
            <PersonRow key={p.id} theme={theme} person={p} rank={i + 1} selected={selected.has(p.id)} onToggle={() => toggleSelect(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function WeightsPanel({ theme, weights, onChange, onReset, customised }) {
  return (
    <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>How the score is weighted</span>
        {customised && <button onClick={onReset} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Reset to defaults</button>}
      </div>
      <div className="admin-weights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 28px' }}>
        {WEIGHT_FIELDS.map((f) => (
          <div key={f.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: theme.textSecondary }}>{f.label}</span>
              <span style={{ color: theme.accent, fontWeight: 500 }}>{weights[f.key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={f.max}
              step={f.step}
              value={weights[f.key]}
              onChange={(e) => onChange(f.key, Number(e.target.value))}
              style={{ width: '100%', accentColor: theme.accent, cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>
      <p style={{ fontSize: '11px', color: theme.textLabel, marginTop: '12px', marginBottom: 0 }}>
        Saved on this device. Clicks, opens and downloads are capped (5 / 20 / 10) before weighting so a single noisy metric can’t dominate.
      </p>
      <style>{`@media (max-width: 700px) { .admin-weights-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function PersonRow({ theme, person, rank, selected, onToggle }) {
  const reasons = []
  if (person.isUk) reasons.push({ label: 'UK', tone: 'uk' })
  if (person.isDecisionMaker) reasons.push({ label: person.seniority ? titleCase(person.seniority) : 'Decision-maker', tone: 'accent' })
  if (person.highSignals > 0) reasons.push({ label: person.highSignals > 1 ? `${person.highSignals} enquiries` : 'Enquired', tone: 'danger' })
  if (person.clicks > 0) reasons.push({ label: `${person.clicks} click${person.clicks === 1 ? '' : 's'}`, tone: 'accent' })
  if (person.active30d) reasons.push({ label: 'Active 30d', tone: 'success' })
  else if (person.active90d) reasons.push({ label: 'Active 90d', tone: 'muted' })
  if (person.downloads >= 3) reasons.push({ label: `${person.downloads} downloads`, tone: 'muted' })
  if (person.opens > 0 && person.clicks === 0) reasons.push({ label: `${person.opens} opens`, tone: 'muted' })
  if (!person.isOrgEmail) reasons.push({ label: 'Personal email', tone: 'faint' })

  const lastDl = relativeTime(person.lastDownload)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: `1px solid ${theme.rowBorder}`, background: selected ? theme.accentBg : 'transparent' }}>
      <input type="checkbox" checked={selected} onChange={onToggle} style={{ cursor: 'pointer', flexShrink: 0 }} />
      <div style={{ width: '22px', textAlign: 'right', fontSize: '13px', color: theme.textMuted, flexShrink: 0 }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 500, color: theme.textPrimary }}>{person.name || person.email}</span>
          {person.role && <span style={{ fontSize: '13px', color: theme.textSecondary }}>{person.role}</span>}
          {person.organisation && <span style={{ fontSize: '13px', color: theme.textMuted }}>· {person.organisation}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          {reasons.map((r, i) => <Reason key={i} theme={theme} tone={r.tone}>{r.label}</Reason>)}
          {lastDl && <span style={{ fontSize: '11px', color: theme.textLabel }}>· last download {lastDl}</span>}
        </div>
        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>
          <a href={`mailto:${person.email}`} style={{ color: theme.textMuted, textDecoration: 'none' }}>{person.email}</a>
          {person.industry ? ` · ${titleCase(person.industry)}` : ''}
          {person.country && !person.isUk ? ` · ${person.country}` : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '20px', fontWeight: 600, color: theme.accent, lineHeight: 1 }}>{person.score}</div>
        <div style={{ fontSize: '10px', color: theme.textLabel, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>score</div>
      </div>
    </div>
  )
}

function OrgsTab({ theme }) {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [orgPeople, setOrgPeople] = useState({})

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/engagement?view=orgs')
        if (!res.ok) throw new Error('Failed')
        const d = await res.json()
        if (active) setOrgs(d.organisations || [])
      } catch (e) {
        console.error(e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  async function toggle(domain) {
    if (expanded === domain) { setExpanded(null); return }
    setExpanded(domain)
    if (!orgPeople[domain]) {
      try {
        const res = await fetch(`/api/admin/engagement?view=org_people&domain=${encodeURIComponent(domain)}`)
        if (res.ok) {
          const d = await res.json()
          setOrgPeople((prev) => ({ ...prev, [domain]: d.people || [] }))
        }
      } catch (err) { console.error(err) }
    }
  }

  if (loading) return <SkeletonList theme={theme} />
  if (orgs.length === 0) return <EmptyCard theme={theme} text="No organisations with multiple engaged people yet." />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button onClick={() => downloadCsv('engaged-organisations.csv', ORG_CSV_COLS, orgs.map(orgCsvRow))} style={ghostBtn(theme)}>Export CSV</button>
      </div>
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.7fr 0.7fr 0.7fr 0.9fr 0.6fr', gap: '10px', padding: '10px 18px', borderBottom: `1px solid ${theme.headerBorder}`, fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <div>Organisation</div>
          <div style={{ textAlign: 'right' }}>People</div>
          <div style={{ textAlign: 'right' }}>Opens</div>
          <div style={{ textAlign: 'right' }}>Clicks</div>
          <div style={{ textAlign: 'right' }}>Decision-mkrs</div>
          <div style={{ textAlign: 'right' }}>Score</div>
        </div>
        {orgs.map((o) => (
          <div key={o.domain}>
            <div
              onClick={() => toggle(o.domain)}
              style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.7fr 0.7fr 0.7fr 0.9fr 0.6fr', gap: '10px', padding: '14px 18px', borderBottom: `1px solid ${theme.rowBorder}`, cursor: 'pointer', alignItems: 'center', fontSize: '13px', color: theme.textSecondary, background: expanded === o.domain ? theme.accentBg : 'transparent' }}
              onMouseEnter={(e) => { if (expanded !== o.domain) e.currentTarget.style.background = theme.cardBgHover }}
              onMouseLeave={(e) => { if (expanded !== o.domain) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {expanded === o.domain ? '▾ ' : '▸ '}{o.orgName || o.domain}
                  {o.isUk && <span style={{ fontSize: '10px', color: '#3B82F6', background: '#3B82F622', padding: '1px 6px', borderRadius: '3px', marginLeft: '8px' }}>UK</span>}
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>{o.domain}{o.active90d > 0 ? ` · ${o.active90d} active 90d` : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>{o.people}</div>
              <div style={{ textAlign: 'right' }}>{o.opens.toLocaleString()}</div>
              <div style={{ textAlign: 'right', color: o.clicks > 0 ? theme.accent : theme.textMuted }}>{o.clicks.toLocaleString()}</div>
              <div style={{ textAlign: 'right' }}>{o.decisionMakers || '—'}</div>
              <div style={{ textAlign: 'right', fontSize: '15px', fontWeight: 600, color: theme.accent }}>{o.score}</div>
            </div>
            {expanded === o.domain && (
              <div style={{ background: theme.inputBg, padding: '6px 0' }}>
                {!orgPeople[o.domain] ? (
                  <div style={{ padding: '12px 24px', fontSize: '13px', color: theme.textMuted }}>Loading people…</div>
                ) : orgPeople[o.domain].length === 0 ? (
                  <div style={{ padding: '12px 24px', fontSize: '13px', color: theme.textMuted }}>No people found.</div>
                ) : (
                  orgPeople[o.domain].map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 24px', fontSize: '13px', borderBottom: `1px solid ${theme.rowBorder}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ color: theme.textPrimary }}>{[p.first_name, p.last_name].filter(Boolean).join(' ') || p.signup_email}</span>
                        {p.role && <span style={{ color: theme.textMuted, marginLeft: '8px' }}>{p.role}</span>}
                        {p.seniority && <span style={{ color: theme.textLabel, marginLeft: '6px' }}>· {titleCase(p.seniority)}</span>}
                      </div>
                      <span style={{ color: theme.textMuted, fontSize: '12px', flexShrink: 0 }}>
                        {p.newsletter_clicks > 0 ? `${p.newsletter_clicks} clicks · ` : ''}{p.newsletter_opens || 0} opens · {p.download_count || 0} dl
                      </span>
                      <a href={`mailto:${p.signup_email}`} style={{ color: theme.accent, fontSize: '12px', textDecoration: 'none', flexShrink: 0 }}>email →</a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Reason({ theme, tone, children }) {
  const colours = {
    accent: { bg: theme.accentBg, fg: theme.accent },
    success: { bg: theme.success + '22', fg: theme.success },
    danger: { bg: theme.danger + '22', fg: theme.danger },
    uk: { bg: '#3B82F622', fg: '#3B82F6' },
    muted: { bg: theme.inputBg, fg: theme.textSecondary },
    faint: { bg: 'transparent', fg: theme.textLabel },
  }
  const c = colours[tone] || colours.muted
  return (
    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: c.bg, color: c.fg, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function ghostBtn(theme, active) {
  return {
    padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px',
    background: active ? theme.accentBg : theme.cardBg, color: active ? theme.accent : theme.textSecondary,
    border: `1px solid ${active ? theme.accentBorder : theme.cardBorder}`,
  }
}
function solidBtn(theme) {
  return {
    padding: '6px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px',
    background: theme.accent, color: '#fff', border: 'none',
  }
}

function SkeletonList({ theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ height: '64px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  )
}

function EmptyCard({ theme, text }) {
  return (
    <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
      <p style={{ fontSize: '14px', color: theme.textLabel, fontStyle: 'italic', margin: 0 }}>{text}</p>
    </div>
  )
}
