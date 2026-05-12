// Server-safe helper for building FAQ JSON-LD from portable text answers.
// Kept out of ServiceFAQ.js because that file is a 'use client' module
// and server components cannot import functions from client modules.

function portableTextToPlain(blocks = []) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((b) => b._type === 'block' && Array.isArray(b.children))
    .map((b) => b.children.map((c) => c.text || '').join(''))
    .join('\n\n')
    .trim()
}

export function buildFaqJsonLd(items = []) {
  if (!items?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: portableTextToPlain(item.answer),
      },
    })),
  }
}
