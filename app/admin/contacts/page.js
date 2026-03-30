'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const sourceOptions = ['', 'template-download', 'contact-form', 'newsletter-signup', 'manual']
const newsletterOptions = ['', 'active', 'unsubscribed', 'bounced', 'never']
const tierOptions = ['', '1', '2', '3', '4', '5']
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [source, setSource] = useState('')
  const [newsletter, setNewsletter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const debounceRef = useRef(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (tier) params.set('tier', tier)
      if (source) params.set('source', source)
      if (newsletter) params.set('newsletter', newsletter)

      const res = await fetch(`/api/admin/contacts?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setContacts(data.contacts)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, tier, source, newsletter])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

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
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '24px' }}>
        Contacts
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or organisation..."
        defaultValue={search}
        onChange={handleSearchInput}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0',
          color: '#fff',
          fontSize: '15px',
          fontFamily: 'inherit',
          outline: 'none',
          marginBottom: '12px',
          boxSizing: 'border-box',
        }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterSelect label="Tier" value={tier} options={tierOptions} labels={['All tiers', '1', '2', '3', '4', '5']} onChange={(v) => { setTier(v); setPage(1) }} />
        <FilterSelect label="Newsletter" value={newsletter} options={newsletterOptions} labels={['All', 'Active', 'Unsubscribed', 'Bounced', 'Never']} onChange={(v) => { setNewsletter(v); setPage(1) }} />
        <FilterSelect label="Source" value={source} options={sourceOptions} labels={['All sources', 'Template download', 'Contact form', 'Newsletter signup', 'Manual']} onChange={(v) => { setSource(v); setPage(1) }} />
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>
          {total.toLocaleString()} contact{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflowX: 'auto' }}>
        <div style={{ minWidth: '560px' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.2fr 0.5fr 0.8fr 0.6fr 0.6fr', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', gap: '8px' }}>
          <div>Name</div>
          <div>Email</div>
          <div>Organisation</div>
          <div>Tier</div>
          <div>Source</div>
          <div>NL</div>
          <div>Date</div>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 16px' }}>
              <div style={{ height: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))
        ) : contacts.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontStyle: 'italic' }}>
            No contacts found
          </div>
        ) : (
          contacts.map((c, i) => (
            <div key={c.id}>
              <div
                onClick={() => loadDetail(c.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.4fr 1.2fr 0.5fr 0.8fr 0.6fr 0.6fr',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  borderLeft: c.organisation_name ? '3px solid #9B51E0' : '3px solid transparent',
                  cursor: 'pointer',
                  background: selectedId === c.id ? 'rgba(155,81,224,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.75)',
                  gap: '8px',
                  transition: 'background 0.1s',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => { if (selectedId !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { if (selectedId !== c.id) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
              >
                <div style={{ fontWeight: 400, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[c.first_name, c.last_name].filter(Boolean).join(' ') || '-'}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {c.signup_email || '-'}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                  {c.organisation_name || '-'}
                </div>
                <div style={{ fontSize: '13px' }}>{c.tier || '-'}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.latest_signal_detail || c.first_source || ''}>
                  {c.latest_signal_detail || (c.first_source || '-').replace('template-', '').replace('newsletter-', 'NL ')}
                </div>
                <div>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: c.newsletter_status === 'active' ? 'rgba(155,81,224,0.15)' : 'rgba(255,255,255,0.04)',
                    color: c.newsletter_status === 'active' ? '#9B51E0' : 'rgba(255,255,255,0.35)',
                  }}>
                    {c.newsletter_status || 'never'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                  {relativeTime(c.created_at)}
                </div>
              </div>

              {/* Detail panel */}
              {selectedId === c.id && (
                <ContactDetail
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
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={pageBtnStyle(false)}>
            Prev
          </button>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', padding: '6px 12px' }}>
            {page} of {pages}
          </span>
          <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} style={pageBtnStyle(false)}>
            Next
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          .admin-contact-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function ContactDetail({ detail, loading, contactId, onUpdate }) {
  const [noteText, setNoteText] = useState('')
  const [tagText, setTagText] = useState('')
  const [showInteractionForm, setShowInteractionForm] = useState(false)
  const [intType, setIntType] = useState('note')
  const [intSummary, setIntSummary] = useState('')
  const [saving, setSaving] = useState(false)

  if (loading) {
    return (
      <div style={{ padding: '20px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ height: '60px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
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

  return (
    <div style={{ padding: '20px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid rgba(155,81,224,0.2)' }}>
      <div className="admin-contact-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Info + actions */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>
            {[contact.first_name, contact.last_name].filter(Boolean).join(' ')}
          </h3>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            {contact.signup_email && <div>{contact.signup_email}</div>}
            {contact.organisation_name && <div>{contact.organisation_name}{contact.role ? ` - ${contact.role}` : ''}</div>}
            {contact.tier && <div>Tier: {contact.tier}</div>}
            {contact.download_count > 0 && <div>Downloads: {contact.download_count}</div>}
          </div>

          {/* Tags */}
          {contact.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
              {contact.tags.map((t, i) => (
                <span key={i} style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(155,81,224,0.12)', color: '#9B51E0', borderRadius: '3px' }}>{t}</span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
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
                  <span style={{ color: s.strength === 'high' ? '#9B51E0' : 'rgba(255,255,255,0.5)' }}>
                    {s.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{relativeTime(s.created_at)}</span>
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
                    <span style={{ fontSize: '12px', color: '#9B51E0' }}>{int.type}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginLeft: '8px' }}>{int.summary}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{relativeTime(int.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {signals.length === 0 && interactions.length === 0 && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ value, options, labels, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '6px 10px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0',
        color: value ? '#fff' : 'rgba(255,255,255,0.45)',
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

const miniInputStyle = {
  flex: 1,
  padding: '5px 8px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0',
  color: '#fff',
  fontSize: '12px',
  fontFamily: 'inherit',
  outline: 'none',
}

const miniBtn = {
  padding: '4px 8px',
  background: 'rgba(155,81,224,0.15)',
  border: 'none',
  color: '#9B51E0',
  fontSize: '14px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  borderRadius: '0',
}

const timelineHeading = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px',
}

const timelineItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  fontSize: '13px',
}

function pageBtnStyle() {
  return {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '0',
  }
}
