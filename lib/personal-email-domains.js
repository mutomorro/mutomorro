// Domains we treat as personal/free-mail. Used to gate "company email" forms
// (e.g. States of Vitality overview download and quote requests). Validation is
// applied client-side (UX) and server-side (authoritative).

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'outlook.co.uk',
  'yahoo.com',
  'yahoo.co.uk',
  'icloud.com',
  'me.com',
  'mac.com',
  'live.com',
  'live.co.uk',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'btinternet.com',
  'sky.com',
  'virginmedia.com',
])

export const PERSONAL_EMAIL_ERROR =
  'Please use your work email address so we can tailor the information to your organisation.'

export function getEmailDomain(email) {
  if (typeof email !== 'string') return null
  const at = email.lastIndexOf('@')
  if (at === -1 || at === email.length - 1) return null
  return email.slice(at + 1).trim().toLowerCase()
}

export function isPersonalEmail(email) {
  const domain = getEmailDomain(email)
  if (!domain) return false
  return PERSONAL_EMAIL_DOMAINS.has(domain)
}
