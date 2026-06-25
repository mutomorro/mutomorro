'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAdminTheme } from '../../../../lib/admin-theme-context'

const PROMO_DEFAULTS = {
  subject: '',
  previewText: '',
  heroImageUrl: '',
  headline: '',
  body: '',
  ctaText: '',
  ctaUrl: '',
  secondaryText: '',
}

// Promo drafts are autosaved to localStorage (this browser only) so a refresh
// or a later visit doesn't lose work. Editorial content already lives in the
// calendar, so only the promo form needs this.
const PROMO_DRAFT_KEY = 'newsletter-promo-draft'

function isPromoEmpty(p) {
  return Object.keys(PROMO_DEFAULTS).every((k) => !String(p[k] || '').trim())
}

export default function NewsletterSendPage() {
  const { theme } = useAdminTheme()

  // Step 1
  const [template, setTemplate] = useState(null)

  // Step 2 — editorial
  const [issues, setIssues] = useState([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [selectedIssueId, setSelectedIssueId] = useState('')

  // Editable subject / preview (both templates)
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')

  // Step 2 — promo
  const [promo, setPromo] = useState(PROMO_DEFAULTS)

  // Step 3 — audience
  const [audiences, setAudiences] = useState([])
  const [audiencesLoading, setAudiencesLoading] = useState(false)
  const [selectedAudienceId, setSelectedAudienceId] = useState('')
  const [audienceCount, setAudienceCount] = useState(null)
  const [audienceCountLoading, setAudienceCountLoading] = useState(false)

  // Step 4 — preview
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [previewWidth, setPreviewWidth] = useState('desktop')
  // Step 4 — pre-send link check (on demand; not part of the live preview)
  const [linkReport, setLinkReport] = useState(null)
  const [linkChecking, setLinkChecking] = useState(false)
  const [linkError, setLinkError] = useState('')

  // Step 5 — actions
  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTestSent, setConfirmTestSent] = useState(false)
  const [issueKey, setIssueKey] = useState('')
  const [issueKeyEdited, setIssueKeyEdited] = useState(false)

  // Send progress
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(null)
  const [sendError, setSendError] = useState('')

  // Initial load
  useEffect(() => {
    setIssuesLoading(true)
    fetch('/api/admin/newsletter/issues')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setIssues(d.items || []))
      .catch(() => setIssues([]))
      .finally(() => setIssuesLoading(false))

    setAudiencesLoading(true)
    fetch('/api/admin/newsletter/audiences')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        setAudiences(d.audiences || [])
        const def = (d.audiences || []).find((a) => a.is_default)
        if (def) setSelectedAudienceId(def.id)
      })
      .catch(() => setAudiences([]))
      .finally(() => setAudiencesLoading(false))
  }, [])

  const selectedIssue = useMemo(
    () => issues.find((i) => i.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  )

  const selectedAudience = useMemo(
    () => audiences.find((a) => a.id === selectedAudienceId) || null,
    [audiences, selectedAudienceId]
  )

  // When issue is selected, populate subject/preview
  useEffect(() => {
    if (template === 'editorial' && selectedIssue) {
      setSubject(selectedIssue.subject || selectedIssue.title || '')
      setPreviewText(selectedIssue.preview_text || '')
    }
  }, [template, selectedIssueId, selectedIssue])

  // Audience count when selection changes
  useEffect(() => {
    if (!selectedAudienceId) { setAudienceCount(null); return }
    const initial = audiences.find((a) => a.id === selectedAudienceId)
    if (initial && typeof initial.count === 'number') setAudienceCount(initial.count)

    setAudienceCountLoading(true)
    fetch(`/api/admin/newsletter/audiences/${selectedAudienceId}/count`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setAudienceCount(d.count))
      .catch(() => {})
      .finally(() => setAudienceCountLoading(false))
  }, [selectedAudienceId, audiences])

  // Auto-generate issue_key when subject / template changes (unless user edited it)
  useEffect(() => {
    if (issueKeyEdited) return
    if (template === 'editorial' && selectedIssue) {
      const lastTag = Array.isArray(selectedIssue.tags) && selectedIssue.tags.length > 0
        ? selectedIssue.tags[selectedIssue.tags.length - 1]
        : slugify(subject)
      setIssueKey(`${slugify(lastTag)}-v1`)
    } else if (template === 'promo' && subject) {
      setIssueKey(`promo-${slugify(subject)}-v1`)
    } else {
      setIssueKey('')
    }
  }, [template, selectedIssue, subject, issueKeyEdited])

  // Sync subject from promo state
  useEffect(() => {
    if (template === 'promo') {
      setSubject(promo.subject)
      setPreviewText(promo.previewText)
    }
  }, [template, promo.subject, promo.previewText])

  // Restore a saved promo draft once on mount (this browser only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROMO_DRAFT_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved && typeof saved === 'object') setPromo((p) => ({ ...p, ...saved }))
      }
    } catch {}
  }, [])

  // Autosave the promo draft as it changes. Never auto-deletes — the empty
  // state is left alone, and the key is removed explicitly on Clear draft or a
  // successful send — so the mount-time restore is never clobbered.
  useEffect(() => {
    if (isPromoEmpty(promo)) return
    try {
      localStorage.setItem(PROMO_DRAFT_KEY, JSON.stringify(promo))
    } catch {}
  }, [promo])

  // Debounced preview rendering
  const previewBodyRef = useRef('')
  useEffect(() => {
    if (!template) { setPreviewHtml(''); return }
    if (template === 'editorial' && (!selectedIssueId || !selectedIssue?.hasContent)) {
      setPreviewHtml('')
      return
    }
    if (template === 'promo') {
      const required = ['subject', 'previewText', 'headline', 'body', 'ctaText', 'ctaUrl']
      for (const k of required) {
        if (!promo[k] || !promo[k].trim()) { setPreviewHtml(''); return }
      }
    }

    const body = JSON.stringify(buildPreviewPayload({ template, selectedIssueId, subject, previewText, promo }))
    if (body === previewBodyRef.current) return
    previewBodyRef.current = body
    setLinkReport(null) // content changed — last link check is stale

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
  }, [template, selectedIssueId, subject, previewText, promo, selectedIssue])

  const canTestSend = template && (
    (template === 'editorial' && selectedIssue?.hasContent) ||
    (template === 'promo' && promo.subject && promo.previewText && promo.headline && promo.body && promo.ctaText && promo.ctaUrl)
  )

  const canSend = canTestSend && selectedAudienceId && audienceCount && audienceCount > 0 && issueKey

  async function checkLinks() {
    setLinkChecking(true)
    setLinkError('')
    setLinkReport(null)
    try {
      const res = await fetch('/api/admin/newsletter/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPreviewPayload({ template, selectedIssueId, subject, previewText, promo })),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Link check failed')
      setLinkReport(d)
    } catch (e) {
      setLinkError(e.message)
    } finally {
      setLinkChecking(false)
    }
  }

  async function handleTestSend() {
    setTestSending(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/newsletter/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPreviewPayload({ template, selectedIssueId, subject, previewText, promo })),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Test send failed')
      setTestResult({ type: 'success', message: `Test sent to james@mutomorro.com` })
    } catch (e) {
      setTestResult({ type: 'error', message: e.message })
    } finally {
      setTestSending(false)
    }
  }

  const pollRef = useRef(null)
  const pollSendStatus = useCallback((sendId) => {
    fetch(`/api/admin/newsletter/send/${sendId}/status`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        setSendProgress(d)
        if (d.status === 'complete' || d.status === 'failed' || d.status === 'paused_quota') {
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
          setSending(false)
        }
      })
      .catch(() => {})
  }, [])

  async function handleSend() {
    setSending(true)
    setSendError('')
    setSendProgress(null)
    try {
      const payload = {
        ...buildPreviewPayload({ template, selectedIssueId, subject, previewText, promo }),
        subject,
        previewText,
        audienceId: selectedAudienceId,
        issueKey,
        confirmTestSent: true,
      }
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Send failed')
      setSendProgress({ sendId: d.sendId, status: 'sending', sent: 0, total: d.total })
      setConfirmOpen(false)

      // Promo is on its way — drop the saved draft so it won't resurface later.
      if (template === 'promo') {
        try { localStorage.removeItem(PROMO_DRAFT_KEY) } catch {}
      }

      // Start polling
      pollRef.current = setInterval(() => pollSendStatus(d.sendId), 3000)
      pollSendStatus(d.sendId)
    } catch (e) {
      setSendError(e.message)
      setSending(false)
    }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: theme.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>
            Send newsletter
          </h1>
          <p style={{ fontSize: '13px', color: theme.textMuted, margin: '6px 0 0 0' }}>
            Pick a template, fill in the content, choose an audience, preview, then send.
          </p>
        </div>
        <a href="/admin/newsletter" style={{ fontSize: '13px', color: theme.textMuted, textDecoration: 'none' }}>
          ← Back to newsletter
        </a>
      </div>

      {/* Step 1 — template */}
      <Step number={1} title="Choose a template" theme={theme}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="newsletter-template-grid">
          <TemplateCard
            theme={theme}
            active={template === 'editorial'}
            onClick={() => setTemplate('editorial')}
            label="Editorial"
            description="Content-led newsletter. Pulls from your planned content."
            iconType="editorial"
          />
          <TemplateCard
            theme={theme}
            active={template === 'promo'}
            onClick={() => setTemplate('promo')}
            label="Promo"
            description="Announcement or promotion. Hero image, headline, CTA."
            iconType="promo"
          />
        </div>
      </Step>

      {/* Step 2 — content */}
      {template && (
        <Step number={2} title="Content" theme={theme}>
          {template === 'editorial' ? (
            <EditorialContent
              theme={theme}
              issues={issues}
              loading={issuesLoading}
              selectedIssueId={selectedIssueId}
              onSelectIssue={setSelectedIssueId}
              selectedIssue={selectedIssue}
              subject={subject}
              setSubject={setSubject}
              previewText={previewText}
              setPreviewText={setPreviewText}
            />
          ) : (
            <PromoContent
              theme={theme}
              promo={promo}
              setPromo={setPromo}
            />
          )}
        </Step>
      )}

      {/* Step 3 — audience */}
      {template && (
        <Step number={3} title="Audience" theme={theme}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="newsletter-audience-grid">
            <div>
              <label style={getLabelStyle(theme)}>Audience</label>
              <select
                value={selectedAudienceId}
                onChange={(e) => setSelectedAudienceId(e.target.value)}
                style={getSelectStyle(theme)}
                disabled={audiencesLoading}
              >
                <option value="">{audiencesLoading ? 'Loading…' : 'Select an audience'}</option>
                {audiences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{typeof a.count === 'number' ? ` — ${a.count.toLocaleString()}` : ''}
                  </option>
                ))}
              </select>
              {selectedAudience?.description && (
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                  {selectedAudience.description}
                </p>
              )}
            </div>
            <div style={{ alignSelf: 'end' }}>
              <div style={{ padding: '14px 18px', background: theme.accentBg, borderRadius: '6px', border: `1px solid ${theme.accentBorder}` }}>
                <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Live count
                </div>
                <div style={{ fontSize: '28px', color: theme.textPrimary, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  {audienceCountLoading ? '…' : (audienceCount === null ? '—' : audienceCount.toLocaleString())}
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>
                  active subscribers in this segment
                </div>
              </div>
            </div>
          </div>
        </Step>
      )}

      {/* Step 4 — preview */}
      {template && (
        <Step number={4} title="Preview" theme={theme}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'inline-flex', background: theme.cardBg, borderRadius: '6px', padding: '3px' }}>
              {[
                { id: 'desktop', label: 'Desktop' },
                { id: 'mobile', label: 'Mobile' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setPreviewWidth(o.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: 'none',
                    background: previewWidth === o.id ? theme.accentBg : 'transparent',
                    color: previewWidth === o.id ? theme.accent : theme.textSecondary,
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
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
            <div style={{ padding: '40px 20px', textAlign: 'center', background: theme.cardBg, borderRadius: '6px', border: `1px dashed ${theme.cardBorder}` }}>
              <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>
                {template === 'editorial' && !selectedIssueId
                  ? 'Select an issue to see a preview.'
                  : template === 'editorial' && selectedIssue && !selectedIssue.hasContent
                  ? "This issue doesn't have structured content yet. Populate content_json on the calendar item before sending."
                  : 'Fill in the content fields above to see a preview.'}
              </p>
            </div>
          ) : (
            <div style={{ background: '#FAF6F1', borderRadius: '6px', padding: '24px', overflow: 'auto' }}>
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                style={{
                  width: previewWidth === 'mobile' ? '375px' : '600px',
                  height: '720px',
                  margin: '0 auto',
                  display: 'block',
                  border: 'none',
                  background: '#fff',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                }}
              />
              <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', textAlign: 'center', margin: '12px 0 0 0' }}>
                Preview is approximate. Send a test to see the exact rendering in your inbox.
              </p>
            </div>
          )}

          {/* Pre-send link check (on demand) */}
          {previewHtml && (
            <div style={{ marginTop: '16px', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={checkLinks}
                  disabled={linkChecking}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.cardBorder}`,
                    background: theme.cardBg,
                    color: linkChecking ? theme.textMuted : theme.textPrimary,
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: linkChecking ? 'wait' : 'pointer',
                  }}
                >
                  {linkChecking ? 'Checking links…' : 'Check links'}
                </button>
                {linkReport ? (
                  <span style={{ fontSize: '12px', color: theme.textSecondary }}>
                    {linkReport.summary.ok} OK
                    {linkReport.summary.broken > 0 && (
                      <span style={{ color: theme.danger, fontWeight: 600 }}> · {linkReport.summary.broken} broken</span>
                    )}
                    {linkReport.summary.unverified > 0 && (
                      <span style={{ color: theme.warning }}> · {linkReport.summary.unverified} unverified</span>
                    )}
                    {linkReport.summary.skipped > 0 && (
                      <span style={{ color: theme.textMuted }}> · {linkReport.summary.skipped} skipped</span>
                    )}
                  </span>
                ) : (
                  !linkChecking && (
                    <span style={{ fontSize: '12px', color: theme.textMuted }}>
                      Confirms every link resolves before you send.
                    </span>
                  )
                )}
              </div>

              {linkError && (
                <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(220,38,38,0.08)', borderLeft: `3px solid ${theme.danger}`, borderRadius: '4px', fontSize: '12px', color: theme.danger }}>
                  {linkError}
                </div>
              )}

              {linkReport && linkReport.links.length > 0 && (
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {linkReport.links.map((l, i) => {
                    const meta = VERDICT_META[l.verdict] || VERDICT_META.skipped
                    const color = theme[meta.tone] || theme.textMuted
                    const detail = [l.status, l.note].filter(Boolean).join(' · ')
                    return (
                      <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', fontSize: '12px', lineHeight: 1.5 }}>
                        <span style={{ color, fontWeight: 700, width: '12px', flexShrink: 0, textAlign: 'center' }}>{meta.icon}</span>
                        <span style={{ color: theme.textSecondary, wordBreak: 'break-all', flex: 1, minWidth: 0 }}>{l.url}</span>
                        {detail && (
                          <span style={{ color: theme.textMuted, flexShrink: 0, whiteSpace: 'nowrap' }}>{detail}</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </Step>
      )}

      {/* Step 5 — actions */}
      {template && (
        <Step number={5} title="Send" theme={theme}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleTestSend}
              disabled={!canTestSend || testSending}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: `1px solid ${theme.cardBorder}`,
                background: theme.cardBg,
                color: canTestSend && !testSending ? theme.textPrimary : theme.textLabel,
                fontSize: '13px',
                fontFamily: 'inherit',
                cursor: canTestSend && !testSending ? 'pointer' : 'not-allowed',
              }}
            >
              {testSending ? 'Sending test…' : 'Send test to james@mutomorro.com'}
            </button>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSend || sending}
              style={{
                padding: '10px 22px',
                borderRadius: '6px',
                border: 'none',
                background: canSend && !sending ? theme.accent : theme.accentBg,
                color: canSend && !sending ? '#fff' : theme.textMuted,
                fontSize: '13px',
                fontWeight: 400,
                fontFamily: 'inherit',
                cursor: canSend && !sending ? 'pointer' : 'not-allowed',
              }}
            >
              {sending
                ? 'Sending…'
                : selectedAudience && audienceCount !== null
                  ? `Send to ${selectedAudience.name} (${audienceCount.toLocaleString()})`
                  : 'Send to audience'}
            </button>

            {testResult && (
              <span style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '4px',
                background: testResult.type === 'success' ? 'rgba(45,212,191,0.1)' : 'rgba(255,66,121,0.1)',
                color: testResult.type === 'success' ? theme.success : theme.danger,
              }}>
                {testResult.message}
              </span>
            )}
          </div>

          {sendError && (
            <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(255,66,121,0.08)', borderLeft: `3px solid ${theme.danger}`, borderRadius: '4px', fontSize: '13px', color: theme.danger }}>
              {sendError}
            </div>
          )}

          {sendProgress && (
            <SendProgress theme={theme} progress={sendProgress} />
          )}
        </Step>
      )}

      {/* Confirmation modal */}
      {confirmOpen && (
        <ConfirmModal
          theme={theme}
          template={template}
          subject={subject}
          audienceName={selectedAudience?.name}
          audienceCount={audienceCount}
          issueKey={issueKey}
          setIssueKey={(v) => { setIssueKey(v); setIssueKeyEdited(true) }}
          confirmTestSent={confirmTestSent}
          setConfirmTestSent={setConfirmTestSent}
          onCancel={() => { setConfirmOpen(false); setConfirmTestSent(false) }}
          onConfirm={handleSend}
          sending={sending}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .newsletter-template-grid { grid-template-columns: 1fr !important; }
          .newsletter-audience-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function buildPreviewPayload({ template, selectedIssueId, subject, previewText, promo }) {
  if (template === 'editorial') {
    return {
      template,
      content: {
        calendarItemId: selectedIssueId,
        subject,
        previewText,
      },
    }
  }
  return {
    template,
    content: { ...promo, subject, previewText },
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// ─── Components ────────────────────────────────────────────────────

// Icon + theme colour token for each link-check verdict.
const VERDICT_META = {
  ok: { icon: '✓', tone: 'success' },
  broken: { icon: '✗', tone: 'danger' },
  unverified: { icon: '!', tone: 'warning' },
  skipped: { icon: '–', tone: 'textMuted' },
}

function Step({ number, title, theme, children }) {
  return (
    <section style={{ ...getCardStyle(theme), marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
        <span style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: theme.accentBg, color: theme.accent,
          fontSize: '12px', fontWeight: 400,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {number}
        </span>
        <h2 style={{ fontSize: '15px', fontWeight: 400, color: theme.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function TemplateCard({ theme, active, onClick, label, description, iconType }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${active ? theme.accentBorder : theme.cardBorder}`,
        background: active ? theme.accentBg : theme.cardBg,
        color: theme.textPrimary,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '6px',
          background: active ? theme.accentBg : theme.cardBg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {iconType === 'editorial' ? <EditorialIcon active={active} theme={theme} /> : <PromoIcon active={active} theme={theme} />}
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 400, marginBottom: '4px' }}>{label}</div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.5 }}>{description}</div>
        </div>
      </div>
    </button>
  )
}

