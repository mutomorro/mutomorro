-- Newsletter Send UI migration
-- Date: 2026-05-07
--
-- Adds:
--   1. subject, preview_text, content_json columns to calendar_items
--   2. newsletter_audiences table + seed data
--   3. count_audience_contacts RPC function

-- ──────────────────────────────────────────────────────────────────────
-- 1. calendar_items columns
-- ──────────────────────────────────────────────────────────────────────

ALTER TABLE calendar_items
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS preview_text text,
  ADD COLUMN IF NOT EXISTS content_json jsonb;

COMMENT ON COLUMN calendar_items.subject IS 'Email subject line. Used by newsletter send UI.';
COMMENT ON COLUMN calendar_items.preview_text IS 'Inbox preview snippet (preheader text). Used by newsletter send UI.';
COMMENT ON COLUMN calendar_items.content_json IS 'Structured sections array for the email template. Format: {subject, title, previewText, date, leadText, signoff, sections:[{type,...}]}. Populated before send, read by the send UI. The existing content_body column keeps the readable prose version.';

-- ──────────────────────────────────────────────────────────────────────
-- 2. newsletter_audiences table
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  filter_definition jsonb NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_audiences_sort
  ON newsletter_audiences (sort_order, name);

-- Seed data (only insert if table is empty)
INSERT INTO newsletter_audiences (name, description, filter_definition, is_default, sort_order)
SELECT * FROM (VALUES
  (
    'All active subscribers',
    'Every contact with newsletter_status = active and a valid email. The default for monthly newsletters.',
    '{"type": "all_active"}'::jsonb,
    true,
    1
  ),
  (
    'Housing sector',
    'Contacts in social housing and housing associations. For sector-specific content like competence-conduct.org.',
    '{"type": "sector", "values": ["Social Housing", "Housing Association", "Housing", "Affordable Housing"]}'::jsonb,
    false,
    2
  ),
  (
    'Proven sector contacts',
    'Contacts in sectors where Mutomorro has demonstrable experience (housing, nonprofit, government, membership orgs, humanitarian).',
    '{"type": "flag", "flag": "flag:proven-sector"}'::jsonb,
    false,
    3
  ),
  (
    'Potential clients',
    'Senior leaders in purpose-adjacent organisations.',
    '{"type": "flag", "flag": "flag:potential-client"}'::jsonb,
    false,
    4
  )
) AS seed(name, description, filter_definition, is_default, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM newsletter_audiences);

-- ──────────────────────────────────────────────────────────────────────
-- 3. count_audience_contacts RPC
-- ──────────────────────────────────────────────────────────────────────
--
-- Returns a count of contacts matching a filter_definition. Always
-- restricted to newsletter_status = 'active'. Mirrors the JS
-- buildAudienceQuery in lib/newsletter-audiences.js.
--
-- Filter types supported: all_active, flag, sector, seniority, tag, compound (AND).

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
    SELECT count(*) INTO result FROM contacts WHERE newsletter_status = 'active';

  ELSIF ftype = 'flag' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status = 'active'
      AND flags @> ARRAY[filter_def->>'flag'];

  ELSIF ftype = 'sector' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status = 'active'
      AND apollo_industry = ANY (
        SELECT jsonb_array_elements_text(filter_def->'values')
      );

  ELSIF ftype = 'seniority' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status = 'active'
      AND apollo_seniority = ANY (
        SELECT jsonb_array_elements_text(filter_def->'values')
      );

  ELSIF ftype = 'tag' THEN
    SELECT count(*) INTO result FROM contacts
    WHERE newsletter_status = 'active'
      AND tags @> ARRAY[filter_def->>'tag'];

  ELSIF ftype = 'compound' THEN
    -- Build a working set of active contact ids, then intersect each sub-filter.
    CREATE TEMP TABLE _compound_ids (id uuid PRIMARY KEY) ON COMMIT DROP;
    INSERT INTO _compound_ids (id)
      SELECT id FROM contacts WHERE newsletter_status = 'active';

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

COMMENT ON FUNCTION count_audience_contacts(jsonb) IS 'Count contacts matching a newsletter audience filter definition. Always restricted to newsletter_status = active.';
