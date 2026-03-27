'use client'

import { useState, useEffect, useCallback } from 'react'

// Temperature colours
const tempColours = {
  hot: '#DC2626',
  warm: '#D97706',
  cool: '#3B82F6',
  archived: 'rgba(255,255,255,0.2)',
}

const ratingColours = {
  yes: '#22C55E',
  maybe: '#D97706',
  no: '#DC2626',
}

const statusOptions = ['new', 'reviewing', 'bidding', 'submitted', 'won', 'lost', 'passed']

function relativeTime(dateStr) {
  if (!dateStr) return '-'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}

function formatValue(low, high) {
  if (!low && !high) return '-'
  const fmt = (n) => '£' + Number(n).toLocaleString('en-GB')
  if (low && high && low !== high) return `${fmt(low)} – ${fmt(high)}`
  return fmt(low || high)
}

function Skeleton({ width, height = 20 }) {
  return (
    <div style={{ width: width || '100%', height, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
}

export default function AdminTenders() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [temperature, setTemperature] = useState('')
  const [status, setStatus] = useState('new')
  const [rating, setRating] = useState('')
  const [sector, setSector] = useState('')
  const [source, setSource] = useState('')
  const [noticeType, setNoticeType] = useState('')
  const [sort, setSort] = useState('score')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchTenders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), sort })
    if (temperature) params.set('temperature', temperature)
    if (status) params.set('status', status)
    if (rating) params.set('rating', rating)
    if (sector) params.set('sector', sector)
    if (source) params.set('source', source)
    if (noticeType) params.set('notice_type', noticeType)
    if (search) params.set('search', search)

    try {
      const res = await fetch(`/api/admin/tenders?${params}`)
      if (!res.ok) throw new Error('Failed to load')
      setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, temperature, status, rating, sector, source, noticeType, sort, search])

  useEffect(() => { fetchTenders() }, [fetchTenders])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [temperature, status, rating, sector, source, noticeType, sort, search])

  async function loadDetail(id) {
    if (selectedId === id) { setSelectedId(null); return }
    setSelectedId(id)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/tenders/${id}`)
      setDetail(await res.json())
    } catch { setDetail(null) }
    finally { setDetailLoading(false) }
  }

  async function patchTender(id, updates) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/tenders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      // Update in list
      if (data) {
        setData(prev => ({
          ...prev,
          tenders: prev.tenders.map(t => t.id === id ? { ...t, ...updated } : t),
        }))
      }
      if (detail?.id === id) setDetail(prev => ({ ...prev, ...updated }))
    } catch { /* silently fail */ }
    finally { setSaving(false) }
  }

  const stats = data?.stats || {}
  const tenders = data?.tenders || []

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>Tenders</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Review, rate, and track tender opportunities</p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
        <span>{stats.total || 0} total</span>
        <span style={{ color: tempColours.hot }}>● {stats.hot || 0} hot</span>
        <span style={{ color: tempColours.warm }}>● {stats.warm || 0} warm</span>
        <span style={{ color: tempColours.cool }}>● {stats.cool || 0} cool</span>
        <span style={{ color: tempColours.archived }}>● {stats.archived || 0} archived</span>
        <span>🔵 {stats.triggers || 0} triggers</span>
        <span>{stats.unrated || 0} unrated</span>
        {data && <span style={{ marginLeft: 'auto' }}>Showing {data.total} results · Page {data.page} of {data.pages}</span>}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        <FilterSelect label="Temperature" value={temperature} onChange={v => setTemperature(v)}
          options={[['', 'All'], ['hot', 'Hot'], ['warm', 'Warm'], ['cool', 'Cool'], ['archived', 'Archived']]} />
        <FilterSelect label="Status" value={status} onChange={v => setStatus(v)}
          options={[['', 'All'], ...statusOptions.map(s => [s, s.charAt(0).toUpperCase() + s.slice(1)])]} />
        <FilterSelect label="Rating" value={rating} onChange={v => setRating(v)}
          options={[['', 'All'], ['unrated', 'Unrated'], ['yes', 'Yes'], ['maybe', 'Maybe'], ['no', 'No']]} />
        <FilterSelect label="Source" value={source} onChange={v => setSource(v)}
          options={[['', 'All'], ['contracts-finder', 'Contracts Finder'], ['find-a-tender', 'Find a Tender'], ['google-alerts', 'Google Alerts'], ['watchlist', 'Watchlist']]} />
        <FilterSelect label="Sort" value={sort} onChange={v => setSort(v)}
          options={[['score', 'Highest score'], ['newest', 'Newest'], ['deadline', 'Deadline soonest'], ['rated', 'Recently rated']]} />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Tender list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {loading ? (
          Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ ...rowStyle, padding: '16px 20px' }}>
              <Skeleton height={18} />
            </div>
          ))
        ) : tenders.length === 0 ? (
          <div style={{ ...cardStyle, padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No tenders match these filters</p>
          </div>
        ) : (
          tenders.map(tender => (
            <div key={tender.id}>
              <TenderRow
                tender={tender}
                isSelected={selectedId === tender.id}
                onSelect={() => loadDetail(tender.id)}
                onRate={(r) => patchTender(tender.id, { james_rating: r })}
                onStatusChange={(s) => patchTender(tender.id, { status: s })}
                saving={saving}
              />
              {selectedId === tender.id && (
                <DetailPanel
                  detail={detail}
                  loading={detailLoading}
                  onPatch={(updates) => patchTender(tender.id, updates)}
                  saving={saving}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={pageBtnStyle}>← Prev</button>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{page} of {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages} style={pageBtnStyle}>Next →</button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
          div[style*="flex-wrap: wrap"] { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}

function TenderRow({ tender, isSelected, onSelect, onRate, onStatusChange, saving }) {
  const days = daysUntil(tender.deadline)
  const isTrigger = tender.notice_type === 'trigger_event'
  const deadlineUrgent = days !== null && days >= 0 && days < 7

  return (
    <div style={{
      ...rowStyle,
      borderLeft: `3px solid ${isTrigger ? '#3B82F6' : (tempColours[tender.temperature] || 'transparent')}`,
      background: isSelected ? 'rgba(155,81,224,0.08)' : rowStyle.background,
    }}>
      {/* Main row content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Temperature dot */}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
          background: isTrigger ? '#3B82F6' : (tempColours[tender.temperature] || 'rgba(255,255,255,0.15)'),
        }} />

        {/* Title & org */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onSelect}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tender.title}
            </span>
            {isTrigger && <Badge text="Signal" colour="#3B82F6" />}
            {tender.status !== 'new' && <Badge text={tender.status} colour="#9B51E0" />}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tender.organisation || 'Unknown'}{tender.sector ? ` · ${tender.sector}` : ''} · {formatValue(tender.value_low, tender.value_high)}
          </div>
        </div>

        {/* Score & AI */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '60px' }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: tempColours[tender.temperature] || '#fff' }}>
            {tender.total_score}
          </div>
          {tender.ai_score != null && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>AI {tender.ai_score}/10</div>
          )}
        </div>

        {/* Deadline */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '70px' }}>
          {tender.deadline ? (
            <>
              <div style={{ fontSize: '12px', color: deadlineUrgent ? '#DC2626' : 'rgba(255,255,255,0.5)' }}>
                {days !== null ? (days < 0 ? 'Expired' : `${days}d left`) : ''}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                {new Date(tender.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>-</div>
          )}
        </div>

        {/* Rating buttons */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {['yes', 'maybe', 'no'].map(r => (
            <button
              key={r}
              onClick={() => onRate(tender.james_rating === r ? null : r)}
              disabled={saving}
              style={{
                ...miniBtn,
                background: tender.james_rating === r ? ratingColours[r] : 'rgba(255,255,255,0.04)',
                color: tender.james_rating === r ? '#fff' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${tender.james_rating === r ? ratingColours[r] : 'rgba(255,255,255,0.08)'}`,
              }}
              title={r === 'yes' ? 'Would bid' : r === 'maybe' ? 'Maybe' : 'Would not bid'}
            >
              {r === 'yes' ? '✓' : r === 'maybe' ? '?' : '✕'}
            </button>
          ))}
        </div>

        {/* Source */}
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0, minWidth: '50px', textAlign: 'right' }}>
          {tender.source === 'contracts-finder' ? 'CF' : tender.source === 'find-a-tender' ? 'FaT' : tender.source === 'google-alerts' ? 'GA' : tender.source === 'watchlist' ? 'WL' : tender.source}
        </div>
      </div>

      {/* AI summary line */}
      {tender.ai_summary && (
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', marginLeft: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tender.ai_summary}
        </div>
      )}
    </div>
  )
}

