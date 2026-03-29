const BLOCKED_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail'])

/**
 * Verify an email address via ZeroBounce API.
 * Returns { status, subStatus, freeEmail, shouldBlock }
 *
 * shouldBlock = true means: do not create a contact, do not send any email.
 * On API failure or missing key, returns { status: 'unknown', shouldBlock: false }.
 */
export async function verifyEmail(email) {
  const apiKey = process.env.ZEROBOUNCE_API_KEY

  if (!apiKey) {
    console.warn('ZEROBOUNCE_API_KEY not set - skipping email verification')
    return { status: 'unknown', subStatus: '', freeEmail: false, shouldBlock: false }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const params = new URLSearchParams({
      api_key: apiKey,
      email: email,
      ip_address: '',
    })

    const response = await fetch(
      `https://api.zerobounce.net/v2/validate?${params}`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!response.ok) {
      console.error('ZeroBounce API error:', response.status, response.statusText)
      return { status: 'unknown', subStatus: '', freeEmail: false, shouldBlock: false }
    }

    const data = await response.json()
    const status = (data.status || 'unknown').toLowerCase()
    const subStatus = data.sub_status || ''
    const freeEmail = data.free_email || false

    return {
      status,
      subStatus,
      freeEmail,
      shouldBlock: BLOCKED_STATUSES.has(status),
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('ZeroBounce API timeout for:', email)
    } else {
      console.error('ZeroBounce API error:', err.message)
    }
    return { status: 'unknown', subStatus: '', freeEmail: false, shouldBlock: false }
  }
}

/**
 * Check if a contact already has a zb_status stored.
 * If so, return the cached result to avoid unnecessary API calls.
 */
export function getCachedVerification(existingContact) {
  if (!existingContact?.zb_status) return null
  const status = existingContact.zb_status
  return {
    status,
    subStatus: '',
    freeEmail: false,
    shouldBlock: BLOCKED_STATUSES.has(status),
  }
}
