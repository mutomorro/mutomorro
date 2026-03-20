'use client'

import { useState } from 'react'
import Link from 'next/link'

const dimensions = [
  {
    key: 'es',
    letter: 'E',
    name: 'Embedded Strategy',
    slug: 'embedded-strategy',
    colour: '#FF707C',
    tagline: 'The golden thread from ambition to action',
    description: "When strategy is truly working, you\u2019d never know it was there. Nobody stops mid-decision to check the strategy - and yet, across different teams and levels, people keep making choices that pull in the same direction. Not because they\u2019ve been told to, but because something about what matters here has become part of how they think.",
    lensQuestion: 'If you removed every strategy document and presentation, would people still know what to prioritise - and would they prioritise the same things?',
    questions: [
      'Can you trace a line from your biggest ambition to what someone worked on this morning?',
      'When two projects compete for the same resources, does the decision get made against strategic criteria - or by who escalates fastest?',
      'Ask five people in different teams what the top three priorities are. How many different answers do you get?'
    ]
  },
  {
    key: 'mw',
    letter: 'M',
    name: 'Momentum through Work',
    slug: 'momentum-through-work',
    colour: '#FFAC51',
    tagline: "Where people\u2019s energy actually goes",
    description: "Momentum is what happens when the balance shifts - when work itself generates forward motion, and finishing one thing naturally sets up the next. It\u2019s the difference between organisations where the system works with people and those where friction quietly absorbs the energy people came here to spend on the actual work.",
    lensQuestion: "When your people finish a day\u2019s work, have they spent their energy on the thing they were hired to do - or on everything that surrounds it?",
    questions: [
      'If you followed a piece of work from start to finish, where would it stall - and why?',
      'When you ask people what slows them down, do they point to the work itself - or to everything that surrounds it?',
      "How much of people\u2019s time goes on coordinating, chasing, and getting permission versus actually doing the work?"
    ]
  },
  {
    key: 'ev',
    letter: 'E',
    name: 'Evolving Service',
    slug: 'evolving-service',
    colour: '#FFC23B',
    tagline: 'Getting better at the thing you exist to do',
    description: "Evolution is a better word than innovation for what matters here. Not an organisation that launches new things, but one whose relationship with the people it serves is alive and developing. Where there\u2019s a genuine feedback loop between what you deliver and how it lands - and where that learning actually changes what happens next.",
    lensQuestion: 'Is what you deliver today meaningfully better than what you delivered two years ago - and can you trace that improvement back to something you learned from the people you serve?',
    questions: [
      'When did what you deliver last change because of something you learned from the people you serve?',
      "When a frontline team knows something isn\u2019t working, what happens to that knowledge?",
      'Do people talk about what they deliver in terms of the people on the receiving end - or in terms of the process of delivering it?'
    ]
  },
  {
    key: 'rp',
    letter: 'R',
    name: 'Resonant Purpose',
    slug: 'resonant-purpose',
    colour: '#A7D957',
    tagline: 'Purpose you can feel before anyone explains it',
    description: "There\u2019s a gap that shows up time and again - between purpose as something an organisation has and purpose as something it runs on. The organisations that feel different are the ones where purpose has reached a kind of resonance. People amplify it through their own choices because it connects to something they already care about.",
    lensQuestion: 'Does your purpose travel through the organisation under its own power - or does it need to be carried?',
    questions: [
      'How far from the boardroom can you go before purpose stops influencing what happens?',
      'If your purpose disappeared from every document overnight, what would actually change about how you work?',
      'When purpose and pragmatism pull in different directions, which wins - and how do people feel about it?'
    ]
  },
  {
    key: 'gc',
    letter: 'G',
    name: 'Generative Capacity',
    slug: 'generative-capacity',
    colour: '#3AD377',
    tagline: 'An organisation that builds its people, not uses them up',
    description: "The question isn\u2019t how much capability your organisation has - it\u2019s whether it produces it. Whether the system generates capability as a natural byproduct of how it operates, or whether it quietly consumes it, leaving people a little more depleted than when they arrived. Generative organisations feel fundamentally different.",
    lensQuestion: 'Are your people more capable now than when they joined - and did the work itself do that, or did it happen despite the work?',
    questions: [
      "If your three most knowledgeable people left tomorrow, what would the organisation lose that it couldn\u2019t replace?",
      "When someone struggles with something new, is the instinct to support them - or to route the work to whoever can do it fastest?",
      'Do teams emerge from projects stronger than they went in - or just more tired?'
    ]
  },
  {
    key: 'ec',
    letter: 'E',
    name: 'Enacted Culture',
    slug: 'enacted-culture',
    colour: '#00C3D8',
    tagline: "What people do when no one\u2019s written a rule for it",
    description: "Culture is not values printed on a poster. It\u2019s the accumulated product of leadership behaviour, shared norms, historical events, and thousands of small daily interactions. Culture will always tell the truth about an organisation, even when nothing else does. It\u2019s the only dimension that can\u2019t be faked.",
    lensQuestion: "If a new starter spent their first week just watching what happens - never reading a single document - what would they conclude this organisation actually values?",
    questions: [
      'What gets someone promoted here - and is that the same thing the values statement would predict?',
      'When values and expediency conflict on a routine Tuesday - not the high-profile moment - which wins?',
      'When someone raises a difficult truth, what happens to them? Not on paper. In practice.'
    ]
  },
  {
    key: 'nc',
    letter: 'N',
    name: 'Narrative Connections',
    slug: 'narrative-connections',
    colour: '#5A70C2',
    tagline: "The stories that travel when no one\u2019s managing the message",
    description: "Both words are doing work. Narrative - not communication, not information - because it\u2019s meaning that matters, not just messages. And connections - not channels, not flows - because this is about relationships, not infrastructure. You can build the most sophisticated communication channels in the world and still have no narrative connection.",
    lensQuestion: "Can people in different parts of your organisation tell a coherent story about where you\u2019re heading and why - and do those stories connect?",
    questions: [
      'When something significant happens, how does your organisation make sense of it?',
      'When a significant decision is made, do people across the organisation understand the reasoning - or just the outcome?',
      'When something goes wrong, does the story travel accurately - or does it distort into rumour and blame?'
    ]
  },
  {
    key: 'tc',
    letter: 'T',
    name: 'Tuned to Change',
    slug: 'tuned-to-change',
    colour: '#755E7F',
    tagline: 'The difference between adapting and surviving',
    description: "An organisation tuned to change isn\u2019t braced for it, or resilient against it, or managing it. It\u2019s calibrated to sense and respond to shifting conditions as a natural way of operating. Change isn\u2019t an event to be survived. It\u2019s the medium the organisation moves through - and has always moved through.",
    lensQuestion: 'When the unexpected happens, does your organisation adapt - or does it seize up while it waits for someone to produce a change plan?',
    questions: [
      'The last time something unexpected happened, did the organisation adapt - or did it wait for someone to write a plan?',
      'When people talk about change, is the language one of possibility or one of exhaustion?',
      "Is there confidence that leadership will be straight about what\u2019s changing and why - or do people brace for spin?"
    ]
  }
]

