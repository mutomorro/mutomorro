/**
 * create-new-courses.js
 *
 * Creates the 4 new demand-led courses in Sanity.
 * These are written fresh (not migrated) so the body content is
 * constructed as Portable Text directly - no HTML conversion needed.
 *
 * Usage:
 *   SANITY_TOKEN=your-token-here node scripts/create-new-courses.js
 */

const { createClient } = require('@sanity/client');
const crypto = require('crypto');
const readline = require('readline');

const SANITY_PROJECT_ID = 'c6pg4t4h';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

function k() { return crypto.randomBytes(6).toString('hex'); }

function text(str, style = 'normal') {
  return { _type: 'block', _key: k(), style, markDefs: [], children: [{ _type: 'span', _key: k(), text: str, marks: [] }] };
}

function heading(str, level = 'h2') {
  return text(str, level);
}

function bold(str) {
  return { _type: 'block', _key: k(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: k(), text: str, marks: ['strong'] }] };
}

function richPara(segments) {
  // segments: array of { text, bold?, italic? }
  return {
    _type: 'block', _key: k(), style: 'normal', markDefs: [],
    children: segments.map(s => ({
      _type: 'span', _key: k(), text: s.text,
      marks: [...(s.bold ? ['strong'] : []), ...(s.italic ? ['em'] : [])],
    })),
  };
}

function bullet(str) {
  return { _type: 'block', _key: k(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: k(), text: str, marks: [] }] };
}

