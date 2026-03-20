// Batch 5 - Push 5 rewritten courses to Sanity as drafts
// Run: SANITY_TOKEN=your-token node scripts/push-batch5-courses.js

import { createClient } from '@sanity/client';
import readline from 'readline';

const SANITY_PROJECT_ID = 'c6pg4t4h';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

async function getToken() {
  if (process.env.SANITY_TOKEN) return process.env.SANITY_TOKEN;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('Enter Sanity API token (Editor): ', answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const course1Body = [
  {
    "_type": "block",
    "_key": "b6360d3573e7",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "0cd9de32563e",
        "text": "You think you know how your service works. You have process maps, policy documents, and a team that cares about getting it right. But do you know what it actually feels like to be on the receiving end?",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "64ade6eb5c36",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c5397db680a3",
        "text": "User journey mapping closes that gap. It takes you out of the organisational view and puts you in the shoes of the people you serve - following their real experience from first contact to final outcome, seeing every moment of friction, confusion, delay, and delight along the way.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "95425df38739",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "eff882926068",
        "text": "This course teaches your team how to map user journeys properly and use them to improve your services. It is a practical, hands-on day where you will map a real journey from your own organisation and leave with clear priorities for making it better.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "883d14b57798",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "94109a855f51",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "75ed207338c5",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "2d8dec53ca60",
        "text": "You will spend the day mapping a real user journey from your organisation - not a generic template. By the end, you will have a complete picture of what someone actually experiences when they use your service, and a clear plan for improving it.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "35eb6a437ff9",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "8deb25429010",
        "text": "The day covers three practical skills:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f45ba89ec841",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "053dc9fd4eba",
        "text": "Mapping the real experience",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "2da6f73a1e03",
        "text": " - You will learn to map a journey from the user's perspective, not the organisation's. That means capturing what people actually do, think, and feel at each stage - not what the process says should happen. You will learn techniques for building journey maps that reveal the truth, including how to use real user research and feedback to ground the map in evidence.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "bc9189e8652e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "8fa6f9a4129b",
        "text": "Finding the moments that matter",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "37da53995365",
        "text": " - Not every part of a journey is equally important. Some moments shape the entire experience - a confusing first step, a long wait with no information, a handoff where the person has to repeat everything. You will learn to identify these critical moments and understand why they have such a disproportionate impact on how people feel about your service.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8f5e901a812c",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "95e5e949361a",
        "text": "Designing improvements",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "a9b4939ac897",
        "text": " - A journey map on the wall is not the goal. Better services are. You will use your map to identify specific improvements - changes to processes, communications, handoffs, or touchpoints that will make the biggest difference to the people you serve. The improvements you design will be practical, specific, and ready to test.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8740ee8bbefd",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "76e27c7d5849",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "85dc0189165d",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "80158193ace0",
        "text": "This course is for anyone who wants to improve how their organisation serves people - service managers, customer experience teams, service designers, operations teams, policy teams, and anyone involved in designing or delivering services. It works best when a cross-functional group attends together, because the most valuable insights come from seeing how different parts of the organisation affect the same journey.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "efe7d52725ab",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "9b34d1ec5ee6",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "7ebadccc44fd",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "00adcd8e825f",
        "text": "You will leave with a completed user journey map for a real service in your organisation, a prioritised list of improvements, and the skills to run journey mapping exercises with your own teams in the future. You will also have a different way of seeing your service - from the outside in rather than the inside out.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "dee4b5c754ef",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "d3b83b004319",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f8f30fb0f439",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d1b6a6cd6d78",
        "text": "The day is visual and collaborative. You will work in teams, building journey maps on walls using sticky notes and markers. Short input from the facilitator introduces each technique, then you apply it immediately to your real journey. The atmosphere is energetic and participative - this is not a lecture.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "47614975afc4",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "dab77c953383",
        "text": "We keep groups small so everyone contributes and every team gets individual attention.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f4f783f217aa",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "6a6e6673afb2",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "630a798dee8f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "4bd99d588938",
        "text": "A lot of journey mapping training focuses on the mapping itself - the post-its, the swimlanes, the templates. We focus on what the map reveals. The mapping is a means to an end: understanding your service from the perspective of the people who use it and designing something better.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3c795f916aca",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "46d80579b1e3",
        "text": "We also connect journey mapping to the ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "d44025d37a2d",
        "text": "organisational system that delivers the service",
        "marks": [
          "1cc293d4d29d"
        ]
      },
      {
        "_type": "span",
        "_key": "3223a5183aba",
        "text": ". Most journey problems are not caused by bad intentions or lazy people - they are caused by how the organisation is set up. Fixing the journey means understanding and sometimes changing the system behind it. That is where lasting improvement comes from.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "1cc293d4d29d",
        "href": "/services/service-design-consultancy"
      }
    ]
  }
];