function DetailPanel({ detail, loading, onPatch, saving }) {
  const [notes, setNotes] = useState('')
  const [ratingNotes, setRatingNotes] = useState('')

  useEffect(() => {
    if (detail) {
      setNotes(detail.notes || '')
      setRatingNotes(detail.rating_notes || '')
    }
  }, [detail])

  if (loading) return (
    <div style={{ ...detailStyle }}>
      <Skeleton height={200} />
    </div>
  )

  if (!detail) return null

  const days = daysUntil(detail.deadline)

  return (
    <div style={detailStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left column */}
        <div>
          {/* Key info */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Details</h3>
            <div style={metaRow}><span style={metaLabel}>Organisation</span><span style={metaVal}>{detail.organisation || '-'}</span></div>
            <div style={metaRow}><span style={metaLabel}>Sector</span><span style={metaVal}>{detail.sector || '-'}</span></div>
            <div style={metaRow}><span style={metaLabel}>Value</span><span style={metaVal}>{formatValue(detail.value_low, detail.value_high)}</span></div>
            <div style={metaRow}><span style={metaLabel}>Deadline</span><span style={{ ...metaVal, color: days !== null && days < 7 && days >= 0 ? '#DC2626' : metaVal.color }}>{detail.deadline ? `${new Date(detail.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}${days !== null ? ` (${days < 0 ? 'expired' : days + 'd'})` : ''}` : '-'}</span></div>
            <div style={metaRow}><span style={metaLabel}>Source</span><span style={metaVal}>{detail.source}</span></div>
            <div style={metaRow}><span style={metaLabel}>Found</span><span style={metaVal}>{relativeTime(detail.found_at)}</span></div>
            <div style={metaRow}><span style={metaLabel}>Notice type</span><span style={metaVal}>{detail.notice_type || '-'}</span></div>
          </div>

          {/* AI Assessment */}
          {detail.ai_score != null && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>AI Assessment</h3>
              <div style={{ fontSize: '20px', fontWeight: 500, color: detail.ai_score >= 7 ? '#22C55E' : detail.ai_score >= 5 ? '#D97706' : '#DC2626', marginBottom: '4px' }}>
                {detail.ai_score}/10
              </div>
              {detail.ai_summary && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{detail.ai_summary}</div>}
            </div>
          )}

          {/* Scoring breakdown */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Score Breakdown</h3>
            <div style={metaRow}><span style={metaLabel}>Keywords</span><span style={metaVal}>{detail.keyword_score || 0}{detail.keywords_matched?.length ? ` (${detail.keywords_matched.join(', ')})` : ''}</span></div>
            <div style={metaRow}><span style={metaLabel}>Sector</span><span style={metaVal}>{detail.sector_score || 0}</span></div>
            <div style={metaRow}><span style={metaLabel}>Value</span><span style={metaVal}>{detail.value_score || 0}</span></div>
            <div style={metaRow}><span style={metaLabel}>AI adj.</span><span style={metaVal}>{detail.ai_score != null ? (detail.ai_score >= 8 ? '+10' : detail.ai_score >= 5 ? '+5' : detail.ai_score <= 2 ? '-10' : '0') : '-'}</span></div>
            <div style={{ ...metaRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}><span style={{ ...metaLabel, color: 'rgba(255,255,255,0.6)' }}>Total</span><span style={{ fontSize: '16px', fontWeight: 500, color: tempColours[detail.temperature] || '#fff' }}>{detail.total_score}</span></div>
          </div>

          {detail.source_url && (
            <a href={detail.source_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(155,81,224,0.15)', color: '#9B51E0', fontSize: '13px', textDecoration: 'none', border: 'none' }}>
              View original tender →
            </a>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Status */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Status</h3>
            <select
              value={detail.status || 'new'}
              onChange={e => onPatch({ status: e.target.value })}
              disabled={saving}
              style={selectStyle}
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Description</h3>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6', maxHeight: '200px', overflow: 'auto' }}>
              {detail.description || 'No description available'}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes..."
              style={{ ...textareaStyle, height: '60px' }}
            />
            <button
              onClick={() => onPatch({ notes })}
              disabled={saving || notes === (detail.notes || '')}
              style={{ ...miniBtn, marginTop: '6px', padding: '6px 14px', background: notes !== (detail.notes || '') ? 'rgba(155,81,224,0.15)' : 'rgba(255,255,255,0.04)', color: notes !== (detail.notes || '') ? '#9B51E0' : 'rgba(255,255,255,0.25)' }}
            >
              Save notes
            </button>
          </div>

          {/* Rating notes */}
          <div>
            <h3 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Rating notes</h3>
            <textarea
              value={ratingNotes}
              onChange={e => setRatingNotes(e.target.value)}
              placeholder="Why yes/no/maybe..."
              style={{ ...textareaStyle, height: '60px' }}
            />
            <button
              onClick={() => onPatch({ rating_notes: ratingNotes })}
              disabled={saving || ratingNotes === (detail.rating_notes || '')}
              style={{ ...miniBtn, marginTop: '6px', padding: '6px 14px', background: ratingNotes !== (detail.rating_notes || '') ? 'rgba(155,81,224,0.15)' : 'rgba(255,255,255,0.04)', color: ratingNotes !== (detail.rating_notes || '') ? '#9B51E0' : 'rgba(255,255,255,0.25)' }}
            >
              Save rating notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ text, colour }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: 400, color: colour, background: `${colour}15`,
      padding: '2px 7px', letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
    }}>{text}</span>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      title={label}
      style={filterStyle}
    >
      {options.map(([val, lbl]) => (
        <option key={val} value={val}>{label}: {lbl}</option>
      ))}
    </select>
  )
}

// Shared styles
const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
}

const rowStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.05)',
  padding: '12px 16px',
  marginBottom: '2px',
}

const detailStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderTop: 'none',
  padding: '20px',
  marginBottom: '2px',
}

const filterStyle = {
  padding: '6px 10px',
  fontSize: '12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.7)',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const inputStyle = {
  padding: '6px 12px',
  fontSize: '12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
  fontFamily: 'inherit',
  minWidth: '140px',
}

const selectStyle = {
  padding: '8px 12px',
  fontSize: '13px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontFamily: 'inherit',
  width: '100%',
}

const textareaStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '13px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontFamily: 'inherit',
  resize: 'vertical',
}

const miniBtn = {
  padding: '4px 8px',
  fontSize: '12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const pageBtnStyle = {
  padding: '6px 14px',
  fontSize: '13px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const metaRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  fontSize: '13px',
}

const metaLabel = {
  color: 'rgba(255,255,255,0.35)',
}

const metaVal = {
  color: 'rgba(255,255,255,0.7)',
}
