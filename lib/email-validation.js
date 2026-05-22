// Free / personal email providers. Downloadable content (toolkit PDFs and
// gated resources) requires an organisational email address, so submissions
// from these domains are rejected on both the client and the server.
//
// To extend: add the lowercase domain to the relevant group below.

const FREE_EMAIL_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',

  // Microsoft (Hotmail / Outlook / Live / MSN)
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it',
  'hotmail.es', 'hotmail.ca', 'hotmail.com.au',
  'outlook.com', 'outlook.co.uk', 'outlook.fr', 'outlook.de', 'outlook.it',
  'outlook.es', 'outlook.com.au', 'outlook.ie',
  'live.com', 'live.co.uk', 'live.fr', 'live.de', 'live.ca', 'live.com.au',
  'live.nl', 'live.ie',
  'msn.com', 'windowslive.com',

  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.it',
  'yahoo.es', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.in', 'yahoo.ie',
  'ymail.com', 'rocketmail.com',

  // AOL
  'aol.com', 'aol.co.uk', 'aim.com',

  // Apple
  'icloud.com', 'me.com', 'mac.com',

  // Mail.com family
  'mail.com', 'email.com', 'usa.com', 'consultant.com',

  // GMX
  'gmx.com', 'gmx.co.uk', 'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch',

  // Proton
  'proton.me', 'protonmail.com', 'pm.me',

  // Other global free / privacy webmail
  'yandex.com', 'yandex.ru', 'ya.ru',
  'zoho.com', 'zohomail.com',
  'tutanota.com', 'tutanota.de', 'tuta.io', 'tutamail.com', 'keemail.me',
  'fastmail.com', 'fastmail.fm',
  'hushmail.com',
  'hey.com',
  'inbox.com',
  'mailfence.com',
  'disroot.org',

  // Russia / CIS
  'mail.ru', 'bk.ru', 'list.ru', 'inbox.ru', 'internet.ru', 'ukr.net',

  // China
  'qq.com', 'foxmail.com', '163.com', '126.com', 'sina.com', 'sina.cn',
  'sohu.com', 'yeah.net', 'aliyun.com',

  // South Korea
  'naver.com', 'hanmail.net', 'daum.net',

  // Germany
  'web.de', 't-online.de', 'freenet.de',

  // France
  'orange.fr', 'wanadoo.fr', 'free.fr', 'laposte.net', 'sfr.fr',
  'neuf.fr', 'bbox.fr', 'aliceadsl.fr',

  // Italy
  'libero.it', 'virgilio.it', 'tin.it', 'alice.it', 'tiscali.it',

  // Spain / Portugal / Latin America
  'terra.com', 'terra.com.br', 'bol.com.br', 'uol.com.br', 'ig.com.br',

  // Poland
  'wp.pl', 'o2.pl', 'interia.pl', 'onet.pl', 'op.pl',

  // Czech
  'seznam.cz', 'centrum.cz',

  // India
  'rediffmail.com',

  // UK ISPs (personal accounts, not organisational)
  'btinternet.com', 'talktalk.net', 'sky.com', 'virginmedia.com',
  'ntlworld.com', 'blueyonder.co.uk', 'tiscali.co.uk', 'o2.co.uk',
  'virgin.net', 'btopenworld.com', 'plus.com',

  // US ISPs (personal accounts)
  'verizon.net', 'comcast.net', 'att.net', 'sbcglobal.net',
  'bellsouth.net', 'cox.net', 'charter.net', 'earthlink.net',
  'juno.com', 'optonline.net', 'roadrunner.com', 'frontier.com',
  'windstream.net',

  // Canada / Australia ISPs (personal accounts)
  'shaw.ca', 'rogers.com', 'sympatico.ca', 'telus.net', 'videotron.ca',
  'bigpond.com', 'bigpond.net.au', 'optusnet.com.au', 'iinet.net.au',
])

/**
 * Returns true if the email's domain is a known free / personal provider.
 * Case-insensitive; safe to call with empty or malformed input.
 */
export function isFreeEmailProvider(email) {
  if (typeof email !== 'string') return false
  const at = email.lastIndexOf('@')
  if (at === -1) return false
  const domain = email.slice(at + 1).trim().toLowerCase()
  return FREE_EMAIL_DOMAINS.has(domain)
}

// Shown to the user when a free email address is entered on a download form,
// and returned by the download API routes. Final copy — do not edit casually.
export const FREE_EMAIL_MESSAGE =
  "We send toolkits to organisational email addresses - this helps us understand who's finding our tools useful. Please use your organisational email to download. If you'd just like to keep in touch, you're welcome to join our newsletter."
