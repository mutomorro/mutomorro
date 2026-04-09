import Link from 'next/link'
import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
    return (
        <footer className="footer-wrapper" style={{
            backgroundColor: 'var(--dark)',
            color: '#ffffff',
        }}>

            {/* Newsletter row */}
            <div className="footer-newsletter-row">
                <div style={{ flexShrink: 0 }}>
                    <p style={{
                        fontSize: '13px',
                        fontWeight: '400',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: 'rgba(255,255,255,0.4)',
                        margin: '0 0 6px',
                    }}>
                        Stay in the loop
                    </p>
                    <p style={{
                        fontSize: '15px',
                        fontWeight: '300',
                        lineHeight: '1.6',
                        color: 'rgba(255,255,255,0.6)',
                        margin: 0,
                    }}>
                        Occasional insights on organisational development and change. No spam.
                    </p>
                </div>
                <div style={{ flex: 1 }}>
                    <NewsletterSignup variant="footer-row" />
                </div>
            </div>

            {/* Main footer columns */}
            <div className="footer-grid">

                {/* Brand */}
                <div>
                    <span className="heading-gradient" style={{
                        fontSize: '1.25rem',
                        fontWeight: '400',
                        display: 'block',
                        marginBottom: '1rem',
                    }}>
                        Mutomorro
                    </span>
                    <p style={{
                        fontSize: '15px',
                        lineHeight: '1.7',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: '300',
                        margin: 0,
                    }}>
                        Helping organisations become intentional ecosystems - places where people and purpose thrive together.
                    </p>
                </div>

                {/* How We Help */}
                <div>
                    <p className="footer-heading">How We Help</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <li><Link href="/how-we-help/purpose-and-direction" className="footer-link">Purpose & Direction</Link></li>
                        <li><Link href="/how-we-help/structure-and-operations" className="footer-link">Structure & Operations</Link></li>
                        <li><Link href="/how-we-help/people-and-capability" className="footer-link">People & Capability</Link></li>
                        <li><Link href="/how-we-help/service-and-experience" className="footer-link">Service & Experience</Link></li>
                        <li><Link href="/projects" className="footer-link">Projects and experience</Link></li>
                    </ul>
                </div>

                {/* Explore */}
                <div>
                    <p className="footer-heading">Explore</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <li><Link href="/articles" className="footer-link">Thinking</Link></li>
                        <li><Link href="/courses" className="footer-link">Courses</Link></li>
                        <li><Link href="/tools" className="footer-link">Tools of the Trade</Link></li>
                        <li><Link href="/states-of-vitality" className="footer-link">States of Vitality</Link></li>
                    </ul>
                </div>

                {/* About */}
                <div>
                    <p className="footer-heading">About</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <li><Link href="/about" className="footer-link">About us</Link></li>
                        <li><Link href="/philosophy" className="footer-link">Philosophy</Link></li>
                        <li><Link href="/emergent-framework" className="footer-link">The EMERGENT Framework</Link></li>
                        <li><Link href="/contact" className="footer-link">Talk to us</Link></li>
                    </ul>
                </div>

                {/* Get in Touch */}
                <div>
                    <p className="footer-heading">Get in Touch</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: '400',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                color: 'rgba(255,255,255,0.35)',
                                margin: '0 0 6px',
                            }}>
                                London
                            </p>
                            <p style={{
                                fontSize: '15px',
                                fontWeight: '300',
                                lineHeight: '1.6',
                                color: 'rgba(255,255,255,0.6)',
                                margin: 0,
                            }}>
                                86-90 Paul Street<br />
                                London EC2A 4NE
                            </p>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: '400',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                color: 'rgba(255,255,255,0.35)',
                                margin: '0 0 6px',
                            }}>
                                Glasgow
                            </p>
                            <p style={{
                                fontSize: '15px',
                                fontWeight: '300',
                                lineHeight: '1.6',
                                color: 'rgba(255,255,255,0.6)',
                                margin: 0,
                            }}>
                                15 Candleriggs Square<br />
                                Glasgow G1 1TQ Scotland
                            </p>
                        </div>
                        <a
                            href="https://www.linkedin.com/company/mutomorro/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-link"
                            style={{ fontSize: '15px' }}
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>

            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} Mutomorro. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link href="/privacy" className="footer-link" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Privacy</Link>
                    <Link href="/terms" className="footer-link" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Terms</Link>
                </div>
            </div>

        </footer>
    )
}
