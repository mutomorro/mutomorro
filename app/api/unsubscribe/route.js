import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function verifyToken(email, token) {
  const expectedToken = crypto
    .createHmac('sha256', process.env.UNSUBSCRIBE_SECRET)
    .update(email)
    .digest('hex')
  return token === expectedToken
}

async function unsubscribe(email) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  await supabase
    .from('contacts')
    .update({ newsletter_status: 'unsubscribed' })
    .eq('signup_email', email.toLowerCase().trim())
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return new Response('Invalid unsubscribe link', { status: 400 })
  }

  if (!verifyToken(email, token)) {
    return new Response('Invalid unsubscribe link', { status: 400 })
  }

  await unsubscribe(email)

  return NextResponse.redirect(new URL('/unsubscribed', request.url))
}

export async function POST(request) {
  // RFC 8058 List-Unsubscribe-Post support
  const formData = await request.text()
  const params = new URLSearchParams(formData)
  const email = params.get('email') || new URL(request.url).searchParams.get('email')
  const token = params.get('token') || new URL(request.url).searchParams.get('token')

  if (!email || !token) {
    return new Response('Invalid unsubscribe link', { status: 400 })
  }

  if (!verifyToken(email, token)) {
    return new Response('Invalid unsubscribe link', { status: 400 })
  }

  await unsubscribe(email)

  return new Response('Unsubscribed', { status: 200 })
}
