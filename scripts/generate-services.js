#!/usr/bin/env node
// generate-services.js
// Generates services.ndjson for Sanity import
// Run: node generate-services.js > services.ndjson
// Import: npx sanity dataset import services.ndjson production --replace

const { svc } = require('./service-helpers')

const services = [

// ─────────────────────────────────────────────────
// 1. Culture Change Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Culture Change',
  slug: 'culture-change-consultancy',
  category: 'purpose-direction',
  categoryLabel: 'Purpose & Direction',
  order: 1,
  heroHeading: 'Culture Change Consultancy',
  heroTagline: 'We help organisations create culture change that genuinely lasts - by working with the patterns, connections, and practices that shape how your organisation actually works.',
  contextHeading: 'We know culture isn\'t a programme you run. It\'s what emerges when everything else works well together.',
  contextBody: [
    'It is the patterns that determine whether people collaborate or protect their territory. Whether knowledge flows freely or gets hoarded. Whether change feels natural or gets resisted at every turn.',
    'You cannot change culture by talking about culture. It shifts when you change the conditions it grows from - how decisions get made, how people connect to purpose, how capability develops, how work actually flows.',
    'Our culture change consultancy works with those conditions. Not running a programme alongside everything else, but making practical improvements to how your organisation functions - and letting culture develop as a natural consequence.',
  ],
  propositionCaption: 'Change the conditions, and culture shifts naturally.',
  whyHeading: 'Why culture change matters',
  whyIntro: 'Culture shapes everything. How decisions get made, whether people speak up, how quickly teams adapt. When culture works well, it is the invisible engine behind everything an organisation achieves. When it does not, even the best strategies struggle to land.',
  whyItems: [
    'Organisations with strong cultures retain their best people - and attract better ones',
    'When values are lived, not laminated, people make better decisions without being told what to do',
    'Teams that share knowledge freely solve problems faster and waste less energy',
    'Change lands when people believe in it - not when it is mandated from above',
    'The organisations that thrive are the ones where people feel genuine ownership over the kind of place they are creating',
  ],
  whyBridge: [
    'Whether a merger has brought two organisations together, new leadership is setting a fresh direction, or your organisation has simply grown beyond the way things used to work - the question is the same. How do you create culture change that actually lasts?',
    'That is what good culture change consultancy should help you answer.',
  ],
  stats: [
    ['4x', 'higher retention', 'SHRM 2024'],
    ['23%', 'higher profitability', 'Gallup'],
    ['2.2%', 'higher ROE', 'Deloitte 2024'],
    ['21%', 'higher productivity', 'Gallup'],
  ],
  perspHeading: 'Culture is a living thing',
  perspBody: [
    'Culture grows from the patterns, connections, and rhythms of how your organisation actually works. It comes from how decisions get made, how knowledge flows between teams, how people connect to purpose, and how innovation is encouraged. It is not separate from these things - it emerges from them.',
    'This is why we work with your organisation as a living ecosystem. When you improve how knowledge flows, how decisions happen, how capability develops, and how people connect to meaningful direction, culture shifts as a natural consequence. You are not running a culture programme alongside everything else - you are making practical improvements to how your organisation functions, and culture develops as a result.',
    'It is a different way of thinking about organisational culture change. And it creates change that genuinely lasts because you are working with the system, not against it.',
  ],
  approachIntro: [
    'Every organisation is different, so every culture change journey is different. But our culture change consultancy typically moves through four connected areas - understanding where you are now, designing practical changes with your people, making those changes real, and building your capability to keep developing independently.',
    'These are not rigid stages. Some organisations need all four. Others already understand their culture well and want to move straight into designing changes. The areas connect and build on each other, but they flex around what you actually need.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See your culture clearly',
      heading: 'Understanding your culture as it really is',
      body: [
        'Before anything changes, you need a clear and honest picture of where you are now. Not a tick-box audit or a generic engagement survey, but a proper exploration of how your organisational culture actually works - the patterns, strengths, and dynamics that shape daily working life.',
        'We help you see your culture as part of your wider organisational ecosystem, mapping what is healthy, what is constrained, and where the real leverage points are. This is collaborative work that draws on the experience and knowledge of people across your organisation.',
      ],
      practice: [
        'Mapping cultural patterns across your organisation using our ecosystem health framework',
        'Listening to people at every level to understand lived experience, not just stated values',
        'Identifying the systemic patterns that create the culture you have - both the strengths to build on and the dynamics holding things back',
        'Building a shared understanding across leadership that goes beyond symptoms to root causes',
      ],
      outcome: 'A clear picture of your organisational culture with agreed priorities for where change will have the greatest impact - and genuine shared understanding across your leadership team about what is really going on and where to focus energy.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design changes together',
      heading: 'Co-designing practical changes with your people',
      body: [
        'Culture change works when the people who live with it every day help design it. We facilitate collaborative sessions where your teams identify what needs to shift and develop practical approaches that fit your specific context.',
        'This is not about writing a new values statement or designing a behaviour framework. It is about making practical improvements to how your organisation actually functions - redesigning how decisions flow, creating better ways for teams to share knowledge, or strengthening how purpose connects to daily work. The solutions come from your collective intelligence. We bring the structure, the systems thinking, and the facilitation skills.',
      ],
      practice: [
        'Facilitated sessions that bring together diverse perspectives from across your organisation',
        'Designing practical changes to specific aspects of how your organisation works - not abstract culture goals',
        'Testing and refining ideas collaboratively before committing to full implementation',
        'Building genuine ownership so changes stick because people believe in them, not because they have been told to comply',
      ],
      outcome: 'Practical, context-specific changes designed by the people who will make them work - with genuine ownership rather than top-down imposition.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make it real',
      heading: 'Making change real, not theoretical',
      body: [
        'Good ideas do not change organisations - new practices do. This is where many culture change programmes fall short. They design well but struggle to move from plan to practice.',
        'We work alongside your teams as changes are put into action, providing support, challenge, and a systems perspective as things unfold. We are there when it gets complicated, helping you navigate resistance, adjust course, and keep momentum. Multiple small shifts happening across your system create lasting culture change in a way that big, one-off programmes rarely do.',
      ],
      practice: [
        'Embedding with your teams over weeks and months, not delivering a programme and leaving',
        'Working through the real challenges of implementation - the politics, the resistance, the unexpected consequences',
        'Helping leaders role-model the cultural shifts they want to see, practically and consistently',
        'Tracking progress across your organisational ecosystem so you can see what is changing and where to focus next',
      ],
      outcome: 'Transformation that embeds into daily reality rather than sitting in a strategy document - with the messy, human work of making it happen properly supported throughout.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep going without us',
      heading: 'Building your capability to keep going without us',
      body: [
        'Our goal is to make ourselves unnecessary. The whole point of lasting culture change is that your organisation can sustain and develop it independently - without needing external consultants to keep things on track.',
        'We build your leaders\' and teams\' capability to understand your organisational ecosystem, spot patterns, and continue developing your culture on your own terms. This means developing systems thinking skills, creating internal facilitation capability, and establishing rhythms for ongoing culture development.',
      ],
      practice: [
        'Developing your leaders\' ability to read cultural patterns and work with them, not against them',
        'Training internal facilitators who can run collaborative sessions and design processes independently',
        'Creating ongoing rhythms and practices for culture development that become part of how your organisation works',
        'Progressively handing over capability so that by the time we step back, you do not notice the difference',
      ],
      outcome: 'Internal capability to steward your own organisational culture - so you are building something that grows stronger over time, led by your own people, without depending on external consultants.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our culture change consultancy describe something that is hard to put into a programme summary but easy to feel. The conversations are different. Teams that used to work around each other start working with each other. People raise things earlier because they trust something will happen.',
  outcomes: [
    ['Make decisions that stick', 'Because the decision-making patterns themselves have changed, not just the people making them'],
    ['Resolve tensions earlier', 'Because people understand the system they are part of and can see where friction is coming from'],
    ['Adapt without crisis', 'Because change capability is built into how the organisation works, not bolted on as a programme'],
    ['Develop their own culture', 'Because they have the tools, skills, and understanding to keep evolving without external help'],
    ['Connect daily work to purpose', 'Because purpose is woven into how things actually happen, not displayed on a wall'],
  ],
  outcomesClosing: 'This is not about creating a perfect culture. It is about creating an organisational culture that can keep learning, adapting, and improving - led by the people inside it.',
  primaryKeyword: 'culture change consultancy',
  secondaryKeywords: ['organisational culture change', 'workplace culture transformation', 'culture change programme', 'how to change organisational culture', 'culture transformation'],
  seoTitle: 'Culture Change Consultancy - Mutomorro',
  seoDescription: 'Culture change consultancy that works with the patterns, connections, and practices shaping how your organisation actually works. Not a programme - a different way of thinking about culture.',
},

// ─────────────────────────────────────────────────
// 2. Post-Merger Integration Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Post-Merger Integration',
  slug: 'post-merger-integration-consultancy',
  category: 'structure-operations',
  categoryLabel: 'Structure & Operations',
  order: 1,
  heroHeading: 'Post-Merger Integration Consultancy',
  heroTagline: 'We know a merger changes everything - how work works, how services are delivered, how teams come together, how people develop. We help you integrate the whole system, not just the org chart.',
  contextHeading: 'We know a merger is not one project. It is every part of your organisation being rebuilt at the same time.',
  contextBody: [
    'When two organisations come together, everything is in play. The way work flows. The way teams are structured. Service delivery patterns. Operational processes. People development. Culture. All of it, all at once, all interconnected.',
    'Most post-merger integration consultancy picks one slice - the financial integration, the IT migration, the structural redesign, or the culture programme. But a merger is not five separate projects running in parallel. It is one organisational system being rebuilt. Changes to the structure affect operational rhythms. Operational rhythms shape the quality of service delivery. The quality of service delivery shapes how people feel about the new organisation. Everything connects.',
    'We work with the whole system. Not picking one dimension and hoping the rest will follow, but helping you see how all the pieces fit together and designing an integration that accounts for all of them.',
  ],
  propositionCaption: 'Integrate the whole system, not just one slice.',
  whyHeading: 'Why whole-system integration matters',
  whyIntro: 'Most mergers get the structural and financial integration done competently. The org chart is drawn, the systems are migrated, the budgets are combined. But the organisation that actually emerges - how it works, how it feels, whether it delivers - depends on everything else.',
  whyItems: [
    'Between 50% and 85% of mergers fail to deliver their expected value - because structural integration alone does not make two organisations work as one',
    'The best people leave first - not because of the org chart, but because how work works, how decisions get made, and how they are valued has changed for the worse',
    'Service quality can drop during and after a merger - when operational alignment, team design, and delivery patterns are not given the same attention as reporting lines',
    'Capability and expertise get lost when the focus is on structure alone - the things that made each organisation good at what it did can easily disappear in the rush to integrate',
    'The organisations that get mergers right treat integration as a whole-system design challenge, not a series of separate workstreams',
  ],
  whyBridge: [
    'Whether you are planning a merger, in the middle of one, or trying to make sense of an integration that has stalled - the question is the same. How do you bring two complete organisations together into something that genuinely works?',
    'That is what post-merger integration consultancy should help you do.',
  ],
  stats: [
    ['70%', 'of mergers fail to achieve expected synergies', 'KPMG'],
    ['50%', 'of senior leaders leave within 2 years of a merger', 'Deloitte'],
    ['30%', 'productivity drop during poorly managed integration', 'McKinsey'],
    ['2x', 'more likely to succeed with dedicated integration support', 'Bain'],
  ],
  perspHeading: 'A merger is the ultimate ecosystem challenge',
  perspBody: [
    'Every organisation is an ecosystem - a living system of patterns, connections, and rhythms that determine how it actually works. A merger takes two of these ecosystems and asks them to become one. That is not a structural exercise. It is the most complex organisational challenge there is.',
    'The way each organisation makes decisions. Its approach to collaboration. How services reach customers. The patterns of capability development. The relationship between purpose and daily work. All of these are different in each organisation, and all of them need to be understood, respected, and thoughtfully integrated.',
    'This is why we take an ecosystem approach to post-merger integration consultancy. We do not separate culture from operations, or structure from service delivery, or people development from organisational design. We work with all of these as the interconnected system they actually are. The result is integration that holds together because it was designed as a whole, not bolted together from separate workstreams.',
  ],
  approachIntro: [
    'Every merger is different - different organisations, different histories, different reasons for coming together. But our post-merger integration consultancy typically moves through four connected areas - understanding the ecosystems you are bringing together, designing how the new organisation will work, making integration real across every dimension, and building the capability to keep evolving as one.',
    'These are not rigid stages. Some organisations come to us before the deal is done. Others call when the integration has stalled. We start wherever you are and work with what you need.',
    'We also work well alongside other advisors. Mergers often involve multiple consultancies focused on different aspects - financial, legal, IT, HR. Our role is to connect the dots between those workstreams and ensure the human and operational dimensions of integration do not fall between the gaps.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'Map both ecosystems honestly',
      heading: 'Understanding the two organisations you are bringing together',
      body: [
        'Before you can design the future, you need an honest picture of both presents. Not just the org charts and the stated cultures, but the real patterns of how each organisation actually works - the operational rhythms, the collaboration habits, the service delivery approaches, and the things people genuinely value.',
        'We map both organisational ecosystems to build a clear picture of what each one is good at, where the tensions lie, and where the real integration challenges will be. This is not a due diligence exercise. It is a genuine exploration of two living systems that are about to become one.',
      ],
      practice: [
        'Mapping both organisational ecosystems across every dimension - structure, operations, capability, culture, service delivery, collaboration patterns, and team dynamics',
        'Listening to people at every level in both organisations - not just the leadership teams who negotiated the deal',
        'Identifying what is worth preserving from each organisation and what needs to change',
        'Building a shared understanding across the new leadership team of what integration actually requires across the whole system',
      ],
      outcome: 'A clear, honest picture of both organisations as complete systems - with agreed priorities for where integration effort will have the greatest impact.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design how the new organisation works',
      heading: 'Designing how the new organisation will actually work',
      body: [
        'The strongest integrations happen when people from both organisations genuinely shape the new one together. Not one side\'s way of working imposed on the other. Not a polite compromise that satisfies nobody. Something genuinely new, designed by the people who understand how both organisations actually work.',
        'We facilitate collaborative sessions where people from across the new organisation work together on the practical questions: how will teams collaborate? How will services be delivered? How will the structure support the way work actually needs to flow? These are not abstract exercises - they are practical design sessions for how the new organisation will actually function.',
      ],
      practice: [
        'Cross-organisational design sessions covering operations, service delivery, team structure, capability development, and ways of working',
        'Involving people from both organisations in designing the new approaches - not just consulting them after the decisions are made',
        'Working through the practical tensions honestly - where one organisation\'s approach is stronger, where the other\'s is, and where something entirely new is needed',
        'Building genuine ownership by giving people a real say in how their new organisation works',
      ],
      outcome: 'A practical design for how the new organisation works across every dimension - created by the people who will make it work, not imposed from above.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make integration real',
      heading: 'Making integration real across the whole organisation',
      body: [
        'There is a moment in every merger where the announcements have been made and the structures have been agreed, but two organisations still exist side by side. The real integration - making things actually work as one - is where the hard work happens and where most integration programmes lose momentum.',
        'We work alongside your teams through the reality of bringing two organisations together. Not just the culture side. Not just the structural side. The whole thing - the operational alignment, the service delivery changes, the team redesigns, the knowledge integration, and the cultural shifts that make it all hold together.',
      ],
      practice: [
        'Embedding with integration teams to support the practical reality of combining operations, services, and teams',
        'Helping leaders make the difficult decisions about which practices to keep, which to change, and which to build from scratch',
        'Working across integration workstreams to ensure they connect - so structural changes support operational ones, and operational changes support cultural ones',
        'Tracking integration progress across the whole system, not just individual workstreams',
      ],
      outcome: 'An organisation where integration is felt in how work actually works - not just visible on the org chart or announced in the newsletter.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep evolving as one',
      heading: 'Building the capability to keep evolving as one organisation',
      body: [
        'Integration does not finish on day one hundred. The new organisation needs to keep developing how it works - refining operations, strengthening teams, improving services, and building a shared identity. Our goal is to make sure you can do all of that without us.',
        'We build the internal capability to continue the integration journey across every dimension. Leaders who can read organisational patterns and respond to them. Teams that can work across old boundaries. Practices that keep the whole system developing together.',
      ],
      practice: [
        'Developing leaders\' ability to see the whole system and make decisions that account for how everything connects',
        'Building internal capability for cross-organisational collaboration, facilitation, and design',
        'Creating rhythms for ongoing organisational development that become part of how the new organisation works',
        'Progressively stepping back as your internal capability grows - transferring tools, approaches, and confidence',
      ],
      outcome: 'An organisation that can continue developing as one integrated system - getting stronger over time, not drifting back into old patterns.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our post-merger integration consultancy describe a point where the new organisation starts to feel like one thing, not two. Not because someone mandated it, but because how work works, how decisions get made, and how teams collaborate has genuinely changed.',
  outcomes: [
    ['An organisation that works as one', 'Because the integration was designed as a whole system, not a collection of separate workstreams'],
    ['Services that get better, not worse', 'Because operational alignment and service delivery were integrated alongside structure and culture'],
    ['The best of both organisations', 'Because the strengths of each were identified and deliberately preserved, not lost in the rush to combine'],
    ['People who want to stay', 'Because they can see the new organisation is genuinely worth being part of, not just the old one with a different name'],
    ['Capability to keep evolving', 'Because the ability to develop as one organisation is built in, not dependent on external support'],
  ],
  outcomesClosing: 'A merger is a rare opportunity to build something genuinely new - an organisation that is better than either predecessor. With the right approach, it can be a step forward for everyone involved, not just a disruption to endure.',
  primaryKeyword: 'post-merger integration consultancy',
  secondaryKeywords: ['merger integration consulting', 'cultural integration after merger', 'post-merger culture change', 'M&A integration support', 'merger culture alignment', 'housing association merger', 'post-merger organisational design'],
  seoTitle: 'Post-Merger Integration Consultancy - Mutomorro',
  seoDescription: 'Post-merger integration consultancy that works with the whole organisational system - culture, operations, service delivery, structure, and people - not just one slice.',
},

// ─────────────────────────────────────────────────
// 3. Change Management Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Change Management',
  slug: 'change-management-consultancy',
  category: 'people-capability',
  categoryLabel: 'People & Capability',
  order: 1,
  heroHeading: 'Change Management Consultancy',
  heroTagline: 'People resist change when it is done to them, not with them. We help you design and deliver change that works with how your organisation actually functions - so adoption happens because the approach makes sense, not because it has been mandated.',
  contextHeading: 'We know change is hard. It is harder when it is done to people, not with them.',
  contextBody: [
    'People resist change for good reasons. When change is imposed without understanding how the organisation actually works - without involving the people who will live with it - resistance is a completely rational response. It is not a problem to overcome. It is feedback worth listening to.',
    'Most change management approaches focus on getting people to accept a decision that has already been made. Communication plans, stakeholder engagement, overcoming objections. But if the change itself was not designed with the organisation in mind - if it ignores the patterns, the practical realities, and the lived experience of the people involved - no amount of communication will make it stick.',
    'Our change management consultancy starts from a different place. We help you understand the system you are working with, involve the right people in designing the change, and build the approach around how your organisation actually functions. When you do that, adoption is not something you have to force.',
  ],
  propositionCaption: 'Change that works with the system, not against it.',
  whyHeading: 'Why change management matters',
  whyIntro: 'Organisations change all the time - that is not the issue. The issue is whether the change you need actually lands. Whether people adopt new ways of working because they make sense, not just because they have been told to. Whether the investment in change delivers the outcomes it promised.',
  whyItems: [
    'Around 70% of organisational change initiatives fail to achieve their objectives - a statistic that has barely shifted in thirty years',
    'The cost of failed change is not just financial - it erodes trust, burns out good people, and makes the next change even harder',
    'Organisations that manage change well adapt faster, retain more talent, and outperform those that do not',
    'The difference between change that sticks and change that fades is almost always about how well it was embedded into how the organisation actually works',
    'When people understand why something is changing and feel involved in how, adoption is not something you have to manage - it happens naturally',
  ],
  whyBridge: [
    'Whether you are in the middle of a transformation programme, planning a restructure, implementing new technology, or navigating a shift in strategy - the question is always the same. How do you make change real?',
    'That is what good change management consultancy should help you do.',
  ],
  stats: [
    ['70%', 'of change programmes fail to meet objectives', 'McKinsey'],
    ['5x', 'more likely to succeed with effective change management', 'Prosci'],
    ['6x', 'ROI from investing in change management', 'Prosci'],
    ['33%', 'of leaders say change fatigue is the biggest barrier', 'Gartner'],
  ],
  perspHeading: 'Change is not a project. It is how healthy organisations work.',
  perspBody: [
    'Most change management frameworks treat change as something unusual - a disruption that needs managing until things go back to normal. But organisations that thrive do not treat change as an event. They build the capability to adapt as a normal part of how they work.',
    'This is why we take a systems approach. Instead of layering change management over the top of a project, we work with the patterns and connections that shape how your organisation actually functions. When those patterns support change - when knowledge flows freely, when people feel connected to purpose, when decisions happen at the right level - change does not need to be forced. It happens because the system enables it.',
    'Our change management consultancy helps you build that kind of organisation. Not just managing the change in front of you, but developing the capability to navigate whatever comes next.',
  ],
  approachIntro: [
    'Every change is different, and every organisation is different. But our change management consultancy typically moves through four connected areas - understanding the system you are working with, designing change that fits, supporting implementation through the messy reality, and building your capability to keep adapting independently.',
    'These are not rigid stages. Some organisations need all four. Others need support at a specific point where things have stalled. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See the whole system',
      heading: 'Understanding the system you are changing',
      body: [
        'Before designing a change approach, you need to understand the organisation you are working with. Not just the stated strategy and the org chart, but the real patterns - how decisions actually get made, how information actually flows, where power actually sits, and what people actually care about.',
        'We map the organisational ecosystem to understand what will support the change and what will resist it. This is not a stakeholder analysis exercise. It is a genuine exploration of how the system works, so the change approach can work with it rather than fight it.',
      ],
      practice: [
        'Mapping the organisational ecosystem to understand the patterns that will shape how change lands',
        'Listening to people across the organisation to understand the lived reality, not just the leadership narrative',
        'Identifying the leverage points where change will have the greatest systemic impact',
        'Building shared understanding across the change team about what they are really working with',
      ],
      outcome: 'A clear, systemic understanding of the organisation that enables change to be designed for how things actually work, not how the org chart says they should.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design change that fits',
      heading: 'Designing change that works with your organisation',
      body: [
        'Change approaches that are designed in a project office and rolled out to an organisation rarely land well. The people who understand how things really work are the people who do the work every day. Their knowledge is essential to designing change that fits.',
        'We facilitate collaborative design sessions where the people closest to the work help shape how change will happen. Not just consulted after the decisions are made, but genuinely involved in designing the approach. This builds understanding, ownership, and practical solutions that actually work in context.',
      ],
      practice: [
        'Collaborative design sessions that bring together the people designing the change and the people who will live with it',
        'Designing change approaches that account for how the organisation actually works, not how it is supposed to work',
        'Building in flexibility so the approach can adapt as you learn what works and what does not',
        'Creating genuine ownership by involving people in the design, not just the communication',
      ],
      outcome: 'A change approach designed with the people who will make it work - practical, context-specific, and owned by the organisation rather than imposed on it.',
    },
    {
      num: '03', title: 'Implement', summary: 'Support through the messy middle',
      heading: 'Supporting change through the messy reality',
      body: [
        'The plan never survives first contact with reality. That is not a failure - it is how change actually works. The critical thing is having the support, the perspective, and the flexibility to adapt as things unfold.',
        'We embed alongside your teams through the implementation, providing the systems perspective to see what is really happening, the facilitation skills to work through challenges, and the challenge to keep going when it gets hard. We are there for the difficult conversations, the unexpected consequences, and the moments when the old ways of working try to reassert themselves.',
      ],
      practice: [
        'Embedding with your teams through the change, not disappearing after the plan is written',
        'Providing a systems perspective - helping people see the patterns and connections that explain what is happening',
        'Facilitating the difficult conversations that change inevitably surfaces',
        'Helping leaders stay the course while remaining genuinely responsive to what they are learning',
      ],
      outcome: 'Change that lands in practice, not just in theory - supported through the reality of implementation, not abandoned to it.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Build change fluency',
      heading: 'Building your capability to navigate change independently',
      body: [
        'The goal is not to manage this one change well. It is to build your organisation\'s capability to navigate whatever comes next. We call this change fluency - the distributed ability to understand change, design good approaches, and support people through transitions.',
        'We develop this capability across your organisation, not just in a change management team. Leaders who can read the system and adapt their approach. Managers who can support their teams through transitions. Teams that can work through uncertainty productively.',
      ],
      practice: [
        'Developing leaders\' ability to understand and work with organisational patterns during change',
        'Building internal facilitation capability for change design and implementation',
        'Creating organisational rhythms that support ongoing adaptation, not just one-off projects',
        'Transferring systems thinking tools and approaches so your people can navigate future change independently',
      ],
      outcome: 'An organisation with genuine change fluency - the capability to navigate change as a normal part of how it works, not something that requires external support every time.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our change management consultancy describe a shift in how change feels. It stops being something that happens to people and becomes something they are part of. The language changes. The energy changes.',
  outcomes: [
    ['Change that actually lands', 'Because it was designed for how the organisation really works, not how someone wished it worked'],
    ['Less resistance, more engagement', 'Because people were involved in the design, not just informed of the outcome'],
    ['Faster adaptation', 'Because the organisation\'s ability to navigate change improves with every transition, not just the current one'],
    ['Leaders who can lead change', 'Because they understand the system they are leading and can read what it needs'],
    ['Sustainable momentum', 'Because change capability is built into the organisation, not dependent on a project team'],
  ],
  outcomesClosing: 'Good change management is not about controlling a process. It is about building an organisation that can keep adapting, learning, and improving - led by the people who know it best.',
  primaryKeyword: 'change management consultancy',
  secondaryKeywords: ['organisational change management', 'change management support', 'managing organisational change', 'leading change in organisations', 'change management programme'],
  seoTitle: 'Change Management Consultancy - Mutomorro',
  seoDescription: 'Change management consultancy that works with how your organisation actually functions - not a framework imposed from outside, but practical support for making change land.',
},

// ─────────────────────────────────────────────────
// 4. Employee Experience Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Employee Experience',
  slug: 'employee-experience-consultancy',
  category: 'people-capability',
  categoryLabel: 'People & Capability',
  order: 2,
  heroHeading: 'Employee Experience Consultancy',
  heroTagline: 'Employee experience is not a programme you run alongside the real work. It is the real work - shaped by how your organisation actually functions every day.',
  contextHeading: 'We know employee experience is not about perks and surveys. It is about how the whole organisation works.',
  contextBody: [
    'Most approaches to employee experience focus on the visible things - engagement surveys, benefits packages, wellbeing initiatives, onboarding processes. These matter, but they are the surface. Underneath them sits something much more influential: how decisions get made, how teams collaborate, how purpose connects to daily work, and how capable people feel in their roles.',
    'When those deeper patterns work well, the employee experience is good - not because of a programme, but because the organisation itself is healthy. When they do not, no amount of perks or initiatives will close the gap.',
    'Our employee experience consultancy works with the whole system. We help you understand what is actually shaping how people experience your organisation, and make practical improvements to the things that matter most.',
  ],
  propositionCaption: 'When the organisation works well, the experience follows.',
  whyHeading: 'Why employee experience matters',
  whyIntro: 'How people experience your organisation shapes everything - who stays, who leaves, how hard they try, how much they innovate, and how well they serve your customers. It is not a soft issue. It is a strategic one.',
  whyItems: [
    'Organisations with strong employee experience see higher retention, higher productivity, and stronger customer outcomes - consistently',
    'The experience that matters most is not the away day or the benefits package - it is the everyday reality of how work feels',
    'When people feel genuinely connected to purpose, supported in their development, and trusted with real responsibility, discretionary effort is not something you have to ask for',
    'Poor employee experience does not just cost talent - it shows up in service quality, customer satisfaction, and how the organisation adapts to change',
    'The organisations people want to work for are the ones where the experience is genuine, not performed',
  ],
  whyBridge: [
    'Whether your engagement scores are falling, your retention is suffering, or you simply know the experience could be better - the question is the same. What is actually shaping how people experience your organisation?',
    'That is what good employee experience consultancy should help you understand.',
  ],
  stats: [
    ['17%', 'higher productivity with positive EX', 'Gallup'],
    ['21%', 'higher profitability with engaged teams', 'Gallup'],
    ['59%', 'lower turnover with strong EX', 'Gallup'],
    ['2x', 'more likely to delight customers', 'HBR'],
  ],
  perspHeading: 'Employee experience is an ecosystem property',
  perspBody: [
    'Employee experience is not one thing. It is the combined effect of how your whole organisation works - the quality of leadership, the clarity of purpose, the way teams collaborate, the opportunity to develop, the pace of change, and a hundred other patterns that people experience every day.',
    'This is why isolated EX programmes rarely deliver lasting change. You can redesign your onboarding, improve your benefits, and run better surveys - but if the underlying organisational patterns stay the same, the experience stays the same. The survey scores might tick up temporarily, but the feeling does not change.',
    'Our employee experience consultancy takes a systems approach. We help you see the full picture of what shapes experience in your organisation, identify the patterns that matter most, and make practical changes to the things that will genuinely shift how people feel about working here.',
  ],
  approachIntro: [
    'Every organisation is different, and what shapes employee experience varies hugely depending on context. But our employee experience consultancy typically moves through four connected areas - understanding what is really shaping the experience, designing improvements with the people who will feel them, making those improvements real, and building your capability to keep developing the experience independently.',
    'These are not rigid stages. Some organisations already know what the issues are and want to move straight into design. Others need to start with a clear picture of what is actually happening. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See what shapes the experience',
      heading: 'Understanding what is really shaping the experience',
      body: [
        'Engagement surveys tell you what people think. They rarely tell you why. To genuinely improve employee experience, you need to understand the organisational patterns that create it - how leadership shows up, how teams collaborate, how people connect to purpose, and whether the systems around them help or hinder their ability to do good work.',
        'We go beyond the survey data to map the organisational ecosystem that shapes experience. This means listening to people at every level, observing how work actually happens, and building a picture that connects the dots between how the organisation functions and how people feel.',
      ],
      practice: [
        'Mapping the organisational patterns that shape experience - leadership, collaboration, development, purpose, and operational rhythms',
        'Listening to people across the organisation through conversations, not just surveys',
        'Identifying the systemic drivers behind engagement scores - the "why" behind the numbers',
        'Building a shared understanding across leadership of what is genuinely shaping the experience',
      ],
      outcome: 'A clear picture of what is really driving the employee experience - not just what the survey says, but the organisational patterns behind it.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design improvements together',
      heading: 'Designing improvements with the people who will feel them',
      body: [
        'The people best placed to design a better employee experience are the people who live with it every day. Not a single team designing in isolation. Not a consultancy recommending best practice from the outside. The people who actually know what it feels like to work in your organisation.',
        'We bring together people from across the organisation to identify what would make the biggest difference and design practical approaches that fit the real context. This is not about copying what other organisations do. It is about understanding your system and designing improvements that work within it.',
      ],
      practice: [
        'Collaborative sessions involving people from across the organisation, at every level',
        'Designing practical improvements to the patterns that most shape the experience',
        'Focusing on systemic changes that shift the everyday reality, not just the visible touchpoints',
        'Building genuine ownership by involving the people who will benefit from the changes',
      ],
      outcome: 'Practical, specific improvements designed by the people who understand the experience from the inside - with real ownership because they helped create them.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make the improvements real',
      heading: 'Making improvements real in everyday working life',
      body: [
        'Improving employee experience is not a project that launches and ends. It is a shift in how the organisation works - and that takes time, attention, and the willingness to keep adjusting as you learn what works.',
        'We support implementation over the medium term, working alongside your teams as improvements are put into practice. Some changes will land easily. Others will surface tensions or resistance that need working through. We help you navigate all of it, keeping the focus on the practical reality of making things genuinely better.',
      ],
      practice: [
        'Supporting implementation over time, not just handing over a plan',
        'Helping leaders model the changes they want to see - walking the talk on experience',
        'Working through the practical challenges that emerge when you change how things work',
        'Tracking what is shifting and where to focus next, using qualitative and quantitative signals',
      ],
      outcome: 'Improvements that are felt in everyday working life - not just announced, but genuinely embedded in how the organisation operates.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Own your own experience',
      heading: 'Building your capability to keep improving the experience',
      body: [
        'Your organisation\'s employee experience should keep getting better long after we have gone. That means building the internal capability to listen, understand, design, and improve - not as a one-off project, but as an ongoing part of how you work.',
        'We help you develop the skills, practices, and rhythms to keep developing the employee experience independently. Leaders who can read the signals. Teams that can identify and act on what needs improving. Practices that keep the experience evolving as the organisation grows and changes.',
      ],
      practice: [
        'Developing leaders\' ability to understand and influence the experience through how they lead, not just what they say',
        'Building internal capability for listening, designing, and improving experience',
        'Creating rhythms and practices for ongoing experience development',
        'Progressively stepping back as your capability grows',
      ],
      outcome: 'An organisation that can keep improving its employee experience from the inside - because the capability to listen, design, and adapt is built in.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our employee experience consultancy describe a shift that goes beyond the survey scores. The conversations change. The atmosphere changes. People start bringing more of themselves to work because the organisation feels like a place worth investing in.',
  outcomes: [
    ['People who stay because they want to', 'Because the experience is genuinely good, not just marketed well'],
    ['Better service, naturally', 'Because how people feel about their organisation shows up in how they treat customers'],
    ['Ideas that surface', 'Because people in a healthy organisation are more willing to share what they see and suggest what could be better'],
    ['Faster adaptation', 'Because people who feel valued and connected are more willing to move with the organisation when things change'],
    ['A place people recommend', 'Because the experience matches the employer brand, not contradicts it'],
  ],
  outcomesClosing: 'Good employee experience is not something you add on. It is something that emerges when the organisation itself works well - and that is a much more powerful and sustainable foundation than any programme.',
  primaryKeyword: 'employee experience consultancy',
  secondaryKeywords: ['employee experience strategy', 'improving employee experience', 'employee experience consulting', 'EX consultancy', 'workplace experience', 'employee engagement consultancy'],
  seoTitle: 'Employee Experience Consultancy - Mutomorro',
  seoDescription: 'Employee experience consultancy that treats EX as something that emerges from how your organisation works - not a programme layered on top.',
},

// ─────────────────────────────────────────────────
// 5. Organisational Restructuring Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Organisational Restructuring',
  slug: 'organisational-restructuring-consultancy',
  category: 'structure-operations',
  categoryLabel: 'Structure & Operations',
  order: 2,
  heroHeading: 'Organisational Restructuring Consultancy',
  heroTagline: 'A restructure is not just about the boxes on the chart. It is about designing an organisation where work actually flows, people can thrive, and services improve.',
  contextHeading: 'We know a restructure affects everything. Not just reporting lines, but how the whole organisation works.',
  contextBody: [
    'An organisational restructure changes the shape of the organisation. But it also changes how decisions flow, how teams collaborate, how knowledge moves, and how people experience their working lives. A restructure that only considers reporting lines and headcount misses most of what actually matters.',
    'Too often, restructuring is treated as a mechanical exercise - drawing new boxes, moving people around, and hoping everything settles. But organisations are not machines. Change the structure and you change the patterns of how everything works. If those patterns are not considered, the new structure can create as many problems as it solves.',
    'Our organisational restructuring consultancy designs structures that work with how your organisation actually needs to function. We think about what the structure needs to enable - better collaboration, clearer accountability, smoother service delivery - and design from there.',
  ],
  propositionCaption: 'Design the structure around how work needs to work.',
  whyHeading: 'Why getting restructuring right matters',
  whyIntro: 'Restructuring is one of the most disruptive things an organisation can do. When it is done well, it creates clarity, energy, and better ways of working. When it is done badly, it can take years to recover.',
  whyItems: [
    'A well-designed structure enables better collaboration, faster decision-making, and clearer accountability',
    'Restructuring that ignores how work actually flows creates new bottlenecks, silos, and frustrations - sometimes worse than what it replaced',
    'Restructures can degrade the informal networks and organisational knowledge that make things actually work - the relationships, the shortcuts, the institutional memory that no org chart captures',
    'The human cost of poorly handled restructuring is significant - uncertainty, talent loss, and a drop in morale that can persist long after the new org chart is published',
    'Getting the structure right is only half the challenge - helping people transition into new roles, new teams, and new ways of working is where the real work happens',
  ],
  whyBridge: [
    'Whether you are restructuring in response to growth, a merger, a change in strategy, or financial pressure - the question is the same. How do you design an organisation that genuinely works better?',
    'That is what organisational restructuring consultancy should help you answer.',
  ],
  stats: [
    ['60%', 'of restructures fail to achieve their goals', 'McKinsey'],
    ['80%', 'of restructured orgs restructure again within 3 years', 'Bain'],
    ['50%', 'productivity loss during poorly managed transitions', 'Deloitte'],
    ['23%', 'of employees consider leaving during restructuring', 'CIPD'],
  ],
  perspHeading: 'Structure should serve the work, not the other way around',
  perspBody: [
    'Most restructuring starts from the org chart - who reports to whom, how many layers, how many spans. But the org chart is a picture of authority, not a picture of how work happens. The real question is: what does the organisation need to be good at, and what structure would best support that?',
    'We approach organisational restructuring consultancy as a design challenge. What does the work need? How do teams need to collaborate? Where do decisions need to happen? How does value reach the people you serve? When you start from those questions, the structure that emerges is one that genuinely enables the organisation to do its job.',
    'This is the ecosystem approach to restructuring. Instead of designing a structure and asking people to fit into it, we design a structure that fits how the organisation actually needs to work - accounting for collaboration, capability, service delivery, and the human experience of the people inside it.',
  ],
  approachIntro: [
    'Every restructure is different - different drivers, different scale, different context. But our organisational restructuring consultancy typically moves through four connected areas - understanding how the current organisation works, designing a structure that serves what is needed, supporting people through the transition, and building capability to keep developing the organisation over time.',
    'We also work well alongside other advisors. Restructuring often involves HR, legal, and financial workstreams. Our role is to bring the organisational design and people perspective - ensuring the new structure actually works for the people inside it and the services it needs to deliver.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See how the organisation really works',
      heading: 'Understanding how the organisation really works today',
      body: [
        'Before redesigning the structure, you need to understand the organisation you actually have - not the one on the org chart. How does work actually flow? Where are the real bottlenecks? Where does collaboration happen naturally and where is it forced? What are people genuinely good at?',
        'We map the current organisational ecosystem to understand the patterns that any new structure needs to account for. This is not just a structural review. It is an exploration of how the whole system works - so the new design builds on what is strong and addresses what is not.',
      ],
      practice: [
        'Mapping how work actually flows through the organisation - not just the formal structure',
        'Understanding collaboration patterns, capability concentrations, and service delivery chains',
        'Identifying what works well in the current structure and what creates friction',
        'Building shared understanding across leadership of what the new structure needs to enable',
      ],
      outcome: 'A clear picture of how the organisation actually works - the foundation for designing a structure that genuinely fits.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design the structure together',
      heading: 'Designing a structure that serves how work needs to work',
      body: [
        'The strongest structures are designed with the people who understand how work actually happens. Leadership sets the direction, but the people closest to service delivery, collaboration, and daily operations bring essential insight that no org chart exercise can capture.',
        'We facilitate a collaborative design process that brings together strategic intent and practical reality. What does the organisation need to be good at? What structure would best support that? How do teams need to connect? Where should decisions sit? These questions get better answers when they include diverse perspectives.',
      ],
      practice: [
        'Collaborative design sessions involving leaders, operational teams, and people closest to service delivery',
        'Designing structure around what the organisation needs to enable - not just what looks tidy on a chart',
        'Testing options against practical scenarios before committing',
        'Building ownership by involving the people who will live with the new structure in designing it',
      ],
      outcome: 'A structure designed around how work actually needs to flow - with genuine buy-in from the people who will make it work.',
    },
    {
      num: '03', title: 'Implement', summary: 'Support the transition',
      heading: 'Supporting people through the transition',
      body: [
        'A restructure on paper is one thing. A restructure in practice is entirely another. People are moving into new roles, new teams, and new reporting relationships. Old habits persist. New expectations are unclear. The gap between the planned structure and the lived reality is where most restructures lose momentum.',
        'We support the transition over time, helping leaders communicate clearly, helping teams form and find their rhythm, and helping the organisation navigate the inevitable bumps that come with significant structural change.',
      ],
      practice: [
        'Supporting leaders to communicate the rationale, the process, and what it means for people - honestly and consistently',
        'Helping new teams form, build relationships, and establish working patterns',
        'Working through the practical challenges that emerge as the new structure beds in',
        'Keeping an eye on the whole system - making sure structural changes are not creating unintended problems elsewhere',
      ],
      outcome: 'A transition that is managed with care, clarity, and practical support - so the new structure starts delivering sooner rather than stalling.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep the structure working',
      heading: 'Building capability to keep developing the organisation',
      body: [
        'The best structures are not static. They evolve as the organisation learns, grows, and adapts. Our goal is to leave you with the capability to keep developing how your organisation is designed - adjusting, refining, and improving as needs change.',
        'We help develop the internal capability to think about organisational design as an ongoing practice, not a one-off event. Leaders who can read the signals that the structure needs adjusting. Teams that can adapt how they work. Practices that keep the organisation developing.',
      ],
      practice: [
        'Developing leaders\' ability to think about structure as a living design, not a fixed blueprint',
        'Building capability for ongoing organisational development and adaptation',
        'Creating practices for reviewing and refining how the organisation works',
        'Progressively stepping back as your confidence and capability grow',
      ],
      outcome: 'An organisation that can keep developing its own structure and ways of working - adapting as needs change rather than waiting for the next big restructure.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our organisational restructuring consultancy describe something that goes beyond the new org chart. The work flows better. Teams that were stuck find new energy. People understand their role and how it connects to the bigger picture.',
  outcomes: [
    ['Work that flows', 'Because the structure was designed around how work actually needs to happen'],
    ['Clearer accountability', 'Because roles and responsibilities were designed thoughtfully, not just allocated'],
    ['Teams that work', 'Because the transition was supported properly and teams had time to form'],
    ['Less disruption', 'Because people were involved in the design and understood the rationale'],
    ['A structure that lasts', 'Because it was designed to adapt, not just to solve today\'s problem'],
  ],
  outcomesClosing: 'A restructure done well is an opportunity to make the organisation genuinely better - not just different. The goal is not a new chart, but a new way of working that serves everyone.',
  primaryKeyword: 'organisational restructuring consultancy',
  secondaryKeywords: ['organisational restructure consultancy', 'restructuring and change management', 'organisational redesign', 'operating model redesign', 'organisational restructure support'],
  seoTitle: 'Organisational Restructuring Consultancy - Mutomorro',
  seoDescription: 'Organisational restructuring consultancy that designs structures around how work actually needs to flow - not the other way around.',
},

// ─────────────────────────────────────────────────
// 6. Operational Effectiveness Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Operational Effectiveness',
  slug: 'operational-effectiveness-consultancy',
  category: 'structure-operations',
  categoryLabel: 'Structure & Operations',
  order: 3,
  heroHeading: 'Operational Effectiveness Consultancy',
  heroTagline: 'Making your organisation better at what it does - by improving how work actually works, not just measuring how fast it goes.',
  contextHeading: 'We know operational effectiveness is about more than efficiency. It is about how well the whole system works.',
  contextBody: [
    'Efficiency is doing things faster. Effectiveness is doing the right things well. Most operational improvement programmes focus on the first - cutting costs, speeding up processes, removing waste. These things matter, but they are only part of the picture.',
    'The organisations that consistently deliver well are the ones where the whole operational system works together. Where processes support the people using them. Where teams have the capability and the autonomy to solve problems. Where the way work flows is designed around what customers actually need, not around internal convenience.',
    'Our operational effectiveness consultancy works at that deeper level. We help you understand how your operational ecosystem actually functions and make practical improvements to the patterns that shape how well work gets done.',
  ],
  propositionCaption: 'Effective organisations do the right things well, not just fast.',
  whyHeading: 'Why operational effectiveness matters',
  whyIntro: 'Operational effectiveness is the engine that turns strategy into reality. Without it, even the best ideas struggle to deliver. With it, the organisation develops a rhythm of delivery that builds confidence, capability, and momentum.',
  whyItems: [
    'Organisations that are operationally effective deliver better outcomes for less effort - not through cutting corners, but through working smarter',
    'When operations work well, people spend their energy on the things that matter rather than fighting the system',
    'Operational friction is one of the biggest hidden costs in any organisation - it slows delivery, frustrates teams, and erodes the quality of service',
    'Improving operational effectiveness is not a one-off project - it is a capability that, once built, keeps delivering returns',
    'The best organisations treat operational improvement as everyone\'s job, not the preserve of a process team',
  ],
  whyBridge: [
    'Whether you are struggling with delivery, seeing quality issues, losing time to inefficiency, or simply know things could work better - the question is the same. What is getting in the way, and how do you fix it?',
    'That is what operational effectiveness consultancy should help you answer.',
  ],
  stats: [
    ['30%', 'of work time lost to operational inefficiency', 'McKinsey'],
    ['25%', 'improvement in delivery when operations are redesigned around outcomes', 'Deloitte'],
    ['40%', 'of employees say their tools and processes hinder rather than help', 'Gallup'],
    ['2x', 'more likely to retain talent when operations work well', 'CIPD'],
  ],
  perspHeading: 'Operations are an ecosystem, not a machine',
  perspBody: [
    'Traditional operational improvement treats the organisation like a machine - find the broken part, fix it, optimise it. But organisations are not machines. They are living systems where everything connects. Changing one process affects how teams collaborate. Changing how teams collaborate affects the quality of delivery. The quality of delivery affects how people feel about their work.',
    'This is why process-level fixes often disappoint. You optimise one workflow but create a bottleneck elsewhere. You introduce a new system but people work around it because it does not fit how they actually need to operate.',
    'Our operational effectiveness consultancy takes a systems view. We help you see how the operational ecosystem fits together - processes, people, capability, technology, and ways of working - and design improvements that account for how everything connects. The result is improvement that holds because it works with the system, not against it.',
  ],
  approachIntro: [
    'Every organisation\'s operational challenges are different. But our operational effectiveness consultancy typically moves through four connected areas - understanding how work actually flows, designing better ways of operating, making the improvements real, and building your capability to keep improving independently.',
    'These are not rigid stages. Some organisations need a full operational review. Others know exactly where the problems are and want to move straight to redesign. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See how work really flows',
      heading: 'Understanding how work really flows through your organisation',
      body: [
        'Before improving operations, you need to see them clearly. Not the process maps on the wall, but the real patterns of how work actually moves through the organisation. Where does it flow well? Where does it get stuck? Where are people working around the system rather than with it?',
        'We map the operational ecosystem to understand the full picture - the formal processes, the informal workarounds, the capability gaps, and the friction points that slow delivery. This gives you a clear, shared understanding of what is working, what is not, and where improvement will have the greatest impact.',
      ],
      practice: [
        'Mapping how work actually flows - following the real path, not the documented process',
        'Identifying friction points, bottlenecks, and workarounds that signal deeper issues',
        'Understanding how teams, tools, and processes interact - where they help and where they hinder',
        'Building a shared picture across leadership of what the operational challenges really are',
      ],
      outcome: 'A clear map of how your operations actually work - with agreed priorities for where improvement will deliver the most value.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design better ways of working',
      heading: 'Designing operational improvements with the people who do the work',
      body: [
        'The people who do the work every day understand the operations better than anyone. They know where the friction is, what works, and what would make the biggest difference. Designing improvements without them is like fixing a car without asking the driver what is wrong.',
        'We bring together operational teams, leaders, and the people closest to delivery to design improvements that fit the real context. Not imposing a methodology. Not copying what another organisation does. Designing approaches that work for your specific operational ecosystem.',
      ],
      practice: [
        'Collaborative design sessions with the people who do the work, manage the work, and depend on the work',
        'Designing improvements to processes, practices, and ways of working that account for how things really operate',
        'Testing improvements before scaling - learning what works and adjusting',
        'Building ownership by involving people in the design, not just the implementation',
      ],
      outcome: 'Operational improvements designed by the people who understand the work best - practical, specific, and owned by the organisation.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make the improvements stick',
      heading: 'Making operational improvements stick',
      body: [
        'Operational improvements that exist only on paper are not improvements at all. The real test is whether they change how work actually happens - whether teams adopt new practices, whether processes genuinely improve, and whether the organisation starts delivering better as a result.',
        'We support implementation over time, working alongside your teams as new ways of working are bedded in. Some improvements land quickly. Others need adjusting as they meet the reality of daily operations. We help you navigate both, keeping the focus on practical outcomes.',
      ],
      practice: [
        'Supporting teams as they adopt new processes and practices',
        'Adjusting improvements based on what is actually working in practice',
        'Helping leaders maintain focus on operational improvement alongside day-to-day pressures',
        'Tracking the impact of changes on delivery quality, team experience, and organisational rhythm',
      ],
      outcome: 'Operational improvements that are genuinely embedded in how the organisation works - delivering better outcomes, not just better documentation.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep improving independently',
      heading: 'Building your capability for continuous operational improvement',
      body: [
        'The most operationally effective organisations are the ones that never stop improving. Not through big transformation programmes, but through an ongoing practice of noticing what could be better and doing something about it. Our goal is to help you build that kind of organisation.',
        'We develop the internal capability for ongoing operational improvement - teams that can identify friction and solve it, leaders who can see patterns in how work flows, and practices that keep the organisation learning and adapting.',
      ],
      practice: [
        'Building capability for operational problem-solving across teams, not just a central function',
        'Developing leaders\' ability to see operational patterns and act on them',
        'Creating practices for ongoing improvement - regular review, learning, and adaptation',
        'Progressively stepping back as continuous improvement becomes part of how you work',
      ],
      outcome: 'An organisation with continuous improvement built into its rhythm - getting better at what it does as a normal part of how it operates.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our operational effectiveness consultancy describe a shift in how work feels. Less friction. Less time wasted. More energy going into the things that actually matter.',
  outcomes: [
    ['Better delivery', 'Because the operational system is designed around outcomes, not just processes'],
    ['People who can focus', 'Because the friction that used to consume energy has been removed or reduced'],
    ['Faster adaptation', 'Because the organisation has learned how to improve its own operations, not just run them'],
    ['Happier teams', 'Because operational improvements make daily work genuinely better, not just more measured'],
    ['Sustainable improvement', 'Because the capability to keep getting better is built in, not dependent on a programme'],
  ],
  outcomesClosing: 'Operational effectiveness is not about perfecting processes. It is about creating an organisation where work flows well, people can do their best, and delivery keeps getting better over time.',
  primaryKeyword: 'operational effectiveness consultancy',
  secondaryKeywords: ['improving operational effectiveness', 'operational efficiency consulting', 'operational improvement', 'organisational effectiveness', 'operational excellence consultancy'],
  seoTitle: 'Operational Effectiveness Consultancy - Mutomorro',
  seoDescription: 'Operational effectiveness consultancy that improves how work actually works - by understanding the patterns, processes, and practices that shape daily delivery.',
},

// ─────────────────────────────────────────────────
// 7. Organisational Design Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Organisational Design',
  slug: 'organisational-design-consultancy',
  category: 'structure-operations',
  categoryLabel: 'Structure & Operations',
  order: 4,
  heroHeading: 'Organisational Design Consultancy',
  heroTagline: 'We help you design organisations that actually work - where structure, operations, collaboration, and capability all fit together as one connected system.',
  contextHeading: 'We know organisational design is about much more than structure. It is about how everything fits together.',
  contextBody: [
    'Organisational design is often treated as a structural exercise. Draw the org chart. Define the roles. Set the spans of control. But structure is just one part of how an organisation works. The design that matters is the whole thing - how teams collaborate, how decisions get made, how services reach the people who need them, how capability develops, and how all of these connect.',
    'An org chart tells you who reports to whom. It tells you almost nothing about how the organisation actually functions. The most important design decisions are the ones that shape how work flows between the boxes, not just what sits inside them.',
    'Our organisational design consultancy designs the whole system. We help you create an organisation where structure, operations, collaboration, culture, and capability all work together - because that is what makes an organisation genuinely effective.',
  ],
  propositionCaption: 'Design the whole organisation, not just the chart.',
  whyHeading: 'Why organisational design matters',
  whyIntro: 'How your organisation is designed determines what it can do. The right design enables clarity, collaboration, and effective delivery. The wrong design - or a design that has not kept up with how the organisation has changed - creates friction, confusion, and frustration.',
  whyItems: [
    'Many organisational problems that look like people problems or process problems are actually design problems - the organisation is not set up to do what it needs to do',
    'Organisations that outgrow their design experience increasing friction - things that used to work smoothly start breaking down',
    'Good organisational design makes roles clear, collaboration natural, and delivery effective - it creates the conditions for people to do their best work',
    'Poorly designed organisations waste vast amounts of energy on navigating the system rather than doing the work',
    'Organisational design is not a one-off exercise - the best organisations treat it as an ongoing practice, adapting their design as their context changes',
  ],
  whyBridge: [
    'Whether you are designing a new organisation, redesigning an existing one, or trying to understand why things are not working as they should - the question is always the same. How should this organisation be designed to do what it needs to do?',
    'That is what organisational design consultancy should help you answer.',
  ],
  stats: [
    ['70%', 'of organisation redesigns fail to meet objectives', 'McKinsey'],
    ['3x', 'performance gap between well-designed and poorly-designed organisations', 'Deloitte'],
    ['80%', 'of leaders say their operating model needs updating', 'Bain'],
    ['50%', 'of employee frustration is attributable to organisational design issues', 'Gallup'],
  ],
  perspHeading: 'An organisation is a living system, not a machine',
  perspBody: [
    'Traditional organisational design treats the organisation as a machine to be engineered - define the inputs, design the processes, specify the outputs. But organisations are not machines. They are complex living systems where structure, culture, capability, and operations interact in ways that cannot be captured on a single chart.',
    'This is why so many reorganisations disappoint. The new structure looks clean on paper but fails in practice because it did not account for how people actually work, how services actually reach customers, or how capability actually develops. The chart changes but the patterns persist.',
    'Our organisational design consultancy takes an ecosystem approach. We design organisations as connected systems where structure supports operations, operations support delivery, delivery shapes culture, and culture enables capability. When all of these work together, the organisation does not just function - it thrives.',
  ],
  approachIntro: [
    'Every organisational design challenge is different. But our organisational design consultancy typically moves through four connected areas - understanding how the current organisation works, designing the organisation you need, implementing the design with care, and building your capability to keep developing the design over time.',
    'We also work well alongside other advisors. Organisational design often involves HR, finance, and operational leadership. Our role is to bring the systems perspective - making sure the design works as a connected whole, not just a collection of separate decisions.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See the whole system',
      heading: 'Understanding the organisation you actually have',
      body: [
        'Before you can design the future, you need to understand the present - honestly. Not the tidy version on the website, but the real organisation. How does work actually flow? Where do teams collaborate naturally and where does the structure force them apart? Where does capability sit, and where are the gaps? What is the relationship between the formal design and the lived reality?',
        'We map the current organisational ecosystem to understand how all the parts fit together. This is not just a structural audit. It is a full picture of how the organisation actually functions - the patterns, the strengths, and the constraints that any new design needs to account for.',
      ],
      practice: [
        'Mapping the whole organisational ecosystem - structure, operations, collaboration, capability, service delivery, and culture',
        'Understanding the gap between the formal design and how things actually work',
        'Identifying what the current design enables and what it constrains',
        'Building shared understanding across leadership of what the organisation actually needs',
      ],
      outcome: 'A clear picture of how the organisation actually works as a whole system - the foundation for designing something better.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design the new organisation',
      heading: 'Designing the organisation you need',
      body: [
        'The strongest organisational designs emerge when the people who understand the work are involved in the design. Strategy sets the direction, but the people who deliver services, manage operations, and collaborate across teams bring the practical knowledge that makes a design actually work.',
        'We facilitate a design process that connects strategic intent with operational reality. What does the organisation need to be good at? What structure, operating model, and ways of working would best support that? How do the pieces need to connect? These questions get better answers when diverse perspectives are in the room.',
      ],
      practice: [
        'Collaborative design sessions involving leaders, operational teams, and service delivery specialists',
        'Designing structure, operating model, and ways of working as a connected system',
        'Testing designs against real scenarios and practical challenges',
        'Building ownership and understanding by involving people in the design, not just the announcement',
      ],
      outcome: 'An organisational design where structure, operations, collaboration, and capability all work together - designed with the people who will make it real.',
    },
    {
      num: '03', title: 'Implement', summary: 'Bring the design to life',
      heading: 'Bringing the design to life',
      body: [
        'An organisational design is only as good as its implementation. The transition from the current organisation to the new one is where design meets reality - and where the quality of the design work really shows. Good design anticipates the implementation challenges. Good implementation stays faithful to the design intent while adapting to what it learns.',
        'We support the implementation over time, helping leaders communicate the changes, helping teams form and find their rhythm, and helping the organisation navigate the transition from old patterns to new ones.',
      ],
      practice: [
        'Supporting the transition with practical guidance and leadership coaching',
        'Helping new teams and roles find their rhythm and build effective working relationships',
        'Working through the tensions and challenges that emerge as the new design beds in',
        'Tracking how the design is working in practice and adjusting where needed',
      ],
      outcome: 'An organisation that transitions smoothly from old design to new - with people supported through the change and the new ways of working taking root.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep developing the design',
      heading: 'Building capability for ongoing organisational development',
      body: [
        'The best organisational designs evolve. As the organisation grows, as the context changes, as you learn what works and what does not - the design needs to adapt with it. Our goal is to leave you with the capability to keep developing your organisation\'s design, not to create a dependency on external support.',
        'We help develop the internal capability to think about organisational design as a continuous practice. Leaders who can read the signals that the design needs adapting. Teams that can experiment with better ways of working. A culture of ongoing organisational development.',
      ],
      practice: [
        'Developing leaders\' ability to think about the organisation as a system they can shape and improve',
        'Building internal capability for organisational design and development',
        'Creating practices for regularly reviewing and adapting how the organisation works',
        'Progressively stepping back as organisational development becomes an internal strength',
      ],
      outcome: 'An organisation with the capability to keep developing its own design - evolving as needs change rather than waiting for the next reorganisation.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our organisational design consultancy describe something that goes beyond the new structure. The organisation starts to feel like it was designed to do what it needs to do. Things that were hard become easier. Things that were slow become quicker. Not because people are working harder, but because the system supports them.',
  outcomes: [
    ['An organisation that fits', 'Because the design was created around what the organisation needs to do, not copied from somewhere else'],
    ['Clarity and confidence', 'Because people understand their role, their team, and how they contribute to the bigger picture'],
    ['Better collaboration', 'Because the design was built to enable it, not just hope for it'],
    ['Stronger delivery', 'Because the operating model connects purpose to capability to service'],
    ['An organisation that evolves', 'Because the capability to keep developing the design is built in'],
  ],
  outcomesClosing: 'Good organisational design is not about drawing the perfect chart. It is about creating a living system where structure, operations, culture, and capability all work together to enable the organisation to do its best work.',
  primaryKeyword: 'organisational design consultancy',
  secondaryKeywords: ['organisational design consulting', 'operating model design', 'organisation design', 'organisational structure consultancy', 'designing organisations', 'target operating model'],
  seoTitle: 'Organisational Design Consultancy - Mutomorro',
  seoDescription: 'Organisational design consultancy that designs organisations as living systems - structure, operations, collaboration, and capability working together, not just boxes on a chart.',
},

// ─────────────────────────────────────────────────
// 8. Organisational Purpose Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Organisational Purpose',
  slug: 'organisational-purpose-consultancy',
  category: 'purpose-direction',
  categoryLabel: 'Purpose & Direction',
  order: 2,
  heroHeading: 'Organisational Purpose Consultancy',
  heroTagline: 'Purpose is the most powerful organising force in any organisation. We help you discover it, define it, and embed it into how everything works.',
  contextHeading: 'We know purpose is not a statement on the wall. It is the thread that should run through everything.',
  contextBody: [
    'Most organisations have a purpose statement. Fewer have a purpose that genuinely shapes what happens day to day. The statement exists, but the connection between it and how decisions get made, how priorities are set, and how people experience their work is often weak or invisible.',
    'This is not because the purpose is wrong. It is usually because purpose was treated as a communications exercise rather than an organisational one. The words were crafted carefully, launched with energy, and then gradually drifted to the margins of daily life.',
    'Our organisational purpose consultancy helps you do something different. We help you discover a purpose that genuinely resonates, define it in a way that connects to what your organisation actually does, and embed it into the patterns and practices that shape daily working life. Not a poster. A compass.',
  ],
  propositionCaption: 'Purpose that shapes decisions, not just decorates walls.',
  whyHeading: 'Purpose isn\'t decoration. It\'s direction.',
  whyIntro: 'Purpose is not a nice-to-have. It is a strategic asset. Organisations with clear, embedded purpose make better decisions, attract better people, and deliver more consistently - because everyone shares a reference point for what matters.',
  whyItems: [
    'Purpose-driven organisations grow three times faster than their competitors and enjoy higher employee and customer satisfaction',
    'When purpose is genuinely embedded, it simplifies decision-making at every level - people can judge what to do by asking whether it serves the purpose',
    'The best talent increasingly chooses where to work based on whether the organisation\'s purpose resonates with their own values',
    'Purpose creates organisational resilience - when things get difficult, a shared sense of why you exist holds people together',
    'Without genuine purpose, organisations default to reacting - to markets, to competitors, to whatever feels most urgent',
  ],
  whyBridge: [
    'Whether you are trying to define your purpose for the first time, reconnect with a purpose that has drifted, or embed an existing purpose more deeply into how the organisation works - the question is the same. How do you make purpose the organising force it should be?',
    'That is what organisational purpose consultancy should help you do.',
  ],
  stats: [
    ['3x', 'faster growth in purpose-driven organisations', 'King\'s College London'],
    ['4x', 'higher employee engagement when purpose is embedded', 'McKinsey'],
    ['83%', 'of millennials want to work for purpose-driven organisations', 'Deloitte'],
    ['52%', 'of consumers choose brands based on shared values', 'Edelman'],
  ],
  perspHeading: 'Purpose is the foundation of a healthy ecosystem',
  perspBody: [
    'In any organisational ecosystem, purpose is the foundational force. It is what gives direction to strategy, meaning to culture, coherence to operations, and connection to daily work. When purpose is clear and genuinely embedded, everything else has something to orient around. When it is vague or disconnected, the whole system drifts.',
    'This is why treating purpose as a branding exercise misses the point entirely. Purpose is not about how you present yourself to the world. It is about how your organisation organises itself - what it prioritises, how it allocates resources, what it celebrates, and what it will not compromise on.',
    'Our organisational purpose consultancy works at that deeper level. We help you discover a purpose that resonates genuinely with the people inside your organisation, define it in a way that connects to real work, and embed it into the organisational patterns that shape how things actually happen. When purpose is woven into the ecosystem, it does not need a campaign to keep it alive.',
  ],
  approachIntro: [
    'Every organisation\'s relationship with purpose is different. Some are searching for it. Some have it but it has drifted. Some know it deeply but struggle to make it felt in daily working life. Our organisational purpose consultancy typically moves through four connected areas - discovering what purpose truly resonates, defining it clearly, embedding it into how the organisation works, and building the capability to keep it alive.',
    'These are not rigid stages. Some organisations need to start from scratch. Others need help embedding a purpose they have already articulated. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'Discover what resonates',
      heading: 'Discovering a purpose that genuinely resonates',
      body: [
        'Purpose can only be created in a boardroom up to a point. It needs to be discovered - drawn from what the organisation actually does, what its people genuinely care about, and the impact it has on the world around it. The best purposes are already there, waiting to be articulated. They are found in the stories people tell about why their work matters.',
        'We help you explore what purpose means for your organisation by listening broadly and deeply. Not just to the leadership team, but to the people who deliver the work, the people who benefit from it, and the wider context in which the organisation operates.',
      ],
      practice: [
        'Exploring purpose through conversations at every level of the organisation',
        'Understanding what people genuinely care about and what drew them to this work',
        'Listening to the people your organisation serves - what difference does it make in their lives?',
        'Mapping the gap between stated purpose and lived reality - where is purpose felt and where has it faded?',
      ],
      outcome: 'A genuine understanding of what purpose resonates most deeply - grounded in real stories and real impact, not crafted by a communications team.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Define it clearly',
      heading: 'Defining purpose in a way that connects to real work',
      body: [
        'A purpose statement is only useful if it helps people make decisions, set priorities, and understand how their work contributes to something bigger. Too many purpose statements are beautiful but inert - they inspire for a moment and then fade because they are too abstract to connect to daily reality.',
        'We facilitate a collaborative process to define purpose in a way that is clear, specific, and actionable. Not just what you stand for, but how that translates into what you prioritise, how you make decisions, and what success looks like. The result should be something that every person in the organisation can connect to their own work.',
      ],
      practice: [
        'Collaborative sessions to articulate purpose in clear, meaningful language',
        'Connecting purpose to the practical decisions and priorities that shape daily work',
        'Testing the purpose articulation with people across the organisation - does it resonate? Does it guide?',
        'Developing a framework for how purpose translates into strategy, culture, and operations',
      ],
      outcome: 'A clearly defined purpose that people across the organisation recognise, believe in, and can connect to their daily work.',
    },
    {
      num: '03', title: 'Implement', summary: 'Embed it into how things work',
      heading: 'Embedding purpose into how the organisation actually works',
      body: [
        'This is where most purpose work falls short. The purpose is defined, the launch is done, and then everyone goes back to how things were. Purpose stays on the wall but fades from the work. The missing step is embedding purpose into the organisational patterns that shape daily life - how decisions get made, how priorities are set, how performance is recognised, and how people connect their work to impact.',
        'We work with you to weave purpose into the fabric of the organisation. Not through a campaign, but through practical changes to how things work - so that purpose becomes something people encounter in their daily experience, not just in the annual report.',
      ],
      practice: [
        'Identifying the key organisational patterns where purpose needs to show up - decision-making, resource allocation, performance, recognition',
        'Making practical changes that connect purpose to daily work, not just to communications',
        'Helping leaders embody purpose in how they lead - their priorities, their language, their decisions',
        'Building feedback loops so the organisation can see whether purpose is being lived or drifting',
      ],
      outcome: 'Purpose embedded into the real patterns of organisational life - felt in daily work, not just stated in documents.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep purpose alive',
      heading: 'Building capability to keep purpose alive and evolving',
      body: [
        'Purpose is not a fixed point. As the organisation grows and the world changes, purpose needs to deepen, adapt, and find new expression. The goal is to build the internal capability to keep purpose at the heart of how the organisation works - not as a project that finishes, but as a practice that continues.',
        'We help develop leaders and teams who can steward purpose over time - noticing when it starts to drift, finding new ways to connect it to evolving work, and keeping the conversation about why the organisation exists alive and meaningful.',
      ],
      practice: [
        'Developing leaders\' ability to use purpose as a practical guide for decisions and priorities',
        'Building internal capability for purpose-led facilitation and sense-making',
        'Creating practices for regularly reconnecting with purpose - especially during periods of change',
        'Progressively stepping back as purpose stewardship becomes an internal strength',
      ],
      outcome: 'An organisation where purpose is a living, evolving force - tended by the people inside it, not dependent on external support to keep it alive.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our organisational purpose consultancy describe a shift in coherence. Decisions that used to feel contested become clearer. Priorities that used to compete start to align. People who used to wonder why they are here start to feel it.',
  outcomes: [
    ['Decisions that make sense', 'Because there is a shared reference point for what the organisation is trying to do'],
    ['People who stay and care', 'Because the purpose resonates with them personally and they can see it in their work'],
    ['Strategy that holds together', 'Because purpose provides the foundation that strategy builds on'],
    ['Resilience in difficulty', 'Because a shared sense of why holds people together when things get hard'],
    ['An organisation that attracts', 'Because genuine purpose is visible from the outside and draws the right people in'],
  ],
  outcomesClosing: 'Purpose is not a project. It is the foundation that everything else builds on. When it is genuinely embedded, it makes the whole organisation more coherent, more resilient, and more worth being part of.',
  primaryKeyword: 'organisational purpose consultancy',
  secondaryKeywords: ['defining organisational purpose', 'purpose-driven organisation', 'company purpose strategy', 'purpose beyond profit', 'corporate purpose development'],
  seoTitle: 'Organisational Purpose Consultancy - Mutomorro',
  seoDescription: 'Organisational purpose consultancy that helps you discover, define, and embed genuine purpose - so it shapes decisions, culture, and daily work, not just the website.',
},

// ─────────────────────────────────────────────────
// 9. Strategic Alignment Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Strategic Alignment',
  slug: 'strategic-alignment-consultancy',
  category: 'purpose-direction',
  categoryLabel: 'Purpose & Direction',
  order: 3,
  heroHeading: 'Strategic Alignment Consultancy',
  heroTagline: 'Strategy should be the golden thread running through every decision, every team, every day. We help you align the whole organisation around a shared direction - so strategy is felt everywhere, not filed somewhere.',
  contextHeading: 'We know strategy is only as good as the organisation\'s ability to deliver it.',
  contextBody: [
    'Most organisations have a strategy. Fewer have an organisation that is genuinely aligned to deliver it. The strategy document is clear, the leadership team is bought in, but the connection between strategic intent and what actually happens day to day is often weaker than anyone wants to admit.',
    'This is not a communication problem. You can cascade the strategy perfectly and still find that the organisation\'s patterns - how it makes decisions, how it allocates resources, how teams collaborate, how capability develops - pull in a different direction. When the organisation is not aligned to the strategy, even the best strategy underdelivers.',
    'Our strategic alignment consultancy works at the connection point between strategy and organisation. We help you understand where the gaps are and make practical changes so that purpose, strategy, structure, operations, and culture all pull in the same direction.',
  ],
  propositionCaption: 'Align the organisation to the strategy, not just the leadership team.',
  whyHeading: 'Why strategic alignment matters',
  whyIntro: 'Having a good strategy is not the hard part. Making the whole organisation move in the same direction is. Strategic alignment is what turns intent into reality - connecting what the leadership team has agreed with what actually happens across the organisation every day.',
  whyItems: [
    'Only 28% of leaders believe their organisation is good at executing strategy - the gap between intent and reality is one of the most common leadership frustrations',
    'Misalignment is expensive - it shows up in duplicated effort, competing priorities, confused teams, and slow delivery',
    'When strategy, structure, operations, and culture all point in the same direction, the organisation moves faster with less friction',
    'Strategic alignment is not a one-off exercise - it needs ongoing attention as context changes and the organisation evolves',
    'The organisations that execute well are not necessarily the ones with the best strategies - they are the ones where the whole organisation is set up to deliver',
  ],
  whyBridge: [
    'Whether you have a new strategy that needs embedding, an existing strategy that is not landing, or a feeling that different parts of the organisation are pulling in different directions - the question is the same. How do you get the whole organisation aligned?',
    'That is what strategic alignment consultancy should help you answer.',
  ],
  stats: [
    ['67%', 'of well-crafted strategies fail due to poor execution', 'Harvard Business Review'],
    ['95%', 'of employees do not understand their organisation\'s strategy', 'Kaplan & Norton'],
    ['28%', 'of leaders believe their organisation executes strategy well', 'Bridges Business Consultancy'],
    ['40%', 'of strategic value is lost to poor alignment', 'PMI'],
  ],
  perspHeading: 'Alignment is an ecosystem challenge',
  perspBody: [
    'Strategy does not fail in isolation. It fails because the organisational ecosystem is not set up to deliver it. The structure pulls one way, the culture pulls another, and the operational patterns were designed for a previous strategy that nobody formally retired.',
    'True alignment is not about getting everyone to agree with the strategy. It is about making sure the whole organisational system - structure, operations, culture, capability, and the way people work together - supports the strategic direction. When these elements are aligned, strategy execution feels natural. When they are not, every step forward meets resistance.',
    'Our strategic alignment consultancy takes this systems view. We help you see where the organisation is aligned and where it is not, understand why, and make practical changes that bring the whole system into coherence. Not through a cascade exercise, but through genuine organisational development.',
  ],
  approachIntro: [
    'Every alignment challenge is different. But our strategic alignment consultancy typically moves through four connected areas - understanding where alignment exists and where it breaks down, designing the changes needed to bring the system into coherence, implementing those changes across the organisation, and building the capability to maintain alignment as context evolves.',
    'These are not rigid stages. Some organisations need a full alignment diagnostic. Others know exactly where the gaps are. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See where alignment breaks down',
      heading: 'Understanding where alignment exists and where it does not',
      body: [
        'Most leaders have an instinct for where alignment is missing. They can feel it in the friction, the competing priorities, and the gap between what was agreed and what is happening. But instinct is not enough - you need a clear, shared picture of where the organisation is aligned and where it is not, and why.',
        'We map the relationship between strategic intent and organisational reality. Where does the structure support the strategy and where does it work against it? Where do operational patterns enable delivery and where do they create friction? Where is the culture pulling in the same direction and where is it pulling away?',
      ],
      practice: [
        'Mapping alignment across the organisational ecosystem - structure, operations, culture, capability, and ways of working',
        'Identifying the specific points where the organisation is misaligned with strategic intent',
        'Understanding the root causes of misalignment - not just the symptoms',
        'Building a shared picture across leadership of what genuine alignment would require',
      ],
      outcome: 'A clear map of where the organisation is and is not aligned with its strategy - with agreed priorities for where to focus.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design the changes needed',
      heading: 'Designing the changes that will bring alignment',
      body: [
        'Alignment does not come from telling people what the strategy is. It comes from changing the organisational patterns that pull against it. Some of these changes are structural. Some are operational. Some are cultural. Most involve a combination.',
        'We work with leaders and teams across the organisation to design practical changes that bring the system into coherence. What needs to shift in how the organisation is structured, how it operates, how it develops people, and how it makes decisions to genuinely support the strategic direction?',
      ],
      practice: [
        'Collaborative sessions bringing together leaders and operational teams to design alignment changes',
        'Addressing structural, operational, cultural, and capability dimensions together - not in separate workstreams',
        'Designing changes that are practical and deliverable, not just theoretically right',
        'Building ownership by involving the people who will need to make the changes real',
      ],
      outcome: 'A practical plan for bringing the organisation into alignment - addressing the real patterns that need to shift, not just the communication that needs to improve.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make alignment real',
      heading: 'Making alignment real across the organisation',
      body: [
        'Designing alignment changes is one thing. Making them stick in a complex, busy organisation is another. The day-to-day pressures reassert themselves. Old patterns persist. New approaches take time to bed in.',
        'We support implementation over time, helping leaders stay the course, helping teams adopt new ways of working, and helping the organisation navigate the inevitable tensions that arise when you genuinely try to change how things work.',
      ],
      practice: [
        'Supporting leaders to model aligned behaviour - making decisions and setting priorities that reflect the strategy',
        'Helping teams understand how their work connects to strategic direction and what needs to change',
        'Working through the practical challenges of changing embedded patterns',
        'Tracking alignment across the organisation - not just at the top',
      ],
      outcome: 'An organisation where alignment is felt in daily work - where the connection between strategy and what actually happens is visible and real.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Maintain alignment over time',
      heading: 'Building capability to maintain alignment as things evolve',
      body: [
        'Alignment is not a destination. As the organisation grows and the context changes, new misalignments will emerge. The goal is to build the internal capability to notice, diagnose, and address misalignment as an ongoing practice - not something that requires a consultancy every time.',
        'We help develop leaders who can read the signals of misalignment, teams that can adapt how they work, and organisational practices that keep strategy connected to reality as things evolve.',
      ],
      practice: [
        'Developing leaders\' ability to spot misalignment early and address it constructively',
        'Building internal capability for strategic sense-making and adaptation',
        'Creating practices for regularly checking alignment and making adjustments',
        'Progressively stepping back as alignment stewardship becomes an internal strength',
      ],
      outcome: 'An organisation that can maintain and adapt its strategic alignment over time - noticing when things drift and having the capability to course-correct.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our strategic alignment consultancy describe a clarity that was missing before. The strategy stops feeling like a document and starts feeling like a direction. People at every level can see how their work connects, and the organisation moves with a coherence that was not there before.',
  outcomes: [
    ['A strategy that lands', 'Because the organisation is set up to deliver it, not just to read about it'],
    ['Less friction, more momentum', 'Because the structure, operations, and culture are pulling in the same direction'],
    ['Clearer priorities', 'Because alignment gives people a shared reference point for what matters most'],
    ['Faster execution', 'Because energy goes into delivery, not into navigating competing demands'],
    ['An organisation that adapts together', 'Because alignment is maintained as things change, not lost with every shift in context'],
  ],
  outcomesClosing: 'Strategic alignment is not about control. It is about coherence - making sure the whole organisation is set up to move in the direction it has chosen, together.',
  primaryKeyword: 'strategic alignment consultancy',
  secondaryKeywords: ['aligning strategy and culture', 'strategy execution support', 'connecting strategy to operations', 'strategic alignment programme', 'strategy implementation consultancy'],
  seoTitle: 'Strategic Alignment Consultancy - Mutomorro',
  seoDescription: 'Strategic alignment consultancy that connects strategy to how the organisation actually works - so direction is felt in daily decisions, not just in the strategy document.',
},

// ─────────────────────────────────────────────────
// 10. Organisational Capacity Building
// ─────────────────────────────────────────────────
{
  title: 'Capacity Building',
  slug: 'organisational-capacity-building',
  category: 'people-capability',
  categoryLabel: 'People & Capability',
  order: 3,
  heroHeading: 'Organisational Capacity Building',
  heroTagline: 'We help organisations develop the collective capability they need - not by importing expertise, but by growing it from within.',
  contextHeading: 'We know capacity is not just about skills. It is about whether the organisation can genuinely do what it needs to do.',
  contextBody: [
    'Organisational capacity is the collective ability to deliver. Not just individual skills, but the combination of capabilities, systems, confidence, and practices that allow an organisation to do what it needs to do - reliably, sustainably, and at the scale that matters.',
    'Many capacity building programmes focus on training individuals. Important, but incomplete. An organisation can be full of skilled people and still lack the collective capability to deliver - because the systems, structures, and culture do not support them. The capacity of the organisation is more than the sum of its parts.',
    'Our approach to organisational capacity building works at the system level. We help you understand where capacity is strong and where it falls short, and develop the combination of skills, practices, and organisational conditions that allow people to do their best work together.',
  ],
  propositionCaption: 'Build the organisation\'s capability, not just the individuals\'.',
  whyHeading: 'Why organisational capacity building matters',
  whyIntro: 'Most organisations reach a point where their ambitions outgrow their current capacity. The question is whether you close that gap by importing capability from outside - which creates dependency - or by building it from within, which creates lasting strength.',
  whyItems: [
    'Organisations that invest in building internal capacity are more resilient, more adaptable, and less dependent on external support',
    'Capacity gaps are rarely just about skills - they are about whether the organisation\'s systems, culture, and practices enable people to use the skills they have',
    'When capacity building is done well, it has a multiplying effect - capable people develop other capable people, and the organisation gets stronger over time',
    'Dependency on external expertise is expensive and fragile - building internal capacity creates sustainable capability that grows with the organisation',
    'The organisations that consistently deliver are the ones where capability development is part of how they work, not an occasional investment',
  ],
  whyBridge: [
    'Whether you are facing a specific capability gap, preparing for growth, or building the organisational strength needed to deliver on an ambitious strategy - the question is the same. How do you build lasting capacity?',
    'That is what organisational capacity building should help you do.',
  ],
  stats: [
    ['94%', 'of employees would stay longer if the organisation invested in their development', 'LinkedIn'],
    ['40%', 'of new skills are needed within the next 5 years for existing roles', 'WEF'],
    ['4x', 'more likely to retain talent with strong development culture', 'Deloitte'],
    ['70%', 'of learning happens through experience and practice, not training', '70:20:10 Institute'],
  ],
  perspHeading: 'Capacity is an ecosystem property',
  perspBody: [
    'An organisation\'s capacity is not just the skills of its people. It is the combination of individual capability, team effectiveness, leadership quality, operational systems, learning practices, and cultural conditions that together determine what the organisation can do. These are all connected - building one without the others rarely produces the results you need.',
    'This is why training programmes alone often disappoint. You can develop individuals brilliantly, but if the organisation does not create the conditions for them to apply what they have learned - the autonomy, the support, the systems, the culture - the capacity of the organisation does not actually change.',
    'Our organisational capacity building takes this ecosystem view. We help you develop capability at every level - individual, team, leadership, and organisational - and ensure the conditions exist for that capability to be used. The result is capacity that grows and sustains, rather than fading after the training is over.',
  ],
  approachIntro: [
    'Every organisation\'s capacity needs are different. But our organisational capacity building typically moves through four connected areas - understanding where capacity is strong and where it falls short, designing a development approach that works at every level, building capability through practice, and creating the conditions for ongoing growth.',
    'These are not rigid stages. Some organisations need a full capacity assessment. Others know what they need to build and want to move straight to development. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'Assess capacity honestly',
      heading: 'Understanding where capacity is strong and where it needs building',
      body: [
        'Capacity gaps are not always obvious. Sometimes the issue is clear - the organisation does not have the skills it needs. But often the gap is more subtle. The skills exist but the systems do not support them. The capability is there individually but not collectively. The organisation can perform well today but lacks the capacity to grow.',
        'We assess capacity across the whole system - not just individual skills, but team effectiveness, leadership capability, operational practices, and the organisational conditions that either enable or constrain what people can do.',
      ],
      practice: [
        'Assessing capacity at individual, team, leadership, and organisational levels',
        'Understanding the gap between current capacity and what the organisation needs to be able to do',
        'Identifying the systemic factors - culture, structure, practices - that support or constrain capacity',
        'Building a shared understanding of where capacity building will have the greatest impact',
      ],
      outcome: 'A clear picture of organisational capacity - what is strong, what needs developing, and where the systemic conditions need to change to support growth.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design the development approach',
      heading: 'Designing capacity building that works at every level',
      body: [
        'Effective capacity building works at multiple levels simultaneously. It develops individual skills, strengthens team effectiveness, builds leadership capability, and creates the organisational conditions for all of this to stick. Designing it requires input from the people who understand where the gaps are and what would make the biggest difference.',
        'We work with leaders and teams to design a capacity building approach that fits your context. Not a generic programme, but a tailored combination of development activities, practice opportunities, and systemic changes that together build the capacity the organisation needs.',
      ],
      practice: [
        'Collaborative design involving leaders and the people whose capacity needs developing',
        'Designing development that combines learning, practice, coaching, and on-the-job application',
        'Addressing the organisational conditions alongside the skills - autonomy, support, systems, culture',
        'Building a realistic plan that fits around the real demands of the work',
      ],
      outcome: 'A capacity building approach designed for your specific context - working at individual, team, and organisational levels simultaneously.',
    },
    {
      num: '03', title: 'Implement', summary: 'Build capability through practice',
      heading: 'Building capability through practice, not just learning',
      body: [
        'The most lasting capability is built through doing, not just learning. Real capacity develops when people apply new skills in their actual work, reflect on what happens, and gradually build confidence and competence through practice.',
        'We support capacity building over time, combining facilitated learning with on-the-job application, coaching, and reflection. We are there as people practise, struggle, learn, and grow - providing support without creating dependency.',
      ],
      practice: [
        'Combining facilitated learning with real-world application - not classroom-only',
        'Coaching individuals and teams as they develop new capabilities in practice',
        'Creating structured opportunities for reflection and learning from experience',
        'Building peer support and learning networks so development continues between sessions',
      ],
      outcome: 'Capability built through practice - grounded in real work, supported by coaching and reflection, and growing stronger over time.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Create a learning culture',
      heading: 'Creating the conditions for ongoing growth',
      body: [
        'The ultimate goal of organisational capacity building is an organisation that keeps developing its own capability as a normal part of how it works. Not dependent on external programmes. Not waiting for the next training budget cycle. An organisation where learning, development, and growth are part of the culture.',
        'We help you create those conditions - the practices, the systems, the leadership behaviours, and the cultural norms that keep capability developing long after our involvement ends.',
      ],
      practice: [
        'Developing leaders who actively support and enable capability growth in their teams',
        'Creating organisational practices for continuous learning - reflection, sharing, mentoring, experimentation',
        'Building learning into the rhythm of how the organisation works, not as a separate activity',
        'Progressively stepping back as the learning culture takes root',
      ],
      outcome: 'An organisation with a genuine learning culture - where capability keeps growing because the conditions for development are part of how things work.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with on capacity building describe a shift in confidence. The organisation starts to feel more capable, more adaptable, and more self-sufficient. Problems that used to require external help get solved internally. Challenges that used to feel overwhelming become manageable.',
  outcomes: [
    ['More capable teams', 'Because capability was built collectively, not just individually'],
    ['Less dependency', 'Because the organisation can do more for itself, with its own people'],
    ['Faster adaptation', 'Because capable organisations learn and adjust more quickly'],
    ['Stronger retention', 'Because people who are developing stay longer and contribute more'],
    ['Sustainable growth', 'Because capacity building is ongoing, not a one-off investment'],
  ],
  outcomesClosing: 'Organisational capacity building is about creating an organisation that can do what it needs to do - and keeps getting better at it. That is a much more powerful investment than any individual training programme.',
  primaryKeyword: 'organisational capacity building',
  secondaryKeywords: ['building organisational capability', 'capacity development consultancy', 'leadership capacity building', 'developing organisational capability', 'capability building programme'],
  seoTitle: 'Organisational Capacity Building - Mutomorro',
  seoDescription: 'Organisational capacity building that develops the collective skills, confidence, and systems your organisation needs to deliver on its purpose - sustainably and independently.',
},

// ─────────────────────────────────────────────────
// 11. Organisational Development Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Organisational Development',
  slug: 'organisational-development-consultancy',
  category: 'people-capability',
  categoryLabel: 'People & Capability',
  order: 4,
  heroHeading: 'Organisational Development Consultancy',
  heroTagline: 'We help organisations develop as whole, living systems - improving how they work, how they adapt, and how they grow, from the inside out.',
  contextHeading: 'We know organisational development is about the whole system growing, not just solving today\'s problem.',
  contextBody: [
    'Organisational development is the ongoing practice of making your organisation better at what it does. Not through one-off interventions, but through a sustained, thoughtful approach to improving how the organisation works as a whole - its structure, its culture, its capability, its operations, and the connections between them all.',
    'Many organisations invest in isolated improvements - a restructure here, a training programme there, a culture initiative somewhere else. Each makes sense on its own, but without a systemic view, the improvements do not add up. They can even work against each other.',
    'Our organisational development consultancy takes the wider view. We help you see the organisation as a connected system and develop it holistically - so that improvements in one area reinforce improvements in others, and the whole organisation grows stronger over time.',
  ],
  propositionCaption: 'Develop the whole organisation, not just the parts.',
  whyHeading: 'Why organisational development matters',
  whyIntro: 'The organisations that thrive over time are not the ones that get everything right once. They are the ones that keep developing - that build the ability to grow, adapt, and improve as a continuing practice.',
  whyItems: [
    'Organisations face constant pressure to adapt - to new markets, new technologies, new expectations, and new challenges. The ones that develop well navigate these pressures with less disruption',
    'Isolated improvements often fade because they are not connected to the wider system - organisational development creates change that reinforces itself',
    'When an organisation develops holistically, the individual improvements multiply - better structure enables better operations, which enables better delivery, which strengthens culture',
    'The alternative to ongoing development is periodic crisis-driven transformation - which is more expensive, more disruptive, and less effective',
    'Organisational development builds the muscle for continuous improvement - once developed, it keeps working without requiring heroic effort',
  ],
  whyBridge: [
    'Whether you are preparing for growth, navigating a period of change, or investing in making your organisation fundamentally better at what it does - the question is the same. How do you develop the whole organisation, not just the parts?',
    'That is what organisational development consultancy should help you do.',
  ],
  stats: [
    ['5x', 'return on investment from organisational development', 'CIPD'],
    ['30%', 'improvement in organisational effectiveness with sustained OD', 'McKinsey'],
    ['2x', 'more likely to retain talent in developing organisations', 'Deloitte'],
    ['85%', 'of executives say organisational agility is critical to success', 'McKinsey'],
  ],
  perspHeading: 'Organisational development is ecosystem stewardship',
  perspBody: [
    'Every organisation is a living ecosystem. It has patterns, rhythms, and connections that determine how it works. Organisational development, at its best, is the practice of stewarding that ecosystem - understanding it, nurturing its health, addressing what constrains it, and helping it grow.',
    'Traditional OD often focuses on specific interventions - a team development programme, a leadership assessment, a process improvement initiative. These have value, but they are tools, not the practice itself. The practice of organisational development is about seeing the whole system, understanding how the parts connect, and developing the organisation in a way that creates lasting, compounding improvement.',
    'Our organisational development consultancy brings this ecosystem perspective. We help you develop your organisation as a connected whole - where improvements to structure reinforce improvements to culture, where operational effectiveness enables capability growth, and where the whole system becomes more than the sum of its parts.',
  ],
  approachIntro: [
    'Every organisation is at a different point in its development. Our organisational development consultancy typically moves through four connected areas - understanding the current state of the organisational ecosystem, designing a development approach that addresses the whole system, making improvements real through practice and implementation, and building the internal capability for ongoing organisational development.',
    'These are not rigid stages. Some organisations need a full diagnostic. Others have a clear sense of what needs developing and want to move straight to action. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'Assess the ecosystem',
      heading: 'Understanding the health of your organisational ecosystem',
      body: [
        'Before developing the organisation, you need to understand it - honestly and holistically. Not just the areas that are causing visible problems, but the whole system. Where is it healthy and where is it constrained? What is working well and what needs attention? How do the different parts of the organisation support or undermine each other?',
        'We assess the organisational ecosystem across its key dimensions - purpose, strategy, structure, operations, capability, culture, service delivery, and adaptability. This gives you a clear, shared picture of where the organisation is strong and where development will have the greatest impact.',
      ],
      practice: [
        'Assessing organisational health across all key dimensions of the ecosystem',
        'Understanding the connections and tensions between different parts of the system',
        'Identifying strengths to build on and constraints to address',
        'Building a shared understanding across leadership of where development should focus',
      ],
      outcome: 'A clear picture of organisational health - strengths, constraints, and priorities for development, seen as a connected system.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design the development approach',
      heading: 'Designing an organisational development approach that fits',
      body: [
        'Organisational development is not one-size-fits-all. The right approach depends on where the organisation is, what it needs to achieve, and what it has the capacity to take on. A thoughtful development approach works at multiple levels - individual, team, leadership, and organisational - and ensures that improvements in one area support improvements in others.',
        'We work with you to design an approach that fits your context, your pace, and your ambitions. Not a generic OD programme, but a tailored approach that addresses the specific dimensions of your organisational ecosystem that need attention.',
      ],
      practice: [
        'Collaborative design involving leaders and people from across the organisation',
        'Designing development that addresses multiple dimensions simultaneously - structure, operations, capability, culture',
        'Ensuring improvements are connected so they reinforce each other',
        'Building a realistic, phased approach that accounts for the organisation\'s capacity for change',
      ],
      outcome: 'An organisational development approach designed for your specific context - connected, realistic, and designed to create compounding improvement.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make development real',
      heading: 'Making organisational development real through practice',
      body: [
        'Organisational development is a practice, not a plan. It happens through doing - through trying new approaches, learning from what works, adjusting, and gradually building new patterns. The most effective OD is embedded in the real work of the organisation, not run as a separate programme.',
        'We support implementation over time, working alongside leaders and teams as new practices take root. Some changes happen quickly. Others take time and patience. We help you navigate both, keeping the focus on genuine, sustainable improvement.',
      ],
      practice: [
        'Embedding development into the real work of the organisation, not running it as a separate initiative',
        'Supporting leaders and teams as they adopt new practices and ways of working',
        'Learning from what works and adjusting the approach as the organisation develops',
        'Tracking progress across the whole system, not just individual initiatives',
      ],
      outcome: 'Organisational development that is felt in how the organisation actually works - not just planned, but practised.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Build internal OD capability',
      heading: 'Building your capability for ongoing organisational development',
      body: [
        'The goal of our organisational development consultancy is to make your organisation capable of developing itself. Not dependent on external consultants for every improvement. Not waiting for the next transformation programme. An organisation with the skills, practices, and confidence to keep growing on its own terms.',
        'We help build internal OD capability - leaders who can see the whole system, practitioners who can facilitate development, and organisational practices that keep improvement happening as a normal part of how things work.',
      ],
      practice: [
        'Developing leaders who can read the organisational ecosystem and act on what they see',
        'Building internal capability for facilitation, design, and organisational development practice',
        'Creating rhythms and practices for ongoing development - review, learning, adaptation, experimentation',
        'Progressively stepping back as organisational development becomes an internal strength',
      ],
      outcome: 'An organisation with the internal capability to keep developing itself - growing stronger, more adaptable, and more effective over time, on its own terms.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our organisational development consultancy describe a shift from reactive to intentional. Instead of firefighting problems as they arise, the organisation develops the ability to grow and improve as a practice. It becomes normal, not exceptional.',
  outcomes: [
    ['An organisation that keeps getting better', 'Because development is ongoing, not periodic'],
    ['Improvements that compound', 'Because they are designed as a connected system, not isolated initiatives'],
    ['Greater adaptability', 'Because an organisation that develops well can navigate change more easily'],
    ['Stronger people at every level', 'Because organisational development invests in capability throughout, not just at the top'],
    ['Less need for external intervention', 'Because the capability to develop the organisation is built inside it'],
  ],
  outcomesClosing: 'Organisational development is not a project. It is a practice - the ongoing work of helping an organisation grow, adapt, and improve as a living system. When it is done well, it is the best investment an organisation can make.',
  primaryKeyword: 'organisational development consultancy',
  secondaryKeywords: ['OD consultancy', 'organisational development consulting', 'organisational development strategy', 'OD consulting UK', 'improving organisational effectiveness', 'organisational development programme'],
  seoTitle: 'Organisational Development Consultancy - Mutomorro',
  seoDescription: 'Organisational development consultancy that helps your organisation grow, adapt, and improve as a whole system - not just fix isolated problems.',
},

// ─────────────────────────────────────────────────
// 12. Customer Experience Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Customer Experience',
  slug: 'customer-experience-consultancy',
  category: 'service-experience',
  categoryLabel: 'Service & Experience',
  order: 1,
  heroHeading: 'Customer Experience Consultancy',
  heroTagline: 'The experience your customers have is shaped by how your organisation works behind the scenes. We help you improve CX by improving the system that creates it.',
  contextHeading: 'We know customer experience is not a front-of-house problem. It is a whole-organisation challenge.',
  contextBody: [
    'Most approaches to customer experience focus on the touchpoints - the website, the contact centre, the service interactions. These matter, but they are the visible end of a much bigger system. The experience your customers actually have is shaped by what happens behind the scenes - how teams collaborate, how information flows, how decisions get made, and how well the organisation\'s internal workings support the people delivering the service.',
    'You can redesign every touchpoint beautifully and still deliver a poor experience if the organisation behind it is not set up to deliver. Front-line teams cannot provide a great experience if the systems, processes, and culture do not support them.',
    'Our customer experience consultancy works at both levels. We help you understand the full system that shapes customer experience - from the front line to the back office, from culture to operations - and make practical improvements to the things that will genuinely shift how customers feel about you.',
  ],
  propositionCaption: 'Great customer experience starts inside the organisation.',
  whyHeading: 'Why customer experience matters',
  whyIntro: 'Customer experience is not a department or a programme. It is the sum of every interaction, every impression, and every feeling that your customers have about your organisation. It is shaped by everything you do - and getting it right has a direct impact on loyalty, reputation, and growth.',
  whyItems: [
    'Customers who have a positive experience are far more likely to stay, recommend, and forgive the occasional mistake',
    'The gap between the experience organisations think they deliver and what customers actually feel is consistently wider than leaders expect',
    'Customer experience and employee experience are deeply connected - organisations where people feel valued and supported consistently deliver better CX',
    'Sustainable CX improvement comes from changing how the organisation works, not from adding programmes or technology on top of existing patterns',
    'In sectors where the product or service is similar, experience is the main differentiator - it is what people remember and what drives their choices',
  ],
  whyBridge: [
    'Whether your customer satisfaction scores are declining, complaints are rising, or you simply know the experience could be better - the question is the same. What is really shaping the experience, and what would genuinely shift it?',
    'That is what customer experience consultancy should help you answer.',
  ],
  stats: [
    ['86%', 'of buyers will pay more for a better experience', 'PwC'],
    ['73%', 'say experience is a key factor in purchasing decisions', 'PwC'],
    ['65%', 'of customers find a positive experience more persuasive than advertising', 'PwC'],
    ['4-8%', 'higher revenue in CX-leading organisations', 'Bain'],
  ],
  perspHeading: 'Customer experience is an ecosystem outcome',
  perspBody: [
    'The experience your customers have is not created at the touchpoint. It is created by the organisational ecosystem that sits behind it. The quality of collaboration between teams. The flow of information from front line to decision-makers. The capability of the people delivering the service. The culture that either empowers or constrains them.',
    'This is why CX programmes that focus only on the customer-facing layer often disappoint. You can map every journey, redesign every interaction, and train every front-line team - but if the organisational patterns behind the service do not change, the experience will revert. The front line cannot outperform the system it works within.',
    'Our customer experience consultancy takes this systemic view. We help you see the full picture of what shapes customer experience - from the internal patterns and practices through to the service itself - and make improvements that hold because they address the real drivers, not just the visible symptoms.',
  ],
  approachIntro: [
    'Every organisation\'s customer experience challenges are different. But our customer experience consultancy typically moves through four connected areas - understanding the full system that shapes the experience, designing improvements that address the real drivers, making those improvements real, and building your capability to keep improving independently.',
    'These are not rigid stages. Some organisations have already mapped their customer journey and want to move straight into systemic improvement. Others need to start with a fresh look at what is really happening. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See the full picture',
      heading: 'Understanding the full system that shapes customer experience',
      body: [
        'Customer journey maps show you what the customer sees. They rarely show you why. To genuinely improve customer experience, you need to understand the organisational patterns behind the service - the collaboration habits, the information flows, the capability levels, and the cultural dynamics that shape what customers actually receive.',
        'We go beyond the journey map to understand the whole system. What enables great service and what constrains it? Where are the disconnects between what the organisation intends and what customers experience? What would need to change internally for the external experience to genuinely improve?',
      ],
      practice: [
        'Mapping the full system that shapes customer experience - not just the journey, but the organisational patterns behind it',
        'Listening to customers and front-line teams together - connecting what customers experience with what the organisation does',
        'Identifying the internal patterns that most directly shape the quality of the external experience',
        'Building a shared understanding across leadership of what CX improvement actually requires',
      ],
      outcome: 'A clear picture of what is really shaping customer experience - the internal patterns and practices that need to change, not just the touchpoints that need polishing.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design improvements that stick',
      heading: 'Designing improvements that address the real drivers',
      body: [
        'The most effective CX improvements are the ones that change how the organisation works, not just how the service looks. Redesigning a complaints process is useful. Changing the organisational patterns that generate the complaints in the first place is transformative.',
        'We bring together people from across the organisation - front-line teams, operations, leadership, and wherever possible the customers themselves - to design improvements that address the real drivers of experience. Not just the symptoms. The systemic patterns that create them.',
      ],
      practice: [
        'Collaborative design sessions involving front-line teams, operations, leadership, and customer perspectives',
        'Designing improvements to the internal patterns that most shape external experience',
        'Connecting front-of-house improvements with the back-of-house changes needed to sustain them',
        'Building ownership across the organisation, not just within a CX team',
      ],
      outcome: 'Improvements designed to address the real drivers of customer experience - practical, specific, and connected to the organisational changes that will make them stick.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make improvements real',
      heading: 'Making CX improvements real across the organisation',
      body: [
        'Improving customer experience is not just a front-line project. It requires changes across the organisation - to how teams collaborate, how information moves, how capability is developed, and how the organisation supports the people delivering the service. These changes need time and support to bed in.',
        'We work alongside your teams through implementation, helping the organisation make the internal changes that support external improvement. Some changes are quick. Others require patience as new patterns form. We help you navigate both.',
      ],
      practice: [
        'Supporting implementation across the organisation, not just at the customer-facing layer',
        'Helping teams adopt new collaboration patterns and ways of working that support better CX',
        'Connecting internal changes to external outcomes so people can see the impact of what they are doing',
        'Tracking both customer experience and the internal patterns that drive it',
      ],
      outcome: 'CX improvements that are embedded across the organisation - sustained by the internal changes that make them possible, not dependent on a programme to keep them alive.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep improving from within',
      heading: 'Building your capability to keep improving customer experience',
      body: [
        'Customer expectations do not stand still. The organisations that consistently deliver great experience are the ones that keep getting better - listening, learning, adapting, and improving as a continuous practice. Our goal is to help you build that capability internally.',
        'We develop the skills, practices, and connections that keep CX improving over time. Front-line teams that can identify and act on what customers need. Leaders who understand the connection between how the organisation works and what customers experience. Practices that keep the whole system learning and improving.',
      ],
      practice: [
        'Developing capability across the organisation to notice, understand, and act on customer experience signals',
        'Building connections between front-line insight and organisational decision-making',
        'Creating practices for ongoing CX learning and improvement',
        'Progressively stepping back as CX improvement becomes an internal strength',
      ],
      outcome: 'An organisation that keeps getting better at customer experience - because the capability to listen, learn, and improve is built into how it works.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our customer experience consultancy describe a shift that goes beyond the satisfaction scores. Front-line teams feel more supported. The gap between what the organisation intends and what customers experience starts to close. Improvement becomes ongoing, not occasional.',
  outcomes: [
    ['Customers who feel it', 'Because the improvements are real, not cosmetic - grounded in how the organisation actually works'],
    ['Front-line teams who can deliver', 'Because the organisation behind them is set up to support great service'],
    ['Complaints that reduce', 'Because the patterns that generated them have been addressed, not just the handling process'],
    ['Insight that flows', 'Because what customers experience is connected to how the organisation learns and adapts'],
    ['Experience that keeps improving', 'Because the capability to listen and improve is built in, not dependent on a programme'],
  ],
  outcomesClosing: 'Great customer experience is not about perfecting touchpoints. It is about building an organisation that naturally delivers well - because the system behind the service is healthy, connected, and continuously learning.',
  primaryKeyword: 'customer experience consultancy',
  secondaryKeywords: ['CX consultancy', 'customer experience improvement', 'customer experience strategy', 'improving customer experience', 'customer experience transformation'],
  seoTitle: 'Customer Experience Consultancy - Mutomorro',
  seoDescription: 'Customer experience consultancy that improves CX by working with the organisational patterns that shape it - not by adding another programme on top.',
},

// ─────────────────────────────────────────────────
// 13. Service Design Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Service Design',
  slug: 'service-design-consultancy',
  category: 'service-experience',
  categoryLabel: 'Service & Experience',
  order: 2,
  heroHeading: 'Service Design Consultancy',
  heroTagline: 'We help you design services that genuinely work for the people who use them - by connecting what users need with how your organisation actually delivers.',
  contextHeading: 'We know good service design is not just about the user journey. It is about the organisation that delivers it.',
  contextBody: [
    'Service design has rightly put users at the centre. Understanding what people need, mapping their journeys, prototyping better interactions - this is important work. But a beautifully designed service still fails if the organisation behind it cannot deliver it reliably, adapt it when things change, or sustain it over time.',
    'The gap between the designed service and the delivered service is where most improvement efforts come unstuck. The service looks right on paper, but the organisational reality - team capacity, information flow, operational constraints, culture - means the experience people actually receive falls short of what was intended.',
    'Our service design consultancy bridges that gap. We design services around the people who use them while also working with the organisational system that needs to deliver them. When the service and the organisation are designed together, you get services that work in practice, not just in theory.',
  ],
  propositionCaption: 'Design the service and the organisation to deliver it, together.',
  whyHeading: 'Why service design matters',
  whyIntro: 'Services are how your organisation creates value for the people it serves. How those services are designed - whether they are intuitive, responsive, and genuinely helpful - shapes everything from satisfaction to trust to long-term loyalty.',
  whyItems: [
    'Well-designed services are easier and more satisfying for people to use - and more efficient for the organisation to deliver',
    'Services designed around internal convenience rather than user needs create friction, frustration, and unnecessary demand',
    'Good service design reduces failure demand - the avoidable contacts, complaints, and workarounds that consume resources',
    'In the public sector, service design directly affects people\'s lives - the difference between a service that works for people and one that does not is felt deeply',
    'Services that are designed to learn and adapt keep getting better over time, rather than degrading as context changes',
  ],
  whyBridge: [
    'Whether you are designing a new service, redesigning an existing one, or trying to understand why a service is not working as it should - the question is the same. How do you create a service that genuinely works for the people who use it?',
    'That is what service design consultancy should help you do.',
  ],
  stats: [
    ['80%', 'of organisations believe they deliver a good experience - only 8% of customers agree', 'Bain'],
    ['40%', 'of customer contacts are failure demand - avoidable if the service worked properly', 'Vanguard'],
    ['6x', 'cheaper to fix a service at the design stage than after launch', 'Design Council'],
    ['91%', 'of dissatisfied customers will not return', 'ThinkJar'],
  ],
  perspHeading: 'Services exist within ecosystems',
  perspBody: [
    'A service does not exist in isolation. It is delivered by an organisation - by people working in teams, following processes, using systems, operating within a culture. The quality of the service is shaped by the quality of all of these things. You cannot design a great service without understanding the ecosystem that will deliver it.',
    'This is why user-centred design alone is not enough. Understanding what users need is essential, but designing a response that the organisation can actually deliver - reliably, sustainably, and at the right quality - requires understanding the organisational system as well as the user need.',
    'Our service design consultancy works at this intersection. We bring together user insight and organisational understanding to design services that work for the people who use them and for the organisation that delivers them. When both sides of the equation are designed together, you get services that are not just well-designed on paper but genuinely work in practice.',
  ],
  approachIntro: [
    'Every service design challenge is different. But our service design consultancy typically moves through four connected areas - understanding the service and the system that delivers it, designing improvements that account for both, implementing changes across the service and the organisation, and building your capability to keep improving services over time.',
    'These are not rigid stages. Some organisations need to start with user research. Others already understand their users well and need help redesigning the delivery system. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'Understand users and the delivery system',
      heading: 'Understanding both sides of the service',
      body: [
        'Good service design starts with understanding - but not just understanding the user. You need to understand the whole picture: what people need from the service, how the service currently works, and what the organisational system behind it enables or constrains.',
        'We bring together user research and organisational analysis to build a complete picture. What do people need? What do they currently experience? Where does the service fall short and why? What would need to change - in the service and in the organisation - for the experience to genuinely improve?',
      ],
      practice: [
        'User research that goes beyond satisfaction surveys - understanding real needs, real experiences, and real pain points',
        'Mapping the service delivery system - the people, processes, capabilities, and culture that shape what users actually receive',
        'Identifying where the service fails users and understanding the organisational patterns behind those failures',
        'Building a shared understanding across the organisation of what good service design requires',
      ],
      outcome: 'A clear picture of the service from both sides - what users need and what the organisational system currently delivers, with priorities for where improvement matters most.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design services that work in practice',
      heading: 'Designing services that work for users and the organisation',
      body: [
        'The best services are designed with the people who use them and the people who deliver them. Users bring the perspective of what they actually need. Delivery teams bring the knowledge of what is practically possible. Together, they create designs that are desirable, feasible, and genuinely deliverable.',
        'We facilitate collaborative design sessions that bring these perspectives together. Not just user journey mapping, but end-to-end service design that accounts for the organisational reality behind the service. The result is services designed to work in practice, not just in a prototype.',
      ],
      practice: [
        'Collaborative design involving users, front-line teams, and operational leaders',
        'Designing the service and the delivery system together - not one then the other',
        'Prototyping and testing with real users before committing to full implementation',
        'Ensuring designs are practical and deliverable within the organisational context',
      ],
      outcome: 'A service design that works for the people who use it and the organisation that delivers it - tested, practical, and ready for implementation.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make the new service real',
      heading: 'Making the redesigned service a reality',
      body: [
        'A service design on paper is a hypothesis. Making it real is where you find out what works, what needs adjusting, and what the organisation needs to change to deliver it properly. Implementation is not just launching - it is a learning process.',
        'We support the transition from design to delivery, helping teams adopt new ways of working, helping the organisation make the operational changes needed, and learning from what happens when real users encounter the redesigned service.',
      ],
      practice: [
        'Phased implementation that allows learning and adjustment as the new service goes live',
        'Supporting teams as they adopt new processes, roles, and ways of working',
        'Connecting service improvements to the organisational changes that sustain them',
        'Gathering feedback from users and delivery teams to refine the service in practice',
      ],
      outcome: 'A redesigned service that works in reality - refined through real experience, supported by the organisational changes needed to deliver it well.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep designing better services',
      heading: 'Building your capability to keep designing better services',
      body: [
        'Great services are never finished. They evolve as user needs change, as the organisation develops, and as you learn from what works. The goal is to build the internal capability to keep designing, testing, and improving services as an ongoing practice.',
        'We help develop the skills and practices for continuous service improvement - teams that can listen to users, spot opportunities, design better approaches, and implement improvements without needing external support every time.',
      ],
      practice: [
        'Developing internal service design capability - the skills to research, design, test, and improve',
        'Creating practices for ongoing service learning - gathering insight and acting on it as a rhythm, not a project',
        'Building connections between user insight and organisational decision-making',
        'Progressively stepping back as service design becomes an internal strength',
      ],
      outcome: 'An organisation that keeps designing better services - because the capability to listen, design, and improve is part of how it works.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our service design consultancy describe a shift in how services feel - for users and for the people delivering them. Services become simpler, more responsive, and more satisfying. The organisation behind them works better too.',
  outcomes: [
    ['Services that work for people', 'Because they were designed around real needs, not internal assumptions'],
    ['Less failure demand', 'Because the root causes of complaints and workarounds have been addressed, not just managed'],
    ['Teams that take pride', 'Because delivering a well-designed service feels good - people can see the difference they make'],
    ['Services that learn', 'Because the capability to improve is built in, so services keep getting better'],
    ['Organisation and service aligned', 'Because both were designed together, so the organisation can deliver what it promises'],
  ],
  outcomesClosing: 'Good service design is about more than beautiful blueprints. It is about creating services that genuinely work - for the people who use them and the organisation that delivers them. That requires designing both sides together.',
  primaryKeyword: 'service design consultancy',
  secondaryKeywords: ['service design and improvement', 'public sector service design', 'human-centred service design', 'service redesign consultancy', 'designing better services'],
  seoTitle: 'Service Design Consultancy - Mutomorro',
  seoDescription: 'Service design consultancy that designs services around the people who use them - connecting user needs with organisational capability to create services that genuinely work.',
},

// ─────────────────────────────────────────────────
// 14. Scaling Operations Consultancy
// ─────────────────────────────────────────────────
{
  title: 'Scaling Operations',
  slug: 'scaling-operations-consultancy',
  category: 'service-experience',
  categoryLabel: 'Service & Experience',
  order: 3,
  heroHeading: 'Scaling Operations Consultancy',
  heroTagline: 'Growth is exciting until the way you work stops working. We help organisations scale without losing what made them good in the first place.',
  contextHeading: 'We know scaling is not just about getting bigger. It is about growing without breaking what works.',
  contextBody: [
    'Every growing organisation reaches a point where the way things work stops working. The informal communication that connected everyone breaks down as the team grows. The decision-making that was fast when there were twenty people becomes a bottleneck at fifty. The culture that attracted people starts to dilute. The quality that built your reputation starts to slip.',
    'This is not a failure. It is a natural consequence of growth. The approaches that work for a small organisation do not scale automatically - they need to be deliberately redesigned for the organisation you are becoming, not the one you used to be.',
    'Our scaling operations consultancy helps you navigate this transition. We help you understand what needs to change to support growth and what needs to be preserved, and design the operational foundations, team structures, and practices that will allow you to scale while keeping hold of the things that matter most.',
  ],
  propositionCaption: 'Scale the operations without losing the soul.',
  whyHeading: 'Why getting scaling right matters',
  whyIntro: 'Growth is an opportunity - but only if the organisation can handle it. Scaling poorly does not just slow growth down. It can erode the culture, the quality, and the relationships that made the organisation worth growing in the first place.',
  whyItems: [
    'Organisations that scale well build the foundations before they are urgently needed - the ones that wait until things break spend far more fixing them',
    'The things that make small organisations great - close collaboration, fast decisions, shared purpose - do not survive by accident at scale. They need to be deliberately designed into the new way of working',
    'Scaling without investing in operational foundations creates technical and organisational debt that compounds over time',
    'The best people leave growing organisations not because they do not believe in the mission, but because the way things work has become frustrating',
    'Organisations that get scaling right grow stronger - not just bigger. The culture deepens, the capability grows, and the quality improves',
  ],
  whyBridge: [
    'Whether you are scaling rapidly and things are starting to strain, planning for growth and want to get the foundations right, or looking back at scaling that did not go as well as it could have - the question is the same. How do you grow without losing what makes you good?',
    'That is what scaling operations consultancy should help you answer.',
  ],
  stats: [
    ['74%', 'of start-ups fail due to premature scaling', 'Startup Genome'],
    ['65%', 'of fast-growth companies say culture dilution is their biggest concern', 'Deloitte'],
    ['3x', 'more likely to sustain growth with deliberate operational investment', 'McKinsey'],
    ['50%', 'of growing organisations restructure within 2 years of scaling', 'Bain'],
  ],
  perspHeading: 'A growing organisation is an ecosystem in transition',
  perspBody: [
    'When an organisation grows, everything changes - not just the size. The communication patterns, the decision-making habits, the team dynamics, the operational rhythms, and the culture all need to evolve together. Growth is not just about adding capacity. It is about redesigning how the whole system works for the organisation you are becoming.',
    'The organisations that scale well understand this. They do not just hire more people and hope for the best. They invest in redesigning how work flows, how teams connect, how decisions get made, and how the things that matter most are preserved and strengthened at the new scale.',
    'Our scaling operations consultancy takes this ecosystem approach. We help you see the whole system that needs to evolve, design the operational foundations for the scale you are growing into, and make the transition in a way that preserves what matters - the culture, the quality, and the relationships that make your organisation worth being part of.',
  ],
  approachIntro: [
    'Every scaling journey is different - different pace, different stage, different pressures. But our scaling operations consultancy typically moves through four connected areas - understanding how the current system works and where it is straining, designing the foundations for the organisation you are growing into, implementing the transition, and building the capability to keep adapting as growth continues.',
    'These are not rigid stages. Some organisations are in the middle of rapid growth and need immediate support. Others are planning ahead. We start wherever you are.',
  ],
  stages: [
    {
      num: '01', title: 'Understand', summary: 'See where the strain is',
      heading: 'Understanding where the current way of working is reaching its limits',
      body: [
        'Growth creates strain in predictable places - but the specifics vary for every organisation. Where are decisions getting stuck? Where is communication breaking down? Where is quality slipping? Where are good people getting frustrated? The answers tell you what needs to change and what needs to be preserved.',
        'We map the current organisational ecosystem to understand what is working well and what is straining under growth. This gives you a clear picture of what needs redesigning for the next stage and what should be deliberately protected.',
      ],
      practice: [
        'Mapping how the organisation currently works - communication patterns, decision-making, team dynamics, operational rhythms',
        'Identifying where growth is creating strain and where things are still working well',
        'Understanding what makes the current organisation good - the culture, practices, and relationships worth preserving',
        'Building a shared view across leadership of what scaling well actually requires',
      ],
      outcome: 'A clear picture of the organisation at its current scale - what is working, what is straining, and what needs to evolve for the next stage of growth.',
    },
    {
      num: '02', title: 'Co-design', summary: 'Design for the next stage',
      heading: 'Designing the foundations for the organisation you are growing into',
      body: [
        'Scaling well means designing for the organisation you are becoming, not patching the one you have. The communication patterns, team structures, operational processes, and leadership practices that serve you at twenty people are not the same ones that will serve you at fifty or a hundred.',
        'We work with you to design the operational foundations for the next stage of growth. Not a complete reinvention - you want to keep what works - but a thoughtful evolution that accounts for the realities of a larger, more complex organisation. The key is designing it with the people who understand what makes the organisation work, so nothing essential is lost in the transition.',
      ],
      practice: [
        'Collaborative design sessions involving leaders and operational teams',
        'Designing scalable communication, decision-making, and collaboration patterns',
        'Building team structures and practices that work at the new scale while preserving the culture',
        'Planning the transition so it can happen gradually, not as a disruptive overhaul',
      ],
      outcome: 'Operational foundations designed for your next stage of growth - preserving what matters while building what is needed.',
    },
    {
      num: '03', title: 'Implement', summary: 'Make the transition',
      heading: 'Making the transition to the next stage',
      body: [
        'Scaling is a transition, not a switch. New ways of working need to be introduced while the organisation continues to deliver. Teams need to adapt to new patterns while still doing their jobs. The pace needs to be fast enough to keep up with growth but careful enough not to break what works.',
        'We support the transition over time, helping teams adopt new practices, helping leaders navigate the shift from the old way to the new, and keeping an eye on the things that matter most - the culture, the quality, and the relationships that growth must not erode.',
      ],
      practice: [
        'Introducing new operational patterns gradually, not all at once',
        'Supporting teams as they transition to new ways of working, new structures, and new rhythms',
        'Monitoring the health of the organisation during the transition - culture, quality, and morale',
        'Adjusting the approach as you learn what works at the new scale',
      ],
      outcome: 'A smooth transition to the next stage - with growth supported by new foundations, not undermined by them.',
    },
    {
      num: '04', title: 'Build capability', summary: 'Keep scaling well',
      heading: 'Building the capability to keep scaling well',
      body: [
        'If your organisation is growing, scaling is not a one-off challenge. It is a continuous one. The foundations you build now will need evolving again as you grow further. The goal is to build the internal capability to keep redesigning how you work as you grow - so you are never again caught out by your own success.',
        'We help develop the skills and practices for ongoing organisational evolution. Leaders who can read the signals of growth strain. Teams that can adapt their own ways of working. An organisational culture that treats scaling as a design challenge, not a crisis.',
      ],
      practice: [
        'Developing leaders who can anticipate scaling challenges and design for them',
        'Building internal capability for ongoing operational redesign and adaptation',
        'Creating practices for regularly reviewing how the organisation works as it grows',
        'Progressively stepping back as scaling becomes something the organisation manages itself',
      ],
      outcome: 'An organisation that scales well - not just this time, but every time. Because the capability to evolve the way it works is built into how it operates.',
    },
  ],
  outcomesHeading: 'What becomes possible',
  outcomesIntro: 'Organisations we have partnered with through our scaling operations consultancy describe the moment when growth starts to feel manageable again. The strain eases. The quality returns. The culture deepens rather than dilutes. Growth goes from feeling like a threat to feeling like what it should be - an opportunity.',
  outcomes: [
    ['Growth that feels good', 'Because the organisation is designed for the scale it is reaching, not fighting against it'],
    ['Culture that deepens', 'Because the things that matter were deliberately preserved and strengthened, not left to chance'],
    ['Quality that holds', 'Because the operational foundations support delivery at the new scale'],
    ['People who stay', 'Because the organisation still feels like a place worth being part of, even as it grows'],
    ['Readiness for what comes next', 'Because the capability to keep evolving is built in'],
  ],
  outcomesClosing: 'Scaling well is one of the hardest things an organisation can do. But when it is done with care - preserving what matters, building what is needed, and evolving the whole system together - growth becomes the powerful opportunity it should be.',
  primaryKeyword: 'scaling operations consultancy',
  secondaryKeywords: ['scaling a growing organisation', 'operational scaling strategy', 'scaling without losing culture', 'growing business operations', 'scaling organisation structure'],
  seoTitle: 'Scaling Operations Consultancy - Mutomorro',
  seoDescription: 'Scaling operations consultancy that helps growing organisations scale without losing what made them good in the first place - the culture, the quality, and the way people work.',
},

]

// ─── Generate NDJSON ─────────────────────────────
services.forEach((d, i) => {
  const id = `service-${d.slug}`
  const doc = svc(id, d)
  console.log(JSON.stringify(doc))
})
