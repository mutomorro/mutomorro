-- Widen the housing-association inference + reclassify.
-- Date: 2026-06-26
--
-- The first sector pass only caught 6 housing associations because many sit on
-- .org.uk (classified Charity) or have names without "housing"/"homes". This widens
-- the housing rule (provider language + a short named list) and reclassifies, also
-- honouring the curated `housing-association` tag as ground truth. The manual tail
-- is finished in the admin curation view (/admin/contacts sector filter + bulk).

CREATE OR REPLACE FUNCTION public.infer_sector(p_email text, p_org text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN d ~ '\.nhs\.uk$' OR d ~ '\.nhs\.net$' THEN 'NHS / health'
    WHEN d ~ '\.police\.uk$' THEN 'Emergency services'
    WHEN d ~ '\.sch\.uk$' THEN 'Schools'
    WHEN d ~ '\.ac\.uk$' THEN 'Higher education'
    WHEN d ~ '\.gov\.uk$' THEN
      CASE WHEN org ~ 'council|borough|county|district|metropolitan|combined authority' THEN 'Local government'
           ELSE 'Central government' END
    WHEN org ~ 'housing|\mhomes\M|housing association|housing group|housing trust|registered provider|registered social landlord|social landlord|almshouse|housing co.?op|community gateway|peabody|places for people|notting hill genesis|guinness partnership|metropolitan thames' THEN 'Housing association'
    WHEN org ~ 'council|borough council|county council|district council' THEN 'Local government'
    WHEN org ~ 'nhs|hospital|health trust|healthcare|integrated care board' THEN 'NHS / health'
    WHEN org ~ 'university|\mcollege\M' THEN 'Higher education'
    WHEN org ~ 'academy|multi.academy|\mschool\M|\mschools\M' THEN 'Schools'
    WHEN org ~ 'charity|foundation|\mcic\M|voluntary|third sector' THEN 'Charity / third sector'
    WHEN d ~ '\.org\.uk$' THEN 'Charity / third sector'
    WHEN d <> '' AND NOT public.is_free_email_domain(d) THEN 'Corporate / private'
    ELSE NULL
  END
  FROM (SELECT lower(split_part(coalesce(p_email, ''), '@', 2)) AS d,
               lower(coalesce(p_org, '')) AS org) x;
$$;

-- Reclassify: tagged housing + widened-rule matches -> Housing association.
UPDATE public.contacts SET sector = 'Housing association'
WHERE coalesce(sector, '') <> 'Housing association'
  AND coalesce(organisation_name, '') !~* 'mutomorro'
  AND lower(split_part(signup_email, '@', 2)) <> 'mutomorro.com'
  AND (tags @> ARRAY['housing-association']
       OR public.infer_sector(signup_email, organisation_name) = 'Housing association');

-- Rollback: re-apply infer_sector from 2026-06-26_sector-taxonomy.sql (narrower housing).
