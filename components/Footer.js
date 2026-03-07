import Link from 'next/link'

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: 'var(--color-dark)',
            color: '#ffffff',
            padding: '4rem 2rem 2rem',
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

                {/* Brand column */}
                <div>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '400',
                        background: 'var(--gradient-heading)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                        display: 'block',
                        marginBottom: '1rem',
                    }}>
                        Mutomorro
                    </span>
                    <p style={{
                        fontSize: '0.9rem',
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
                    <p style={footerHeading}>How We Help</p>
                    <ul style={footerList}>
                        <li><Link href="/how-we-help/purpose-and-direction" style={footerLink}>Purpose & Direction</Link></li>
                        <li><Link href="/how-we-help/structure-and-operations" style={footerLink}>Structure & Operations</Link></li>
                        <li><Link href="/how-we-help/people-and-capability" style={footerLink}>People & Capability</Link></li>
                        <li><Link href="/how-we-help/service-and-experience" style={footerLink}>Service & Experience</Link></li>
                        <li><Link href="/projects" style={footerLink}>Projects and experience</Link></li>
                    </ul>
                </div>

                {/* Explore */}
                <div>
                    <p style={footerHeading}>Explore</p>
                    <ul style={footerList}>
                        <li><Link href="/article" style={footerLink}>Thinking</Link></li>
                        <li><Link href="/courses" style={footerLink}>Courses</Link></li>
                        <li><Link href="/tools" style={footerLink}>Tools of the Trade</Link></li>
                        <li><Link href="/states-of-vitality" style={footerLink}>States of Vitality</Link></li>
                    </ul>
                </div>

                {/* About */}
                <div>
                    <p style={footerHeading}>About</p>
                    <ul style={footerList}>
                        <li><Link href="/about" style={footerLink}>About us</Link></li>
                        <li><Link href="/philosophy" style={footerLink}>Philosophy</Link></li>
                        <li><Link href="/emergent-framework" style={footerLink}>The EMERGENT Framework</Link></li>
                        <li><Link href="/contact" style={footerLink}>Talk to us</Link></li>
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
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: '300',
            }}>
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} Mutomorro. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy</Link>
                    <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms</Link>
                </div>
            </div>

        </footer>
    )
}

const footerHeading = {
    fontSize: '0.75rem',
    fontWeight: '400',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-coral)',
    marginBottom: '1rem',
    marginTop: 0,
}

const footerList = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
}

const footerLink = {
    textDecoration: 'none',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '300',
}