export default function DimensionExplorer() {
  const [activeTab, setActiveTab] = useState('es')

  const activeDim = dimensions.find(d => d.key === activeTab)

  return (
    <div className="de-container">
      {/* Tab row */}
      <div className="de-tab-row">
        {dimensions.map(dim => (
          <button
            key={dim.key}
            className={`de-tab-button${activeTab === dim.key ? ' active' : ''}`}
            style={{ '--active-color': dim.colour }}
            onClick={() => setActiveTab(dim.key)}
          >
            <span className="de-tab-letter" style={{ color: dim.colour }}>{dim.letter}</span>
            <div className="de-tab-indicator" />
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="de-panel" key={activeTab} style={{ '--active-color': activeDim.colour }}>
        <div className="de-panel-inner">
          {/* Left column */}
          <div className="de-panel-left">
            <h2 className="de-dim-name" style={{ color: activeDim.colour }}>{activeDim.name}</h2>
            <div className="de-tagline">{activeDim.tagline}</div>
            <p className="de-description">{activeDim.description}</p>
            <div className="de-lens-question">
              <span className="de-lens-label">The lens question</span>
              {activeDim.lensQuestion}
            </div>
          </div>

          {/* Right column */}
          <div className="de-panel-right">
            <div className="de-questions-label">Questions worth asking</div>
            <ul className="de-question-list">
              {activeDim.questions.map((q, i) => (
                <li key={i} className="de-question-item">{q}</li>
              ))}
            </ul>
            <div className="de-panel-explore">
              <Link href={`/emergent-framework/${activeDim.slug}`} className="de-explore-link">
                Explore {activeDim.name}
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
