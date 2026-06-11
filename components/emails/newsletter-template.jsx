import React from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components'
import { isTrackableUrl } from '@/lib/newsletter-tracking'

// Source Sans 3 is the web font (loaded via the <link> below). Source Sans Pro
// is its older name and has wider native coverage in email clients; Arial /
// Helvetica close out the chain for clients that load no web font at all.
const fontFamily = "'Source Sans 3', 'Source Sans Pro', Arial, Helvetica, sans-serif"

const PURPLE = '#9B51E0'
const INK = '#221C2B'
const HAIRLINE = '#e0dbd5'

function wrapLinks(html, recipientId) {
  if (!recipientId || !html) return html
  // Wrap mutomorro.com hrefs with the tracking redirect. Hostname is checked
  // strictly so "https://mutomorro.com.attacker.tld" does NOT get wrapped.
  return html.replace(
    /href="(https?:\/\/[^"]*)"/g,
    (match, url) => {
      if (!isTrackableUrl(url)) return match
      return `href="https://mutomorro.com/api/newsletter/track?rid=${recipientId}&url=${encodeURIComponent(url)}"`
    }
  )
}

// Tracking wrapper for hrefs passed as plain values (index items, content
// block links). Anchor links (#observation) are left untouched.
function trackUrl(url, recipientId) {
  if (typeof url !== 'string' || !url) return url
  if (url.startsWith('#')) return url
  if (recipientId && isTrackableUrl(url)) {
    return `https://mutomorro.com/api/newsletter/track?rid=${recipientId}&url=${encodeURIComponent(url)}`
  }
  return url
}

// ─── Legacy editorial sections ──────────────────────────────────────
// Retained for the warm-up campaign, which renders content_json in the
// older { sections: [...] } shape. New editions use the edition layout.

