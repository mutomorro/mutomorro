-- Audience filter: include double opt-in subscribers
-- Date: 2026-05-22
--
-- The newsletter send UI (2026-05-07) built its audiences against
-- newsletter_status = 'active' only. But the double opt-in confirm flow sets
-- newsletter_status = 'confirmed', and nothing promotes 'confirmed' -> 'active'.
-- Result: every subscriber gained through double opt-in was invisible to the
-- send UI. The rest of the codebase (old send route, warm-up script, admin
-- dashboard counts) already treats 'active' + 'confirmed' together.
--
-- This migration brings count_audience_contacts into line with the updated
-- buildAudienceQuery in lib/newsletter-audiences.js: both now count/select
-- newsletter_status IN ('active', 'confirmed').

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
      AND flags @> ARRAY[filter_def->>'flag'];

  ELSIF ftype = 'sector' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND apollo_industry = ANY (
        SELECT jsonb_array_elements_text(filter_def->'values')
      );

  ELSIF ftype = 'seniority' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND apollo_seniority = ANY (
        SELECT jsonb_array_elements_text(filter_def->'values')
      );

  ELSIF ftype = 'tag' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status IN ('active', 'confirmed')
      AND tags @> ARRAY[filter_def->>'tag'];

  ELSIF ftype = 'compound' THEN
    -- Build a working set of subscribed contact ids, then intersect each sub-filter.
    CREATE TEMP TABLE _compound_ids (id uuid PRIMARY KEY) ON COMMIT DROP;
    INSERT INTO _compound_ids (id)
      SELECT id FROM contacts WHERE newsletter_status IN ('active', 'confirmed');

    FOR sub_filter IN SELECT * FROM jsonb_array_elements(filter_def->'filters')
    LOOP
      IF sub_filter->>'type' = 'flag' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE flags @> ARRAY[sub_filter->>'flag']
        );
      ELSIF sub_filter->>'type' = 'sector' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE apollo_industry = ANY (
            SELECT jsonb_array_elements_text(sub_filter->'values')
          )
        );
      ELSIF sub_filter->>'type' = 'seniority' THEN
        DELETE FROM _compound_ids WHERE id NOT IN (
          SELECT id FROM contacts WHERE apollo_seniority = ANY (
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

COMMENT ON FUNCTION count_audience_contacts(jsonb) IS 'Count contacts matching a newsletter audience filter definition. Restricted to subscribed contacts: newsletter_status IN (active, confirmed).';
