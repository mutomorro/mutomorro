import { NextResponse } from 'next/server'

export function middleware(request) {
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, password] = atob(authValue).split(':')

    if (user === 'mutomorro' && password === 'admin') {
      return NextResponse.next()
    }
  }

  return new NextResponse('Protected', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Staging"',
    },
  })
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|philosophy).*)',
}