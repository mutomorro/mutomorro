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

// Commercial facets compose freely (AND) on one list. A "lens" is just a facet-set
// applied as a clean starting point you then refine (populate-and-refine). The
// Overview funnel deep-links in via ?preset= and maps to the same sets.
const FACET_DEFAULTS = { uk: false, dm: false, engaged: false, enquired: false, sub: '', contactable: false, due: false }
const LENSES = [
  { key: 'golden', label: '★ Golden', set: { uk: true, dm: true, scope: 'in' } },
  { key: 'engaged', label: 'Engaged', set: { uk: true, dm: true, engaged: true, scope: 'in' } },
  { key: 'target', label: 'Target', set: { uk: true, dm: true, sub: 'subscribed', engaged: true, scope: 'in' } },
  { key: 'target_audience', label: 'Target Audience', set: { uk: true, dm: true, sub: 'notsub', contactable: true, scope: 'in' } },
  { key: 'due', label: 'Due a touch', set: { due: true } },
]
const PRESET_TO_FACETS = {
  uk: { uk: true, scope: 'in' },
  uk_subscribed: { uk: true, sub: 'subscribed', scope: 'in' },
  uk_engaged: { uk: true, sub: 'subscribed', engaged: true, scope: 'in' },
  uk_target: { uk: true, dm: true, sub: 'subscribed', engaged: true, scope: 'in' },
  uk_notsub: { uk: true, sub: 'notsub', scope: 'in' },
  uk_target_audience: { uk: true, dm: true, sub: 'notsub', contactable: true, scope: 'in' },
  uk_optedout: { uk: true, sub: 'optedout', scope: 'in' },
  golden: { uk: true, dm: true, scope: 'in' },
  engaged: { uk: true, dm: true, engaged: true, scope: 'in' },
}
const SUB_OPTIONS = ['', 'subscribed', 'notsub', 'optedout']
const SUB_LABELS = ['Any subscription', 'Subscribed', 'Not subscribed', 'Opted-out']

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
  const [sector, setSector] = useState('')
  const [scope, setScope] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [facets, setFacets] = useState(FACET_DEFAULTS)
  const [bulkSector, setBulkSector] = useState('')
  const [sort, setSort] = useState('-engagement_score')
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
      if (sector) params.set('sector', sector)
      if (scope) params.set('scope', scope)
      // Commercial facets (compose with the above).
      if (facets.uk) params.set('uk', '1')
      if (facets.dm) params.set('dm', '1')
      if (facets.engaged) params.set('engaged', '1')
      if (facets.enquired) params.set('enquired', '1')
      if (facets.sub) params.set('sub', facets.sub)
      if (facets.contactable) params.set('contactable', '1')
      if (facets.due) params.set('due', '1')

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
  }, [page, search, tier, source, newsletter, zb, tag, sector, scope, facets, sort])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Honour deep-links: ?tag= (e.g. the Overview housing chip) and ?preset= (the
  // Overview funnel boxes → a lens facet-set). Read after mount so SSR/first client
  // render agree (inputs show via defaultValue).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const t = sp.get('tag')
    if (t) { setTag(t); setTagInput(t); setPage(1) }
    const pr = sp.get('preset')
    const set = pr && PRESET_TO_FACETS[pr]
    if (set) {
      setFacets({ ...FACET_DEFAULTS, uk: !!set.uk, dm: !!set.dm, engaged: !!set.engaged, enquired: !!set.enquired, sub: set.sub || '', contactable: !!set.contactable, due: !!set.due })
      setScope(set.scope || '')
      setPage(1)
    }
  }, [])

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

  // Set one facet (the building blocks; they stack/AND on one list).
  function setFacet(key, val) {
    setPage(1)
    setBulkMsg(null)
    setFacets((f) => ({ ...f, [key]: val }))
  }

  // Apply a lens = a clean facet-set you then refine (populate-and-refine).
  function applyLens(set) {
    setPage(1)
    setBulkMsg(null)
    setFacets({ ...FACET_DEFAULTS, uk: !!set.uk, dm: !!set.dm, engaged: !!set.engaged, enquired: !!set.enquired, sub: set.sub || '', contactable: !!set.contactable, due: !!set.due })
    setSearch(''); setSearchInput(''); setTier(''); setSource(''); setNewsletter(''); setZb(''); setTag(''); setTagInput(''); setSector(''); setScope(set.scope || '')
  }

  // Clear every facet + filter back to the full list.
  function clearAll() {
    setPage(1)
    setBulkMsg(null)
    setFacets(FACET_DEFAULTS)
    setSearch(''); setSearchInput(''); setTier(''); setSource(''); setNewsletter(''); setZb(''); setTag(''); setTagInput(''); setSector(''); setScope('')
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
      fetchContacts()
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

  // Bulk sector / scope curation for the ticked contacts.
  async function bulkCurate(payload, describe) {
    if (selected.size === 0) return
    setBusy(true); setBulkMsg(null)
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], ...payload }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setBulkMsg({ ok: true, text: `${describe} ${d.updated} contact${d.updated === 1 ? '' : 's'}.` })
      setSelected(new Set()); fetchContacts()
    } catch (e) {
      setBulkMsg({ ok: false, text: 'Update failed.' })
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
    setSearchInput(value)
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

  // Active-filter pills — every constraint currently narrowing the list, each removable.
  const lbl = (opts, labels, v) => labels[opts.indexOf(v)] || v
  const activeFilters = []
  if (search) activeFilters.push({ key: 'search', label: `Search: "${search}"`, clear: () => { setSearch(''); setSearchInput('') } })
  if (facets.uk) activeFilters.push({ key: 'uk', label: 'UK', clear: () => setFacet('uk', false) })
  if (facets.dm) activeFilters.push({ key: 'dm', label: 'Fit (mgr+)', clear: () => setFacet('dm', false) })
  if (facets.engaged) activeFilters.push({ key: 'engaged', label: 'Engaged', clear: () => setFacet('engaged', false) })
  if (facets.enquired) activeFilters.push({ key: 'enquired', label: 'Enquired', clear: () => setFacet('enquired', false) })
  if (facets.due) activeFilters.push({ key: 'due', label: 'Due a touch', clear: () => setFacet('due', false) })
  if (facets.contactable) activeFilters.push({ key: 'contactable', label: 'Contactable', clear: () => setFacet('contactable', false) })
  if (facets.sub) activeFilters.push({ key: 'sub', label: lbl(SUB_OPTIONS, SUB_LABELS, facets.sub), clear: () => setFacet('sub', '') })
  if (tier) activeFilters.push({ key: 'tier', label: `Tier: ${lbl(tierOptions, tierLabels, tier)}`, clear: () => { setTier(''); setPage(1) } })
  if (newsletter) activeFilters.push({ key: 'newsletter', label: lbl(newsletterOptions, newsletterLabels, newsletter), clear: () => { setNewsletter(''); setPage(1) } })
  if (zb) activeFilters.push({ key: 'zb', label: lbl(zbOptions, zbLabels, zb), clear: () => { setZb(''); setPage(1) } })
  if (source) activeFilters.push({ key: 'source', label: lbl(sourceOptions, sourceLabels, source), clear: () => { setSource(''); setPage(1) } })
  if (sector) activeFilters.push({ key: 'sector', label: `Sector: ${sector === '(none)' ? 'No sector' : sector}`, clear: () => { setSector(''); setPage(1) } })
  if (scope) activeFilters.push({ key: 'scope', label: scope === 'in' ? 'In scope' : 'Out of scope', clear: () => { setScope(''); setPage(1) } })
  if (tag) activeFilters.push({ key: 'tag', label: `Tag: ${tag}`, clear: () => { setTag(''); setTagInput(''); setPage(1) } })
  const anyFilterActive = activeFilters.length > 0

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '24px' }}>
        Contacts
      </h1>

      {/* Lenses — apply a facet-set you can then refine */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '2px' }}>Lenses</span>
        {LENSES.map((l) => (
          <button key={l.key} onClick={() => applyLens(l.set)} style={lensChip(theme, false)}>{l.label}</button>
        ))}
        <span style={{ fontSize: '12px', color: theme.textMuted, marginLeft: 'auto' }}>
          {total.toLocaleString()} {anyFilterActive ? (total === 1 ? 'match' : 'matches') : (total === 1 ? 'contact' : 'contacts')}
          {anyFilterActive && <button onClick={clearAll} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', marginLeft: '10px' }}>Clear all</button>}
        </span>
      </div>

      {/* Facets — stack freely (AND) on the one list */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <FacetToggle theme={theme} label="UK" active={facets.uk} onClick={() => setFacet('uk', !facets.uk)} tone="uk" />
        <FacetToggle theme={theme} label="Fit (mgr+)" active={facets.dm} onClick={() => setFacet('dm', !facets.dm)} />
        <FacetToggle theme={theme} label="Engaged" active={facets.engaged} onClick={() => setFacet('engaged', !facets.engaged)} />
        <FacetToggle theme={theme} label="Enquired" active={facets.enquired} onClick={() => setFacet('enquired', !facets.enquired)} />
        <FacetToggle theme={theme} label="Due a touch" active={facets.due} onClick={() => setFacet('due', !facets.due)} tone="warn" />
        {facets.contactable && <FacetToggle theme={theme} label="Contactable" active onClick={() => setFacet('contactable', false)} />}
        <FilterSelect theme={theme} value={facets.sub} options={SUB_OPTIONS} labels={SUB_LABELS} onChange={(v) => setFacet('sub', v)} />
      </div>

      {/* Active filters — every constraint narrowing the list right now, each removable */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '12px', padding: '8px 12px', background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '2px' }}>Filtering by</span>
          {activeFilters.map((f) => (
            <button key={f.key} onClick={f.clear} title="Remove this filter" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` }}>
              {f.label} <span style={{ color: theme.textLabel }}>✕</span>
            </button>
          ))}
          <button onClick={clearAll} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', marginLeft: '4px' }}>Clear all</button>
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
          <span style={{ width: '1px', height: '20px', background: theme.cardBorder }} />
          <select
            value={bulkSector}
            onChange={(e) => { const v = e.target.value; setBulkSector(''); if (v) bulkCurate({ sector: v }, `Set sector on`) }}
            disabled={busy}
            style={{ padding: '6px 10px', fontSize: '13px', background: theme.inputBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '6px', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="">Set sector…</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => bulkCurate({ out_of_scope: true }, 'Scrubbed')} disabled={busy} style={{ padding: '6px 12px', fontSize: '13px', background: theme.cardBg, color: theme.warning, border: `1px solid ${theme.cardBorder}`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Out of scope
          </button>
          <button onClick={() => bulkCurate({ out_of_scope: false }, 'Restored')} disabled={busy} style={{ padding: '6px 12px', fontSize: '13px', background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            In scope
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
        value={searchInput}
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

      {/* Filters — additional refinements (stack with the facets above) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterSelect theme={theme} value={tier} options={tierOptions} labels={tierLabels} onChange={(v) => { setTier(v); setPage(1) }} />
        <FilterSelect theme={theme} value={newsletter} options={newsletterOptions} labels={newsletterLabels} onChange={(v) => { setNewsletter(v); setPage(1) }} />
        <FilterSelect theme={theme} value={zb} options={zbOptions} labels={zbLabels} onChange={(v) => { setZb(v); setPage(1) }} />
        <FilterSelect theme={theme} value={source} options={sourceOptions} labels={sourceLabels} onChange={(v) => { setSource(v); setPage(1) }} />
        <input
          type="text"
          placeholder="Tag…"
          value={tagInput}
          onChange={(e) => { const v = e.target.value; setTagInput(v); const t = v.trim(); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => { setTag(t); setPage(1) }, 300) }}
          style={{
            width: '120px', padding: '6px 10px', background: theme.inputBg,
            border: `1px solid ${tag ? theme.accentBorder : theme.cardBorder}`, borderRadius: '0',
            color: theme.textPrimary, fontSize: '13px', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <FilterSelect theme={theme} value={sector}
          options={['', ...SECTORS, '(none)']}
          labels={['All sectors', ...SECTORS, 'No sector']}
          onChange={(v) => { setSector(v); setPage(1) }} />
        <FilterSelect theme={theme} value={scope}
          options={['', 'in', 'out']}
          labels={['All scope', 'In scope', 'Out of scope']}
          onChange={(v) => { setScope(v); setPage(1) }} />
      </div>

      {/* Table */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '34px 1.2fr 1.4fr 1.2fr 0.5fr 0.55fr 0.8fr 0.6fr 0.6fr', padding: '10px 16px', borderBottom: `1px solid ${theme.headerBorder}`, fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', gap: '8px', alignItems: 'center' }}>
          <input type="checkbox" checked={selected.size === contacts.length && contacts.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
          <SortTH theme={theme} label="Name" field="first_name" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Email" field="signup_email" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Organisation" field="organisation_name" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Tier" field="tier" sort={sort} onSort={toggleSort} />
          <SortTH theme={theme} label="Score" field="engagement_score" sort={sort} onSort={toggleSort} />
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
          <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: '14px' }}>
            <div style={{ color: theme.textLabel, fontStyle: 'italic' }}>No contacts match</div>
            {activeFilters.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '13px', color: theme.textSecondary }}>
                {activeFilters.length} filter{activeFilters.length === 1 ? '' : 's'} active — they may be hiding results.{' '}
                <button onClick={clearAll} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>Clear all</button>
              </div>
            )}
          </div>
        ) : (
          contacts.map((c, i) => (
            <div key={c.id}>
              <div
                onClick={() => loadDetail(c.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 1.2fr 1.4fr 1.2fr 0.5fr 0.55fr 0.8fr 0.6fr 0.6fr',
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
                  {reasonsFor(c).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {reasonsFor(c).map((r, i) => (
                        <span key={i} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: theme.accentBg, color: theme.accent, whiteSpace: 'nowrap' }}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {c.signup_email || '-'}
                </div>
                <div style={{ minWidth: 0, fontSize: '13px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: c.out_of_scope ? 0.5 : 1 }}>
                    {c.organisation_name
                      ? c.organisation_name
                      : (() => { const d = domainFrom(c.signup_email); return d
                          ? <span style={{ color: theme.textLabel, fontStyle: 'italic' }} title="From email domain — not yet enriched">{d}</span>
                          : '-' })()}
                  </div>
                  <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: c.sector ? theme.textMuted : theme.textLabel, fontStyle: c.sector ? 'normal' : 'italic' }}>{c.sector || 'no sector'}</span>
                    {c.out_of_scope && <span style={{ color: theme.warning }}> · out of scope</span>}
                  </div>
                </div>
                <div style={{ fontSize: '13px' }}>{c.tier || '-'}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: c.engagement_score != null ? theme.accent : theme.textLabel }}>
                  {c.engagement_score != null ? Math.round(Number(c.engagement_score)) : '-'}
                </div>
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
                  onDelete={() => { setSelectedId(null); setDetail(null); fetchContacts() }}
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

// The curated sector taxonomy (built for the change-management ICP, not Apollo's
// generic industries). Shared by the filter, bulk bar, and the detail panel.
const SECTORS = [
  'Housing association', 'NHS / health', 'Local government', 'Central government',
  'Higher education', 'Schools', 'Charity / third sector', 'Emergency services',
  'Utilities / infrastructure', 'Corporate / private',
]

function ContactDetail({ theme, detail, loading, contactId, onUpdate, onDelete }) {
  const [noteText, setNoteText] = useState('')
  const [tagText, setTagText] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [confirmDel, setConfirmDel] = useState(false)
  const [errMsg, setErrMsg] = useState(null)
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

  // Sector / scope curation (column allow-list enforced server-side).
  async function patchContact(fields) {
    setSaving(true)
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contactId, ...fields }),
    })
    setSaving(false)
    onUpdate()
  }

  function startEdit() {
    setErrMsg(null)
    setForm({
      first_name: contact.first_name || '', last_name: contact.last_name || '',
      signup_email: contact.signup_email || '', organisation_name: contact.organisation_name || '',
      role: contact.role || '', seniority: contact.seniority || '',
      location: contact.location || '', country: contact.country || '',
    })
    setEditing(true)
  }

  async function saveEdits() {
    setSaving(true); setErrMsg(null)
    const res = await fetch('/api/admin/contacts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contactId, ...form }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErrMsg(d.error || 'Save failed'); return }
    setEditing(false); onUpdate()
  }

  async function removeContact() {
    setSaving(true); setErrMsg(null)
    const res = await fetch('/api/admin/contacts', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contactId }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErrMsg(d.error || 'Delete failed'); setConfirmDel(false); return }
    onDelete()
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, color: theme.textPrimary, margin: 0 }}>
              {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '(no name)'}
            </h3>
            {!editing && (
              <button onClick={startEdit} style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Edit details</button>
            )}
          </div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {[['first_name', 'First name'], ['last_name', 'Last name'], ['signup_email', 'Email'], ['organisation_name', 'Organisation'], ['role', 'Role'], ['location', 'Location'], ['country', 'Country']].map(([k, label]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ width: '80px', color: theme.textMuted, flexShrink: 0 }}>{label}</span>
                  <input type="text" value={form[k] || ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={miniInputStyle} />
                </label>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ width: '80px', color: theme.textMuted, flexShrink: 0 }}>Level</span>
                <select value={form.seniority || ''} onChange={(e) => setForm((f) => ({ ...f, seniority: e.target.value }))} style={{ ...miniInputStyle, cursor: 'pointer' }}>
                  <option value="">—</option>
                  {['entry', 'senior', 'manager', 'head', 'director', 'vp', 'c_suite', 'partner', 'founder', 'owner'].map((s) => <option key={s} value={s}>{titleCaseWord(s)}</option>)}
                </select>
              </label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button onClick={saveEdits} disabled={saving} style={{ ...miniBtn, padding: '5px 14px', fontSize: '12px', background: theme.accent, color: '#fff' }}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => { setEditing(false); setErrMsg(null) }} style={{ ...miniBtn, padding: '5px 14px', fontSize: '12px', background: theme.cardBg, color: theme.textSecondary }}>Cancel</button>
              </div>
            </div>
          ) : (
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
          )}

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

          {/* Sector + scope curation */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
            <select value={contact.sector || ''} onChange={(e) => patchContact({ sector: e.target.value })} disabled={saving} style={{ ...miniInputStyle, cursor: 'pointer' }} title="Sector">
              <option value="">No sector</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => patchContact({ out_of_scope: !contact.out_of_scope })} disabled={saving} style={{ ...miniBtn, color: contact.out_of_scope ? theme.warning : theme.accent, whiteSpace: 'nowrap', padding: '4px 8px', fontSize: '12px' }} title="Whether this contact counts in the buyer-insight pools">
              {contact.out_of_scope ? 'Out of scope' : 'In scope'}
            </button>
          </div>

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

            {/* Next nudge — the nurture follow-up date (drives the "Due a touch" facet) */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: theme.textMuted, whiteSpace: 'nowrap' }}>Next nudge</span>
              <input
                type="date"
                value={contact.next_nudge_date || ''}
                onChange={(e) => patchContact({ next_nudge_date: e.target.value || null })}
                disabled={saving}
                style={{ ...miniInputStyle, cursor: 'pointer' }}
              />
              {contact.next_nudge_date && (
                <button onClick={() => patchContact({ next_nudge_date: null })} disabled={saving} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>clear</button>
              )}
            </div>
          </div>

          {errMsg && <div style={{ fontSize: '12px', color: theme.danger, marginTop: '10px' }}>{errMsg}</div>}

          {/* Delete (two-step) */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${theme.rowBorder}` }}>
            {confirmDel ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: theme.danger }}>Delete permanently? Engagement history goes too.</span>
                <button onClick={removeContact} disabled={saving} style={{ padding: '4px 12px', fontSize: '12px', background: theme.danger, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Deleting…' : 'Yes, delete'}</button>
                <button onClick={() => setConfirmDel(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => { setConfirmDel(true); setErrMsg(null) }} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Delete contact</button>
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

// Facet toggle pill (no count — facets compose, they don't partition the list).
function FacetToggle({ theme, label, active, onClick, tone }) {
  const accent = tone === 'warn' ? theme.warning : tone === 'uk' ? '#3B82F6' : theme.accent
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
      background: active ? accent : theme.cardBg,
      color: active ? '#fff' : theme.textSecondary,
      border: `1px solid ${active ? accent : theme.cardBorder}`,
    }}>{active ? `✓ ${label}` : label}</button>
  )
}

// Pill style for the lens buttons.
function lensChip(theme, active) {
  return {
    padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '20px',
    background: active ? theme.accent : theme.cardBg,
    color: active ? '#fff' : theme.textSecondary,
    border: `1px solid ${active ? theme.accent : theme.cardBorder}`,
  }
}

// Manager-and-above (mirrors is_decision_maker_seniority).
const DM_SET = new Set(['manager', 'director', 'head', 'vp', 'c_suite', 'founder', 'partner', 'owner'])
function isUkClient(c) {
  const country = (c.country || '').trim().toLowerCase()
  if (country) {
    if (country.includes('united kingdom') || country.includes('northern ireland')) return true
    if (['uk', 'gb', 'great britain', 'britain', 'england', 'scotland', 'wales'].includes(country)) return true
  }
  const domain = (c.signup_email || '').split('@').pop() || ''
  return /\.uk$/.test(domain.toLowerCase())
}

// "Why this row scores" chips — computed from the row's own columns, shown on every
// row (each row carries country, seniority, high_signals_count, clicks, downloads).
function reasonsFor(c) {
  const r = []
  if (isUkClient(c)) r.push('UK')
  if (c.seniority && DM_SET.has(c.seniority)) r.push(titleCaseWord(c.seniority))
  const hs = Number(c.high_signals_count) || 0
  if (hs > 0) r.push(hs > 1 ? `${hs} enquiries` : 'Enquired')
  if ((c.newsletter_clicks || 0) > 0) r.push(`${c.newsletter_clicks} click${c.newsletter_clicks === 1 ? '' : 's'}`)
  const days = c.last_download_date ? (Date.now() - new Date(c.last_download_date).getTime()) / 86400000 : Infinity
  if (days <= 30) r.push('Active 30d')
  else if (days <= 90) r.push('Active 90d')
  if ((c.download_count || 0) >= 3) r.push(`${c.download_count} downloads`)
  return r
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
