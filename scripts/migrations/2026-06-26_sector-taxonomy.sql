-- Sector taxonomy + HE-noise scrub.
-- Date: 2026-06-26
--
-- A custom sector field built for a UK change-management ICP (Apollo's industry
-- buckets misfit: housing associations split across nonprofit/real estate/gov).
-- Two new columns on contacts:
--   sector       — the curated/inferred sector (separate from Apollo's `industry`)
--   out_of_scope — scrubs a contact from buyer-INSIGHT (funnel + engagement),
--                  without deleting it. Used for HE students/juniors, which are
--                  ~90% of the .ac.uk pool and skew every number. Reversible.
--
-- infer_sector() is deterministic: high-confidence UK public-sector TLDs first,
-- then org-name keywords (housing prioritised), then a Corporate/private catch-all.
-- The backfill (separate data step) only fills NULL sector, so manual curation in
-- the admin is never overwritten.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS out_of_scope boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.infer_sector(p_email text, p_org text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    -- High-confidence UK public-sector TLDs.
    WHEN d ~ '\.nhs\.uk$' OR d ~ '\.nhs\.net$' THEN 'NHS / health'
    WHEN d ~ '\.police\.uk$' THEN 'Emergency services'
    WHEN d ~ '\.sch\.uk$' THEN 'Schools'
    WHEN d ~ '\.ac\.uk$' THEN 'Higher education'
    WHEN d ~ '\.gov\.uk$' THEN
      CASE WHEN org ~ 'council|borough|county|district|metropolitan|combined authority' THEN 'Local government'
           ELSE 'Central government' END
    -- Org-name keywords (housing first - the priority sector).
    WHEN org ~ 'housing|housing association|registered provider|\bhomes\b' THEN 'Housing association'
    WHEN org ~ 'council|borough council|county council|district council' THEN 'Local government'
    WHEN org ~ 'nhs|hospital|health trust|healthcare|integrated care board' THEN 'NHS / health'
    WHEN org ~ 'university|\bcollege\b' THEN 'Higher education'
    WHEN org ~ 'academy|multi.academy|\bschool\b|\bschools\b' THEN 'Schools'
    WHEN org ~ 'charity|foundation|\bcic\b|voluntary|third sector' THEN 'Charity / third sector'
    WHEN d ~ '\.org\.uk$' THEN 'Charity / third sector'
    -- Anything else on a real (non-free) domain is private sector.
    WHEN d <> '' AND NOT public.is_free_email_domain(d) THEN 'Corporate / private'
    ELSE NULL  -- free-email with no org-name signal: genuinely unknown
  END
  FROM (SELECT lower(split_part(coalesce(p_email, ''), '@', 2)) AS d,
               lower(coalesce(p_org, '')) AS org) x;
$$;

-- Rollback:
--   ALTER TABLE public.contacts DROP COLUMN sector, DROP COLUMN out_of_scope;
--   DROP FUNCTION public.infer_sector(text, text);
