-- Fix audience RPC: column references and compound temp-table type
-- Date: 2026-05-22
--
-- The count_audience_contacts RPC's flag / sector / seniority branches
-- referenced columns that do not exist on `contacts` (flags, apollo_industry,
-- apollo_seniority). The JS applyFilter in lib/newsletter-audiences.js — the
-- source of truth for what a send actually queries — uses tags, industry and
-- seniority. The RPC now matches: flags -> tags, apollo_industry -> industry,
-- apollo_seniority -> seniority.
--
-- The compound branch also declared its temp table id column as uuid, but
-- contacts.id is bigint — so any compound filter errored on the INSERT. The
-- temp table is now bigint.
--
-- Before this fix the RPC errored for those filter types and countAudience
-- silently fell back to a slower paginated fetch; sends were unaffected (they
-- always use the JS path). This makes the fast count path work and stay
-- consistent with the send.

CREATE OR REPLACE FUNCTION count_audience_contacts(filter_def jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result integer := 0;
  sub_filter jsonb;
  ftype text := filter_def->>'type';
BEGIN
  IF ftype = 'all_active' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed');

  ELSIF ftype = 'flag' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND tags @> ARRAY[filter_def->>'flag'];

  ELSIF ftype = 'sector' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND industry = ANY (
        SELECT jsonb_array_elements_text(filter_def->'values')
      );

  ELSIF ftype = 'seniority' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND seniority = ANY (
        SELECT jsonb_array_elements_text(filter_def->'values')
      );

  ELSIF ftype = 'tag' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND tags @> ARRAY[filter_def->>'tag'];

  ELSIF ftype = 'compound' THEN
    -- Build a working set of subscribed contact ids, then intersect each sub-filter.
    CREATE TEMP TABLE _compound_ids (id bigint PRIMARY KEY) ON COMMIT DROP;
    INSERT INTO _compound_ids (id)
      SELECT id FROM contacts WHERE newsletter_status IN ('active', 'confirmed');

    FOR sub_filter IN SELECT * FROM jsonb_array_elements(filter_def->'filters')
    LOOP
      IF sub_filter->>'type' = 'flag' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE tags @> ARRAY[sub_filter->>'flag']
        );
      ELSIF sub_filter->>'type' = 'sector' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE industry = ANY (
            SELECT jsonb_array_elements_text(sub_filter->'values')
          )
        );
      ELSIF sub_filter->>'type' = 'seniority' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE seniority = ANY (
            SELECT jsonb_array_elements_text(sub_filter->'values')
          )
        );
      ELSIF sub_filter->>'type' = 'tag' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE tags @> ARRAY[sub_filter->>'tag']
        );
      END IF;
    END LOOP;

    SELECT count(*) INTO result FROM _compound_ids;
  END IF;

  RETURN COALESCE(result, 0);
END;
$$;

COMMENT ON FUNCTION count_audience_contacts(jsonb) IS 'Count contacts matching a newsletter audience filter definition. Restricted to subscribed contacts: newsletter_status IN (active, confirmed). Column mapping mirrors lib/newsletter-audiences.js: flag/tag -> tags, sector -> industry, seniority -> seniority.';
