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

const fontFamily = "'Source Sans 3', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

function RenderSection({ section, index }) {
  switch (section.type) {
    case 'paragraph':
      return (
        <Text
          key={index}
          style={{
            fontFamily,
            fontSize: '18px',
            fontWeight: 300,
            color: '#000',
            lineHeight: '1.75',
            margin: '0 0 24px 0',
          }}
          dangerouslySetInnerHTML={{ __html: section.text }}
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
            color: '#000',
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
            borderLeft: '3px solid #9B51E0',
            paddingLeft: '28px',
            margin: '0 0 44px 0',
          }}
        >
          <Text
            style={{
              fontFamily,
              fontSize: '26px',
              fontWeight: 300,
              color: '#000',
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
                    fontSize: '18px',
                    fontWeight: 400,
                    color: '#9B51E0',
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
                    fontSize: '18px',
                    fontWeight: 300,
                    color: '#000',
                    lineHeight: '1.75',
                    verticalAlign: 'top',
                    paddingBottom: i < section.items.length - 1 ? '22px' : '0',
                  }}
                  dangerouslySetInnerHTML={{ __html: item.text }}
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
          <a
            href={section.buttonUrl}
            style={{
              fontFamily,
              backgroundColor: '#9B51E0',
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

export default function NewsletterTemplate({
  subject = '',
  previewText = '',
  date = '',
  leadText = '',
  sections = [],
  signoff = 'Until next month,',
  unsubscribeUrl = '',
  viewInBrowserUrl = '',
}) {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          strong { font-weight: 400 !important; }
          a { color: #9B51E0; }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: '#f0f0f0', margin: '0', padding: '40px 0' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>

          {/* 1. Gradient accent bar */}
          <Section style={{
            background: 'linear-gradient(90deg, #80388F, #FF4279, #FFA200)',
            height: '4px',
            width: '100%',
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
                <Img
                  src="https://mutomorro.com/images/mutomorro-logo.png"
                  alt="Mutomorro"
                  width="120"
                  style={{ display: 'block' }}
                />
                {/* Fallback if logo image is unavailable:
                <table cellPadding="0" cellSpacing="0" border="0">
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', paddingRight: '10px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#9B51E0',
                        }} />
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span style={{
                          fontFamily,
                          fontSize: '15px',
                          fontWeight: 400,
                          color: '#000',
                        }}>
                          Mutomorro
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                */}
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
              color: '#000',
              lineHeight: '1.08',
              letterSpacing: '-0.025em',
              margin: '0',
            }}>
              {subject}
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
                  {sections.map((section, i) => (
                    <RenderSection key={i} section={section} index={i} />
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
              fontSize: '18px',
              fontWeight: 300,
              color: '#000',
              lineHeight: '1.75',
              margin: '0 0 4px 0',
            }}>
              {signoff}
            </Text>
            <Text style={{
              fontFamily,
              fontSize: '18px',
              fontWeight: 400,
              color: '#000',
              lineHeight: '1.75',
              margin: '0',
            }}>
              James
            </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 7. Footer */}
          <Section style={{
            backgroundColor: '#FAF6F1',
            marginTop: '48px',
            padding: '36px 44px',
          }}>
            <Img
              src="https://mutomorro.com/images/mutomorro-logo.png"
              alt="Mutomorro"
              width="80"
              style={{ display: 'block', marginBottom: '16px', opacity: 0.5 }}
            />
            {/* Fallback if logo image is unavailable:
            <table cellPadding="0" cellSpacing="0" border="0" style={{ marginBottom: '16px' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#9B51E0',
                      opacity: 0.5,
                    }} />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span style={{
                      fontFamily,
                      fontSize: '14px',
                      fontWeight: 400,
                      color: 'rgba(0,0,0,0.5)',
                    }}>
                      Mutomorro
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            */}
            <Text style={{
              fontFamily,
              fontSize: '14px',
              fontWeight: 300,
              color: 'rgba(0,0,0,0.35)',
              margin: '0 0 4px 0',
            }}>
              Organisational development consultancy
            </Text>
            <Text style={{
              fontFamily,
              fontSize: '14px',
              fontWeight: 300,
              color: 'rgba(0,0,0,0.35)',
              margin: '0 0 20px 0',
            }}>
              London, United Kingdom
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

export const sampleProps = {
  subject: "The invisible architecture of your organisation",
  previewText: "Every organisation has two structures...",
  date: "March 2026",
  leadText: "What really determines how work gets done - and how to see it.",
  sections: [
    { type: 'paragraph', text: 'Every organisation has two structures. The one on the org chart, and the one that actually determines how work gets done.' },
    { type: 'paragraph', text: 'The first is visible. It lives in strategy documents and town halls. The second is invisible - it\'s the set of habits, relationships, and unwritten rules that shape what people actually do on a Tuesday morning.' },
    { type: 'paragraph', text: 'Most change programmes focus entirely on the visible structure. They redesign the org chart, rewrite the strategy, launch new processes. And then they\'re surprised when nothing changes.' },
    { type: 'paragraph', text: 'The invisible architecture is where the real work is. And it can be shaped - but only if you know it\'s there.' },
    { type: 'blockquote', text: 'The way people actually work together is never written down anywhere.' },
    { type: 'image', src: 'https://placehold.co/492x280/F5F0EB/cccccc?text=580+x+320', alt: 'Organisational patterns', caption: 'The patterns that shape how work really gets done are rarely the ones on the org chart.' },
    { type: 'divider' },
    { type: 'heading', text: 'Three things to try this month' },
    { type: 'list', items: [
      { text: '<strong>Ask the question nobody asks.</strong> In your next team meeting, ask: "What\'s something everyone knows but nobody says out loud?" The answers tell you about the invisible structure.' },
      { text: '<strong>Watch the workarounds.</strong> Every workaround is a signal that the official process doesn\'t match reality. Map three workarounds in your team this week.' },
      { text: '<strong>Follow the decisions.</strong> Track one decision from announcement to action. Notice where it gets reinterpreted, delayed, or quietly dropped. That\'s the invisible architecture at work.' },
    ]},
    { type: 'cta', text: 'A tool to help you map the real structure', buttonText: 'Download the toolkit', buttonUrl: 'https://mutomorro.com/tools' },
  ],
  signoff: "Until next month,",
  unsubscribeUrl: "https://mutomorro.com/api/unsubscribe?email=test@example.com&token=abc123",
  viewInBrowserUrl: "https://mutomorro.com/newsletter/sample-id",
}

NewsletterTemplate.PreviewProps = sampleProps
