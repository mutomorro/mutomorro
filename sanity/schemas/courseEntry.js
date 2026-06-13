import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * A single course inside a training pillar page's "The courses" list.
 *
 * Pillar pages (e.g. /training/change-management) run a range of courses. Each
 * was previously authored as a bare h3 + paragraphs + four accordions, so the
 * courses blended into one undifferentiated wall of text. This block makes each
 * course a structured, scannable unit: a title, a small "spec" (format / who
 * it's for / what you leave with) surfaced out of the prose, the intro itself,
 * and the same expandable detail accordions as before.
 *
 * Rendered front-end by components/ContentCourse.js (number on top, bold title,
 * intro + spec rail, accordions beneath). The title is registered in the page
 * Table of Contents via lib/slugify.js (buildHeadingIndex treats a courseEntry
 * as a level-3 heading), so the contents rail and read-progress keep working.
 *
 * `intro` mirrors the constrained Portable Text used by the accordion block
 * (sanity/schemas/accordion.js): paragraphs, bullet lists, bold/italic and the
 * link annotation — no headings or nested blocks. `accordions` reuses the
 * existing `accordion` object type rather than redefining it.
 */

// Plain-text preview helper, so editors can tell instances apart.
function bodyText(blocks) {
  return (blocks || [])
    .map((b) => (b?.children || []).map((c) => c?.text || '').join(''))
    .join(' ')
    .trim()
}

// One constrained Portable Text block, matching accordion.js: normal
// paragraphs and bullet lists, with bold, italic and the link annotation.
const introBlock = defineArrayMember({
  type: 'block',
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [{ title: 'Bullet', value: 'bullet' }],
  marks: {
    decorators: [
      { title: 'Bold', value: 'strong' },
      { title: 'Italic', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
            validation: (Rule) =>
              Rule.uri({
                allowRelative: true,
                scheme: ['http', 'https', 'mailto', 'tel'],
              }),
          },
        ],
      },
    ],
  },
})

export default defineType({
  name: 'courseEntry',
  title: 'Course (in a list)',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Course title',
      type: 'string',
      description: 'The course name. Appears as the unit heading and in the page contents.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      description: 'Shown in the spec panel — e.g. "Two days, in-house".',
    }),
    defineField({
      name: 'audience',
      title: 'For',
      type: 'string',
      description: 'Who it’s for, kept short — e.g. "Project managers, HR, team leaders".',
    }),
    defineField({
      name: 'outcome',
      title: 'You leave with',
      type: 'string',
      description: 'A short outcome phrase — e.g. "A completed change plan".',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: [introBlock],
      description: 'The descriptive paragraph(s) under the title.',
    }),
    defineField({
      name: 'accordions',
      title: 'Detail (accordions)',
      type: 'array',
      of: [{ type: 'accordion' }],
      description: 'Expandable detail panels — e.g. What you’ll work on, How it runs, What you’ll take away, What makes it different.',
    }),
  ],
  preview: {
    select: { title: 'title', format: 'format', intro: 'intro' },
    prepare({ title, format, intro }) {
      return {
        title: title || 'Course',
        subtitle: format || bodyText(intro).slice(0, 60) || 'Course',
      }
    },
  },
})