const course2Body = [
  {
    "_type": "block",
    "_key": "4351fb200426",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "fcfebf40fca1",
        "text": "Your customers are working too hard. Not because your service is bad - but because somewhere in the system, things are more complicated than they need to be. Forms that ask for the same information twice. Processes that require people to chase progress. Handoffs where context gets lost and people have to start again.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cb7a5a53e682",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b8b05a0e4509",
        "text": "Every unnecessary step, every moment of confusion, every time someone thinks \"why is this so difficult?\" - that is effort your organisation is creating. And effort drives people away. Research consistently shows that reducing effort matters more than delighting people. The organisations that make things easy are the ones people come back to.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d2f24c58d3e9",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "1cd8c3de0dd4",
        "text": "This course helps your team find and remove that unnecessary effort. It is a practical day where you will analyse real services from your organisation, identify where effort is highest, and design specific changes to reduce it.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0f6bbb8d2586",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "d95d3f744bdc",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "86382a147cdb",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ed61579fc930",
        "text": "You will work on real services and processes from your own organisation, using a structured approach to find and fix the effort your customers or service users face.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "63bce2f75707",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5072df1862a3",
        "text": "The day covers three areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "2dc9e0b0b953",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c14084a155d0",
        "text": "Seeing effort from the outside",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "93962dcf5278",
        "text": " - The effort that matters is what the customer experiences, not what the organisation measures. You will learn to identify effort from the user's perspective - where they get stuck, where they give up, where they feel frustrated. This often reveals problems that internal metrics miss entirely, because the organisation measures what it does, not what the person on the other end experiences.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ab9b004fed77",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "610463454488",
        "text": "Understanding why effort exists",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "a292ee38214e",
        "text": " - Most unnecessary effort is not deliberate. It is the result of processes designed around organisational needs rather than user needs, systems that do not talk to each other, or policies that made sense once but have not been updated. You will learn to trace effort back to its root causes in the organisational system - because reducing effort means changing the system, not just adding a friendlier front end.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f7875e4d2c0d",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "dd672d645daa",
        "text": "Designing lower-effort experiences",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "7aada8605119",
        "text": " - With a clear picture of where effort is highest and why, you will redesign specific parts of your service to make things easier. You will learn practical techniques for simplifying processes, reducing handoffs, improving communications, and removing steps that create effort without adding value. The changes you design will be specific and testable.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4e659ecc7077",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "ea913a00b08e",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3a9839fbeecc",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "2c06d5af7437",
        "text": "This course is for anyone responsible for how customers or service users experience your organisation - ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "2b323c24e2fc",
        "text": "customer experience",
        "marks": [
          "07a5251370f9"
        ]
      },
      {
        "_type": "span",
        "_key": "7585f0e756d9",
        "text": " teams, service managers, operations teams, digital teams, and leaders who want to make their services genuinely easier to use.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "07a5251370f9",
        "href": "/services/customer-experience-consultancy"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "b32c01900b4b",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "8110366c8b86",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "653c03d81018",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "731d7aa33308",
        "text": "You will leave with a clear map of where effort is highest in your service, a set of specific changes designed to reduce it, and practical tools for measuring and managing customer effort going forward. You will also have a fundamentally different lens for evaluating your services - one that starts with what the person on the other end actually experiences.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d214b69043b3",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "f14224f8b8f7",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "7605da87dccd",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "fc21132d046b",
        "text": "The day combines analysis and design. You will alternate between structured exercises to identify and diagnose effort, and creative sessions to design improvements. You will work in small teams, ideally with colleagues from different parts of the same service, so you can see the full picture.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9f0c16076f88",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "1803357407ca",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cdfa70dda61a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a1d702660587",
        "text": "Most customer experience training focuses on satisfaction or delight. This course focuses on effort - the thing that research shows actually drives loyalty and retention. Making things easy is not glamorous, but it is what works.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "74c72f39cee3",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "375ad0c8e588",
        "text": "We also look beyond the touchpoints to the ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "9a48faf06f91",
        "text": "operational system behind them",
        "marks": [
          "03da42be11f3"
        ]
      },
      {
        "_type": "span",
        "_key": "acde3d2b320b",
        "text": ". If your contact centre is handling calls that should not need to happen, the fix is not better call handling - it is redesigning the process that generates the calls in the first place. That systems view is what makes the improvements sustainable.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "03da42be11f3",
        "href": "/services/operational-effectiveness-consultancy"
      }
    ]
  }
];

