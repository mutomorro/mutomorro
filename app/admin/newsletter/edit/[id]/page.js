'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAdminTheme } from '../../../../../lib/admin-theme-context'

// The text fields this editor owns. Order = on-screen order.
// `content` keys are written into content_json; subject/previewText are columns.
const FIELDS = [
  { key: 'subject', label: 'Subject line (inbox)', type: 'input', column: true,
    hint: 'What recipients see in their inbox and as the email subject.' },
  { key: 'previewText', label: 'Preview text (inbox)', type: 'input', column: true,
    hint: 'The grey snippet shown next to the subject in most inboxes.' },
  { key: 'monthYear', label: 'Edition date label', type: 'input',
    hint: 'Small uppercase label beside the logo, e.g. June 2026.' },
  { key: 'subjectLine', label: 'Headline', type: 'input',
    hint: 'The large heading at the top of the email body.' },
  { key: 'introText', label: 'Intro', type: 'textarea', rows: 3,
    hint: 'The opening paragraph under the headline.' },
  { key: 'observationKicker', label: 'Observation label', type: 'input',
    hint: 'Small label above the observation title, e.g. Field notes.' },
  { key: 'observationTitle', label: 'Observation title', type: 'input' },
  { key: 'observationBody', label: 'Observation body', type: 'textarea', rows: 16,
    hint: 'Blank lines start new paragraphs. For bold or links use raw HTML - <strong>...</strong> and <a href="...">...</a>. Markdown is not parsed.' },
  { key: 'signOff', label: 'Sign-off', type: 'input', hint: 'e.g. James' },
  { key: 'ps', label: 'P.S.', type: 'textarea', rows: 3 },
]

const EMPTY = FIELDS.reduce((acc, f) => { acc[f.key] = ''; return acc }, {})

