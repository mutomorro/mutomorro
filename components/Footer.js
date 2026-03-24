import Link from 'next/link'
import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: 'var(--dark)',
            color: '#ffffff',
            padding: '5rem 48px 2rem',
        }}>

            {/* Main footer columns */}
            <div style={{
                maxWidth: '1350px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '3rem',
                paddingBottom: '3rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>

                {/* Brand + Newsletter column */}
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
                        margin: '0 0 2rem',
                    }}>
                        Helping organisations become intentional ecosystems - places where people and purpose thrive together.
                    </p>
                    <NewsletterSignup variant="footer" />
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

            </div>

            {/* Bottom bar */}
            <div style={{
                maxWidth: '1350px',
                margin: '0 auto',
                paddingTop: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.35)',
                fontWeight: '300',
            }}>
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} Mutomorro. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link href="/privacy" className="footer-link" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Privacy</Link>
                    <Link href="/terms" className="footer-link" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Terms</Link>
                </div>
            </div>

        </footer>
    )
}
