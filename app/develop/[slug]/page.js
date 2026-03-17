import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

export const metadata = {
  title: 'Building Capability | Mutomorro',
  description: 'Developing the leaders and teams who make organisations work. Leadership programmes, coaching, facilitation, training, and team development.',
}

export default async function DevelopPage() {
  const services = await client.fetch(
    `*[_type == "capabilityService"] | order(order asc) {
      title,
      "slug": slug.current,
      audienceLabel,
      audience,
      heroTagline
    }`
  )

  const forLeaders = services.filter((s) => s.audience === 'for-leaders')
  const forTeams = services.filter((s) => s.audience === 'for-teams')

  return (
    <main>
      {/* Hero */}
      <section style={{ background: '#221C2B', color: '#fff', padding: '6rem 2rem 4rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.7 }}>
            Building Capability
          </p>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Developing leaders and teams
          </h1>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, opacity: 0.9 }}>
            Where our services address organisational challenges, capability building develops the people who lead and do the work. Leadership programmes, coaching, facilitation, training, and team development - all grounded in how organisations actually work as living systems.
          </p>
        </div>
      </section>

      {/* For Leaders */}
      <section style={{ padding: '5rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            For Leaders
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {forLeaders.map((service) => (
              <a
                key={service.slug}
                href={`/develop/${service.slug}`}
                style={{
                  display: 'block',
                  padding: '2rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              >
                <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem', color: '#221C2B' }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#555' }}>
                  {service.heroTagline}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* For Teams */}
      <section style={{ padding: '5rem 2rem', background: '#faf8f5' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            For Teams
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {forTeams.map((service) => (
              <a
                key={service.slug}
                href={`/develop/${service.slug}`}
                style={{
                  display: 'block',
                  padding: '2rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s',
                }}
              >
                <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem', color: '#221C2B' }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#555' }}>
                  {service.heroTagline}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#221C2B', color: '#fff', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Not sure what you need?
          </h2>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2rem', opacity: 0.9 }}>
            Every organisation is different. Tell us what you are working on and we will help you figure out the right approach.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: '#9b7fc4',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            Talk to us
          </a>
        </div>
      </section>
    </main>
  )
}