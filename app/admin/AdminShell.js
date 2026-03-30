'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Contacts', href: '/admin/contacts' },
  { label: 'Pipeline', href: '/admin/pipeline' },
  { label: 'Newsletter', href: '/admin/newsletter' },
  { label: 'Outreach', href: '/admin/outreach' },
  { label: 'Calendar', href: '/admin/calendar' },
  { label: 'Handoffs', href: '/admin/handoffs' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Tenders', href: '/admin/tenders' },
]

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Don't show shell on login page
  if (pathname === '/admin/login') {
    return children
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#221C2B',
      color: 'rgba(255,255,255,0.85)',
      fontFamily: 'var(--font-source-sans), Source Sans 3, sans-serif',
    }}>
      {/* Mobile top bar */}
      <div
        className="admin-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'rgba(34,28,43,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'none',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          zIndex: 1001,
        }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            padding: 0,
            cursor: 'pointer',
            fontSize: '20px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
        <span style={{ fontSize: '15px', fontWeight: 400, color: '#fff', letterSpacing: '-0.01em' }}>
          Command Centre
        </span>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
        }}
        className={`admin-sidebar ${mobileOpen ? 'admin-sidebar--open' : ''}`}
      >
        {/* Logo area */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Mutomorro
          </span>
          <span style={{
            display: 'block',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: '4px',
          }}>
            Command Centre
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(item.href)
                  setMobileOpen(false)
                }}
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  borderLeft: isActive ? '2px solid #9B51E0' : '2px solid transparent',
                  background: isActive ? 'rgba(155,81,224,0.08)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'rgba(255,255,255,0.8)'
                    e.target.style.background = 'rgba(255,255,255,0.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'rgba(255,255,255,0.5)'
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.target.style.color = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.35)' }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '32px 40px',
        minHeight: '100vh',
      }}
        className="admin-main"
      >
        {children}
      </main>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          className="admin-overlay"
        />
      )}

      <style>{`
        .admin-topbar {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-topbar {
            display: flex !important;
          }
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .admin-sidebar--open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 72px !important;
          }
        }
      `}</style>
    </div>
  )
}
