import { getAllTools } from '../../sanity/client'
import CTA from '../../components/CTA'
import BackgroundPattern from '@/components/animations/BackgroundPattern'
import ToolsGrid from './ToolsGrid'

export const revalidate = 3600

export const metadata = {
  title: 'Tools and templates for organisational development',
  description: 'Free downloadable tools, templates, and frameworks. Practical resources for leaders working on culture, change, strategy, and organisational design.',
  openGraph: {
    url: 'https://mutomorro.com/tools',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
}

export default async function Tools() {
  const tools = await getAllTools()

  return (
    <main>

      {/* Hero */}
      <BackgroundPattern variant="constellation" className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto', position: 'relative' }}>
          <span className="kicker" style={{ marginBottom: '20px' }}>Tools and frameworks</span>
          <h1 className="heading-h1 heading-gradient" style={{
            margin: '0 0 32px',
            maxWidth: '800px',
          }}>
            Models, frameworks and concepts
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px' }}>
            Practical tools to help you think clearly, work better, and lead with confidence.
          </p>
        </div>
      </BackgroundPattern>

      {/* Tool cards */}
      <section className="section--full section-padding" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <ToolsGrid items={tools} />
        </div>
      </section>

      <CTA
        label="Work with us"
        heading="Want to put these ideas into practice?"
      />

    </main>
  )
}
