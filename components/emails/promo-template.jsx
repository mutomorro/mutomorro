import React from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components'

const fontFamily = "'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

function isMutomorroUrl(url) {
  if (typeof url !== 'string') return false
  try {
    return new URL(url).hostname === 'mutomorro.com'
  } catch {
    return false
  }
}

function wrapLinks(html, recipientId) {
  if (!recipientId || !html) return html
  return html.replace(
    /href="(https?:\/\/[^"]*)"/g,
    (match, url) => {
      if (!isMutomorroUrl(url)) return match
      return `href="https://mutomorro.com/api/newsletter/track?rid=${recipientId}&url=${encodeURIComponent(url)}"`
    }
  )
}

function renderBody(body, recipientId) {
  if (!body) return null
  // Treat `body` as a markdown-ish string. Split on blank lines into paragraphs.
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return paragraphs.map((p, i) => (
    <Text
      key={i}
      style={{
        fontFamily,
        fontSize: '20px',
        fontWeight: 300,
        color: '#221C2B',
        lineHeight: '1.75',
        margin: i === paragraphs.length - 1 ? '0' : '0 0 24px 0',
      }}
      dangerouslySetInnerHTML={{ __html: wrapLinks(p, recipientId) }}
    />
  ))
}

export default function PromoTemplate({
  subject = '',
  previewText = '',
  heroImageUrl = '',
  headline = '',
  body = '',
  ctaText = '',
  ctaUrl = '',
  secondaryText = '',
  unsubscribeUrl = '',
  recipientId = '',
  issueKey = '',
}) {
  const trackedCtaUrl = recipientId && isMutomorroUrl(ctaUrl)
    ? `https://mutomorro.com/api/newsletter/track?rid=${recipientId}&url=${encodeURIComponent(ctaUrl)}`
    : ctaUrl

  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
        <style>{`
          strong { font-weight: 400 !important; }
          a { color: #9B51E0; }
          @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#FAF6F1', margin: '0', padding: '0 0 40px 0' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>

          {/* Gradient accent bar */}
          <Section style={{
            background: 'linear-gradient(90deg, #80388F, #FF4279, #FFA200)',
            height: '8px',
            width: '100%',
            fontSize: '1px',
            lineHeight: '1px',
          }}>
            &nbsp;
          </Section>

          {/* Masthead */}
          <Section style={{ padding: '24px 44px 20px' }}>
            <Link href="https://mutomorro.com" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Img
                src="https://mutomorro.com/images/mutomorro-logo.png"
                alt="Mutomorro"
                width="132"
                style={{ display: 'block' }}
              />
            </Link>
          </Section>

          {/* Optional hero image */}
          {heroImageUrl && (
            <Section style={{ padding: '0' }}>
              <Img
                src={heroImageUrl}
                alt={headline}
                width="580"
                style={{
                  width: '100%',
                  maxWidth: '580px',
                  display: 'block',
                  border: '0',
                }}
              />
            </Section>
          )}

          {/* Headline */}
          <Section style={{ padding: '40px 44px 0' }}>
            <Text style={{
              fontFamily,
              fontSize: '40px',
              fontWeight: 400,
              color: '#221C2B',
              lineHeight: '1.08',
              letterSpacing: '-0.025em',
              margin: '0 0 28px 0',
            }}>
              {headline}
            </Text>
          </Section>

          {/* Body */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0">
            <tbody>
              <tr>
                <td style={{ padding: '0 44px 0' }}>
                  {renderBody(body, recipientId)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* CTA */}
          {ctaText && ctaUrl && (
            <Section
              style={{
                backgroundColor: '#FAF6F1',
                padding: '36px 36px',
                textAlign: 'center',
                margin: '40px 44px 0',
              }}
            >
              <a
                href={trackedCtaUrl}
                style={{
                  fontFamily,
                  backgroundColor: '#9B51E0',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 400,
                  padding: '16px 40px',
                  borderRadius: '0px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                {ctaText}
              </a>
            </Section>
          )}

          {/* Secondary text */}
          {secondaryText && (
            <table width="100%" cellPadding="0" cellSpacing="0" border="0">
              <tbody>
                <tr>
                  <td style={{ padding: '32px 44px 0' }}>
                    {renderBody(secondaryText, recipientId)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Tracking pixel */}
          {recipientId && (
            <Img
              src={`https://mutomorro.com/api/newsletter/track?rid=${recipientId}`}
              width="1"
              height="1"
              alt=""
              style={{ display: 'block', width: '1px', height: '1px', border: '0', opacity: 0 }}
            />
          )}

          {/* Footer */}
          <Section style={{
            backgroundColor: '#FAF6F1',
            marginTop: '48px',
            padding: '36px 44px',
          }}>
            <Link href="https://mutomorro.com" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
              <Img
                src="https://mutomorro.com/images/mutomorro-logo.png"
                alt="Mutomorro"
                width="88"
                style={{ display: 'block', opacity: 0.5 }}
              />
            </Link>
            <Text style={{
              fontFamily,
              fontSize: '14px',
              fontWeight: 300,
              color: 'rgba(0,0,0,0.35)',
              margin: '0 0 4px 0',
            }}>
              Helping organisations become intentional ecosystems
            </Text>
            <Text style={{
              fontFamily,
              fontSize: '14px',
              fontWeight: 300,
              color: 'rgba(0,0,0,0.35)',
              margin: '0 0 20px 0',
            }}>
              86-90 Paul Street, London EC2A 4NE
            </Text>

            <Hr style={{
              borderTop: '1px solid rgba(0,0,0,0.06)',
              borderBottom: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              margin: '0 0 16px 0',
            }} />

            <Text style={{
              fontFamily,
              fontSize: '13px',
              fontWeight: 300,
              color: 'rgba(0,0,0,0.3)',
              margin: '0',
              lineHeight: '1.6',
            }}>
              <Link href={unsubscribeUrl} style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
                Unsubscribe
              </Link>
              <span style={{ color: 'rgba(0,0,0,0.15)' }}> · </span>
              <Link href="https://www.linkedin.com/company/mutomorro" style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
                LinkedIn
              </Link>
              <span style={{ color: 'rgba(0,0,0,0.15)' }}> · </span>
              <Link href="https://mutomorro.com" style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
                mutomorro.com
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export const sampleProps = {
  subject: 'See your organisation differently',
  previewText: 'A free 15-minute organisational health snapshot',
  heroImageUrl: '',
  headline: 'See your organisation differently',
  body: 'States of Vitality is a free 15-minute organisational health snapshot. It shows you how vital your organisation feels right now across the four registers we work with - and where the energy is being lost.\n\nIt is built for senior leaders who suspect there is something underneath the noise of daily operations. Something quieter. Something more truthful.',
  ctaText: 'Take the Snapshot',
  ctaUrl: 'https://mutomorro.com/states-of-vitality',
  secondaryText: 'It takes 15 minutes. No sign-in required.',
  unsubscribeUrl: 'https://mutomorro.com/api/unsubscribe?email=test@example.com&token=abc123',
}

PromoTemplate.PreviewProps = sampleProps
