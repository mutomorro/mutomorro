import { redirect } from 'next/navigation'

// /admin/engagement was merged into /admin/contacts (29 Jun 2026). Kept as a
// redirect so old bookmarks land sensibly, and any ?filter= deep-link maps onto
// the new ?preset= lens. The /api/admin/engagement route stays — the Contacts
// surface still calls it (targeted-mode ranking + bulk-tag).
export default async function EngagementMoved({ searchParams }) {
  const sp = (await searchParams) || {}
  const filter = typeof sp.filter === 'string' ? sp.filter : ''
  redirect(filter ? `/admin/contacts?preset=${encodeURIComponent(filter)}` : '/admin/contacts')
}