function EditorialIcon({ active, theme }) {
  const c = active ? theme.accent : theme.textSecondary
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="11" x2="19" y2="11" />
      <line x1="5" y1="15" x2="14" y2="15" />
    </svg>
  )
}

function PromoIcon({ active, theme }) {
  const c = active ? theme.accent : theme.textSecondary
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <rect x="4" y="5" width="16" height="9" />
      <rect x="8" y="17" width="8" height="3" rx="1" />
    </svg>
  )
}

function EditorialContent({ theme, issues, loading, selectedIssueId, onSelectIssue, selectedIssue, subject, setSubject, previewText, setPreviewText }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={getLabelStyle(theme)}>Newsletter issue</label>
        <select
          value={selectedIssueId}
          onChange={(e) => onSelectIssue(e.target.value)}
          style={getSelectStyle(theme)}
          disabled={loading}
        >
          <option value="">{loading ? 'Loading issues…' : 'Select an issue'}</option>
          {issues.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title}{i.scheduled_date ? ` — ${i.scheduled_date}` : ''}{!i.hasContent ? ' (no content yet)' : ''}
            </option>
          ))}
        </select>
        {selectedIssue?.description && (
          <p style={{ fontSize: '12px', color: theme.textMuted, margin: '6px 0 0 0', lineHeight: 1.5 }}>
            {selectedIssue.description}
          </p>
        )}
        {selectedIssue && !selectedIssue.hasContent && (
          <p style={{ fontSize: '12px', color: theme.danger, margin: '8px 0 0 0', lineHeight: 1.5 }}>
            This issue has no content yet.{' '}
            <a href={`/admin/newsletter/edit/${selectedIssueId}`} style={{ color: theme.accent, textDecoration: 'underline' }}>
              Add content
            </a>
            {' '}before previewing or sending.
          </p>
        )}
        {selectedIssueId && selectedIssue?.hasContent && (
          <p style={{ margin: '10px 0 0 0' }}>
            <a href={`/admin/newsletter/edit/${selectedIssueId}`} style={{ fontSize: '13px', color: theme.accent, textDecoration: 'none' }}>
              Edit content {'→'}
            </a>
          </p>
        )}
      </div>

      {selectedIssueId && (
        <>
          <div>
            <label style={getLabelStyle(theme)}>Subject line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={getInputStyle(theme)}
              placeholder="Subject line"
            />
          </div>
          <div>
            <label style={getLabelStyle(theme)}>Preview text</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              style={getInputStyle(theme)}
              placeholder="Inbox preview snippet"
            />
          </div>
        </>
      )}
    </div>
  )
}

