/**
 * Claude API relevance scoring
 *
 * The primary brain of the tender finder. Reads the full tender and judges
 * whether it's something Mutomorro would genuinely bid on.
 *
 * Uses Claude Sonnet 4 (fast, cheap, ~1p per call).
 */

import Anthropic from '@anthropic-ai/sdk'

const AI_DELAY_MS = 500

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Build the scoring prompt for a single tender.
 */
function buildScoringPrompt(tender) {
  const value = tender.value_low
    ? `£${Number(tender.value_low).toLocaleString('en-GB')}${tender.value_high ? ' - £' + Number(tender.value_high).toLocaleString('en-GB') : ''}`
    : 'Not specified'

  return `You are deciding whether a tender opportunity is worth pursuing for Mutomorro.

## Who Mutomorro is

James Freeman-Gray runs Mutomorro, a solo organisational development (OD) consultancy.
He needs to find roughly 5-7 winning projects per year, worth £250k total revenue.
He tenders for maybe 15-20 opportunities per year at most. Every bid takes significant time.
So this isn't "could Mutomorro vaguely do this?" - it's "would James actually write a proposal for this?"

## What Mutomorro genuinely delivers

CORE WORK (the sweet spot - score 8-10 if these match):
- Leadership development programmes (designing and delivering)
- Executive coaching
- Culture change and values work
- Organisational design and restructuring
- Change management and transformation support
- Strategic alignment and strategy development
- Organisational reviews and health checks
- Team development sessions and away day facilitation
- Bespoke training design and delivery

SECONDARY WORK (good but less common - score 6-7 if these match):
- Service design and customer experience strategy
- Employee experience and people strategy
- Capacity building and capability frameworks
- Post-merger integration support
- Operational effectiveness reviews

## Commercial reality

- Solo practitioner (no team, no subcontractors by default)
- Sweet spot: £10,000 - £50,000 per project
- Will consider up to £150,000 if deliverable solo
- Contracts over £250,000 are almost certainly too large
- Framework agreements and DPS registrations are fine if the call-offs are the right size
- Geographic: UK-based, can work nationally

## Strongest sectors (but sector alone doesn't make a tender relevant)
Social housing, charities, public sector, regulators, professional bodies, NHS, higher education

## How to think about this

Use your inference. Read the tender description and think about what the actual work involves:
- "Developing a customer charter" = Service Design work = yes
- "Board effectiveness review" = Leadership Development = yes
- "Communication and print services" = print/design/comms work = score 1-2, even if one lot mentions "change comms"
- "Marketing and communications framework" = creative/PR/advertising = score 1-2, not OD work
- "Safeguarding training" = specialist clinical content = no, even though it's "training"
- "Employment and health test and learn" = policy programme = no, even though it's public sector
- A £50m framework for L&D = too big to be meaningful unless specific lots are clearly right-sized
- DPS for physical goods/construction/IT/print/comms/arts/heritage = no, regardless of sector

Be ruthless. If you're unsure, score low. James would rather miss a borderline opportunity than waste time reviewing irrelevant ones. He wants 1-2 strong leads per week, not 50 maybes.

GEOGRAPHIC FILTER: James is based in Scotland and works across the whole of the UK. Only score highly if this is a UK opportunity, or an international development role that could realistically be delivered remotely from the UK (e.g. evaluation, research, strategy work for INGOs, multilateral bodies, or UK government-funded programmes). Tenders from foreign governments, foreign banks, or foreign public bodies that require in-country delivery (e.g. Bank of Zambia, Hong Kong government, South African transport sector) should score 1-2 regardless of how well the work fits. Scottish opportunities are of particular interest - if a tender is borderline (you'd otherwise give it a 6 or 7), nudge it up by 1 if the commissioning organisation is Scottish. This is a small consideration, not a major factor - service fit still matters far more than geography.

OPPORTUNITY CHECK: Only score highly if this appears to be a live, open opportunity that James could bid on. If the text describes a contract that has already been awarded, a news article about work someone else has won, a grant programme James wouldn't qualify for, or a report/announcement about something that has already happened, score 1. Look for clues like "awarded", "secures", "appoints", "wins contract", or past-tense language describing completed work.

## The tender to score

Title: ${tender.title}
Organisation: ${tender.organisation || 'Not specified'}
Description: ${(tender.description || 'No description available').slice(0, 3000)}
Value: ${value}
Deadline: ${tender.deadline || 'Not specified'}

## Your task

Score this tender 1-10:
- 1-3: Not relevant. Wrong type of work entirely (construction, IT/digital/software, clinical/specialist health services, print, marketing, creative, communications, PR, advertising, media buying, graphic design, adult education/training marketplaces such as NVQs, apprenticeships, employment programmes, literacy/numeracy courses, arts/culture/heritage projects, infrastructure/engineering, grant funding programmes unless specifically commissioning OD/consultancy work). Bin it.
- 4-5: Tangentially related but James would not bid. Maybe it mentions "training" or "engagement" but the actual work is something else. Bin it.
- 6-7: Genuine overlap with Mutomorro's services. The work is recognisably OD, leadership, culture, or change work. Worth a look.
- 8-9: Strong fit. Core Mutomorro territory, right type of work, plausible size. James should seriously consider bidding.
- 10: Perfect. Exactly what Mutomorro does, right sector, right size, right timing.

Respond in EXACTLY this format (no other text):
SCORE: [number]
SUMMARY: [one-line assessment of why this is or isn't relevant]
SERVICE: [which Mutomorro service this maps to, or "none"]`
}

