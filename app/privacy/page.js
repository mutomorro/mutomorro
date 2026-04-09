import ResetConsentButton from './ResetConsentButton'

export const metadata = {
  title: 'Privacy and cookies',
  description: 'How Mutomorro uses cookies and handles your data. Plain language, no legal waffle.',
}

export default function PrivacyPage() {
  return (
    <main>
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker">PRIVACY</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px' }}>
            Privacy and cookies
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            What we collect, why, and how you stay in control. Plain language, no legal waffle.
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>What cookies we use</h2>
        <p style={{ marginBottom: '32px' }}>
          We keep things simple. This site uses two cookies at most - and only one of them needs your permission.
        </p>

        <div style={{ overflowX: 'auto', marginBottom: '48px' }}>
          <table className="privacy-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>What it does</th>
                <th>How long it lasts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>mutomorro_consent</code></td>
                <td>Remembers your cookie choice so we don&apos;t ask you again every time you visit</td>
                <td>12 months</td>
              </tr>
              <tr>
                <td>Apollo tracking</td>
                <td>Helps us understand which organisations visit our site (only loads if you accept)</td>
                <td>Set by Apollo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginBottom: '48px', fontSize: '15px', color: 'rgba(0,0,0,0.5)' }}>
          The consent cookie is classified as &quot;strictly necessary&quot; under UK law - it just remembers what you chose. It doesn&apos;t track anything.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>What tracking we use and why</h2>
        <p style={{ marginBottom: '16px' }}>
          When you accept cookies, we use a tool called Apollo to understand which organisations visit our site.
          This tells us that someone from a particular company looked at our services page, for example.
        </p>
        <p style={{ marginBottom: '16px' }}>
          It does not tell us who you are personally - just the organisation you&apos;re browsing from.
          We use this to have better conversations with the right people. If a company we&apos;ve been
          speaking with visits our site, it helps us understand what they&apos;re interested in.
        </p>
        <p style={{ marginBottom: '48px' }}>
          If you decline cookies, the Apollo script never loads and none of this happens. The site
          works exactly the same either way.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>What we don&apos;t do</h2>
        <ul style={{ marginBottom: '48px', paddingLeft: '24px' }}>
          <li style={{ marginBottom: '8px' }}>We don&apos;t use Google Analytics</li>
          <li style={{ marginBottom: '8px' }}>We don&apos;t build advertising profiles</li>
          <li style={{ marginBottom: '8px' }}>We don&apos;t sell or share your data with anyone</li>
          <li style={{ marginBottom: '8px' }}>We don&apos;t track you across other websites</li>
        </ul>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Change your preferences</h2>
        <p style={{ marginBottom: '24px' }}>
          You can change your cookie choice at any time. Click the button below to reset your
          preferences - the cookie banner will reappear so you can choose again.
        </p>
        <div style={{ marginBottom: '48px' }}>
          <ResetConsentButton />
        </div>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Your rights</h2>
        <p style={{ marginBottom: '16px' }}>
          Under UK data protection law, you can:
        </p>
        <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
          <li style={{ marginBottom: '8px' }}>Ask what data we hold about you</li>
          <li style={{ marginBottom: '8px' }}>Ask us to delete it</li>
          <li style={{ marginBottom: '8px' }}>Ask us to stop processing it</li>
          <li style={{ marginBottom: '8px' }}>Change your cookie preferences at any time (button above)</li>
        </ul>
        <p style={{ marginBottom: '48px' }}>
          If you&apos;re not happy with how we&apos;ve handled something, you can also contact the
          ICO (Information Commissioner&apos;s Office) - they&apos;re the UK data regulator.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Get in touch</h2>
        <p>
          If you have any questions about how we use data, email us
          at <a href="mailto:hello@mutomorro.com" className="link-inline">hello@mutomorro.com</a>.
        </p>

      </section>
    </main>
  )
}
