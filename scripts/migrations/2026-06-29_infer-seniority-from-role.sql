-- 2026-06-29_infer-seniority-from-role.sql
-- UC-1 (fit-from-role): a Director hides from the Fit facet/lenses when the
-- `seniority` enum is null even though the role text says "Director of People"
-- (Vicki Carruthers). 242 contacts have a null seniority but a clearly-senior role.
--
-- Fix: infer seniority from role text. Because the score, the Fit facet and the
-- reasons chips all read `seniority`, backfilling the column fixes fit everywhere
-- with NO application changes. A BEFORE trigger keeps it current for any future
-- insert/update (enrich, import, manual) where seniority is null but role is set.
-- Only ever FILLS a null seniority - never overwrites a known one.

CREATE OR REPLACE FUNCTION public.infer_seniority_from_role(p_role text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  -- High-confidence only, ordered most-senior-first so the strongest token wins
  -- (e.g. "Managing Director" -> director, "Chief People Officer" -> c_suite).
  SELECT CASE
    WHEN p_role IS NULL OR btrim(p_role) = '' THEN NULL
    WHEN p_role ~* '\mowner\M'                                   THEN 'owner'
    WHEN p_role ~* 'co-?founder' OR p_role ~* '\mfounder\M'      THEN 'founder'
    WHEN p_role ~* '\mchief\M'
      OR p_role ~* '\m(ceo|cfo|coo|cto|cmo|cpo|chro|cio|ciso|cco)\M' THEN 'c_suite'
    -- NB: deliberately NOT inferring 'partner' from role text — it catches
    -- "HR/L&D/Business Partner" (mid-level IC), not senior partners.
    WHEN p_role ~* 'vice[- ]president' OR p_role ~* '\m(vp|svp|evp)\M' THEN 'vp'
    WHEN p_role ~* '\mdirector\M'                                THEN 'director'
    WHEN p_role ~* '\mhead\M'                                    THEN 'head'
    WHEN p_role ~* '\mmanager\M'                                 THEN 'manager'
    ELSE NULL
  END;
$$;

-- Keep it current: fill seniority from role on any insert/update where it's null.
CREATE OR REPLACE FUNCTION public.contacts_fill_seniority()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.seniority IS NULL AND NEW.role IS NOT NULL THEN
    NEW.seniority := public.infer_seniority_from_role(NEW.role);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contacts_fill_seniority ON public.contacts;
CREATE TRIGGER trg_contacts_fill_seniority
  BEFORE INSERT OR UPDATE OF role, seniority ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.contacts_fill_seniority();

-- One-time backfill of existing rows (the ~242).
UPDATE public.contacts
SET seniority = public.infer_seniority_from_role(role)
WHERE seniority IS NULL
  AND public.infer_seniority_from_role(role) IS NOT NULL;

-- Re-score so the newly-fit contacts get their +12.
SELECT public.refresh_engagement_scores();
