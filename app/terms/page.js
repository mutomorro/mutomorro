export const metadata = {
  title: 'Terms of use - Mutomorro',
  description: 'Terms of use for the Mutomorro website. Plain language, no legal waffle.',
}

export default function TermsPage() {
  return (
    <main>
      <section className="section--full dark-bg section-padding-hero">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <span className="kicker">TERMS</span>
          <h1 className="heading-display heading-gradient" style={{ maxWidth: '900px' }}>
            Terms of use
          </h1>
          <p className="lead-text" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '680px' }}>
            The basics of using this website. Plain language, no legal waffle.
          </p>
        </div>
      </section>

      <section className="section-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>About this site</h2>
        <p style={{ marginBottom: '16px' }}>
          This website is run by Mutomorro, an organisational development consultancy based in the UK. When we say &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; on this page, we mean Mutomorro.
        </p>
        <p style={{ marginBottom: '48px' }}>
          By using this site, you agree to these terms. If you don&apos;t agree, please don&apos;t use the site. We keep things straightforward, but these terms are still a binding agreement.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Using the site</h2>
        <p style={{ marginBottom: '16px' }}>
          You can browse, read, and use this site for your own purposes. Everything here - articles, tools, courses, frameworks - is designed to be useful. We want you to learn from it and apply it in your work.
        </p>
        <p style={{ marginBottom: '48px' }}>
          What we ask is that you use the site reasonably. Don&apos;t try to break it, scrape it in bulk, or use it in ways that would disrupt things for other visitors.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Our content</h2>
        <p style={{ marginBottom: '16px' }}>
          The content on this site - including articles, tools, course materials, diagrams, and frameworks - belongs to Mutomorro unless we say otherwise.
        </p>
        <p style={{ marginBottom: '16px' }}>
          You&apos;re welcome to share links, reference our ideas, and use our downloadable tools within your organisation. That&apos;s what they&apos;re for.
        </p>
        <p style={{ marginBottom: '48px' }}>
          What we ask is that you don&apos;t copy large sections of our content, rebrand our tools as your own, or resell anything you&apos;ve downloaded from us. If you want to use something beyond normal use - in a publication, training programme, or product - just ask us first.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Downloads and tools</h2>
        <p style={{ marginBottom: '16px' }}>
          We offer free downloadable tools and resources. When you download something, you can use it within your organisation for internal purposes.
        </p>
        <p style={{ marginBottom: '48px' }}>
          The tools are provided as-is. We do our best to make them accurate and useful, but we can&apos;t guarantee they&apos;ll be perfect for every situation. Use your own judgement when applying them to your work.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Newsletter</h2>
        <p style={{ marginBottom: '48px' }}>
          If you sign up to our newsletter, we&apos;ll send you emails about organisational development - ideas, tools, and things we think are interesting. You can unsubscribe at any time using the link in every email. We won&apos;t share your email address with anyone else. More detail on how we handle your data is in our{' '}
          <a href="/privacy" className="link-inline">privacy and cookies page</a>.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>External links</h2>
        <p style={{ marginBottom: '48px' }}>
          Sometimes we link to other websites. We do this because we think the content is useful, not because we endorse or control those sites. We&apos;re not responsible for what you find when you follow a link away from our site.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Limitation of liability</h2>
        <p style={{ marginBottom: '16px' }}>
          We work hard to keep this site accurate, useful, and up to date. But we can&apos;t guarantee everything will always be perfect.
        </p>
        <p style={{ marginBottom: '48px' }}>
          The content on this site is for general information. It&apos;s not a substitute for professional advice tailored to your specific situation. We&apos;re not liable for any losses or damages that come from using (or not being able to use) this site or its content.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Changes to these terms</h2>
        <p style={{ marginBottom: '48px' }}>
          We might update these terms from time to time. When we do, the updated version will be here. We won&apos;t send you an email every time we change a comma, but if anything significant changes, we&apos;ll make it clear.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Governing law</h2>
        <p style={{ marginBottom: '48px' }}>
          These terms are governed by the laws of England and Wales. If anything ever needed resolving formally, the courts of England and Wales would handle it.
        </p>

        <h2 className="heading-h2" style={{ marginBottom: '24px' }}>Get in touch</h2>
        <p>
          Questions about any of this? Email us at{' '}
          <a href="mailto:hello@mutomorro.com" className="link-inline">hello@mutomorro.com</a>.
        </p>

      </section>
    </main>
  )
}
