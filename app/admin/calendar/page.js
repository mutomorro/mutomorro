'use client'

import { useState, useEffect, useCallback } from 'react'

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
  return date.toISOString().split('T')[0]
}

function isSameDay(d1, d2) {
  return formatDateStr(d1) === formatDateStr(d2)
}

function isToday(date) {
  return isSameDay(date, new Date())
}

export default function CalendarPage() {
  const [view, setView] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => getMonday(new Date()))
  const [items, setItems] = useState([])
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Calendar
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{weekLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden', marginRight: '8px' }}>
            {['week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  background: view === v ? 'rgba(155,81,224,0.2)' : 'transparent',
                  color: view === v ? '#fff' : 'rgba(255,255,255,0.4)',
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

      {/* Calendar grid */}
      {view === 'week' ? (
        <WeekView
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
          days={monthDays}
          monthStart={monthStart}
          monthEnd={monthEnd}
          items={items}
          itemsForDate={itemsForDate}
          onDayClick={openAdd}
          onItemClick={openEdit}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <ItemModal
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

function WeekView({ days, itemsForDate, onAddClick, onItemClick, onStatusCycle, loading }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
      {days.map((day) => {
        const dateStr = formatDateStr(day)
        const dayItems = itemsForDate(dateStr)
        const today = isToday(day)

        return (
          <div
            key={dateStr}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: today ? '1px solid rgba(155,81,224,0.4)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Day header */}
            <div style={{
              padding: '10px 12px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {dayNames[days.indexOf(day)]}
                </span>
                <span style={{
                  marginLeft: '6px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: today ? '#9B51E0' : 'rgba(255,255,255,0.7)',
                }}>
                  {day.getDate()}
                </span>
              </div>
              <button
                onClick={() => onAddClick(dateStr)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.15)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.target.style.color = 'rgba(255,255,255,0.5)' }}
                onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.15)' }}
              >
                +
              </button>
            </div>

            {/* Items */}
            <div style={{ padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loading ? (
                <div style={{ height: '30px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ) : (
                dayItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '6px 8px',
                      borderLeft: `3px solid ${typeColours[item.type] || 'rgba(255,255,255,0.2)'}`,
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '0 4px 4px 0',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => onItemClick(item)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  >
                    <div style={{ fontSize: '13px', color: '#fff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.scheduled_time && (
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          {item.scheduled_time.slice(0, 5)}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusCycle(item) }}
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          background: item.status === 'done' ? 'rgba(155,81,224,0.2)' : 'rgba(255,255,255,0.06)',
                          color: item.status === 'done' ? '#9B51E0' : 'rgba(255,255,255,0.45)',
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
          div[style*="grid-template-columns: repeat(7"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function MonthView({ days, monthStart, monthEnd, itemsForDate, onDayClick, onItemClick }) {
  return (
    <div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {dayNames.map((name) => (
          <div key={name} style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 0' }}>
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map((day) => {
          const dateStr = formatDateStr(day)
          const dayItems = itemsForDate(dateStr)
          const inMonth = day >= monthStart && day <= monthEnd
          const today = isToday(day)

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              style={{
                background: inMonth ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                border: today ? '1px solid rgba(155,81,224,0.4)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: '6px',
                padding: '8px',
                minHeight: '110px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = inMonth ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)' }}
            >
              <div style={{
                fontSize: '13px',
                color: today ? '#9B51E0' : inMonth ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
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
                      borderLeft: `2px solid ${typeColours[item.type] || 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '0 2px 2px 0',
                      background: 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

function ItemModal({ item, defaultDate, onSave, onDelete, onClose }) {
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
        width: '100%',
        maxWidth: '480px',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: '#2a2433',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '28px',
        zIndex: 1001,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 400, color: '#fff' }}>
            {item ? 'Edit item' : 'New item'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', fontFamily: 'inherit' }}>
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
                  border: '1px solid rgba(255,66,121,0.3)',
                  color: '#FF4279',
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
                background: '#9B51E0',
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

const navBtnStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '18px',
  padding: '6px 10px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontFamily: 'inherit',
  lineHeight: 1,
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0',
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}
