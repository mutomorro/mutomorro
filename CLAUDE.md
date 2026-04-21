# Mutomorro — dev notes for Claude Code

## Known gotchas

### Supabase PostgREST 1,000-row default

Supabase's PostgREST client caps `.select()` responses at **1,000 rows by default**. Queries returning more succeed silently with truncated data — no warning, no error.

**Rule:** any query whose result is fed into a `.filter()`, `Set`, `Map`, or `.forEach` for aggregation MUST either:
1. Use the shared `fetchAllPaginated` helper from [`lib/supabase-paginate.js`](lib/supabase-paginate.js), OR
2. Use a server-side `GROUP BY` via `.rpc()` (preferred for counts and aggregates — faster and always correct), OR
3. Have an explicit `.limit(n)` with `n` chosen intentionally and documented.

**Never** write `.from('x').select('y')` where `x` can exceed 1,000 rows and the result is iterated in JS.

**Examples of correct shape:**

```js
// Preferred: server-side aggregation
const { data } = await supabase.rpc('get_newsletter_tier_counts')

// Acceptable: paginated full-row fetch when you genuinely need every row
import { fetchAllPaginated } from '@/lib/supabase-paginate'
const all = await fetchAllPaginated((from, to) => supabase
  .from('contacts')
  .select('id, signup_email')
  .in('newsletter_status', ['active', 'confirmed'])
  .range(from, to)
)

// Fine: exact count on the server, no rows transferred
const { count } = await supabase
  .from('contacts')
  .select('*', { count: 'exact', head: true })
  .eq('newsletter_status', 'active')
```

**Anchoring incident:** April 2026 newsletter warm-up sent duplicates to 645 contacts over three weeks because `newsletter_recipients.select('contact_id')` returned 1,000 of 2,403 rows, letting 413 already-sent contacts escape the dedup filter. Full investigation notes are kept locally in `docs/running-summaries/` (gitignored) — `session-summary-newsletter-dedup-fix-2026-04-17.md` for the root-cause fix and `session-summary-pagination-audit-fix-2026-04-17.md` for the codebase-wide audit.

### Tables currently >1,000 rows

- `contacts` (~5,200; ~2,900 active/confirmed)
- `newsletter_recipients` (~2,400 and growing)
- `tenders` (growing)
- `contact_interactions`, `contact_enrichment_history` (grow per-contact)

Any query touching these tables that aggregates in JS needs the treatment above.