function PromoContent({ theme, promo, setPromo }) {
  const set = (k) => (v) => setPromo({ ...promo, [k]: v })
  const onChange = (k) => (e) => set(k)(e.target.value)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="newsletter-promo-grid">
      <Field theme={theme} label="Subject line" required>
        <input type="text" value={promo.subject} onChange={onChange('subject')} style={getInputStyle(theme)} />
      </Field>
      <Field theme={theme} label="Preview text" required>
        <input type="text" value={promo.previewText} onChange={onChange('previewText')} style={getInputStyle(theme)} />
      </Field>
      <Field theme={theme} label="Hero image URL" full hint="Optional. Renders full-width above the headline. Export 1160px wide (2× for retina), landscape (2:1 or 16:9), JPG/PNG under ~300KB. Upload to the Supabase newsletter-assets bucket and paste its public URL here.">
        <input type="text" value={promo.heroImageUrl} onChange={onChange('heroImageUrl')} style={getInputStyle(theme)} placeholder="https://… public URL (optional)" />
      </Field>
      <Field theme={theme} label="Headline" required full>
        <input type="text" value={promo.headline} onChange={onChange('headline')} style={getInputStyle(theme)} />
      </Field>
      <Field theme={theme} label="Body" required full hint={'[first name] fills in the recipient’s name (“there” if we don’t have it). Blank lines start new paragraphs. For bold or links use raw HTML — <strong>…</strong>, <a href="…">…</a> — Markdown isn’t parsed.'}>
        <textarea
          value={promo.body}
          onChange={onChange('body')}
          rows={5}
          style={{ ...getInputStyle(theme), fontFamily: 'inherit', resize: 'vertical' }}
          placeholder="Blank lines split into paragraphs. Use [first name] to personalise."
        />
      </Field>
      <Field theme={theme} label="CTA text" required>
        <input type="text" value={promo.ctaText} onChange={onChange('ctaText')} style={getInputStyle(theme)} placeholder="Take the snapshot" />
      </Field>
      <Field theme={theme} label="CTA URL" required>
        <input type="text" value={promo.ctaUrl} onChange={onChange('ctaUrl')} style={getInputStyle(theme)} placeholder="https://mutomorro.com/…" />
      </Field>
      <Field theme={theme} label="Secondary text" full>
        <textarea value={promo.secondaryText} onChange={onChange('secondaryText')} rows={3} style={{ ...getInputStyle(theme), fontFamily: 'inherit', resize: 'vertical' }} placeholder="Optional paragraph below the CTA" />
      </Field>
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
        <span style={{ fontSize: '12px', color: theme.textMuted }}>
          Draft saves automatically in this browser.
        </span>
        {!isPromoEmpty(promo) && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear this promo draft? This can’t be undone.')) {
                try { localStorage.removeItem(PROMO_DRAFT_KEY) } catch {}
                setPromo(PROMO_DEFAULTS)
              }
            }}
            style={{ fontSize: '12px', color: theme.textSecondary, background: 'transparent', border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
          >
            Clear draft
          </button>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .newsletter-promo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Field({ theme, label, required, full, hint, children }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <label style={getLabelStyle(theme)}>
        {label}{required && <span style={{ color: theme.danger }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '12px', color: theme.textMuted, margin: '6px 0 0 0', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

function SendProgress({ theme, progress }) {
  const pct = progress.total > 0 ? Math.min(100, (progress.sent / progress.total) * 100) : 0
  const isComplete = progress.status === 'complete'
  const isFailed = progress.status === 'failed'
  const isPaused = progress.status === 'paused_quota'
  return (
    <div style={{ marginTop: '20px', padding: '18px', background: isComplete ? 'rgba(45,212,191,0.06)' : isFailed ? 'rgba(255,66,121,0.06)' : theme.accentBg, borderRadius: '6px', border: `1px solid ${isComplete ? 'rgba(45,212,191,0.2)' : isFailed ? 'rgba(255,66,121,0.2)' : theme.accentBorder}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: 400 }}>
          {isComplete ? 'Send complete' : isFailed ? 'Send failed' : isPaused ? 'Paused (Resend quota)' : 'Sending…'}
        </span>
        <span style={{ fontSize: '13px', color: theme.textSecondary }}>
          {progress.sent.toLocaleString()} / {progress.total.toLocaleString()}
        </span>
      </div>
      <div style={{ height: '6px', background: theme.cardBg, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: isComplete ? theme.success : isFailed ? theme.danger : theme.accent, transition: 'width 0.5s ease' }} />
      </div>
      {progress.issueKey && (
        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Issue key: {progress.issueKey}
        </div>
      )}
    </div>
  )
}

function ConfirmModal({ theme, template, subject, audienceName, audienceCount, issueKey, setIssueKey, confirmTestSent, setConfirmTestSent, onCancel, onConfirm, sending }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '10px',
          padding: '28px', maxWidth: '480px', width: '100%',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 400, color: theme.textPrimary, margin: '0 0 6px 0' }}>
          Confirm send
        </h3>
        <p style={{ fontSize: '13px', color: theme.textSecondary, margin: '0 0 20px 0', lineHeight: 1.5 }}>
          You are about to send to {audienceCount?.toLocaleString() || '—'} real subscribers. This cannot be undone.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '13px' }}>
          <Row theme={theme} label="Template" value={template === 'editorial' ? 'Editorial' : 'Promo'} />
          <Row theme={theme} label="Subject" value={subject} />
          <Row theme={theme} label="Audience" value={`${audienceName || '—'} (${audienceCount?.toLocaleString() || '—'} subscribers)`} />
          <div>
            <label style={{ ...getLabelStyle(theme), marginBottom: '6px' }}>Issue key</label>
            <input
              type="text"
              value={issueKey}
              onChange={(e) => setIssueKey(e.target.value)}
              style={getInputStyle(theme)}
            />
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '4px 0 0 0' }}>
              No subscriber will receive the same issue key twice.
            </p>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' }}>
          <input
            type="checkbox"
            checked={confirmTestSent}
            onChange={(e) => setConfirmTestSent(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', color: theme.textPrimary }}>
            I&apos;ve sent a test and reviewed it
          </span>
        </label>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={sending}
            style={{
              padding: '10px 18px', borderRadius: '6px',
              border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textSecondary,
              fontSize: '13px', fontFamily: 'inherit', cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmTestSent || !issueKey || sending}
            style={{
              padding: '10px 22px', borderRadius: '6px', border: 'none',
              background: confirmTestSent && issueKey && !sending ? theme.accent : theme.accentBg,
              color: confirmTestSent && issueKey && !sending ? '#fff' : theme.textMuted,
              fontSize: '13px', fontFamily: 'inherit',
              cursor: confirmTestSent && issueKey && !sending ? 'pointer' : 'not-allowed',
            }}
          >
            {sending ? 'Starting…' : 'Send now'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ theme, label, value }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <span style={{ width: '90px', flexShrink: 0, fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '2px' }}>
        {label}
      </span>
      <span style={{ flex: 1, fontSize: '14px', color: theme.textPrimary, wordBreak: 'break-word' }}>
        {value || '—'}
      </span>
    </div>
  )
}

function getCardStyle(theme) {
  return {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '10px',
    padding: '24px',
  }
}

function getLabelStyle(theme) {
  return {
    display: 'block',
    fontSize: '11px',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  }
}

function getInputStyle(theme) {
  return {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: `1px solid ${theme.cardBorder}`,
    background: theme.inputBg,
    color: theme.textPrimary,
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
}

function getSelectStyle(theme) {
  // Encode the chevron colour for the SVG data-uri
  const arrowColor = encodeURIComponent(theme.textMuted)
  return {
    ...getInputStyle(theme),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 6L11 1' stroke='${arrowColor}' stroke-width='1.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
  }
}
