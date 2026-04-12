// patch-service-headings.mjs
// Run from ~/Projects/mutomorro with:
//   SANITY_TOKEN=<your-editor-token> node patch-service-headings.mjs
//
// Patches contextHeading and perspectiveHeading on all 14 service documents.
// Uses the Sanity HTTP API directly (no MCP).

const PROJECT_ID = 'c6pg4t4h'
const DATASET = 'production'
const API_VERSION = '2024-01-01'
const TOKEN = process.env.SANITY_TOKEN

if (!TOKEN) {
  console.error('Missing SANITY_TOKEN environment variable')
  process.exit(1)
}

const patches = [
  {
    id: 'service-organisational-capacity-building',
    title: 'Capacity Building',
    contextHeading: 'Your organisation needs to do more than it currently can. We help you build that capacity from the inside - so it grows and stays.',
    perspectiveHeading: 'Why we look at the whole organisation, not just skills',
  },
  {
    id: 'service-change-management-consultancy',
    title: 'Change Management',
    contextHeading: "You've got a change to deliver. We help you do it in a way that brings people with you - so it lands and lasts.",
    perspectiveHeading: 'Why lasting change means working with the whole organisation',
  },
  {
    id: 'service-culture-change-consultancy',
    title: 'Culture Change',
    contextHeading: 'You want a culture where people do their best work. We help you create the conditions where that happens naturally.',
    perspectiveHeading: "Why culture can't be changed in isolation",
  },
  {
    id: 'service-customer-experience-consultancy',
    title: 'Customer Experience',
    contextHeading: "You want your customers to have a better experience. We help you improve what's happening behind the scenes to make that possible.",
    perspectiveHeading: 'Why great CX starts behind the scenes',
  },
  {
    id: 'service-employee-experience-consultancy',
    title: 'Employee Experience',
    contextHeading: 'You want your organisation to be a genuinely good place to work. We help you shape the things that make the biggest difference.',
    perspectiveHeading: 'Why employee experience is shaped by how everything works',
  },
  {
    id: 'service-operational-effectiveness-consultancy',
    title: 'Operational Effectiveness',
    contextHeading: 'You want your organisation to work better - smoother decisions, clearer processes, less energy wasted. We help you get there.',
    perspectiveHeading: 'Why fixing operations means looking at the bigger picture',
  },
  {
    id: 'service-organisational-design-consultancy',
    title: 'Organisational Design',
    contextHeading: "You're ready to redesign how your organisation works. We help you create a design where everything fits together properly.",
    perspectiveHeading: 'Why good design means understanding how everything connects',
  },
  {
    id: 'service-organisational-development-consultancy',
    title: 'Organisational Development',
    contextHeading: "You want your organisation to keep getting better - not just fix what's broken, but genuinely grow. We help you build that momentum.",
    perspectiveHeading: 'Why real development means growing the whole organisation',
  },
  {
    id: 'service-organisational-purpose-consultancy',
    title: 'Organisational Purpose',
    contextHeading: 'You want purpose to run through everything your organisation does. We help you make that real - not just words on a wall.',
    perspectiveHeading: 'Why purpose needs to be woven into everything',
  },
  {
    id: 'service-organisational-restructuring-consultancy',
    title: 'Organisational Restructuring',
    contextHeading: "You're facing a restructure. We help you design one that makes things genuinely better - for how work flows, how people feel, and how services land.",
    perspectiveHeading: 'Why a good restructure considers more than reporting lines',
  },
  {
    id: 'service-post-merger-integration-consultancy',
    title: 'Post-Merger Integration',
    contextHeading: "You're bringing two organisations together. We help you integrate everything - the structure, the culture, the services, the people - so the new organisation thrives.",
    perspectiveHeading: 'Why successful mergers need a whole-organisation approach',
  },
  {
    id: 'service-scaling-operations-consultancy',
    title: 'Scaling Operations',
    contextHeading: "You're growing and you want to do it well. We help you scale in a way that keeps what's good and fixes what's holding you back.",
    perspectiveHeading: 'Why scaling means redesigning how you work, not just doing more',
  },
  {
    id: 'service-service-design-consultancy',
    title: 'Service Design',
    contextHeading: 'You want to deliver services that genuinely work for the people who use them. We help you design from the ground up.',
    perspectiveHeading: 'Why better services need the whole organisation behind them',
  },
  {
    id: 'service-strategic-alignment-consultancy',
    title: 'Strategic Alignment',
    contextHeading: "You've got a strategy and you want people to feel it everywhere. We help you connect the plan to what happens day to day.",
    perspectiveHeading: 'Why alignment is about more than communicating the strategy',
  },
]

async function patchDocument(patch) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`

  const mutations = [{
    patch: {
      id: patch.id,
      set: {
        contextHeading: patch.contextHeading,
        perspectiveHeading: patch.perspectiveHeading,
      },
    },
  }]

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to patch ${patch.title}: ${res.status} ${err}`)
  }

  return res.json()
}

async function run() {
  console.log(`Patching ${patches.length} service documents...\n`)

  for (const patch of patches) {
    try {
      await patchDocument(patch)
      console.log(`✓ ${patch.title}`)
    } catch (err) {
      console.error(`✗ ${patch.title}: ${err.message}`)
    }
  }

  console.log('\nDone. Check Sanity Studio to verify.')
}

run()