const course3Body = [
  {
    "_type": "block",
    "_key": "cd63fb03c153",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "198f6999ffa0",
        "text": "Your organisation has a purpose statement. It might be on the wall, on the website, on the annual report. But does it actually guide how people make decisions? Does it help when priorities compete? Does every person in the organisation know what it means for their work?",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e1620978e90b",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5cf01775ea2d",
        "text": "If the answer is \"not really\" - you are not alone. Most purpose statements are written for external audiences and then forgotten internally. They sound good but do not do anything. They describe what the organisation is, not what it is for.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "10db42cf8d9a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b71e5c79eb4e",
        "text": "This course is for leadership teams who want a purpose that works - one that is clear enough to guide decisions, specific enough to be useful, and real enough that people across the organisation can connect it to what they do every day.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "36bdb93f4941",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "cb27223ee8da",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "945290b7302f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "dc51faeefb21",
        "text": "You will spend the day working collaboratively as a leadership team to define - or redefine - your organisational purpose. This is not a branding exercise. It is the hard, rewarding work of getting clear on why your organisation exists and what that means in practice.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "7f49d853594b",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "bd663ac0b95c",
        "text": "The day works through three connected challenges:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "7b3e8ec358e3",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5a1dd2204ed3",
        "text": "Understanding what purpose actually is",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "e36c748a7e4c",
        "text": " - Purpose is not a mission statement. It is not a tagline. It is the answer to a fundamental question: what is this organisation for? You will explore the difference between purpose, mission, vision, and values - and why getting them confused leads to statements that sound good but guide nothing. You will look at what genuine, operational purpose looks like in practice.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c2ba15d8d491",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c056bc75d657",
        "text": "Defining your purpose",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "62549825ae4c",
        "text": " - Through facilitated exercises, you will work as a team to articulate your organisation's purpose in clear, specific language. This means being honest about what your organisation actually does and who it serves - not what you aspire to in the abstract. The goal is a purpose statement that is distinctive, credible, and actionable. One that helps you say yes to the right things and no to the wrong ones.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "86f45625968c",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b73d90704b9c",
        "text": "Connecting purpose to decisions",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "ced352b6aba7",
        "text": " - A purpose that lives on the wall is not a purpose. You will work through how your purpose connects to strategic priorities, resource allocation, performance measurement, and daily decision-making. This is where purpose becomes operational - and it is where most organisations stop too soon.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "2c87c118c52d",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "e9c169de8cf9",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f3699d4e2a52",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "81e3f6257005",
        "text": "This course is designed for leadership teams - the group of people who set direction and make decisions that shape the organisation. It works best when the whole leadership team attends together, because defining purpose is a collective act, not something one person writes and others approve.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "16530eb532d6",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "934b3418dc82",
        "text": "It is also valuable for organisations going through a transition - a merger, a restructure, a change of leadership, or a strategic pivot - where the question \"what are we actually for?\" needs a fresh, honest answer.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "395434fecd82",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "33bb0cb408f9",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0fca8f1a10d2",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "76616b3c9f10",
        "text": "You will leave with a clearly articulated organisational purpose that your leadership team has developed together and believes in. You will also have a practical framework for connecting that purpose to how the organisation actually operates - so it becomes something people experience, not just something they read.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "a0af5e9fde51",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "3ce07676e245",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e59597c5a525",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "8633167407fa",
        "text": "This is a facilitated working session, not a presentation. You will work together as a team through a structured process, with the facilitator guiding the conversation and challenging comfortable assumptions. Expect honest discussion, creative exercises, and moments where the conversation gets productively difficult - because defining genuine purpose requires saying what you are not, as well as what you are.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "fb2fe268b4cc",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "c6dc90b3b69e",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "697ec03bc942",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "0c9d2c48b93c",
        "text": "A lot of purpose work produces beautiful language that changes nothing. This course is designed to produce useful language that changes everything. We are not interested in purpose statements that look good on a website. We are interested in purpose that helps people make better decisions every day.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "56cb97b928dc",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "1887fd7cc3f8",
        "text": "We also connect purpose to the wider ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "1b8540f1bbce",
        "text": "organisational system",
        "marks": [
          "6c7e4275d85e"
        ]
      },
      {
        "_type": "span",
        "_key": "7a80f64c2699",
        "text": " - because a purpose that is not embedded in how decisions get made, how resources are allocated, and how success is measured is just words on a wall.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "6c7e4275d85e",
        "href": "/services/organisational-purpose-consultancy"
      }
    ]
  }
];

