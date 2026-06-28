/**
 * Tender-finder configuration.
 *
 * SCORING_MODEL is read from the environment so a Claude model retirement is a
 * config change (set TENDER_SCORING_MODEL in Vercel and redeploy nothing), not a
 * code edit. The previous hardcoded id (claude-sonnet-4-20250514) was retired by
 * Anthropic and every scoring call started returning 404 - silently, because the
 * errors are caught per-item. Keeping the id in one env-backed place is the fix
 * for that whole class.
 *
 * Default: the current Sonnet snapshot (like-for-like with the retired Sonnet 4
 * the scorer was tuned against). A current Haiku snapshot (claude-haiku-4-5) is
 * roughly 3x cheaper and a reasonable swap given the volume (hundreds of tenders
 * a day) - to switch, set TENDER_SCORING_MODEL=claude-haiku-4-5 in the env; no
 * code change needed. Confirm any new id resolves first with
 * `node docs/stack-checks/check-anthropic-model.mjs`.
 */
export const SCORING_MODEL = process.env.TENDER_SCORING_MODEL || 'claude-sonnet-4-6'
