// The studio page is a client component (`'use client'`), so the Next.js
// `metadata` export can't live there. This layout sets `noindex, nofollow`
// for every route under /studio. robots.txt also disallows /studio — this
// is the belt-and-braces meta tag.
export const metadata = {
  robots: 'noindex, nofollow',
}

export default function StudioLayout({ children }) {
  return children
}