const course4Body = [
  {
    "_type": "block",
    "_key": "357d751a5511",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a57c05151c6d",
        "text": "Your team does good work. But do they know why it matters? Not in a \"motivational poster\" way - but in a real, practical way that connects their daily effort to something bigger. Do they understand how their work fits into what the organisation is trying to achieve? Do they feel part of something, or just busy?",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f768025ad83e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a183fd7cd763",
        "text": "Shared purpose is what turns a group of people who work together into a team that pulls together. When people understand not just what they do, but why it matters and how it connects, the quality of their work changes. They make better decisions. They collaborate more naturally. They find meaning in even the mundane parts of the job.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8815682881a7",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "50964c62971d",
        "text": "This course helps teams build that connection. It is a practical, facilitated day where your team will explore what shared purpose means for them - not in the abstract, but in the reality of their daily work.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9934152003c2",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "c9ab6a0cbe16",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cbd8f3f3b274",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5c61c949b2a9",
        "text": "You will spend the day as a team, working through exercises designed to build genuine shared understanding of why your work matters and how it connects to the organisation's wider purpose.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "742c59b982ba",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "252ad98bb61b",
        "text": "The day covers three areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "883394e9ee3f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "2256e4f75e87",
        "text": "Understanding the bigger picture",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "70d8046b2d77",
        "text": " - Most people understand their own role but have a fuzzy picture of how it connects to everything else. You will explore how your team's work fits into the wider organisation - what it contributes, who it affects, and why it matters. This is not about reading the strategy document. It is about building a felt understanding of your place in the system.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "85801be60694",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "055f67d0f015",
        "text": "Finding meaning in the work",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "83dd32d8c718",
        "text": " - Purpose is not something imposed from above. It is something people discover in the work they do. You will explore what is genuinely meaningful about your team's work - the impact it has, the difference it makes, the problems it solves. This is often more powerful than any corporate purpose statement, because it is real and specific to your experience.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c881aa70988e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "1dd64c1adf70",
        "text": "Agreeing how to work together",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "cb969c5843b0",
        "text": " - Shared purpose is not just about why. It is about how. You will work together to agree practical commitments - how you will collaborate, how you will make decisions, how you will support each other, and how you will hold each other accountable. These are the everyday expressions of purpose that make the difference between a team that talks about values and a team that lives them.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "dffa37da3b92",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "668505b43bbe",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8de4648b112f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "7362837646a5",
        "text": "This course is for any team that wants to work together more effectively by building a stronger sense of shared purpose. It works for teams of all kinds - project teams, leadership teams, service delivery teams, cross-functional teams, and teams that have recently been brought together through restructuring or reorganisation.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b7e5f3669fb3",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ba2425d1526c",
        "text": "It is particularly valuable for teams going through change, where the question \"what are we here to do?\" needs a fresh collective answer.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0e0ff07ebcd8",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "641e560b9687",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6d95bd1986a5",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "58bfa02389cf",
        "text": "You will leave with a shared understanding of why your team's work matters, a clear picture of how it connects to the wider organisation, and practical commitments for how you will work together going forward. More importantly, you will leave feeling more connected - to each other, to the work, and to the organisation's purpose.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "66e3038fdde9",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "2b36e44d9ca4",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "93cd1dbfed4a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "9f9eea3685e6",
        "text": "This is a team experience, not a training course. The facilitator creates the conditions for honest, productive conversation - using structured exercises, creative activities, and guided discussion. There is no lecture component. The content comes from your team's own experience and insight.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "546de767de05",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "e8dc03f8276e",
        "text": "We keep the atmosphere warm and open. This works best when people feel safe to be honest about what is working, what is not, and what they genuinely care about.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ade835244ce9",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "5a74740a2f63",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "33f6eed93fc8",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "da04c1dd925f",
        "text": "Most team-building focuses on relationships or skills. This course focuses on meaning - the deeper question of why the team exists and what it is trying to achieve together. That foundation makes everything else work better.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8ff5fdaee659",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "1d3d41cc1a32",
        "text": "We also connect team purpose to ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "990b8f853b17",
        "text": "organisational purpose",
        "marks": [
          "c96dcab8c701"
        ]
      },
      {
        "_type": "span",
        "_key": "0102e3b08d04",
        "text": ". A team that has a strong sense of its own purpose but is disconnected from the wider organisation is a team pulling in its own direction. We help you build alignment between what your team cares about and what the ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "c7079c7b179a",
        "text": "organisation needs",
        "marks": [
          "21801494f165"
        ]
      },
      {
        "_type": "span",
        "_key": "9da51ebd9e8c",
        "text": ".",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "c96dcab8c701",
        "href": "/services/organisational-purpose-consultancy"
      },
      {
        "_type": "link",
        "_key": "21801494f165",
        "href": "/services/organisational-development-consultancy"
      }
    ]
  }
];

