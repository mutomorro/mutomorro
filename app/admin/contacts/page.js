'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

const sourceOptions = ['', 'template-download', 'contact-form', 'newsletter-signup', 'manual']
const sourceLabels = ['All sources', 'Template download', 'Contact form', 'Newsletter signup', 'Manual']
const newsletterOptions = ['', 'active', 'confirmed', 'pending_confirmation', 'opted-in-not-added', 'never', 'unsubscribed', 'bounced']
const newsletterLabels = ['All newsletter', 'Active', 'Confirmed', 'Pending confirm', 'Opted-in (not added)', 'Never', 'Unsubscribed', 'Bounced']
const tierOptions = ['', '1', '2', '3', '4', 'invalid']
const tierLabels = ['All tiers', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Invalid']
const zbOptions = ['', 'valid', 'catch-all', 'unknown', 'unverified', 'invalid', 'do_not_mail', 'abuse']
const zbLabels = ['All deliverability', 'Valid', 'Catch-all', 'Unknown', 'Unverified', 'Invalid', 'Do not mail', 'Abuse']
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
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

function titleCaseWord(s) {
  if (!s) return ''
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function InfoRow({ theme, label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ color: theme.textMuted, minWidth: '92px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: theme.textSecondary, wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

function domainFrom(email) {
  if (!email || !email.includes('@')) return ''
  return email.split('@').pop().trim().toLowerCase()
}

function Chip({ theme, label, count, active, onClick, tone }) {
  const accent = tone === 'warn' ? theme.warning : theme.accent
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 12px', borderRadius: '20px',
        fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
        background: active ? accent : theme.cardBg,
        color: active ? '#fff' : theme.textSecondary,
        border: `1px solid ${active ? accent : theme.cardBorder}`,
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '12px', color: active ? 'rgba(255,255,255,0.85)' : theme.textMuted }}>{(count ?? 0).toLocaleString()}</span>
    </button>
  )
}

export default function ContactsPage() {
  const { theme } = useAdminTheme()
  const [contacts, setContacts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [source, setSource] = useState('')
  const [newsletter, setNewsletter] = useState('')
  const [zb, setZb] = useState('')
  const [tag, setTag] = useState('')
  const [segment, setSegment] = useState('')
  const [sort, setSort] = useState('-created_at')
  const [segments, setSegments] = useState(null)
  const [selected, setSelected] = useState(() => new Set())
  const [busy, setBusy] = useState(false)
  const [bulkTag, setBulkTag] = useState('')
  const [bulkMsg, setBulkMsg] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const debounceRef = useRef(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), sort })
      if (search) params.set('search', search)
      if (tier) params.set('tier', tier)
      if (source) params.set('source', source)
      if (newsletter) params.set('newsletter', newsletter)
      if (zb) params.set('zb', zb)
      if (tag) params.set('tag', tag)
      if (segment) params.set('segment', segment)

      const res = await fetch(`/api/admin/contacts?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setContacts(data.contacts)
      setTotal(data.total)
      setPages(data.pages)
      setSelected(new Set())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, tier, source, newsletter, zb, tag, segment, sort])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const loadSegments = useCallback(() => {
    fetch('/api/admin/contacts/segments')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setSegments)
      .catch((e) => console.error(e))
  }, [])
  useEffect(() => { loadSegments() }, [loadSegments])

  // Toggle sort: same field flips direction, new field starts descending.
  function toggleSort(field) {
    setPage(1)
    setSort((cur) => {
      const curField = cur.replace(/^[+-]/, '')
      const curAsc = cur.startsWith('+')
      if (curField === field) return (curAsc ? '-' : '+') + field
      return '-' + field
    })
  }

  // Working-segment chip: toggle on/off.
  function pickSegment(val) {
    setPage(1)
    setBulkMsg(null)
    setSegment((cur) => (cur === val ? '' : val))
  }

  function toggleSelect(id) {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function toggleSelectAll() {
    setSelected((prev) => (prev.size === contacts.length && contacts.length > 0 ? new Set() : new Set(contacts.map((c) => c.id))))
  }

  async function enrichSelected() {
    if (selected.size === 0) return
    setBusy(true); setBulkMsg(null)
    try {
      const res = await fetch('/api/admin/contacts/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setBulkMsg({ ok: true, text: `Enriched ${d.enriched} of ${d.attempted} (${d.noMatch} no match).` })
      fetchContacts(); loadSegments()
    } catch (e) {
      setBulkMsg({ ok: false, text: 'Enrichment failed.' })
    } finally {
      setBusy(false)
    }
  }

  async function tagSelected() {
    const t = bulkTag.trim()
    if (!t || selected.size === 0) return
    setBusy(true); setBulkMsg(null)
    try {
      const res = await fetch('/api/admin/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], tag: t }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setBulkMsg({ ok: true, text: `Tagged ${d.tagged} contact${d.tagged === 1 ? '' : 's'} “${t}”.` })
      setBulkTag(''); fetchContacts()
    } catch (e) {
      setBulkMsg({ ok: false, text: 'Tagging failed.' })
    } finally {
      setBusy(false)
    }
  }

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function handleSearchInput(e) {
    const value = e.target.value
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => handleSearch(value), 300)
  }

  async function loadDetail(id) {
    if (selectedId === id) {
      setSelectedId(null)
      setDetail(null)
      return
    }
    setSelectedId(id)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/contacts/${id}`)
      if (!res.ok) throw new Error('Failed')
      setDetail(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '24px' }}>
        Contacts
      </h1>

      {/* Working-filter chips — click to filter the list */}
      {segments && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <Chip theme={theme} active={segment === ''} onClick={() => pickSegment('')} label="All" count={segments.total} />
          <Chip theme={theme} active={segment === 'no_company'} onClick={() => pickSegment('no_company')} label="Needs company" count={segments.noCompany} tone="warn" />
          <Chip theme={theme} active={segment === 'decision_makers'} onClick={() => pickSegment('decision_makers')} label="Decision-makers" count={segments.decisionMakers} />
          <Chip theme={theme} active={segment === 'active_30d'} onClick={() => pickSegment('active_30d')} label="Active 30d" count={segments.active30d} />
          <Chip theme={theme} active={segment === 'enriched'} onClick={() => pickSegment('enriched')} label="Enriched" count={segments.enriched} />
        </div>
      )}

      {/* Selection action bar — enrich / tag the ticked contacts */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px 16px', marginBottom: '12px', background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: theme.textPrimary, fontWeight: 500 }}>{selected.size} selected</span>
          <button onClick={enrichSelected} disabled={busy} style={{ padding: '6px 14px', fontSize: '13px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '6px', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Working…' : 'Enrich via Apollo'}
          </button>
          <input
            type="text"
            value={bulkTag}
            onChange={(e) => setBulkTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tagSelected()}
            placeholder="Tag…"
            style={{ padding: '6px 10px', fontSize: '13px', background: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontFamily: 'inherit', borderRadius: '4px', outline: 'none', width: '130px' }}
          />
          <button onClick={tagSelected} disabled={busy || !bulkTag.trim()} style={{ padding: '6px 12px', fontSize: '13px', background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Add tag
          </button>
          <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
          {bulkMsg && <span style={{ fontSize: '13px', color: bulkMsg.ok ? theme.success : theme.danger, width: '100%' }}>{bulkMsg.text}</span>}
        </div>
      )}
      {bulkMsg && selected.size === 0 && (
        <div style={{ fontSize: '13px', color: bulkMsg.ok ? theme.success : theme.danger, marginBottom: '12px' }}>{bulkMsg.text}</div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or organisation..."
        defaultValue={search}
        onChange={handleSearchInput}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: theme.inputBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '0',
          color: theme.textPrimary,
          fontSize: '15px',
          fontFamily: 'inherit',
          outline: 'none',
          marginBottom: '12px',
          boxSizing: 'border-box',
        }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterSelect theme={theme} value={tier} options={tierOptions} labels={tierLabels} onChange={(v) => { setTier(v); setPage(1) }} />
        <FilterSelect theme={theme} value={newsletter} options={newsletterOptions} labels={newsletterLabels} onChange={(v) => { setNewsletter(v); setPage(1) }} />
        <FilterSelect theme={theme} value={zb} options={zbOptions} labels={zbLabels} onChange={(v) => { setZb(v); setPage(1) }} />
        <FilterSelect theme={theme} value={source} options={sourceOptions} labels={sourceLabels} onChange={(v) => { setSource(v); setPage(1) }} />
        <input
          type="text"
          placeholder="Tag…"
          defaultValue={tag}
          onChange={(e) => { const v = e.target.value.trim(); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => { setTag(v); setPage(1) }, 300) }}
          style={{
            width: '120px', padding: '6px 10px', background: theme.inputBg,
            border: `1px solid ${tag ? theme.accentBorder : theme.cardBorder}`, borderRadius: '0',
            color: theme.textPrimary, fontSize: '13px', fontFamily: 'inherit', outline: 'none',
          }}
        />
        {(tier || newsletter || zb || source || tag) && (
          <button
            onClick={() => { setTier(''); setNewsletter(''); setZb(''); setSource(''); setTag(''); setPage(1) }}
            style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: '4px' }}
          >
            Clear
          </button>
        )}
        <span style={{ fontSize: '13px', color: theme.textMuted, marginLeft: 'auto' }}>
          {total.toLocaleString()} contact{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '34px 1.2fr 1.4fr 1.2fr 0.5fr 0.8fr 0.6fr 0.6fr', padding: '10px 16px', borderBottom: `1px solid ${theme.headerBorder}`, fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', gap: '8px', alignItems: 'center' }}>
          <input type="checkbox" checked={selected.size === contacts.length && contacts.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
          <SortTH theme={theme} label="Name" field="first_name" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Email" field="signup_email" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Organisation" field="organisation_name" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Tier" field="tier" sort={sort} onSort={toggleSort} />
          <div>Source</div>
          <div>NL</div>
          <SortTH theme={theme} label="Date" field="created_at" sort={sort} onSort={toggleSort} />
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 16px' }}>
              <div style={{ height: '16px', background: theme.cardBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))
        ) : contacts.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: theme.textLabel, fontSize: '14px', fontStyle: 'italic' }}>
            No contacts found
          </div>
        ) : (
          contacts.map((c, i) => (
            <div key={c.id}>
              <div
                onClick={() => loadDetail(c.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 1.2fr 1.4fr 1.2fr 0.5fr 0.8fr 0.6fr 0.6fr',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${theme.rowBorder}`,
                  borderLeft: c.organisation_name ? `3px solid ${theme.accent}` : '3px solid transparent',
                  cursor: 'pointer',
                  background: selected.has(c.id) ? theme.accentBg : selectedId === c.id ? theme.accentBg : i % 2 === 0 ? 'transparent' : theme.sidebarHover,
                  fontSize: '14px',
                  color: theme.textSecondary,
                  gap: '8px',
                  transition: 'background 0.1s',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => { if (selectedId !== c.id && !selected.has(c.id)) e.currentTarget.style.background = theme.cardBgHover }}
                onMouseLeave={(e) => { if (selectedId !== c.id && !selected.has(c.id)) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : theme.sidebarHover }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelect(c.id)}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 400, color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[c.first_name, c.last_name].filter(Boolean).join(' ') || '-'}
                  </div>
                  {(c.role || c.seniority) && (
                    <div style={{ fontSize: '11px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.role || ''}{c.role && c.seniority ? ' · ' : ''}{c.seniority ? titleCaseWord(c.seniority) : ''}
                    </div>
                  )}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {c.signup_email || '-'}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {c.organisation_name
                    ? c.organisation_name
                    : (() => { const d = domainFrom(c.signup_email); return d
                        ? <span style={{ color: theme.textLabel, fontStyle: 'italic' }} title="From email domain — not yet enriched">{d}</span>
                        : '-' })()}
                </div>
                <div style={{ fontSize: '13px' }}>{c.tier || '-'}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.latest_signal_detail || c.first_source || ''}>
                  {c.latest_signal_detail || (c.first_source || '-').replace('template-', '').replace('newsletter-', 'NL ')}
                </div>
                <div>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: c.newsletter_status === 'active' ? theme.accentBg : theme.cardBg,
                    color: c.newsletter_status === 'active' ? theme.accent : theme.textMuted,
                  }}>
                    {c.newsletter_status || 'never'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>
                  {relativeTime(c.created_at)}
                </div>
              </div>

              {/* Detail panel */}
              {selectedId === c.id && (
                <ContactDetail
                  theme={theme}
                  detail={detail}
                  loading={detailLoading}
                  contactId={c.id}
                  onUpdate={() => { loadDetail(c.id); fetchContacts() }}
                />
              )}
            </div>
          ))
        )}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={getPageBtnStyle(theme)}>
            Prev
          </button>
          <span style={{ fontSize: '13px', color: theme.textMuted, padding: '6px 12px' }}>
            {page} of {pages}
          </span>
          <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} style={getPageBtnStyle(theme)}>
            Next
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 900px) {
          .admin-kpi-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .admin-contact-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function ContactDetail({ theme, detail, loading, contactId, onUpdate }) {
  const [noteText, setNoteText] = useState('')
  const [tagText, setTagText] = useState('')
  const [showInteractionForm, setShowInteractionForm] = useState(false)
  const [intType, setIntType] = useState('note')
  const [intSummary, setIntSummary] = useState('')
  const [saving, setSaving] = useState(false)

  if (loading) {
    return (
      <div style={{ padding: '20px 16px', background: theme.sidebarHover, borderBottom: `1px solid ${theme.cardBorder}` }}>
        <div style={{ height: '60px', background: theme.cardBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  if (!detail) return null

  const { contact, signals, interactions } = detail

  async function addTag() {
    if (!tagText.trim()) return
    setSaving(true)
    const newTags = [...(contact.tags || []), tagText.trim()]
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contactId, tags: newTags }),
    })
    setTagText('')
    setSaving(false)
    onUpdate()
  }

  async function addNote() {
    if (!noteText.trim()) return
    setSaving(true)
    const existing = contact.notes || ''
    const timestamp = new Date().toLocaleDateString('en-GB')
    const updated = `${existing}\n[${timestamp}] ${noteText.trim()}`.trim()
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contactId, notes: updated }),
    })
    setNoteText('')
    setSaving(false)
    onUpdate()
  }

  async function logInteraction() {
    if (!intSummary.trim()) return
    setSaving(true)
    await fetch('/api/admin/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, type: intType, summary: intSummary.trim() }),
    })
    setIntSummary('')
    setShowInteractionForm(false)
    setSaving(false)
    onUpdate()
  }

  const miniInputStyle = {
    flex: 1,
    padding: '5px 8px',
    background: theme.inputBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '0',
    color: theme.textPrimary,
    fontSize: '12px',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const miniBtn = {
    padding: '4px 8px',
    background: theme.accentBg,
    border: 'none',
    color: theme.accent,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '0',
  }

  const timelineHeading = {
    fontSize: '11px',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  }

  const timelineItem = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: `1px solid ${theme.rowBorder}`,
    fontSize: '13px',
  }

  return (
    <div style={{ padding: '20px 16px', background: theme.sidebarHover, borderBottom: `2px solid ${theme.accentBorder}` }}>
      <div className="admin-contact-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Info + actions */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 400, color: theme.textPrimary, marginBottom: '12px' }}>
            {[contact.first_name, contact.last_name].filter(Boolean).join(' ')}
          </h3>
          <div style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
            {contact.signup_email && <InfoRow theme={theme} label="Email" value={contact.signup_email} />}
            {(contact.organisation_name || contact.role) && (
              <InfoRow theme={theme} label="Org" value={`${contact.organisation_name || '—'}${contact.role ? ` · ${contact.role}` : ''}`} />
            )}
            {contact.seniority && <InfoRow theme={theme} label="Level" value={titleCaseWord(contact.seniority)} />}
            {contact.industry && <InfoRow theme={theme} label="Industry" value={contact.industry} />}
            {(contact.location || contact.country) && (
              <InfoRow theme={theme} label="Location" value={[contact.location, contact.country].filter(Boolean).join(', ')} />
            )}
            <InfoRow theme={theme} label="Tier" value={contact.tier || '—'} />
            <InfoRow theme={theme} label="Newsletter" value={contact.newsletter_status || 'never'} />
            <InfoRow theme={theme} label="Engagement" value={`${contact.download_count || 0} downloads · ${contact.newsletter_opens || 0} opens · ${contact.newsletter_clicks || 0} clicks`} />
            {contact.last_download_date && (
              <InfoRow theme={theme} label="Last download" value={new Date(contact.last_download_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
            )}
            <InfoRow theme={theme} label="Enriched" value={contact.enriched ? `Yes${contact.enrichment_source ? ` · ${contact.enrichment_source}` : ''}` : 'No'} />
          </div>

          {contact.downloaded_items?.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Downloaded</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {contact.downloaded_items.map((it, i) => (
                  <span key={i} style={{ fontSize: '11px', padding: '2px 8px', background: theme.inputBg, color: theme.textSecondary, borderRadius: '3px' }}>{it}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {contact.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
              {contact.tags.map((t, i) => (
                <span key={i} style={{ fontSize: '11px', padding: '2px 8px', background: theme.accentBg, color: theme.accent, borderRadius: '3px' }}>{t}</span>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="Add tag" style={miniInputStyle} onKeyDown={(e) => e.key === 'Enter' && addTag()} />
              <button onClick={addTag} disabled={saving} style={miniBtn}>+</button>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add note" style={miniInputStyle} onKeyDown={(e) => e.key === 'Enter' && addNote()} />
              <button onClick={addNote} disabled={saving} style={miniBtn}>+</button>
            </div>
            <button onClick={() => setShowInteractionForm(!showInteractionForm)} style={{ ...miniBtn, width: 'auto', fontSize: '12px', padding: '4px 10px' }}>
              Log interaction
            </button>

            {showInteractionForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', background: theme.cardBg, borderRadius: '4px' }}>
                <select value={intType} onChange={(e) => setIntType(e.target.value)} style={miniInputStyle}>
                  {interactionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="text" value={intSummary} onChange={(e) => setIntSummary(e.target.value)} placeholder="Summary" style={miniInputStyle} />
                <button onClick={logInteraction} disabled={saving || !intSummary.trim()} style={{ ...miniBtn, width: 'auto', fontSize: '12px', padding: '4px 10px' }}>Save</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div>
          {signals.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={timelineHeading}>Signals</h4>
              {signals.map((s) => (
                <div key={s.id} style={timelineItem}>
                  <span style={{ color: s.strength === 'high' ? theme.accent : theme.textSecondary }}>
                    {s.type}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textLabel }}>{relativeTime(s.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {interactions.length > 0 && (
            <div>
              <h4 style={timelineHeading}>Interactions</h4>
              {interactions.map((int) => (
                <div key={int.id} style={timelineItem}>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.accent }}>{int.type}</span>
                    <span style={{ fontSize: '13px', color: theme.textSecondary, marginLeft: '8px' }}>{int.summary}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: theme.textLabel }}>{relativeTime(int.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {signals.length === 0 && interactions.length === 0 && (
            <p style={{ fontSize: '13px', color: theme.textLabel, fontStyle: 'italic' }}>No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SortTH({ theme, label, field, sort, onSort }) {
  const active = sort.replace(/^[+-]/, '') === field
  const asc = sort.startsWith('+')
  return (
    <div
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none', color: active ? theme.textSecondary : theme.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}
      title={`Sort by ${label.toLowerCase()}`}
    >
      {label}
      <span style={{ fontSize: '9px', opacity: active ? 1 : 0.35 }}>{active ? (asc ? '▲' : '▼') : '↕'}</span>
    </div>
  )
}

function FilterSelect({ theme, value, options, labels, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '6px 10px',
        background: theme.inputBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '0',
        color: value ? theme.textPrimary : theme.textMuted,
        fontSize: '13px',
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      {options.map((opt, i) => (
        <option key={opt} value={opt}>{labels[i]}</option>
      ))}
    </select>
  )
}

function getPageBtnStyle(theme) {
  return {
    padding: '6px 14px',
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    color: theme.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '0',
  }
}