async function getToken() {
  if (process.env.SANITY_TOKEN) return process.env.SANITY_TOKEN;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('Paste your Sanity API token: ', (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

// ─── Course 1: Leading your team through change ─────────────────────────────

const course1 = {
  _id: 'course-leading-your-team-through-change',
  _type: 'course',
  title: 'Leading your team through change',
  slug: { _type: 'slug', current: 'leading-your-team-through-change' },
  category: 'change',
  format: 'in-person',
  duration: '1 day',
  shortSummary: 'A practical course for managers supporting their teams through change. You will leave with a clear plan for how to lead your people through your specific transition - built during the session, ready to use the next day.',
  body: [
    text('Something has changed - or is about to. A restructure, a new system, a shift in strategy. And your team is looking at you for answers.'),
    text('As a manager, you are the person who makes change real for the people around you. Not the person who designed the strategy or signed it off - but the one who has to translate it into something your team can understand, believe in, and act on. That is one of the hardest jobs in any organisation.'),
    text('This course is built around that reality. It is a practical, hands-on day where you will work through the specific change your team is facing and leave with a plan you can actually use.'),

    heading('What you will work on'),
    text('This is not a lecture about change models. You will spend the day working on your real situation, using a range of proven frameworks adapted to your context.'),
    text('The day is built around three practical challenges that managers face during change:'),
    richPara([{ text: 'Understanding what your team is really experiencing', bold: true }, { text: ' - Change affects people differently. Some people adapt quickly. Others need more time, more information, or more support. You will map where your team members are in their own transition and identify what each person needs from you right now. We draw on models like the change curve and Bridges\' transition model - not as theory, but as practical lenses for reading your team.' }]),
    richPara([{ text: 'Having the conversations that matter', bold: true }, { text: ' - The hardest part of leading change is often the conversations. The team member who is quietly disengaging. The person who keeps raising objections in meetings. The high performer who is thinking about leaving. You will practise these conversations during the session using realistic scenarios, and leave with approaches you feel confident using.' }]),
    richPara([{ text: 'Building a team change plan', bold: true }, { text: ' - By the end of the day, you will have a written plan for how you will lead your team through this specific change. Not a generic template - a plan built from your actual situation, covering what you will communicate, when, and how you will support different people through the transition.' }]),

    heading('Who this is for'),
    text('Managers and team leaders who are leading their people through a change they did not design. Whether it is a restructure, a new way of working, a system change, or a cultural shift - if your team is looking to you for guidance, this course will help.'),
    text('This is particularly useful if you are feeling caught between senior expectations and team concerns. You are not alone in that - research consistently shows that middle managers are the most important and least supported group during organisational change.'),

    heading('What you will take away'),
    text('Every participant leaves with a completed team change plan covering:'),
    bullet('Where each team member is in their own transition and what they need'),
    bullet('A communication approach tailored to your team\'s specific concerns'),
    bullet('Planned conversations for the people who need individual support'),
    bullet('A realistic timeline for the next four to six weeks'),
    bullet('Confidence in your ability to lead your team through what comes next'),

    heading('How the day works'),
    text('The format is interactive and collaborative. You will work in small groups throughout the day, sharing experiences and learning from other managers facing similar challenges. Sessions alternate between short input from the facilitator, structured exercises, and time to apply what you have learned to your own situation.'),
    text('We keep groups small - typically twelve to sixteen people - so everyone gets individual attention and the chance to work through their specific challenges.'),

    heading('What makes this different'),
    text('Most change management training teaches you about models. This course helps you use them. The focus is entirely practical - you work on your real change, with your real team in mind, and leave with something you can act on immediately.'),
    text('We draw on a range of globally recognised frameworks rather than teaching a single methodology. This means you get the best thinking from across the field, adapted to fit your specific context. That is more useful than certification in one approach.'),
  ],
};

// ─── Course 2: Driving organisational change ─────────────────────────────────

const course2 = {
  _id: 'course-driving-organisational-change',
  _type: 'course',
  title: 'Driving organisational change',
  slug: { _type: 'slug', current: 'driving-organisational-change' },
  category: 'change',
  format: 'in-person',
  duration: '2 days',
  shortSummary: 'A two-day course for teams leading organisation-wide change programmes. You will build a structured approach to your specific transformation - connecting strategy to delivery across the whole system.',
  body: [
    text('Your organisation is going through a significant change - a transformation programme, a merger, a strategic pivot, a fundamental shift in how you work. And your team is responsible for making it happen.'),
    text('Leading change at the organisational level is fundamentally different from leading change in a single team. You are working across boundaries, managing stakeholders with competing interests, and trying to keep momentum in a system that is designed to resist disruption. The challenge is not just planning - it is understanding how the whole organisation will respond and designing your approach accordingly.'),
    text('This two-day course gives programme and transformation teams a structured, systems-informed approach to leading large-scale change. You will work on your real programme throughout, and leave with a practical framework you can use to guide your work.'),

    heading('What you will work on'),
    text('Over two days, you will build a comprehensive approach to your specific change programme, working through four connected areas:'),
    richPara([{ text: 'Reading the system', bold: true }, { text: ' - Before you can change an organisation, you need to understand how it actually works - not how the org chart says it works. You will map the real dynamics at play in your organisation: where power sits, how decisions actually get made, which parts of the system are ready for change and which will resist. We use tools like systems mapping and stakeholder analysis to build a picture that goes beyond surface-level assumptions.' }]),
    richPara([{ text: 'Designing your change approach', bold: true }, { text: ' - Armed with a realistic picture of your organisation, you will design an approach that works with the system rather than against it. This means thinking about sequencing - what needs to happen first to create the conditions for what comes next. It means identifying where small shifts can create ripple effects across the wider organisation. And it means building flexibility into your plan, because no change programme survives first contact with reality unchanged.' }]),
    richPara([{ text: 'Building a coalition', bold: true }, { text: ' - Large-scale change does not succeed through project management alone. It succeeds when enough people across the organisation understand what is happening, believe in where it is going, and are actively contributing to making it work. You will identify who you need on your side, understand what matters to them, and develop practical strategies for building genuine support - not just compliance.' }]),
    richPara([{ text: 'Sustaining momentum', bold: true }, { text: ' - Many change programmes start well but lose energy. You will develop an approach for maintaining momentum over months and years - including how to track progress in ways that go beyond RAG ratings, how to adapt your approach as the organisation responds, and how to build capability so the change outlasts your programme.' }]),

    heading('Who this is for'),
    text('Programme teams, transformation leads, and change teams responsible for organisation-wide change. This course works best when attended by the core team together - so you build your approach collaboratively and leave with shared understanding.'),
    text('It is also valuable for senior leaders sponsoring a major change who want a deeper understanding of what it takes to make transformation succeed at a systems level.'),

    heading('What you will take away'),
    text('Your team will leave with:'),
    bullet('A systems map of your organisation showing the real dynamics that will shape your change'),
    bullet('A sequenced change approach designed around how your specific organisation works'),
    bullet('A stakeholder strategy with practical actions for building support where it matters most'),
    bullet('A momentum framework for tracking and sustaining progress over the life of your programme'),
    bullet('Shared language and understanding across your team about how you will approach the work'),

    heading('How the two days work'),
    text('Day one focuses on understanding your organisation as a system and designing your change approach. Day two focuses on building your coalition and planning for sustained momentum. Throughout both days, you will alternate between frameworks, facilitated exercises, and working sessions where you apply everything directly to your programme.'),
    text('We typically run this for groups of eight to twenty people. If your change team is larger, we can adapt the format.'),

    heading('What makes this different'),
    text('This course takes a systems thinking approach to change - which means looking at how your organisation actually works as a connected whole, not treating it as a collection of separate departments to be managed independently. Most change methodologies focus on process. This one focuses on the system the process is trying to change. That is a fundamentally different starting point, and it leads to better outcomes.'),
  ],
};

// ─── Course 3: Being an effective change sponsor ─────────────────────────────

const course3 = {
  _id: 'course-effective-change-sponsor',
  _type: 'course',
  title: 'Being an effective change sponsor',
  slug: { _type: 'slug', current: 'effective-change-sponsor' },
  category: 'leadership',
  format: 'in-person',
  duration: 'Half day',
  shortSummary: 'A focused half-day for senior leaders sponsoring change. You will leave with clarity on your role, what your programme team needs from you, and a practical plan for how you will show up as a sponsor.',
  body: [
    text('You are sponsoring a change programme. You have approved the strategy, allocated the budget, and appointed a good team to deliver it. But something is not quite working - and you are not sure what your role should be from here.'),
    text('This is one of the most common gaps in organisational change. Research consistently shows that active, visible sponsorship is the single biggest factor in whether change programmes succeed or fail. Yet most senior leaders receive no guidance on what good sponsorship actually looks like in practice.'),
    text('This half-day session gives you that clarity. It is practical, honest, and designed specifically for busy senior leaders who want to make their sponsorship count.'),

    heading('What you will work on'),
    text('This session is built around three questions that every change sponsor needs to answer:'),
    richPara([{ text: 'What does my programme actually need from me?', bold: true }, { text: ' - Sponsorship means different things at different stages of a change programme. Early on, your team needs you to clear obstacles, secure resources, and signal commitment. As the work progresses, they need you to hold the line when things get difficult, manage upward and across the leadership team, and stay visibly engaged even when your diary is full. You will work through what your specific programme needs from you right now - and what it will need in the months ahead.' }]),
    richPara([{ text: 'Where am I helping and where am I getting in the way?', bold: true }, { text: ' - This is the honest conversation most sponsors never have. Sometimes the best-intentioned sponsorship creates problems - swooping in to solve things the team should own, sending mixed signals about priorities, or being invisible when visible support matters most. You will get a clear picture of where your involvement is adding value and where it might need adjusting.' }]),
    richPara([{ text: 'How do I show up consistently?', bold: true }, { text: ' - Knowing what to do is one thing. Doing it consistently, week after week, alongside everything else on your plate - that is the real challenge. You will build a practical sponsorship plan with specific, realistic commitments that fit your actual schedule and working style.' }]),

    heading('Who this is for'),
    text('Senior leaders - directors, executives, board members - who are sponsoring or about to sponsor a significant change programme. This is not about learning change management theory. It is about understanding your specific role as a sponsor and doing it well.'),
    text('This session works well for individual sponsors, but it is even more powerful when multiple sponsors from the same organisation attend together. It creates shared expectations about what sponsorship looks like across the leadership team.'),

    heading('What you will take away'),
    bullet('Clarity on what your specific programme needs from you at this stage'),
    bullet('An honest assessment of where your sponsorship is strong and where to adjust'),
    bullet('A practical sponsorship plan with weekly commitments that fit your real schedule'),
    bullet('Confidence in how to handle the difficult moments - when the programme hits obstacles, when stakeholders push back, when progress stalls'),
    bullet('Understanding of the connection between your visible involvement and the programme\'s chances of success'),

    heading('How the session works'),
    text('This is a focused half-day - typically three to four hours. The format is conversational rather than classroom-based. Short facilitated inputs are followed by structured reflection and planning time. You will spend most of the session working on your own programme, with guidance and challenge from the facilitator.'),
    text('Groups are kept small - usually six to ten sponsors - to allow genuine conversation and individual attention.'),

    heading('What makes this different'),
    text('Most change management training is aimed at the people delivering change. This session is aimed at the person whose support makes the difference between success and failure. It is direct, practical, and respectful of your time. No jargon, no unnecessary theory - just clarity on what you need to do and a plan for doing it.'),
  ],
};

// ─── Course 4: Building a Theory of Change ───────────────────────────────────

const course4 = {
  _id: 'course-building-a-theory-of-change',
  _type: 'course',
  title: 'Building a Theory of Change',
  slug: { _type: 'slug', current: 'building-a-theory-of-change' },
  category: 'strategy',
  format: 'in-person',
  duration: '1 day',
  shortSummary: 'A hands-on course for programme and project teams. You will leave with a completed Theory of Change for your programme - a clear map connecting what you do to the outcomes you are trying to achieve.',
  body: [
    text('You know what your programme is trying to achieve. You have objectives, activities, a team, and a budget. But can you clearly explain how what you do every day connects to the outcomes you are aiming for? Can you show the logic - step by step - of how your activities lead to your impact?'),
    text('That is what a Theory of Change gives you. It is a practical map that connects your activities to your outcomes, shows the assumptions you are making, and highlights where things might not work as expected. It is one of the most useful planning tools available - and one of the most often misunderstood.'),
    text('This one-day course cuts through the confusion and helps you build a real, usable Theory of Change for your specific programme. Not a theoretical exercise - a practical document you will use to plan, communicate, and evaluate your work.'),

    heading('What you will work on'),
    text('The day follows the natural logic of building a Theory of Change, step by step:'),
    richPara([{ text: 'Starting with impact', bold: true }, { text: ' - Most planning starts with activities and works forward. A Theory of Change starts with the change you want to see in the world and works backward. You will define your long-term impact clearly and specifically - not a vague aspiration, but a concrete description of what success looks like.' }]),
    richPara([{ text: 'Mapping your outcomes pathway', bold: true }, { text: ' - Between your activities and your impact, there are intermediate outcomes - the changes that need to happen along the way. You will map these out, step by step, creating a chain of logic from what you do to the difference you make. This is where most programmes discover gaps in their thinking - and where the real value of the process lies.' }]),
    richPara([{ text: 'Testing your assumptions', bold: true }, { text: ' - Every Theory of Change contains assumptions - things you believe to be true that connect one outcome to the next. Making these explicit is one of the most powerful things you can do. You will identify and test your assumptions, looking for the ones that carry the most risk and thinking about how to strengthen them.' }]),
    richPara([{ text: 'Connecting activities to outcomes', bold: true }, { text: ' - With your pathway mapped and your assumptions tested, you will connect your actual activities to the outcomes they are designed to produce. This often reveals that some activities are not clearly connected to any outcome - and that some outcomes have no activities supporting them. Both are useful discoveries.' }]),

    heading('Who this is for'),
    text('Programme and project teams who need to build, refresh, or strengthen their Theory of Change. This includes teams working in charities, social enterprises, the public sector, and any organisation that needs to demonstrate how its work creates impact.'),
    text('The course is particularly useful if you are applying for funding (many funders now require a Theory of Change), evaluating an existing programme, or designing a new one from scratch.'),
    text('It works best when attended by the team together, so you build your Theory of Change collaboratively and leave with shared ownership.'),

    heading('What you will take away'),
    text('Every team leaves with:'),
    bullet('A completed Theory of Change diagram for their programme'),
    bullet('Clearly defined long-term impact, intermediate outcomes, and activities'),
    bullet('A list of assumptions with risk ratings and strategies for testing them'),
    bullet('Confidence in explaining your programme logic to funders, boards, and stakeholders'),
    bullet('A practical document you can use for planning, communication, and evaluation'),

    heading('How the day works'),
    text('This is a facilitated, hands-on workshop. You will spend most of the day building your Theory of Change, with short inputs from the facilitator to introduce each stage of the process. The approach draws on established frameworks while keeping things practical and jargon-free.'),
    text('Teams work on their own programme throughout, with facilitator support to work through sticking points. By the end of the day, your Theory of Change is complete - not a rough draft, but a finished, usable document.'),
    text('Groups typically include three to five teams of four to six people, which creates useful cross-pollination while keeping the focus on your specific work.'),

    heading('What makes this different'),
    text('Many Theory of Change workshops teach you the theory but leave you to build the actual thing on your own. This course is the opposite - you spend the day building it, with expert facilitation to guide you through the tricky bits. You arrive with a programme. You leave with a completed Theory of Change.'),
    text('We also take a systems perspective - helping you see how your programme sits within a wider context and how external factors might affect your pathway. This makes your Theory of Change more realistic and more resilient.'),
  ],
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Create 4 New Courses in Sanity                  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const token = await getToken();
  if (!token) { console.error('No token provided.'); process.exit(1); }

  const client = createClient({
    projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION, token, useCdn: false,
  });

  const courses = [course1, course2, course3, course4];

  for (const course of courses) {
    try {
      await client.createOrReplace(course);
      console.log(`✓ ${course.title}`);
    } catch (err) {
      console.log(`✗ ${course.title}: ${err.message}`);
    }
  }

  console.log('\nDone! Check at /courses on the dev site.');
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });
