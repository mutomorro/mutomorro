import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="section section--white" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap wrap--narrow" style={{ textAlign: 'center' }}>

        <p className="label label--accent" style={{ marginBottom: '1.5rem' }}>404</p>

        <h1 className="heading-large" style={{ marginBottom: '1.25rem' }}>
          This page has gone dormant
        </h1>

        <p className="body-text" style={{ maxWidth: '480px', margin: '0 auto 2.5rem' }}>
          Even the healthiest ecosystems have the occasional dead end. The page you're looking for doesn't exist - but plenty of good things do.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link href="/services" className="btn btn--outline">
            How we help
          </Link>
          <Link href="/contact" className="btn btn--outline">
            Talk to us
          </Link>
        </div>

      </div>
    </section>
  )
}