export default function NewsletterEditPage() {
  const { theme } = useAdminTheme()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [meta, setMeta] = useState(null) // { title, status, hasContent, nonEditable }

  const [form, setForm] = useState(EMPTY)
  const [saved, setSaved] = useState(EMPTY) // last-saved snapshot, for dirty tracking

  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null) // { type, message }

  // Preview
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [previewWidth, setPreviewWidth] = useState('desktop')

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved]
  )

  // Load the issue
  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/admin/newsletter/issues/${id}`)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Failed to load issue')
        return j
      })
      .then((d) => {
        const next = { ...EMPTY, ...(d.editable || {}) }
        setForm(next)
        setSaved(next)
        setMeta({
          title: d.title,
          status: d.status,
          hasContent: d.hasContent,
          nonEditable: d.nonEditable || {},
        })
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function onBeforeUnload(e) {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // Debounced live preview — reflects unsaved edits via the preview overrides
  const previewBodyRef = useRef('')
  useEffect(() => {
    if (loading || loadError) return
    const payload = {
      template: 'editorial',
      content: { calendarItemId: id, ...form },
    }
    const body = JSON.stringify(payload)
    if (body === previewBodyRef.current) return
    previewBodyRef.current = body

    const t = setTimeout(() => {
      setPreviewLoading(true)
      setPreviewError('')
      fetch('/api/admin/newsletter/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
        .then(async (r) => {
          const j = await r.json()
          if (!r.ok) throw new Error(j.error || 'Preview failed')
          return j
        })
        .then((d) => setPreviewHtml(d.html))
        .catch((e) => setPreviewError(e.message))
        .finally(() => setPreviewLoading(false))
    }, 500)
    return () => clearTimeout(t)
  }, [id, form, loading, loadError])

  const setField = useCallback((key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaveResult(null)
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveResult(null)
    try {
      const content = {}
      for (const f of FIELDS) {
        if (!f.column) content[f.key] = form[f.key]
      }
      const res = await fetch(`/api/admin/newsletter/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject,
          previewText: form.previewText,
          content,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Save failed')
      setSaved(form)
      setSaveResult({ type: 'success', message: 'Saved. These changes will be included when you send.' })
    } catch (e) {
      setSaveResult({ type: 'error', message: e.message })
    } finally {
      setSaving(false)
    }
  }

  const ne = meta?.nonEditable || {}
  const hasNonEditable = ne.indexItemCount > 0 || ne.contentBlockCount > 0 || ne.hasHeroImage

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>
            Edit content
          </h1>
          <p style={{ fontSize: '13px', color: theme.textMuted, margin: '6px 0 0 0' }}>
            {meta?.title ? meta.title : 'Newsletter issue'} - edit the words, preview live, then save.
          </p>
        </div>
        <a href="/admin/newsletter/send" style={{ fontSize: '13px', color: theme.textMuted, textDecoration: 'none' }}>
          Go to send {'→'}
        </a>
      </div>

      {loadError ? (
        <div style={{ padding: '16px', background: 'rgba(255,66,121,0.08)', borderLeft: `3px solid ${theme.danger}`, borderRadius: '4px', fontSize: '13px', color: theme.danger }}>
          {loadError}
        </div>
      ) : (
        <>
          {/* Save bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', flexWrap: 'wrap',
            padding: '14px 18px', marginBottom: '20px',
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px',
          }}>
            <div style={{ fontSize: '13px', color: dirty ? theme.warning : theme.textMuted }}>
              {loading ? 'Loading…' : dirty ? 'Unsaved changes' : 'All changes saved'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {saveResult && (
                <span style={{
                  fontSize: '12px', padding: '6px 12px', borderRadius: '4px',
                  background: saveResult.type === 'success' ? 'rgba(45,212,191,0.1)' : 'rgba(255,66,121,0.1)',
                  color: saveResult.type === 'success' ? theme.success : theme.danger,
                }}>
                  {saveResult.message}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={loading || saving || !dirty}
                style={{
                  padding: '10px 22px', borderRadius: '6px', border: 'none',
                  background: !loading && !saving && dirty ? theme.accent : theme.accentBg,
                  color: !loading && !saving && dirty ? '#fff' : theme.textMuted,
                  fontSize: '13px', fontWeight: 400, fontFamily: 'inherit',
                  cursor: !loading && !saving && dirty ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>

          {meta && !meta.hasContent && (
            <div style={{ padding: '14px 18px', marginBottom: '20px', background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: '8px', fontSize: '13px', color: theme.textSecondary, lineHeight: 1.5 }}>
              This issue has no content yet. Add an observation body below to create it, or ask Claude to draft the full edition.
            </div>
          )}

          {/* Editor + preview */}
          <div className="nl-edit-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
            {/* Form */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '22px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle(theme)}>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea
                        value={form[f.key]}
                        onChange={setField(f.key)}
                        rows={f.rows || 4}
                        disabled={loading}
                        style={{ ...inputStyle(theme), fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={form[f.key]}
                        onChange={setField(f.key)}
                        disabled={loading}
                        style={inputStyle(theme)}
                      />
                    )}
                    {f.hint && (
                      <p style={{ fontSize: '12px', color: theme.textMuted, margin: '6px 0 0 0', lineHeight: 1.5 }}>
                        {f.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {hasNonEditable && (
                <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Also on this issue (not editable here yet)
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '13px', color: theme.textSecondary, lineHeight: 1.7 }}>
                    {ne.indexItemCount > 0 && <li>{ne.indexItemCount} index {ne.indexItemCount === 1 ? 'item' : 'items'} (the {'“'}In this edition{'”'} list)</li>}
                    {ne.contentBlockCount > 0 && <li>{ne.contentBlockCount} content {ne.contentBlockCount === 1 ? 'block' : 'blocks'} (the link cards at the foot)</li>}
                    {ne.hasHeroImage && <li>A hero image</li>}
                  </ul>
                  <p style={{ fontSize: '12px', color: theme.textMuted, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    These render in the preview and send unchanged. To change them, ask Claude for now.
                  </p>
                </div>
              )}
            </div>

            {/* Live preview */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px', padding: '22px', position: 'sticky', top: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'inline-flex', background: theme.inputBg, borderRadius: '6px', padding: '3px' }}>
                  {[{ id: 'desktop', label: 'Desktop' }, { id: 'mobile', label: 'Mobile' }].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setPreviewWidth(o.id)}
                      style={{
                        padding: '6px 14px', borderRadius: '4px', border: 'none',
                        background: previewWidth === o.id ? theme.accentBg : 'transparent',
                        color: previewWidth === o.id ? theme.accent : theme.textSecondary,
                        fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer',
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {previewLoading && <span style={{ fontSize: '12px', color: theme.textMuted }}>Rendering…</span>}
              </div>

              {previewError ? (
                <div style={{ padding: '16px', background: 'rgba(255,66,121,0.08)', borderLeft: `3px solid ${theme.danger}`, borderRadius: '4px', fontSize: '13px', color: theme.danger }}>
                  {previewError}
                </div>
              ) : !previewHtml ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: theme.inputBg, borderRadius: '6px' }}>
                  <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>
                    {loading ? 'Loading…' : 'Preview will appear here.'}
                  </p>
                </div>
              ) : (
                <div style={{ background: '#FAF6F1', borderRadius: '6px', padding: '16px', overflow: 'auto' }}>
                  <iframe
                    title="Email preview"
                    srcDoc={previewHtml}
                    style={{
                      width: previewWidth === 'mobile' ? '375px' : '580px',
                      height: '760px', margin: '0 auto', display: 'block',
                      border: 'none', background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', textAlign: 'center', margin: '12px 0 0 0' }}>
                    Approximate. Send a test from the send page to see exact inbox rendering.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .nl-edit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function labelStyle(theme) {
  return {
    display: 'block', fontSize: '11px', color: theme.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
  }
}

function inputStyle(theme) {
  return {
    display: 'block', width: '100%', padding: '10px 12px', borderRadius: '6px',
    border: `1px solid ${theme.cardBorder}`, background: theme.inputBg,
    color: theme.textPrimary, fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box',
  }
}
