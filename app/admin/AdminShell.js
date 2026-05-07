'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { AdminThemeProvider, useAdminTheme } from '../../lib/admin-theme-context'

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

// Pages that have been migrated to use the admin theme tokens.
// Un-migrated pages keep the dark background so their hardcoded white
// text stays readable in light mode. Add as pages are converted.
const THEMED_PATHS = [
  '/admin/newsletter',
]

function isPathThemed(pathname) {
  return THEMED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export default function AdminShell({ children }) {
  return (
    <AdminThemeProvider>
      <ShellInner>{children}</ShellInner>
    </AdminThemeProvider>
  )
}

function ShellInner({ children }) {
  const rawPathname = usePathname()
  const pathname = (rawPathname || '/').replace(/\/+$/, '') || '/'
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, mode, toggleTheme } = useAdminTheme()
  const themed = isPathThemed(pathname)

  // Pages not yet migrated to the theme system stay on the dark palette so
  // their hardcoded white text remains readable. The toggle still works
  // globally; the visual effect rolls out as pages get migrated.
  const mainBg = themed ? theme.pageBg : '#1a1625'
  const mainText = themed ? theme.textPrimary : '#ffffff'
  const mainSecondaryText = themed ? theme.textSecondary : 'rgba(255,255,255,0.65)'

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
      background: mainBg,
      color: mainSecondaryText,
      fontFamily: 'var(--font-source-sans), Source Sans 3, sans-serif',
      transition: 'background 0.2s ease',
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
          background: theme.sidebarBg,
          borderBottom: `1px solid ${theme.sidebarBorder}`,
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

      {/* Sidebar — stays dark in both modes for contrast */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.sidebarBorder}`,
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
          borderBottom: `1px solid ${theme.sidebarBorder}`,
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
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
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
                  color: isActive ? theme.sidebarTextActive : theme.sidebarText,
                  textDecoration: 'none',
                  borderLeft: isActive ? '2px solid #9B51E0' : '2px solid transparent',
                  background: isActive ? 'rgba(155,81,224,0.08)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'rgba(255,255,255,0.8)'
                    e.target.style.background = theme.sidebarHover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = theme.sidebarText
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Theme toggle + logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${theme.sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span aria-hidden="true" style={{ fontSize: '14px' }}>
              {mode === 'dark' ? '☀' : '☾'}
            </span>
            <span>{mode === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

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
              textAlign: 'left',
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
        maxWidth: 'calc(100vw - 220px)',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        background: mainBg,
        color: mainText,
        transition: 'background 0.2s ease, color 0.2s ease',
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
        .admin-topbar { display: none; }
        @media (max-width: 768px) {
          .admin-topbar { display: flex !important; }
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .admin-sidebar--open { transform: translateX(0); }
          .admin-main {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 72px !important;
            max-width: 100vw !important;
          }
        }
      `}</style>
    </div>
  )
}
