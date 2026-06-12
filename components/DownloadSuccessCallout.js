import Link from 'next/link'
import { PortableText } from '@portabletext/react'

// Compact CTA card shown in a tool's template download success message.
// Deliberately styled as a dark "offer" card with a solid button so it stands
// apart from the warm system/confirmation notes around it and reads as an
// action in a one-second glance. Rendered on the server and passed to
// ToolDownloadForm, which shows it only on success. Inline-styled so it needs
// no globals.css changes.
function MaybeExternalLink({ href, style, children }) {
  if (!href) return null
  const isExternal = /^(https?:|mailto:|tel:)/i.test(href)
  if (isExternal) {
    return (
      <a
        href={href}
        style={style}
        target={/^https?:/i.test(href) ? '_blank' : undefined}
        rel={/^https?:/i.test(href) ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  )
}

export default function DownloadSuccessCallout({ callout }) {
  if (!callout) return null
  const accent = callout.accentColor || 'var(--accent)'
  const showLink = Boolean(callout.linkUrl && callout.linkLabel)
  return (
    <div
      style={{
        background: 'var(--dark)',
        padding: '22px',
        marginBottom: '1.75rem',
        borderTop: `3px solid ${accent}`,
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: '10px',
        }}
      >
        Go further
      </span>
      {callout.heading && (
        <h3
          style={{
            fontSize: '19px',
            fontWeight: 500,
            color: '#fff',
            lineHeight: 1.3,
            margin: '0 0 8px',
          }}
        >
          {callout.heading}
        </h3>
      )}
      {callout.body && (
        <div style={{ margin: '0 0 18px' }}>
          <PortableText
            value={callout.body}
            components={{
              block: {
                normal: ({ children }) => (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.72)',
                    }}
                  >
                    {children}
                  </p>
                ),
              },
              marks: {
                link: ({ value, children }) => (
                  <a
                    href={value?.href}
                    style={{ color: '#fff', textDecoration: 'underline' }}
                    {...(value?.href && /^https?:/i.test(value.href)
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {children}
                  </a>
                ),
              },
            }}
          />
        </div>
      )}
      {showLink && (
        <MaybeExternalLink
          href={callout.linkUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: accent,
            color: '#fff',
            fontWeight: 500,
            fontSize: '15px',
            padding: '12px 24px',
            textDecoration: 'none',
          }}
        >
          {callout.linkLabel} <span aria-hidden="true">→</span>
        </MaybeExternalLink>
      )}
    </div>
  )
}