/**
 * Parse the structured AI response.
 */
function parseAiResponse(text) {
  const scoreMatch = text.match(/SCORE:\s*(\d+)/)
  const summaryMatch = text.match(/SUMMARY:\s*(.+)/)
  const serviceMatch = text.match(/SERVICE:\s*(.+)/)

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : null,
    summary: summaryMatch ? summaryMatch[1].trim() : null,
    service: serviceMatch ? serviceMatch[1].trim() : null,
  }
}

/**
 * Decide whether a tender should be sent to the AI for scoring.
 * Saves cost by skipping clearly irrelevant items.
 */
export function shouldAiScore(tender) {
  // Always AI score if any keyword matched
  if (tender.keyword_score > 0) return true

  // Always AI score trigger events (Google Alert signals)
  if (tender.notice_type === 'trigger_event') return true

  // Always AI score Google Alert items (already targeted by alert query)
  if (tender.source === 'google-alerts') return true

  // AI score if sector is a strong match
  if (tender.sector_score >= 10) return true

  // Skip the rest (e.g. broad Contracts Finder results with zero matches)
  return false
}

/**
 * Score a single tender using Claude API.
 *
 * @param {Object} tender
 * @returns {Promise<{ score: number|null, summary: string|null, service: string|null }>}
 */
export async function aiScoreTender(tender) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  try {
    const prompt = buildScoringPrompt(tender)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const result = parseAiResponse(response.content[0].text)

    // Log for cost tracking
    const inputTokens = response.usage?.input_tokens || 0
    const outputTokens = response.usage?.output_tokens || 0
    console.log(`    AI: ${result.score}/10 | ${inputTokens}+${outputTokens} tokens | ${(result.summary || '').slice(0, 60)}`)

    return result
  } catch (error) {
    console.error(`    AI scoring failed for "${tender.title.slice(0, 50)}": ${error.message}`)
    return {
      score: null,
      summary: 'AI scoring failed - manual review recommended',
      service: null,
    }
  }
}

/**
 * Score a batch of tenders with AI, respecting rate limits.
 * Returns the tenders with ai_score and ai_summary fields populated.
 *
 * @param {Array} tenders - Already keyword-scored tenders
 * @returns {Promise<{ tenders: Array, aiCalls: number, aiErrors: number }>}
 */
export async function aiScoreBatch(tenders) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ANTHROPIC_API_KEY not set - skipping AI scoring')
    return { tenders, aiCalls: 0, aiErrors: 0 }
  }

  let aiCalls = 0
  let aiErrors = 0

  for (const tender of tenders) {
    if (!shouldAiScore(tender)) continue

    const result = await aiScoreTender(tender)
    aiCalls++

    if (result.score !== null) {
      tender.ai_score = result.score
      tender.ai_summary = result.summary
      if (result.service) {
        tender.ai_service = result.service
      }
    } else {
      aiErrors++
    }

    // Rate limit
    await sleep(AI_DELAY_MS)
  }

  return { tenders, aiCalls, aiErrors }
}

export { buildScoringPrompt, parseAiResponse }