function RenderSection({ section, index, recipientId }) {
  switch (section.type) {
    case 'paragraph':
      return (
        <Text
          key={index}
          style={{
            fontFamily,
            fontSize: '20px',
            fontWeight: 300,
            color: INK,
            lineHeight: '1.75',
            margin: '0 0 24px 0',
          }}
          dangerouslySetInnerHTML={{ __html: wrapLinks(section.text, recipientId) }}
        />
      )

    case 'heading':
      return (
        <Text
          key={index}
          style={{
            fontFamily,
            fontSize: '30px',
            fontWeight: 400,
            color: INK,
            lineHeight: '1.12',
            letterSpacing: '-0.02em',
            margin: '0 0 28px 0',
          }}
        >
          {section.text}
        </Text>
      )

    case 'blockquote':
      return (
        <Section
          key={index}
          style={{
            borderLeft: `3px solid ${PURPLE}`,
            paddingLeft: '28px',
            margin: '0 0 44px 0',
          }}
        >
          <Text
            style={{
              fontFamily,
              fontSize: '26px',
              fontWeight: 300,
              color: INK,
              fontStyle: 'italic',
              lineHeight: '1.4',
              letterSpacing: '-0.01em',
              margin: '0',
            }}
          >
            {section.text}
          </Text>
        </Section>
      )

    case 'list':
      return (
        <table
          key={index}
          cellPadding="0"
          cellSpacing="0"
          border="0"
          style={{ width: '100%', margin: '0 0 48px 0' }}
        >
          <tbody>
            {section.items.map((item, i) => (
              <tr key={i}>
                <td
                  style={{
                    fontFamily,
                    fontSize: '20px',
                    fontWeight: 400,
                    color: PURPLE,
                    width: '30px',
                    verticalAlign: 'top',
                    paddingBottom: i < section.items.length - 1 ? '22px' : '0',
                    lineHeight: '1.75',
                  }}
                >
                  {i + 1}.
                </td>
                <td
                  style={{
                    fontFamily,
                    fontSize: '20px',
                    fontWeight: 300,
                    color: INK,
                    lineHeight: '1.75',
                    verticalAlign: 'top',
                    paddingBottom: i < section.items.length - 1 ? '22px' : '0',
                  }}
                  dangerouslySetInnerHTML={{ __html: wrapLinks(item.text, recipientId) }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'cta':
      return (
        <Section
          key={index}
          style={{
            backgroundColor: '#FAF6F1',
            padding: '32px 36px',
            textAlign: 'center',
            margin: '0 0 48px 0',
          }}
        >
          {section.text && (
            <Text
              style={{
                fontFamily,
                fontSize: '16px',
                fontWeight: 300,
                color: 'rgba(0,0,0,0.45)',
                lineHeight: '1.5',
                margin: '0 0 24px 0',
              }}
            >
              {section.text}
            </Text>
          )}
          <a
            href={recipientId && isTrackableUrl(section.buttonUrl)
              ? `https://mutomorro.com/api/newsletter/track?rid=${recipientId}&url=${encodeURIComponent(section.buttonUrl)}`
              : section.buttonUrl}
            style={{
              fontFamily,
              backgroundColor: PURPLE,
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 400,
              padding: '14px 36px',
              borderRadius: '0px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {section.buttonText}
          </a>
        </Section>
      )

    case 'image':
      return (
        <Section key={index} style={{ margin: '0 0 44px 0' }}>
          <Img
            src={section.src}
            alt={section.alt}
            width="492"
            style={{
              width: '100%',
              maxWidth: '492px',
              borderRadius: '0',
              display: 'block',
            }}
          />
          {section.caption && (
            <Text
              style={{
                fontFamily,
                fontSize: '13px',
                fontWeight: 400,
                color: 'rgba(0,0,0,0.3)',
                margin: '12px 0 0 0',
              }}
            >
              {section.caption}
            </Text>
          )}
        </Section>
      )

    case 'divider':
      return (
        <Hr
          key={index}
          style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            margin: '44px 0',
          }}
        />
      )

    default:
      return null
  }
}

// ─── Shared chrome ──────────────────────────────────────────────────

function GradientBar() {
  return (
    <Section style={{
      background: 'linear-gradient(90deg, #80388F, #FF4279, #FFA200)',
      height: '8px',
      width: '100%',
      fontSize: '1px',
      lineHeight: '1px',
    }}>
      &nbsp;
    </Section>
  )
}

function Masthead({ date }) {
  return (
    <Section style={{ padding: '24px 44px 20px' }}>
      <Row>
        <Column style={{ verticalAlign: 'middle' }}>
          <Link href="https://mutomorro.com" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Img
              src="https://mutomorro.com/images/mutomorro-logo.png"
              alt="Mutomorro"
              width="132"
              style={{ display: 'block' }}
            />
          </Link>
        </Column>
        <Column style={{ verticalAlign: 'middle', textAlign: 'right' }}>
          <Text style={{
            fontFamily,
            fontSize: '12px',
            fontWeight: 400,
            color: 'rgba(0,0,0,0.3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0',
          }}>
            {date}
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

function Footer({ unsubscribeUrl, viewInBrowserUrl }) {
  return (
    <Section style={{
      backgroundColor: '#FAF6F1',
      marginTop: '16px',
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
        fontSize: '12px',
        fontWeight: 300,
        color: 'rgba(0,0,0,0.35)',
        margin: '0 0 4px 0',
      }}>
        Helping organisations become intentional ecosystems
      </Text>
      <Text style={{
        fontFamily,
        fontSize: '12px',
        fontWeight: 300,
        color: 'rgba(0,0,0,0.35)',
        margin: '0 0 12px 0',
      }}>
        86-90 Paul Street, London EC2A 4NE
      </Text>
      <Text style={{
        fontFamily,
        fontSize: '12px',
        fontWeight: 300,
        color: 'rgba(0,0,0,0.35)',
        margin: '0 0 20px 0',
      }}>
        Forwarded this email?{' '}
        <Link href="https://mutomorro.com" style={{ color: PURPLE, textDecoration: 'underline' }}>
          Subscribe here
        </Link>
      </Text>

      <Hr style={{
        borderTop: `1px solid ${HAIRLINE}`,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        margin: '0 0 16px 0',
      }} />

      <Text style={{
        fontFamily,
        fontSize: '12px',
        fontWeight: 300,
        color: 'rgba(0,0,0,0.3)',
        margin: '0',
        lineHeight: '1.6',
      }}>
        {unsubscribeUrl && (
          <>
            <Link href={unsubscribeUrl} style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
              Unsubscribe
            </Link>
            <span style={{ color: 'rgba(0,0,0,0.15)' }}> · </span>
          </>
        )}
        {viewInBrowserUrl && (
          <>
            <Link href={viewInBrowserUrl} style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
              View in browser
            </Link>
            <span style={{ color: 'rgba(0,0,0,0.15)' }}> · </span>
          </>
        )}
        <Link href="https://www.linkedin.com/company/mutomorro" style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
          LinkedIn
        </Link>
        <span style={{ color: 'rgba(0,0,0,0.15)' }}> · </span>
        <Link href="https://mutomorro.com" style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
          mutomorro.com
        </Link>
      </Text>
    </Section>
  )
}

function TrackingPixel({ recipientId }) {
  if (!recipientId) return null
  return (
    <Img
      src={`https://mutomorro.com/api/newsletter/track?rid=${recipientId}`}
      width="1"
      height="1"
      alt=""
      style={{ display: 'block', width: '1px', height: '1px', border: '0', opacity: 0 }}
    />
  )
}

function HeadBlock({ previewText }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
        <style>{`
          strong { font-weight: 600 !important; }
          a { color: ${PURPLE}; }
          @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
    </>
  )
}

// ─── Edition layout ─────────────────────────────────────────────────

function Kicker({ children, fontSize = '11px', marginBottom = '0' }) {
  return (
    <div style={{
      fontFamily,
      fontSize,
      lineHeight: '1',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: PURPLE,
      fontWeight: 600,
      marginBottom,
    }}>
      {children}
    </div>
  )
}

// 2px purple rule. Rendered as a one-cell table so Outlook honours the height.
function PurpleRule() {
  return (
    <table cellPadding="0" cellSpacing="0" border="0" role="presentation" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 8px 0' }}>
      <tbody>
        <tr>
          <td style={{ height: '2px', backgroundColor: PURPLE, fontSize: '1px', lineHeight: '1px' }}>&nbsp;</td>
        </tr>
      </tbody>
    </table>
  )
}

// Kicker + purple rule + title. Identical between the index and every section.
function SectionHeader({ kicker, title }) {
  return (
    <>
      <Kicker marginBottom="3px">{kicker}</Kicker>
      <PurpleRule />
      <Text style={{
        fontFamily,
        fontSize: '24px',
        fontWeight: 400,
        lineHeight: '1.3',
        margin: '0 0 16px 0',
        color: INK,
      }}>
        {title}
      </Text>
    </>
  )
}

function EditionDivider() {
  return (
    <Hr style={{
      borderTop: `1px solid ${HAIRLINE}`,
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      margin: '0 44px',
      width: 'auto',
    }} />
  )
}

function renderObservationBody(body, recipientId) {
  if (!body) return null
  const paragraphs = String(body)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  return paragraphs.map((p, i) => (
    <Text
      key={i}
      style={{
        fontFamily,
        fontSize: '15px',
        fontWeight: 400,
        color: INK,
        lineHeight: '1.8',
        margin: '0 0 20px 0',
      }}
      dangerouslySetInnerHTML={{ __html: wrapLinks(p, recipientId) }}
    />
  ))
}

function NewsletterEdition({
  monthYear = '',
  subjectLine = '',
  previewText = '',
  heroImageUrl = '',
  heroImageAlt = '',
  introText = '',
  indexItems = [],
  observationKicker = 'Observation',
  observationTitle = '',
  observationBody = '',
  signOff = 'James',
  ps = '',
  contentBlocks = [],
  unsubscribeUrl = '',
  viewInBrowserUrl = '',
  recipientId = '',
}) {
  const items = Array.isArray(indexItems) ? indexItems : []
  const blocks = Array.isArray(contentBlocks) ? contentBlocks : []

  return (
    <Html lang="en">
      <HeadBlock previewText={previewText} />
      <Body style={{ backgroundColor: '#FAF6F1', margin: '0', padding: '0 0 40px 0' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>

          <GradientBar />
          <Masthead date={monthYear} />

          <Hr style={{
            borderTop: `1px solid ${HAIRLINE}`,
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            margin: '0 44px',
            width: 'auto',
          }} />

          {/* Subject heading + intro */}
          <Section style={{ padding: '36px 44px 32px' }}>
            <Text style={{
              fontFamily,
              fontSize: '30px',
              fontWeight: 400,
              color: INK,
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              margin: '0',
            }}>
              {subjectLine}
            </Text>
            {introText && (
              <Text style={{
                fontFamily,
                fontSize: '15px',
                fontWeight: 300,
                color: INK,
                lineHeight: '1.7',
                margin: '20px 0 0 0',
              }}>
                {introText}
              </Text>
            )}
          </Section>

          {/* Hero image (optional) */}
          {heroImageUrl && (
            <Section style={{ padding: '0' }}>
              <Img
                src={heroImageUrl}
                alt={heroImageAlt}
                width="580"
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '580px',
                  height: 'auto',
                  border: '0',
                }}
              />
            </Section>
          )}

          {/* Index / table of contents */}
          {items.length > 0 && (
            <Section style={{ padding: '32px 44px 32px' }}>
              <Kicker marginBottom="14px">In this edition</Kicker>
              <table
                cellPadding="0"
                cellSpacing="0"
                border="0"
                role="presentation"
                style={{ width: '100%', borderCollapse: 'collapse' }}
              >
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td style={{
                        fontFamily,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: PURPLE,
                        width: '18px',
                        verticalAlign: 'top',
                        padding: '5px 12px 5px 0',
                        lineHeight: '1.4',
                      }}>
                        {i + 1}
                      </td>
                      <td style={{ verticalAlign: 'top', padding: '5px 0' }}>
                        <Kicker fontSize="11px" marginBottom="4px">{it.kicker}</Kicker>
                        {it.href ? (
                          <a
                            href={trackUrl(it.href, recipientId)}
                            style={{
                              fontFamily,
                              fontSize: '14px',
                              fontWeight: 600,
                              color: INK,
                              textDecoration: 'none',
                              lineHeight: '1.4',
                            }}
                          >
                            {it.title}
                          </a>
                        ) : (
                          <span style={{
                            fontFamily,
                            fontSize: '14px',
                            fontWeight: 600,
                            color: INK,
                            lineHeight: '1.4',
                          }}>
                            {it.title}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          <EditionDivider />

          {/* Observation */}
          <div id="observation" style={{ fontSize: '0', lineHeight: '0', height: '0' }}>&nbsp;</div>
          <Section style={{ padding: '32px 44px 32px' }}>
            <SectionHeader kicker={observationKicker} title={observationTitle} />
            {renderObservationBody(observationBody, recipientId)}
            {signOff && (
              <Text style={{
                fontFamily,
                fontSize: '15px',
                fontWeight: 400,
                color: INK,
                lineHeight: '1.6',
                margin: '0',
              }}>
                {signOff}
              </Text>
            )}
            {ps && (
              <Text style={{
                fontFamily,
                fontSize: '14px',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'rgba(0,0,0,0.6)',
                lineHeight: '1.65',
                margin: '24px 0 0 0',
              }}>
                {ps}
              </Text>
            )}
          </Section>

          {/* Content blocks (article, diagnostic, …) */}
          {blocks.map((block, i) => (
            <React.Fragment key={i}>
              <EditionDivider />
              <Section style={{ padding: '32px 44px 32px' }}>
                <SectionHeader kicker={block.kicker} title={block.title} />
                {block.description && (
                  <Text style={{
                    fontFamily,
                    fontSize: '14px',
                    fontWeight: 300,
                    color: 'rgba(0,0,0,0.6)',
                    lineHeight: '1.7',
                    margin: '0 0 14px 0',
                  }}>
                    {block.description}
                  </Text>
                )}
                {block.linkText && block.linkHref && (
                  <a
                    href={trackUrl(block.linkHref, recipientId)}
                    style={{
                      fontFamily,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: PURPLE,
                      textDecoration: 'underline',
                    }}
                  >
                    {block.linkText}
                  </a>
                )}
              </Section>
            </React.Fragment>
          ))}

          <TrackingPixel recipientId={recipientId} />
          <Footer unsubscribeUrl={unsubscribeUrl} viewInBrowserUrl={viewInBrowserUrl} />

        </Container>
      </Body>
    </Html>
  )
}

// ─── Legacy layout (warm-up campaign) ───────────────────────────────

function LegacyNewsletterTemplate({
  subject = '',
  title = '',
  previewText = '',
  date = '',
  leadText = '',
  greeting = '',
  sections = [],
  signoff = 'Until next month,',
  unsubscribeUrl = '',
  viewInBrowserUrl = '',
  recipientId = '',
}) {
  const displayTitle = title || subject
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

          {/* 1. Gradient accent bar */}
          <Section style={{
            background: 'linear-gradient(90deg, #80388F, #FF4279, #FFA200)',
            height: '8px',
            width: '100%',
            fontSize: '1px',
            lineHeight: '1px',
          }}>
            &nbsp;
          </Section>

          {/* 2. Forwarded line */}
          <Section style={{ padding: '18px 44px 0', textAlign: 'center' }}>
            <Text style={{
              fontFamily,
              fontSize: '13px',
              fontWeight: 300,
              color: 'rgba(0,0,0,0.3)',
              margin: '0',
            }}>
              Forwarded this email?{' '}
              <Link
                href="https://mutomorro.com"
                style={{
                  color: '#9B51E0',
                  fontWeight: 400,
                  textDecoration: 'underline',
                }}
              >
                Subscribe here
              </Link>
              {' '}for more
            </Text>
          </Section>

          {/* 3. Masthead */}
          <Section style={{ padding: '24px 44px 20px' }}>
            <Row>
              <Column style={{ verticalAlign: 'middle' }}>
                <Link href="https://mutomorro.com" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  <Img
                    src="https://mutomorro.com/images/mutomorro-logo.png"
                    alt="Mutomorro"
                    width="132"
                    style={{ display: 'block' }}
                  />
                </Link>
              </Column>
              <Column style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                <Text style={{
                  fontFamily,
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'rgba(0,0,0,0.3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: '0',
                }}>
                  {date}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Masthead divider */}
          <Hr style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            margin: '0 44px',
          }} />

          {/* 4. Title block */}
          <Section style={{ padding: '40px 44px 0' }}>
            <Text style={{
              fontFamily,
              fontSize: '40px',
              fontWeight: 400,
              color: '#221C2B',
              lineHeight: '1.08',
              letterSpacing: '-0.025em',
              margin: '0',
            }}>
              {displayTitle}
            </Text>
            {leadText && (
              <Text style={{
                fontFamily,
                fontSize: '22px',
                fontWeight: 300,
                color: 'rgba(0,0,0,0.45)',
                lineHeight: '1.45',
                margin: '16px 0 40px 0',
              }}>
                {leadText}
              </Text>
            )}
            {!leadText && <div style={{ height: '40px' }} />}
          </Section>

          {/* Title divider */}
          <Hr style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            margin: '0 44px',
          }} />

          {/* 5. Body content area */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0">
            <tbody>
              <tr>
                <td style={{ padding: '36px 44px 0' }}>
                  {greeting && (
                    <Text
                      style={{
                        fontFamily,
                        fontSize: '20px',
                        fontWeight: 300,
                        color: '#221C2B',
                        lineHeight: '1.75',
                        margin: '0 0 24px 0',
                      }}
                    >
                      {greeting}
                    </Text>
                  )}
                  {sections.map((section, i) => (
                    <RenderSection key={i} section={section} index={i} recipientId={recipientId} />
                  ))}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 6. Sign-off */}
          <table width="100%" cellPadding="0" cellSpacing="0" border="0">
            <tbody>
              <tr>
                <td style={{ padding: '0 44px 0' }}>
            <Text style={{
              fontFamily,
              fontSize: '20px',
              fontWeight: 300,
              color: '#221C2B',
              lineHeight: '1.75',
              margin: '0 0 4px 0',
            }}>
              {signoff}
            </Text>
            <Text style={{
              fontFamily,
              fontSize: '20px',
              fontWeight: 400,
              color: '#221C2B',
              lineHeight: '1.75',
              margin: '0',
            }}>
              James
            </Text>
                </td>
              </tr>
            </tbody>
          </table>

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

          {/* 7. Footer */}
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
              <Link href={viewInBrowserUrl} style={{ color: 'rgba(0,0,0,0.3)', textDecoration: 'underline' }}>
                View in browser
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

// ─── Entry point ────────────────────────────────────────────────────
// Renders the edition layout when edition content is present, otherwise
// falls back to the legacy { sections } layout used by the warm-up campaign.

export default function NewsletterTemplate(props = {}) {
  const isEdition = typeof props.observationBody === 'string' && props.observationBody.trim() !== ''
  return isEdition
    ? <NewsletterEdition {...props} />
    : <LegacyNewsletterTemplate {...props} />
}

export const sampleProps = {
  monthYear: 'May 2026',
  subjectLine: 'Slow enough to miss',
  previewText: 'How organisations change without anyone deciding to change them.',
  heroImageUrl: 'https://hzgnlxxnpvidnntiilcf.supabase.co/storage/v1/object/public/newsletter-assets/drift/organisational-drift-hero.png',
  heroImageAlt: 'Abstract illustration showing ordered shapes gradually drifting out of alignment',
  introText: "This month I've been exploring something most organisations experience but rarely name - the slow, quiet way things change without anyone deciding to change them.",
  indexItems: [
    { kicker: 'Field notes', title: 'The changes no one planned for', href: '#observation' },
    { kicker: 'Long read', title: 'The organisation that changed without anyone deciding to change it', href: 'https://mutomorro.com/articles/organisational-drift' },
    { kicker: 'A tool to try', title: 'Organisational Drift Audit', href: 'https://mutomorro.com/diagnostics/drift-audit' },
  ],
  observationKicker: 'Field notes',
  observationTitle: 'The changes no one planned for',
  observationBody: [
    "There's a particular kind of change in organisations that fascinates me. Not the dramatic kind - not the restructure, the merger, the new CEO with a hundred-day plan. Those are visible. You can point at them. You know when they started.",
    "This is the other kind. The kind where you look up one day and something is different - and you can't say when it changed.",
    "Nobody called a meeting. Nobody made a deliberate choice to move in this direction. And yet, standing here now, the distance between what an organisation set out to be and how it works has quietly widened. Not through any single decision - but through a thousand small, completely reasonable ones.",
    "I often notice this across the organisations I work with. A leadership team that started as genuinely collaborative and slowly - through completely understandable pressures - became a group of people managing their own areas, occasionally updating each other. A decision-making process that accumulated one extra approval stage every year until nobody could remember what speed felt like. A relationship with the people the organisation exists to serve that gradually became more distant, more mediated, more managed - without anyone choosing that.",
    "The thing that makes this pattern so interesting is that it contains no villains. Every single accommodation along the way made sense at the time. Faced with the same pressures, you or I would probably have made the same calls. That's not a failure of judgement. It's something more structural - and more human - than that.",
    'In systems thinking, there\'s a word for this: <a href="https://fieldmarks.org/concept/drift/"><strong>drift</strong></a>. The slow, imperceptible movement of a system away from what it was designed to do - not through failure, but through a series of small, rational adjustments to pressure. Each one invisible. The accumulation, transformative.',
    "What I find myself wondering is how many of these quiet shifts are happening in any organisation at any given moment. Not because anyone is doing anything wrong. But because drift is what complex systems do when nobody is actively tending to the distance between where things are and where they were meant to be.",
    'Once you see it, the question changes. It stops being "who let this happen?" and becomes something quieter and more honest: "What did we set out to be - and how far have we travelled from it?"',
    'That second question, I think, is where some of the most important work in organisations begins.',
  ].join('\n\n'),
  signOff: 'James',
  ps: "P.S. If you recognise any of this - in your organisation, your sector, your own experience - I'd genuinely love to hear what you're seeing. Just reply to this email.",
  contentBlocks: [
    {
      kicker: 'Long read',
      title: 'The organisation that changed without anyone deciding to change it',
      description: 'I went down a research rabbit hole into why drift happens - drawing on some fascinating work from safety science, sociology, and systems thinking. This is the longer piece, where the idea really opens up.',
      linkText: 'Read the article',
      linkHref: 'https://mutomorro.com/articles/organisational-drift',
    },
    {
      kicker: 'A tool to try',
      title: 'Organisational Drift Audit',
      description: 'A short self-assessment that helps you map where drift might be showing up across your organisation - and which gaps are worth your attention first.',
      linkText: 'Take the diagnostic',
      linkHref: 'https://mutomorro.com/diagnostics/drift-audit',
    },
  ],
  unsubscribeUrl: 'https://mutomorro.com/api/unsubscribe?email=test@example.com&token=abc123',
  viewInBrowserUrl: 'https://mutomorro.com/newsletter/sample-id',
}

NewsletterTemplate.PreviewProps = sampleProps
