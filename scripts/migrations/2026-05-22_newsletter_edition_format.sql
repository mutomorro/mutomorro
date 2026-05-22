-- Newsletter edition format migration
-- Date: 2026-05-22
--
-- Documentation-only. The newsletter template moved from a flexible
-- { sections: [...] } body to a structured "edition" layout (hero image,
-- index, section kickers, linked content blocks). content_json now stores
-- the edition props directly. The legacy { sections } shape is still
-- accepted by the renderer for the warm-up campaign.

COMMENT ON COLUMN calendar_items.content_json IS
  'Structured content for the newsletter template. Edition format (current): '
  '{subject, previewText, monthYear, subjectLine, heroImageUrl, heroImageAlt, '
  'introText, indexItems:[{kicker,title,href}], observationKicker, '
  'observationTitle, observationBody, signOff, ps, '
  'contentBlocks:[{kicker,title,description,linkText,linkHref}]}. '
  'observationBody is plain text split into paragraphs on blank lines '
  '(inline HTML such as <strong> is allowed). Legacy format (warm-up only): '
  '{subject, title, previewText, date, leadText, signoff, sections:[{type,...}]}. '
  'The existing content_body column keeps the readable prose version.';
