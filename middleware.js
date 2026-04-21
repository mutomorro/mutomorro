import { NextResponse } from 'next/server'

// Edge-compatible SHA-256 hash
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request) {
  // Normalise trailing slash once so all downstream comparisons work
  // for both /path and /path/ (next.config trailingSlash: true means
  // real requests arrive with the slash, but redirects can race it off).
  const pathname = (request.nextUrl.pathname || '/').replace(/\/+$/, '') || '/'

  // Admin routes: check auth and set header
  if (pathname.startsWith('/admin')) {
    const response = await handleAdminAuth(request, pathname)
    if (response) return response

    // Auth passed - add header so root layout skips Nav/Footer
    const next = NextResponse.next()
    next.headers.set('x-admin-route', '1')
    return next
  }

  // API admin routes (except auth): check session
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const sessionCookie = request.cookies.get('admin_session')?.value
    const expectedHash = await sha256(adminPassword + 'mutomorro-admin-salt')

    if (!sessionCookie || sessionCookie !== expectedHash) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

async function handleAdminAuth(request, pathname) {
  // Allow the login page without a session (pathname is pre-normalised)
  if (pathname === '/admin/login') {
    const next = NextResponse.next()
    next.headers.set('x-admin-route', '1')
    return next
  }

  const sessionCookie = request.cookies.get('admin_session')?.value
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const expectedHash = await sha256(adminPassword + 'mutomorro-admin-salt')

  if (!sessionCookie || sessionCookie !== expectedHash) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Valid session
  return null
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
