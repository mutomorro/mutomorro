import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an email via Resend, surfacing API-level errors.
 *
 * The Resend SDK resolves its promise even when the API rejects a send — it
 * returns `{ data: null, error }` rather than throwing. So
 * `await resend.emails.send(...)` without inspecting `error` drops failures
 * silently (rate limits, invalid recipients, suppressed addresses). This
 * wrapper throws on that error so a caller's try/catch fires, and returns the
 * message data (`{ id }`) on success.
 *
 * @param {object} payload  Resend emails.send payload (from, to, subject, html…)
 * @returns {Promise<{ id: string }>} the Resend message data
 */
export async function sendEmail(payload) {
  const { data, error } = await resend.emails.send(payload)
  if (error) {
    const err = new Error(`Resend send failed: ${error.message || error.name || 'unknown error'}`)
    err.resendError = error
    throw err
  }
  return data
}

export { resend }
