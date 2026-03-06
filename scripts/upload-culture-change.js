// Upload Culture Change service document to Sanity
// Run with: node scripts/upload-culture-change.js
//
// The script will ask for your Sanity API token (Editor permissions).
// This keeps the token out of any files that get pushed to GitHub.

const readline = require('readline')

const PROJECT_ID = 'c6pg4t4h'
const DATASET = 'production'

// Helper: create a Portable Text block from a plain string
// Each paragraph becomes one block in Sanity's format
function textBlock(text) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text: text,
        marks: [],
      },
    ],
  }
}

// Helper: generate a random key for array items
function key() {
  return Math.random().toString(36).slice(2, 10)
}

// ===========================
// THE CULTURE CHANGE DOCUMENT
// ===========================

const cultureChange = {
  _type: 'service',
  // Use a predictable ID so we can update it later if needed
  _id: 'service-culture-change',

  // --- Core ---
  title: 'Culture Change',
  slug: { _type: 'slug', current: 'culture-change' },
  category: 'purpose-direction',
  categoryLabel: 'Purpose & Direction',
  order: 1,

  // --- Hero ---
  heroHeading: 'Organisational Culture Change',
  heroTagline:
    'We help organisations create culture change that genuinely lasts - by working with the patterns, connections, and practices that shape how your organisation actually works.',

  // --- Context ---
  contextHeading:
    "We know culture isn't a programme you run. It's what emerges when everything else works well together.",
  contextBody: [
    textBlock(
      'It is the patterns that determine whether people collaborate or protect their territory. Whether knowledge flows freely or gets hoarded. Whether change feels natural or gets resisted at every turn.'
    ),
    textBlock(
      'You cannot change culture by talking about culture. It shifts when you change the conditions it grows from - how decisions get made, how people connect to purpose, how capability develops, how work actually flows.'
    ),
    textBlock(
      'We help you work with those conditions. Not running a culture programme alongside everything else, but making practical improvements to how your organisation functions - and letting culture develop as a natural consequence.'
    ),
  ],
  propositionCaption:
    'Change the conditions, and culture shifts naturally.',

  // --- Recognition ---
  recognitionHeading:
    'Creating a culture people actually want to be part of',
  recognitionIntro:
    'You are looking for something more than a culture programme. You want real, lasting change to how your organisation feels and functions. The kind of change where:',
  recognitionItems: [
    { _key: key(), text: 'People genuinely collaborate, not just coexist' },
    {
      _key: key(),
      text: 'Values show up in everyday decisions, not just on posters',
    },
    {
      _key: key(),
      text: 'Teams share knowledge freely because it makes everyone better',
    },
    {
      _key: key(),
      text: 'Change happens because people want it to, not because it has been mandated',
    },
    {
      _key: key(),
      text: 'Leaders and teams feel genuine ownership over the kind of place they are creating',
    },
  ],
  recognitionBridge: [
    textBlock(
      'Maybe you are here because a merger has brought two organisations together and you want to build something better from both. Perhaps new leadership is setting a fresh direction and the culture needs to move with it. Or your organisation has simply grown beyond the way things used to work and you need something more intentional.'
    ),
    textBlock(
      'Whatever the moment, you are looking for organisational culture change that goes deeper than programmes and posters.'
    ),
  ],

  // --- Stats ---
  stats: [
    {
      _key: key(),
      statValue: '4x',
      statLabel: 'higher retention',
      statSource: 'SHRM 2024',
    },
    {
      _key: key(),
      statValue: '23%',
      statLabel: 'higher profitability',
      statSource: 'Gallup',
    },
    {
      _key: key(),
      statValue: '2.2%',
      statLabel: 'higher ROE',
      statSource: 'Deloitte 2024',
    },
    {
      _key: key(),
      statValue: '21%',
      statLabel: 'higher productivity',
      statSource: 'Gallup',
    },
  ],

  // --- Perspective ---
  perspectiveHeading: 'Culture is a living thing',
  perspectiveBody: [
    textBlock(
      'Culture grows from the patterns, connections, and rhythms of how your organisation actually works. It comes from how decisions get made, how knowledge flows between teams, how people connect to purpose, and how innovation is encouraged. It is not separate from these things - it emerges from them.'
    ),
    textBlock(
      'This is why we work with your organisation as a living ecosystem. When you improve how knowledge flows, how decisions happen, how capability develops, and how people connect to meaningful direction, culture shifts as a natural consequence. You are not running a culture programme alongside everything else - you are making practical improvements to how your organisation functions, and culture develops as a result.'
    ),
    textBlock(
      'It is a different way of thinking about organisational culture change. And it creates change that genuinely lasts because you are working with the system, not against it.'
    ),
  ],
  perspectiveLinkLabel: 'Learn about our Intentional Ecosystems approach',
  perspectiveLinkUrl: '/philosophy',

  // --- Approach ---
  approachIntro: [
    textBlock(
      'Every organisation is different, so every culture change journey is different. But our work typically moves through four connected areas - understanding where you are now, designing practical changes with your people, making those changes real, and building your capability to keep developing independently.'
    ),
    textBlock(
      'These are not rigid stages. Some organisations need all four. Others already understand their culture well and want to move straight into designing changes. The areas connect and build on each other, but they flex around what you actually need.'
    ),
  ],

  stages: [
    // --- Stage 1: Understand ---
    {
      _key: key(),
      stageNumber: '01',
      stageTitle: 'Understand',
      stageSummary: 'See your culture clearly',
      stageHeading: 'Understanding your culture as it really is',
      stageBody: [
        textBlock(
          'Before anything changes, you need a clear and honest picture of where you are now. Not a tick-box audit or a generic engagement survey, but a proper exploration of how your organisational culture actually works - the patterns, strengths, and dynamics that shape daily working life.'
        ),
        textBlock(
          'We help you see your culture as part of your wider organisational ecosystem, mapping what is healthy, what is constrained, and where the real leverage points are. This is collaborative work that draws on the experience and knowledge of people across your organisation.'
        ),
      ],
      stageInPractice: [
        'Mapping cultural patterns across your organisation using our ecosystem health framework',
        'Listening to people at every level to understand lived experience, not just stated values',
        'Identifying the systemic patterns that create the culture you have - both the strengths to build on and the dynamics holding things back',
        'Building a shared understanding across leadership that goes beyond symptoms to root causes',
      ],
      stageOutcome:
        'A clear picture of your organisational culture with agreed priorities for where change will have the greatest impact - and genuine shared understanding across your leadership team about what is really going on and where to focus energy.',
    },

    // --- Stage 2: Co-design ---
    {
      _key: key(),
      stageNumber: '02',
      stageTitle: 'Co-design',
      stageSummary: 'Design changes together',
      stageHeading: 'Co-designing practical changes with your people',
      stageBody: [
        textBlock(
          'Culture change works when the people who live with it every day help design it. We facilitate collaborative sessions where your teams identify what needs to shift and develop practical approaches that fit your specific context.'
        ),
        textBlock(
          'This is not about writing a new values statement or designing a behaviour framework. It is about making practical improvements to how your organisation actually functions - redesigning how decisions flow, creating better ways for teams to share knowledge, or strengthening how purpose connects to daily work. The solutions come from your collective intelligence. We bring the structure, the systems thinking, and the facilitation skills.'
        ),
      ],
      stageInPractice: [
        'Facilitated workshops that bring together diverse perspectives from across your organisation',
        'Designing practical changes to specific aspects of how your organisation works - not abstract culture goals',
        'Testing and refining ideas collaboratively before committing to full implementation',
        'Building genuine ownership so changes stick because people believe in them, not because they have been told to comply',
      ],
      stageOutcome:
        'Practical, context-specific changes designed by the people who will make them work - with genuine ownership rather than top-down imposition. Solutions that fit because they come from people who understand your organisation from the inside.',
    },

    // --- Stage 3: Implement ---
    {
      _key: key(),
      stageNumber: '03',
      stageTitle: 'Implement',
      stageSummary: 'Make it real',
      stageHeading: 'Making change real, not theoretical',
      stageBody: [
        textBlock(
          'Good ideas do not change organisations - new practices do. This is where many culture change programmes fall short. They design well but struggle to move from plan to practice.'
        ),
        textBlock(
          'We work alongside your teams as changes are put into action, providing support, challenge, and a systems perspective as things unfold. We are there when it gets complicated, helping you navigate resistance, adjust course, and keep momentum. Multiple small shifts happening across your system create lasting culture change in a way that big, one-off programmes rarely do.'
        ),
      ],
      stageInPractice: [
        'Embedding with your teams over weeks and months, not delivering a programme and leaving',
        'Working through the real challenges of implementation - the politics, the resistance, the unexpected consequences',
        'Helping leaders role-model the cultural shifts they want to see, practically and consistently',
        'Tracking progress across your organisational ecosystem so you can see what is changing and where to focus next',
      ],
      stageOutcome:
        'Transformation that embeds into daily reality rather than sitting in a strategy document - with the messy, human work of making it happen properly supported throughout.',
    },

    // --- Stage 4: Build capability ---
    {
      _key: key(),
      stageNumber: '04',
      stageTitle: 'Build capability',
      stageSummary: 'Keep going without us',
      stageHeading: 'Building your capability to keep going without us',
      stageBody: [
        textBlock(
          'Our goal is to make ourselves unnecessary. The whole point of lasting culture change is that your organisation can sustain and develop it independently - without needing external consultants to keep things on track.'
        ),
        textBlock(
          'We build your leaders\' and teams\' capability to understand your organisational ecosystem, spot patterns, and continue developing your culture on your own terms. This means developing systems thinking skills, creating internal facilitation capability, and establishing rhythms for ongoing culture development.'
        ),
      ],
      stageInPractice: [
        "Developing your leaders' ability to read cultural patterns and work with them, not against them",
        'Training internal facilitators who can run collaborative sessions and design processes independently',
        'Creating ongoing rhythms and practices for culture development that become part of how your organisation works',
        'Progressively handing over capability so that by the time we step back, you do not notice the difference',
      ],
      stageOutcome:
        'Internal capability to steward your own organisational culture - so you are building something that grows stronger over time, led by your own people, without depending on external consultants.',
    },
  ],

  // --- Outcomes ---
  outcomesHeading: 'What becomes possible',
  outcomesIntro:
    'Organisations we have worked with on culture change describe something that is hard to put into a programme summary but easy to feel. The conversations are different. Teams that used to work around each other start working with each other. People raise things earlier because they trust something will happen.',
  outcomes: [
    {
      _key: key(),
      outcomeTitle: 'Make decisions that stick',
      outcomeDescription:
        'Because the decision-making patterns themselves have changed, not just the people making them',
    },
    {
      _key: key(),
      outcomeTitle: 'Resolve tensions earlier',
      outcomeDescription:
        'Because people understand the system they are part of and can see where friction is coming from',
    },
    {
      _key: key(),
      outcomeTitle: 'Adapt without crisis',
      outcomeDescription:
        'Because change capability is built into how the organisation works, not bolted on as a programme',
    },
    {
      _key: key(),
      outcomeTitle: 'Develop their own culture',
      outcomeDescription:
        'Because they have the tools, skills, and understanding to keep evolving without external help',
    },
    {
      _key: key(),
      outcomeTitle: 'Connect daily work to purpose',
      outcomeDescription:
        'Because purpose is woven into how things actually happen, not displayed on a wall',
    },
  ],
  outcomesClosing:
    'This is not about creating a perfect culture. It is about creating an organisational culture that can keep learning, adapting, and improving - led by the people inside it.',

  // --- Examples (no projects linked yet - we'll add these later) ---
  testimonialQuote: null,
  testimonialAttribution: null,

  // --- CTA (using defaults - leave blank) ---

  // --- Logo strip ---
  showLogoStrip: true,
  logoStripPosition: 'after-recognition',

  // --- SEO ---
  seoTitle: 'Organisational Culture Change - Mutomorro',
  seoDescription:
    'We help organisations create culture change that genuinely lasts - by working with the patterns, connections, and practices that shape how your organisation actually works.',
}

// ===========================
// UPLOAD FUNCTION
// ===========================

async function upload(token) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mutations: [
        {
          // createOrReplace means: if a document with this _id exists, replace it.
          // If not, create it. Safe to run multiple times.
          createOrReplace: cultureChange,
        },
      ],
    }),
  })

  const result = await response.json()

  if (response.ok) {
    console.log('\n✅ Culture Change uploaded successfully!')
    console.log(`   Document ID: ${cultureChange._id}`)
    console.log('   Open Sanity Studio to see it: localhost:3000/studio')
    console.log('')
  } else {
    console.error('\n❌ Upload failed:')
    console.error(JSON.stringify(result, null, 2))
  }
}

// ===========================
// ASK FOR TOKEN AND RUN
// ===========================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('\nPaste your Sanity API token (Editor permissions): ', (token) => {
  rl.close()
  if (!token.trim()) {
    console.log('No token provided. Exiting.')
    return
  }
  console.log('\nUploading Culture Change to Sanity...')
  upload(token.trim())
})