const course5Body = [
  {
    "_type": "block",
    "_key": "8dbf94d98477",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "49d36babb8ee",
        "text": "Your organisation delivers services. But do you know what the people you serve actually value? Not what you think they should value. Not what your strategy says they value. What they genuinely care about - the things that make them think \"this is worth my time, my money, my trust.\"",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "995303cc37b8",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5f0eee9bc77d",
        "text": "Most organisations define value from the inside out. They start with what they offer and assume people want it. But value is defined by the person receiving the service, not the person delivering it. When you understand that distinction - really understand it - it changes how you design everything.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "671938525d2f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ebddfe4fdcf2",
        "text": "This course helps your team get clear on what value means to the people you serve, and use that understanding to make your services genuinely better. It is a practical day where you will work on real services from your own organisation.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0015f162cd06",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "04de65cd740a",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1ee7884ba4e3",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "dc80f9913ceb",
        "text": "You will spend the day exploring what value means in the context of your specific services - and using that understanding to identify where you are delivering value well, where you are falling short, and where you are spending effort on things that do not matter to the people you serve.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d33283ca0927",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "9565416b8f6b",
        "text": "The day covers three areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "91a4f18689fc",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "95271d498e5b",
        "text": "Understanding value from the outside in",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "5127193d13dc",
        "text": " - You will learn to see value through the eyes of your customers or service users. What do they actually need? What matters most to them? What are they willing to accept less of? You will use practical research techniques to build a picture of value that is grounded in evidence, not assumption. This often produces surprises - because what organisations think people value and what people actually value are frequently different things.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "960a8f95ccb1",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "282f09b45450",
        "text": "Mapping value and waste",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "b324355ca9e9",
        "text": " - Armed with a clear picture of what your users value, you will map your current services against it. Where are you delivering genuine value? Where are you creating waste - spending time and resource on things that do not matter to the people you serve? Where are you under-delivering on the things that matter most? This mapping exercise creates a clear, honest picture of how well your services are aligned with what people actually need.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3ed61b3cad4b",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "4785f7cc236f",
        "text": "Redesigning around value",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "9e05fe911371",
        "text": " - With a clear map of where value is being created and where it is being lost, you will redesign elements of your service to deliver more of what matters and less of what does not. You will learn practical techniques for reallocating effort, simplifying processes, and focusing resource where it will make the biggest difference to the people you serve.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ebccef9cc560",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "af7dbd9edc14",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "5acc7857daea",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "06e99c813d81",
        "text": "This course is for anyone involved in designing or delivering services - ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "b063e4c849d2",
        "text": "service design",
        "marks": [
          "e628854f1a10"
        ]
      },
      {
        "_type": "span",
        "_key": "a570c79c69f8",
        "text": " teams, operations teams, ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "a738dc198e50",
        "text": "customer experience",
        "marks": [
          "4ab4f8a03b8a"
        ]
      },
      {
        "_type": "span",
        "_key": "b7397e70bd57",
        "text": " teams, product teams, and leaders who want their organisation to be more focused on what actually matters to the people they serve.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "e628854f1a10",
        "href": "/services/service-design-consultancy"
      },
      {
        "_type": "link",
        "_key": "4ab4f8a03b8a",
        "href": "/services/customer-experience-consultancy"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "7cf50df26b63",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "330857486b60",
        "text": "It is particularly useful for organisations that suspect they are spending effort in the wrong places - doing a lot of work that feels busy but does not translate into better outcomes for the people they serve.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "949daa65ba8f",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "ec1833685c6f",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "7ad9f4656e66",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "60a5fabaa42e",
        "text": "You will leave with a clear understanding of what value means to the people you serve, a map of where your current services are aligned (and misaligned) with that value, and specific improvements designed to close the gap. You will also have a practical framework for continuing to test and refine your understanding of value over time.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3b319c4bf10c",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "e2376c92a4bc",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "a6c4ef90cd1e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "9eaf54081d4b",
        "text": "The day combines research, analysis, and design. You will alternate between exercises that build understanding of user value and exercises that apply that understanding to your real services. You will work in teams, ideally with colleagues from different parts of the service delivery chain.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e911b1a36d9b",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "a78c0c867c20",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c2f166bd3998",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "75a494f41103",
        "text": "A lot of service improvement starts with efficiency - how do we do this faster or cheaper? This course starts with value - how do we do more of what matters? That is a fundamentally different starting point, and it often leads to different conclusions. Sometimes the most efficient process is not the most valuable one. We help you find the right balance.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ae86bcf82780",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "7dbbab9ff60a",
        "text": "We also connect value to the wider system. What your organisation values internally (efficiency, compliance, control) and what your users value (ease, speed, reliability, humanity) are often in tension. Understanding and navigating that tension is where the real improvement happens - and it is connected to how your whole ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "9e78e57af064",
        "text": "organisation is set up to deliver",
        "marks": [
          "1d3bbc318317"
        ]
      },
      {
        "_type": "span",
        "_key": "7a7bdbcfbd95",
        "text": ".",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "1d3bbc318317",
        "href": "/services/customer-experience-consultancy"
      }
    ]
  }
];

const courses = [
  {
    id: 'course-user-journey-mapping-workshop',
    title: 'User journey mapping training',
    slug: { _type: 'slug', current: 'user-journey-mapping-training' },
    category: 'service-experience',
    seoTitle: 'User Journey Mapping Training | Mutomorro',
    seoDescription: 'User journey mapping training that teaches your team to see your service through the eyes of the people who use it - then design something better. Practical, collaborative, and built around your real services.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-service-design-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-customer-experience-consultancy', _key: 'rs2' },
    ],
    body: course1Body,
  },
  {
    id: 'course-reducing-customer-effort-workshop',
    title: 'Reducing customer effort',
    slug: { _type: 'slug', current: 'reducing-customer-effort' },
    category: 'service-experience',
    seoTitle: 'Reducing Customer Effort Training | Mutomorro',
    seoDescription: 'Training that helps your team identify and remove the unnecessary effort your customers and service users face. Practical, evidence-based, and focused on your real services.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-customer-experience-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-operational-effectiveness-consultancy', _key: 'rs2' },
    ],
    body: course2Body,
  },
  {
    id: 'course-aligning-organisational-purpose',
    title: 'Defining organisational purpose',
    slug: { _type: 'slug', current: 'defining-organisational-purpose' },
    category: 'purpose-direction',
    seoTitle: 'Defining Organisational Purpose Training | Mutomorro',
    seoDescription: 'A practical course for leadership teams who want to define - or redefine - their organisational purpose. Collaborative, grounded, and focused on a purpose that guides real decisions.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-organisational-purpose-consultancy', _key: 'rs1' },
    ],
    body: course3Body,
  },
  {
    id: 'course-building-shared-purpose-teams',
    title: 'Building shared purpose in teams',
    slug: { _type: 'slug', current: 'building-shared-purpose-in-teams' },
    category: 'purpose-direction',
    seoTitle: 'Building Shared Purpose in Teams | Mutomorro',
    seoDescription: 'A practical course for teams who want to connect around a shared sense of purpose - understanding why their work matters and how it connects to what the organisation is trying to achieve.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-organisational-purpose-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-organisational-development-consultancy', _key: 'rs2' },
    ],
    body: course4Body,
  },
  {
    id: 'course-defining-leveraging-value-workshop',
    title: 'Defining value in service delivery',
    slug: { _type: 'slug', current: 'defining-value-in-service-delivery' },
    category: 'service-experience',
    seoTitle: 'Defining Value in Service Delivery | Mutomorro',
    seoDescription: 'A practical course that helps your team understand what value really means to the people you serve - and redesign your services to deliver more of it with less waste.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-customer-experience-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-service-design-consultancy', _key: 'rs2' },
    ],
    body: course5Body,
  },
];

async function main() {
  console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
  console.log('\u2551  Batch 5 - Push 5 rewritten courses to Sanity    \u2551');
  console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n');

  const token = await getToken();
  if (!token) { console.error('No token provided.'); process.exit(1); }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token,
    useCdn: false,
  });

  let success = 0;
  let failed = 0;

  for (const course of courses) {
    try {
      await client
        .patch(course.id)
        .set({
          title: course.title,
          slug: course.slug,
          category: course.category,
          seoTitle: course.seoTitle,
          seoDescription: course.seoDescription,
          relatedServices: course.relatedServices,
          body: course.body,
        })
        .commit();
      console.log(`\u2713 ${course.title}`);
      success++;
    } catch (err) {
      console.log(`\u2717 ${course.title}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
  console.log('Review drafts in Sanity Studio before publishing.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
