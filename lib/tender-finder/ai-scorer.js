/**
 * Claude API relevance scoring
 *
 * The primary brain of the tender finder. Reads the full tender and judges
 * whether it's something Mutomorro could bid on - even when the tender
 * doesn't use OD language.
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

  return `You are scoring a tender opportunity for relevance to Mutomorro, a UK organisational development consultancy.

## What Mutomorro does

Mutomorro helps organisations with:

APPLICATION SERVICES (14 services):
- Organisational Purpose (theory of change, mission review, purpose statement, strategic narrative)
- Strategic Alignment (strategy development, strategic planning, strategic review, business planning)
- Culture Change (staff engagement programme, values development, behavioural framework)
- Merger Integration (post-merger support, integration programme, bringing organisations together)
- Organisational Restructuring (restructure support, organisational review, workforce redesign)
- Operational Effectiveness (process improvement, efficiency review, operating model review)
- Organisational Design (target operating model, governance review, structural review)
- Change Management (transformation support, transition management, change programme)
- Employee Experience (staff survey, wellbeing programme, people strategy, EVP development)
- Organisational Capacity Building (workforce development, skills audit, capability framework)
- Organisational Development (organisational review, organisational health, continuous improvement)
- Service Design (customer charter, service improvement, user research, service review)
- Customer Experience (resident experience for housing, patient experience for NHS, user experience)
- Scaling Operations (growth strategy, scaling support, expansion planning)

CAPABILITY BUILDING (7 services):
- Leadership Development / Deeper Ground programme
- Executive Coaching
- Leadership Facilitation
- Senior Leader Support
- Bespoke Training
- Team Sessions / Away day facilitation
- Manager Coaching

## Strongest sectors (in order)
1. Social housing (housing associations, housing groups)
2. Charity and nonprofit
3. Public sector and regulators
4. Professional bodies (royal colleges, institutes)
5. NHS and healthcare
6. Higher education
7. Large corporates

## Contract sweet spot
- Best range: £10,000 - £150,000
- Solo practitioner, so very large contracts (£500k+) are unlikely fits unless subcontracting is possible

## IMPORTANT
Tenders rarely use the phrase "organisational development". They describe specific deliverables instead. A tender for "developing a customer charter" IS relevant (it's Service Design / Customer Experience work). A tender for "board effectiveness review" IS relevant (it's Leadership Development). Score based on whether Mutomorro could genuinely deliver this work, not whether it uses OD terminology.

## The tender to score

Title: ${tender.title}
Organisation: ${tender.organisation || 'Not specified'}
Description: ${(tender.description || 'No description available').slice(0, 3000)}
Value: ${value}
Deadline: ${tender.deadline || 'Not specified'}

## Your task

Score this tender 1-10 for relevance to Mutomorro:
- 1-2: Not relevant at all (IT systems, construction, pure procurement of goods, etc.)
- 3-4: Tangentially related but not a good fit
- 5-6: Possible fit - some overlap with Mutomorro's services
- 7-8: Good fit - clearly within Mutomorro's service areas
- 9-10: Excellent fit - core Mutomorro territory, right sector, right size

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
