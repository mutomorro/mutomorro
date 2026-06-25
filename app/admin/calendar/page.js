'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminTheme } from '../../../lib/admin-theme-context'

const typeColours = {
  newsletter: '#9B51E0',
  social: '#2DD4BF',
  task: '#F59E0B',
  outreach: '#FF4279',
  content: '#3B82F6',
}

const typeOptions = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'social', label: 'Social' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'content', label: 'Content' },
  { value: 'task', label: 'Task' },
]

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'drafted', label: 'Drafted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusCycle = ['planned', 'drafted', 'scheduled', 'done']

const platformOptions = [
  { value: '', label: 'None' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
]

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

function formatDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameDay(d1, d2) {
  return formatDateStr(d1) === formatDateStr(d2)
}

function isToday(date) {
  return isSameDay(date, new Date())
}

export default function CalendarPage() {
  const { theme } = useAdminTheme()
  const [view, setView] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => getMonday(new Date()))
  const [items, setItems] = useState([])
  const [overdue, setOverdue] = useState([])
  const [backlog, setBacklog] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [modalDate, setModalDate] = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const dateStr = formatDateStr(anchorDate)
      const res = await fetch(`/api/admin/calendar?view=${view}&date=${dateStr}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setItems(data.items || [])
      setOverdue(data.overdue || [])
      setBacklog(data.backlog || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [anchorDate, view])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  function navigate(direction) {
    const d = new Date(anchorDate)
    if (view === 'week') {
      d.setDate(d.getDate() + direction * 7)
    } else {
      d.setMonth(d.getMonth() + direction)
    }
    setAnchorDate(d)
  }

  function goToday() {
    setAnchorDate(getMonday(new Date()))
  }

  function openAdd(dateStr) {
    setEditingItem(null)
    setModalDate(dateStr)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingItem(item)
    setModalDate(item.scheduled_date)
    setModalOpen(true)
  }

  async function cycleStatus(item) {
    const currentIdx = statusCycle.indexOf(item.status)
    const nextIdx = (currentIdx + 1) % statusCycle.length
    const nextStatus = statusCycle[nextIdx]

    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      })
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function markDone(item) {
    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: 'done' }),
      })
      if (res.ok) fetchItems()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSave(formData) {
    try {
      const method = editingItem ? 'PATCH' : 'POST'
      const body = editingItem ? { id: editingItem.id, ...formData } : formData

      const res = await fetch('/api/admin/calendar', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setModalOpen(false)
        fetchItems()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return

    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setModalOpen(false)
        setItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Build week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(anchorDate)
    d.setDate(anchorDate.getDate() + i)
    weekDays.push(d)
  }

  // Build month grid
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
  const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0)
  const monthGridStart = getMonday(monthStart)
  const monthDays = []
  const d = new Date(monthGridStart)
  while (d <= monthEnd || monthDays.length % 7 !== 0) {
    monthDays.push(new Date(d))
    d.setDate(d.getDate() + 1)
    if (monthDays.length > 42) break
  }

  function itemsForDate(dateStr) {
    return items.filter(
      (i) => i.scheduled_date === dateStr || i.due_date === dateStr
    )
  }

  const weekLabel = view === 'week'
    ? `${weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : anchorDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const navBtnStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    color: theme.textSecondary,
    fontSize: '18px',
    padding: '6px 10px',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: 'inherit',
    lineHeight: 1,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Calendar
          </h1>
          <p style={{ fontSize: '14px', color: theme.textMuted }}>{weekLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: theme.cardBg, borderRadius: '6px', overflow: 'hidden', marginRight: '8px' }}>
            {['week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  background: view === v ? theme.accentBg : 'transparent',
                  color: view === v ? theme.textPrimary : theme.textMuted,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => navigate(-1)} style={navBtnStyle}>&#8249;</button>
          <button onClick={goToday} style={{ ...navBtnStyle, fontSize: '13px', padding: '6px 12px' }}>Today</button>
          <button onClick={() => navigate(1)} style={navBtnStyle}>&#8250;</button>
        </div>
      </div>

      {/* Summary bar — counts by type for the visible range + overdue/backlog alerts */}
      <CalendarSummary theme={theme} items={items} overdue={overdue} backlog={backlog} />

      {/* Calendar grid */}
      {view === 'week' ? (
        <WeekView
          theme={theme}
          days={weekDays}
          items={items}
          itemsForDate={itemsForDate}
          onAddClick={openAdd}
          onItemClick={openEdit}
          onStatusCycle={cycleStatus}
          loading={loading}
        />
      ) : (
        <MonthView
          theme={theme}
          days={monthDays}
          monthStart={monthStart}
          monthEnd={monthEnd}
          items={items}
          itemsForDate={itemsForDate}
          onDayClick={openAdd}
          onItemClick={openEdit}
        />
      )}

      {/* Overdue lane — past-due open items, invisible in the current grid */}
      {overdue.length > 0 && (
        <ItemLane
          theme={theme}
          title="Overdue"
          accent={theme.danger}
          items={overdue}
          showDate
          onItemClick={openEdit}
          onMarkDone={markDone}
        />
      )}

      {/* Unscheduled backlog — open items with no date, otherwise invisible */}
      {backlog.length > 0 && (
        <ItemLane
          theme={theme}
          title="Unscheduled backlog"
          accent={theme.warning}
          items={backlog}
          onItemClick={openEdit}
          onMarkDone={markDone}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <ItemModal
          theme={theme}
          item={editingItem}
          defaultDate={modalDate}
          onSave={handleSave}
          onDelete={editingItem ? () => handleDelete(editingItem.id) : null}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

function CalendarSummary({ theme, items, overdue, backlog }) {
  const byType = {}
  for (const it of items) byType[it.type] = (byType[it.type] || 0) + 1
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
      <span style={{ color: theme.textSecondary }}>{items.length} in view</span>
      {typeEntries.map(([type, n]) => (
        <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: theme.textMuted }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColours[type] || theme.textLabel }} />
          {n} {type}
        </span>
      ))}
      {overdue.length > 0 && (
        <span style={{ color: theme.danger, marginLeft: 'auto', fontWeight: 500 }}>
          ⚠ {overdue.length} overdue
        </span>
      )}
      {backlog.length > 0 && (
        <span style={{ color: theme.warning, marginLeft: overdue.length > 0 ? 0 : 'auto' }}>
          {backlog.length} unscheduled
        </span>
      )}
    </div>
  )
}

function ItemLane({ theme, title, accent, items, showDate, onItemClick, onMarkDone }) {
  return (
    <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '16px 18px', marginTop: '24px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 400, color: accent, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
        {title} <span style={{ color: theme.textMuted }}>· {items.length}</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
              borderBottom: `1px solid ${theme.rowBorder}`,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColours[item.type] || theme.textLabel, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onItemClick(item)}>
              <div style={{ fontSize: '14px', color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                {item.type}{item.status ? ` · ${item.status}` : ''}
                {showDate && item.scheduled_date ? ` · was ${new Date(item.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
              </div>
            </div>
            <button
              onClick={() => onMarkDone(item)}
              title="Mark done"
              style={{
                padding: '4px 10px', fontSize: '12px', background: theme.cardBgHover, color: theme.textSecondary,
                border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              ✓ Done
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeekView({ theme, days, itemsForDate, onAddClick, onItemClick, onStatusCycle, loading }) {
  return (
    <div className="admin-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
      {days.map((day) => {
        const dateStr = formatDateStr(day)
        const dayItems = itemsForDate(dateStr)
        const today = isToday(day)

        return (
          <div
            key={dateStr}
            style={{
              background: theme.cardBg,
              border: today ? `1px solid ${theme.accentBorder}` : `1px solid ${theme.cardBorder}`,
              borderRadius: '8px',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Day header */}
            <div style={{
              padding: '10px 12px 8px',
              borderBottom: `1px solid ${theme.rowBorder}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {dayNames[days.indexOf(day)]}
                </span>
                <span style={{
                  marginLeft: '6px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: today ? theme.accent : theme.textSecondary,
                }}>
                  {day.getDate()}
                </span>
              </div>
              <button
                onClick={() => onAddClick(dateStr)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textLabel,
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.target.style.color = theme.textSecondary }}
                onMouseLeave={(e) => { e.target.style.color = theme.textLabel }}
              >
                +
              </button>
            </div>

            {/* Items */}
            <div style={{ padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loading ? (
                <div style={{ height: '30px', background: theme.cardBg, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ) : (
                dayItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '6px 8px',
                      borderLeft: `3px solid ${typeColours[item.type] || theme.textLabel}`,
                      background: theme.cardBg,
                      borderRadius: '0 4px 4px 0',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => onItemClick(item)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = theme.cardBgHover }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = theme.cardBg }}
                  >
                    <div style={{ fontSize: '13px', color: theme.textPrimary, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.scheduled_time && (
                        <span style={{ fontSize: '11px', color: theme.textMuted }}>
                          {item.scheduled_time.slice(0, 5)}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusCycle(item) }}
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          background: item.status === 'done' ? theme.accentBg : theme.cardBgHover,
                          color: item.status === 'done' ? theme.accent : theme.textMuted,
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {item.status}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @media (max-width: 768px) {
          .admin-week-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function MonthView({ theme, days, monthStart, monthEnd, itemsForDate, onDayClick, onItemClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px', minWidth: '500px' }}>
        {dayNames.map((name) => (
          <div key={name} style={{ textAlign: 'center', fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 0' }}>
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', minWidth: '500px' }}>
        {days.map((day) => {
          const dateStr = formatDateStr(day)
          const dayItems = itemsForDate(dateStr)
          const inMonth = day >= monthStart && day <= monthEnd
          const today = isToday(day)

          const inMonthBg = inMonth ? theme.cardBg : theme.sidebarHover

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              style={{
                background: inMonthBg,
                border: today ? `1px solid ${theme.accentBorder}` : `1px solid ${theme.rowBorder}`,
                borderRadius: '6px',
                padding: '8px',
                minHeight: '110px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.cardBgHover }}
              onMouseLeave={(e) => { e.currentTarget.style.background = inMonthBg }}
            >
              <div style={{
                fontSize: '13px',
                color: today ? theme.accent : inMonth ? theme.textSecondary : theme.textLabel,
                marginBottom: '6px',
              }}>
                {day.getDate()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={(e) => { e.stopPropagation(); onItemClick(item) }}
                    title={item.title}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 4px',
                      borderLeft: `2px solid ${typeColours[item.type] || theme.textLabel}`,
                      borderRadius: '0 2px 2px 0',
                      background: theme.cardBg,
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ItemModal({ theme, item, defaultDate, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(item?.title || '')
  const [type, setType] = useState(item?.type || 'task')
  const [platform, setPlatform] = useState(item?.platform || '')
  const [scheduledDate, setScheduledDate] = useState(item?.scheduled_date || defaultDate || '')
  const [scheduledTime, setScheduledTime] = useState(item?.scheduled_time?.slice(0, 5) || '')
  const [status, setStatus] = useState(item?.status || 'planned')
  const [description, setDescription] = useState(item?.description || '')
  const [contentPreview, setContentPreview] = useState(item?.content_preview || '')
  const [tags, setTags] = useState(item?.tags?.join(', ') || '')
  const [saving, setSaving] = useState(false)

  const showPlatform = type === 'social' || type === 'content'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const formData = {
      title: title.trim(),
      type,
      platform: showPlatform ? platform || null : null,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime ? scheduledTime + ':00' : null,
      status,
      description: description.trim() || null,
      content_preview: contentPreview.trim() || null,
      tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
    }

    await onSave(formData)
    setSaving(false)
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 400,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '6px',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: theme.inputBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '0',
    color: theme.textPrimary,
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '10px',
        padding: '28px',
        zIndex: 1001,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 400, color: theme.textPrimary }}>
            {item ? 'Edit item' : 'New item'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '20px', cursor: 'pointer', fontFamily: 'inherit' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
                style={inputStyle}
              />
            </div>

            {/* Type + Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                  {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Platform (conditional) */}
            {showPlatform && (
              <div>
                <label style={labelStyle}>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyle}>
                  {platformOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}

            {/* Date + Time row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Time</label>
                <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Content preview */}
            <div>
              <label style={labelStyle}>Content preview</label>
              <textarea
                value={contentPreview}
                onChange={(e) => setContentPreview(e.target.value)}
                rows={3}
                placeholder="Draft your post text here..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={labelStyle}>Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: `1px solid ${theme.danger}`,
                  color: theme.danger,
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '0',
                  fontFamily: 'inherit',
                }}
              >
                Delete
              </button>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={saving || !title.trim()}
              style={{
                padding: '10px 24px',
                background: theme.accent,
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
              {saving ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
