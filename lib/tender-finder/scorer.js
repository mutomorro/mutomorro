/**
 * Tender keyword scoring
 *
 * Three-layer keyword matching plus sector, value, and deadline scoring.
 * Tenders rarely say "organisational development" - the task language
 * layer catches deliverables that map to Mutomorro's services.
 */

const PRIMARY_KEYWORDS = [
  'organisational development',
  'culture change', 'cultural transformation',
  'change management',
  'organisational design', 'organisational redesign',
  'organisational restructuring',
  'leadership development', 'leadership programme',
  'employee experience',
  'strategic alignment', 'strategy development',
  'service design',
  'customer experience',
  'capacity building', 'capability building',
  'post-merger integration', 'merger integration',
  'operational effectiveness',
  'organisational transformation',
]

const SECONDARY_KEYWORDS = [
  'workforce development',
  'staff engagement', 'employee engagement',
  'people strategy',
  'organisational health',
  'team development', 'team coaching',
  'executive coaching',
  'bespoke training',
  'facilitation services',
  'operating model design',
  'governance review',
  'organisational review',
  'transformation programme',
]

const TASK_LANGUAGE_KEYWORDS = [
  'customer charter',
  'theory of change',
  'values framework', 'values development',
  'staff survey', 'employee survey',
  'away day facilitation',
  'board development', 'board effectiveness',
  'stakeholder engagement strategy',
  'resident involvement strategy',
  'people strategy',
  'target operating model',
  'workforce redesign',
  'service improvement',
  'patient experience',
  'tenant experience',
  'strategic narrative',
  'behavioural framework',
  'capability framework', 'skills audit',
  'evp development',
  'mission review',
]

const SECTOR_SCORING = {
  tier1: {
    score: 15,
    label: 'housing/charity',
    patterns: ['housing association', 'housing group', 'homes', 'charity', 'trust', 'foundation'],
  },
  tier2: {
    score: 10,
    label: 'public sector',
    patterns: ['council', 'authority', 'commission', 'regulator', 'college of', 'society of', 'institute of'],
  },
  tier3: {
    score: 5,
    label: 'nhs/edu/corporate',
    patterns: ['nhs', 'hospital', 'health trust', 'university', 'plc', 'group plc', 'ltd'],
  },
}

/**
 * Match keywords against text. Returns score and list of matched keywords.
 */
function matchKeywords(text, primaryKws, secondaryKws, taskKws) {
  const matched = []
  let score = 0

  // Primary: +20 each, max 40
  let primaryScore = 0
  for (const kw of primaryKws) {
    if (text.includes(kw)) {
      matched.push(kw)
      primaryScore += 20
      if (primaryScore >= 40) break
    }
  }
  score += Math.min(primaryScore, 40)

  // Secondary: +10 each, max 20
  let secondaryScore = 0
  for (const kw of secondaryKws) {
    if (text.includes(kw)) {
      matched.push(kw)
      secondaryScore += 10
      if (secondaryScore >= 20) break
    }
  }
  score += Math.min(secondaryScore, 20)

  // Task language: +15 each, max 30
  let taskScore = 0
  for (const kw of taskKws) {
    if (text.includes(kw)) {
      matched.push(kw)
      taskScore += 15
      if (taskScore >= 30) break
    }
  }
  score += Math.min(taskScore, 30)

  return { score, matched }
}

/**
 * Detect sector from organisation name and description text.
 */
function scoreSector(organisation, text) {
  const combined = `${organisation} ${text}`.toLowerCase()

  for (const [tier, config] of Object.entries(SECTOR_SCORING)) {
    for (const pattern of config.patterns) {
      if (combined.includes(pattern)) {
        return { score: config.score, sector: config.label }
      }
    }
  }

  return { score: 0, sector: 'unknown' }
}

/**
 * Score based on tender value. Sweet spot is 10k-150k.
 */
function scoreValue(valueLow, valueHigh) {
  const value = valueHigh || valueLow || 0
  if (value === 0) return 0
  if (value < 10000) return -20
  if (value >= 10000 && value <= 50000) return 15
  if (value > 50000 && value <= 150000) return 10
  if (value > 150000 && value <= 250000) return 5
  return 0
}

/**
 * Score based on deadline proximity.
 */
function scoreDeadline(deadline) {
  if (!deadline) return 0
  const daysUntil = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return -30
  if (daysUntil < 7) return -10
  if (daysUntil >= 14) return 5
  return 0
}

/**
 * Classify total score into a temperature band.
 */
function classifyTemperature(totalScore) {
  if (totalScore >= 60) return 'hot'
  if (totalScore >= 30) return 'warm'
  if (totalScore >= 10) return 'cool'
  return 'archived'
}

/**
 * Score a tender object. Returns scoring breakdown.
 *
 * @param {Object} tender - Must have title, description, organisation, value_low, value_high, deadline
 * @returns {Object} Scoring breakdown with total_score and temperature
 */
export function scoreTender(tender) {
  const text = `${tender.title} ${tender.description}`.toLowerCase()

  const keywordResult = matchKeywords(text, PRIMARY_KEYWORDS, SECONDARY_KEYWORDS, TASK_LANGUAGE_KEYWORDS)
  const sectorResult = scoreSector(tender.organisation || '', text)
  const valueResult = scoreValue(tender.value_low, tender.value_high)
  const deadlineResult = scoreDeadline(tender.deadline)

  const totalScore = Math.max(0, Math.min(100,
    keywordResult.score + sectorResult.score + valueResult + deadlineResult
  ))

  return {
    keyword_score: keywordResult.score,
    keywords_matched: keywordResult.matched,
    sector_score: sectorResult.score,
    sector: sectorResult.sector,
    value_score: valueResult,
    total_score: totalScore,
    temperature: classifyTemperature(totalScore),
  }
}

/**
 * Recalculate total score after AI scoring is added.
 * Called by the pipeline once ai_score is available.
 *
 * @param {Object} tender - Tender with keyword_score, sector_score, value_score, ai_score
 * @returns {{ total_score: number, temperature: string }}
 */
export function recalculateWithAi(tender) {
  let total = (tender.keyword_score || 0)
    + (tender.sector_score || 0)
    + (tender.value_score || 0)

  // Deadline (recalculate since we have the field)
  const deadlineAdj = scoreDeadline(tender.deadline)
  total += deadlineAdj

  // AI score contribution
  if (tender.ai_score != null) {
    if (tender.ai_score >= 8) total += 10       // AI confirms strong fit
    else if (tender.ai_score >= 5) total += 5   // AI says possible fit
    else if (tender.ai_score <= 2) total -= 10  // AI says definitely not relevant
  }

  total = Math.max(0, Math.min(100, total))

  return {
    total_score: total,
    temperature: classifyTemperature(total),
  }
}

export {
  PRIMARY_KEYWORDS,
  SECONDARY_KEYWORDS,
  TASK_LANGUAGE_KEYWORDS,
  SECTOR_SCORING,
  classifyTemperature,
}
