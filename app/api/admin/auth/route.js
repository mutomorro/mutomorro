import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Generate session hash
    const sessionHash = crypto
      .createHash('sha256')
      .update(password + 'mutomorro-admin-salt')
      .digest('hex')

    const response = NextResponse.json({ success: true })

    // Set httpOnly cookie, 7 days expiry
    response.cookies.set('admin_session', sessionHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
