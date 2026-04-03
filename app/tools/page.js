import { getAllTools } from '../../sanity/client'
import CTA from '../../components/CTA'
import ToolsGrid from './ToolsGrid'

export const revalidate = 3600

export const metadata = {
  title: 'Tools and templates for organisational development',
  description: 'Free downloadable tools, templates, and frameworks. Practical resources for leaders working on culture, change, strategy, and organisational design.',
}

export default async function Tools() {
  const tools = await getAllTools()

  return (
    <main>

      {/* Hero */}
      <section className="section--full dark-bg" style={{ padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
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
      </section>

      {/* Tool cards */}
      <section className="section--full" style={{ padding: '80px 48px', background: 'var(--white)' }}>
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
