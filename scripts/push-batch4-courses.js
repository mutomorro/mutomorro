// Batch 4 - Push 5 rewritten courses to Sanity as drafts
// Run: SANITY_TOKEN=your-token node scripts/push-batch4-courses.js
//
// Uses patch (not createOrReplace) to preserve heroImage and other existing fields.
// Creates a draft for each course - review in Sanity Studio before publishing.

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

// ─── Course bodies (Portable Text) ──────────────────────────────────────────

const course1Body = [
  {
    "_type": "block",
    "_key": "7fc70c4a8e30",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "38ae478ef003",
        "text": "You know something is not working. Tasks take longer than they should. Work gets stuck between teams. People have built workarounds that nobody questions any more. But when you try to explain the problem, it is hard to pin down - because nobody can see the whole picture.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "2bce90ca396a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "19ca9676a7ea",
        "text": "That is what process mapping gives you. A way to make the invisible visible - to lay out how work actually flows through your organisation, see where it gets stuck, and design something better.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "377f07b86f65",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "6076f6d8531f",
        "text": "This course teaches your team to do exactly that. It is a practical, hands-on day where you will map a real process from your own organisation and leave with a clear picture of how it works, where the problems are, and what to do about them.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f60fe7b3a9a6",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "d4a4934323db",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9d52ffe5be15",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "f1c7690ebd0b",
        "text": "You will spend the day working on a real process from your organisation - not a textbook example. By the end, you will have a complete map of how it works today, a clear view of where it breaks down, and a redesigned version that removes the friction.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cc7b42730878",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "e7561bd66cac",
        "text": "The day is built around three practical skills:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "393b40b42803",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "25b3bf6eb1b6",
        "text": "Seeing the whole flow",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "2c4c86b1d785",
        "text": " - Most people only see their part of a process. Process mapping puts the whole thing on the wall - every step, every handoff, every decision point. You will learn to map end-to-end flows using simple, visual techniques that anyone can follow. No special software needed.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f88764ebd594",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ee9dc42e5e5e",
        "text": "Finding the problems",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "a6678bd38d57",
        "text": " - Once you can see the whole flow, the problems become obvious. Steps that add no value. Handoffs where information gets lost. Loops where work goes back and forth. You will learn to spot these patterns and understand why they exist - because fixing a symptom without understanding the cause just moves the problem somewhere else.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "be2e0f487bbb",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "4608d0bb55b6",
        "text": "Designing a better process",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "5e475d3eea9b",
        "text": " - Mapping is not the goal. Improvement is. You will redesign your process to remove waste, simplify handoffs, and create a flow that works for the people who use it. You will leave with a future-state map and a practical plan for making the changes.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c571a0726315",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "95db731936ef",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0739d5dcb682",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "e3569956bedc",
        "text": "This course works well for teams who are responsible for how work gets done - operations managers, team leaders, project managers, improvement leads, and anyone who regularly thinks \"there must be a better way to do this.\"",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "87ad81c2f492",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c36b055a2016",
        "text": "It is particularly useful when a whole team attends together, because the mapping exercise works best when the people who actually do the work are in the room. They know where the real problems are - and they will own the improvements.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "66b67f961ee4",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "76024ebbc868",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "24edd04217b0",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "266bacec8d71",
        "text": "You will leave with a completed current-state process map for a real process in your organisation, a future-state design showing how it could work better, and a practical improvement plan with specific actions. You will also have the skills and confidence to run process mapping exercises with your own team in the future.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1ad2c2f2fb68",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "9fa3494aea15",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "78b9fc7095bf",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "689bb3ae4ebe",
        "text": "The day alternates between short input from the facilitator, hands-on mapping exercises, and group discussion. You will work in small teams throughout, using simple visual tools - sticky notes, markers, and wall space. We keep groups small so everyone gets the chance to work through their specific challenges.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "16a0e7fd2aa6",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ac654fd081f1",
        "text": "We draw on a range of established process improvement approaches, adapted to fit your context. The focus is always on practical application - you work on your real processes, not theoretical examples.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0167d77f0be2",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "a7e4c7bb3c37",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "92fa0eebab18",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "3a9ba77f8abc",
        "text": "Most process mapping training teaches you how to draw a diagram. This course teaches you how to see a system. The mapping is a tool, not the end point. We help you understand why the process works the way it does - the organisational patterns, the team dynamics, the historical decisions that created the current flow - so the improvements you design actually stick.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "a58df5ea9a3e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "734a30319edc",
        "text": "We also connect process mapping to the bigger picture of how your ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "3dd7b393081a",
        "text": "organisation works as a whole system",
        "marks": [
          "db163d96d181"
        ]
      },
      {
        "_type": "span",
        "_key": "92f0889d521e",
        "text": ". A process does not exist in isolation. How it connects to other processes, other teams, and other priorities matters as much as the steps within it.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "db163d96d181",
        "href": "/services/operational-effectiveness-consultancy"
      }
    ]
  }
];

const course2Body = [
  {
    "_type": "block",
    "_key": "214a29ff5553",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5469bac415c2",
        "text": "Your processes have grown over time. What started as something simple has collected extra steps, extra approvals, extra handoffs - each one added for a good reason at the time, but together they have made everything slower and more complicated than it needs to be.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "33882c696519",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "90f0f830a358",
        "text": "Lean process design is about stripping things back. Removing the steps that do not add value. Simplifying the ones that do. Designing processes that flow - quickly, smoothly, and with less effort for everyone involved.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "301cadf4d286",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d0319c6d206b",
        "text": "This course teaches your team how to do that. It is a practical day where you will take a real process from your organisation, identify what is adding value and what is not, and redesign it using lean principles.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c46b4d42736c",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "8540b3aa84bc",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "bb395b3ef8b8",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "fcb0d42e930f",
        "text": "You will spend the day working on a real process that matters to your organisation. The focus is on learning by doing - you will apply lean thinking directly to something you deal with every day.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b19591f74708",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "282882abf427",
        "text": "The day covers three core areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9a9c0c7e3c11",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "31f42258ee6d",
        "text": "Understanding value",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "685e364ba83c",
        "text": " - Lean starts with a simple question: what does the person at the end of this process actually need? Every step that helps deliver that is value. Everything else is waste. You will learn to look at your process through this lens - which is often surprisingly different from how it feels when you are in the middle of it.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b7587f1a3150",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "68a720c6e223",
        "text": "Spotting waste",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "b084fbdd95ee",
        "text": " - Lean identifies specific types of waste that slow processes down: waiting, rework, unnecessary movement, overprocessing, and more. You will learn to recognise these patterns in your own processes. Once you start seeing them, you cannot unsee them - and that is the point. You will also learn to look beyond the obvious symptoms to the ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "17fff61e5072",
        "text": "systemic patterns that create waste",
        "marks": [
          "6e737e848f3a"
        ]
      },
      {
        "_type": "span",
        "_key": "bf7060c34dec",
        "text": " in the first place.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "6e737e848f3a",
        "href": "/tools/8-wastes-of-lean"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "7e92c20aaccb",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b4d20039a314",
        "text": "Designing leaner processes",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "24e719eeb1d0",
        "text": " - With waste identified, you will redesign your process to be simpler, faster, and easier to follow. You will learn practical techniques for reducing batch sizes, shortening handoff chains, and creating flow. The goal is not perfection on paper - it is a realistic improved design that your team can start implementing.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0bb50753efd5",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "006c89d96553",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9ee332bdc5f4",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "17d03ad963d3",
        "text": "This course is for teams who want to improve how their processes work - operations teams, service delivery teams, project teams, and improvement practitioners. It works best when people from across a process attend together, because lean design needs the perspective of everyone involved, not just the people at one end.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "62cef96828ff",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "e4ab2abf909b",
        "text": "No prior knowledge of lean is needed. The principles are straightforward and the exercises are practical.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "46d775c56612",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "ae98c28af1a4",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b641a71a2fd9",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a1893c84cffe",
        "text": "You will leave with a redesigned version of a real process, stripped of unnecessary waste and ready to test. You will also have a practical understanding of lean principles that you can apply to any process going forward - and the confidence to facilitate lean improvement exercises with your own teams.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e578f3136374",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "9770e2e3f4ec",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9f7ddd0df1ed",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d2f3b1be710b",
        "text": "The day is hands-on throughout. Short input on lean principles alternates with practical exercises where you apply them directly to your chosen process. You will work in small groups, sharing insights and learning from each other's processes.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "71e9cfda0b49",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ff7ce79c88fa",
        "text": "We draw on globally recognised lean approaches - including the ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "6667dd131aba",
        "text": "Kaizen Cycle",
        "marks": [
          "50b717a5fd37"
        ]
      },
      {
        "_type": "span",
        "_key": "680812930af2",
        "text": " and value stream thinking - but we adapt them to your context rather than following a rigid methodology. The goal is understanding, not certification.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "50b717a5fd37",
        "href": "/tools/kaizen-cycle"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "a08cea85bd9c",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "93a5ff446755",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "49861b98b9d0",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "f211aefff868",
        "text": "A lot of lean training focuses on manufacturing examples and technical terminology. This course is designed for any organisation - public sector, charity, corporate - and uses plain language throughout. The principles are the same. The application is yours.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "366056df575a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c9188375738e",
        "text": "We also take a systems view. Lean improvements that focus on one process without considering how it connects to everything else can create problems elsewhere. We help you see the wider picture so your improvements work ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "d12889f7630e",
        "text": "across the whole system",
        "marks": [
          "119ce3a7f7b4"
        ]
      },
      {
        "_type": "span",
        "_key": "8e2f2b413852",
        "text": ", not just in one corner of it.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "119ce3a7f7b4",
        "href": "/services/operational-effectiveness-consultancy"
      }
    ]
  }
];

const course3Body = [
  {
    "_type": "block",
    "_key": "79eea769db46",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5cab218d9567",
        "text": "Work is not flowing the way it should. Things take too long. People chase approvals that should not be needed. Information gets stuck between teams. Everyone is busy, but the output does not match the effort going in.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0cdc7c46ae14",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "8e9941ef09ad",
        "text": "These are workflow problems - and they are some of the most common frustrations in any organisation. The good news is that most of them are fixable, once you can see them clearly.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "a8140065955f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "273501c2aa2b",
        "text": "This course teaches your team to find and fix workflow problems systematically. It is a practical day where you will analyse a real workflow from your organisation, identify what is slowing it down, and design specific improvements.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c1ec1f476108",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "047c661e6d40",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f170be6f908a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "018ce09808f7",
        "text": "You will work on a real workflow that is causing problems in your organisation. Not a textbook scenario - something that actually matters to your team.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b28ec0df7b55",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b123610262f1",
        "text": "The day is structured around three practical challenges:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "bb48dabe7a64",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "4c4e5f5af3f0",
        "text": "Diagnosing the bottlenecks",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "87d6fac173df",
        "text": " - Most workflow problems have a small number of root causes that create a large amount of friction. You will learn to identify these bottlenecks - the points where work piles up, slows down, or gets stuck. You will map the workflow as it actually operates (not how it is documented) and use simple analytical techniques to find the real constraints.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1a02faa87423",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d89af2584f11",
        "text": "Understanding the causes",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "8a0c0858f11a",
        "text": " - Bottlenecks exist for reasons. Sometimes it is a capacity problem. Sometimes it is a handoff problem. Sometimes it is an approval step that made sense five years ago but no longer serves a purpose. You will learn to dig into why workflows break down, not just where - because the fix depends on the cause.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cc2c09d9702e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a0c47135fcd9",
        "text": "Designing improvements",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "2a09f88472de",
        "text": " - With a clear diagnosis, you will redesign the workflow to remove bottlenecks, reduce friction, and create smoother flow. You will learn practical techniques for simplifying approvals, improving handoffs, reducing waiting time, and balancing workload across teams. The improvements you design will be specific, practical, and ready to test.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "80da3804575d",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "52ff69482012",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e4fdf26706c3",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d547344f3c9c",
        "text": "This course is for anyone who is responsible for how work flows through their team or organisation - operations managers, team leaders, service managers, project managers, and improvement leads. It works particularly well when people from different parts of the same workflow attend together, because the biggest improvements often happen at the boundaries between teams.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "436754318039",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "19f5a8dbced4",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9d9de2c193ac",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ca0f77288032",
        "text": "You will leave with a clear diagnosis of what is slowing your workflow down, a redesigned workflow with specific improvements, and a plan for testing those improvements. You will also have practical skills for analysing and improving workflows that you can use again and again.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0e092b062230",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "2fc23209ef2e",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "38009aa90977",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c440c7ba109a",
        "text": "The day is built around practical exercises. Short input on workflow analysis techniques leads into hands-on work on your real workflow, with group discussion to share insights and challenge assumptions. You will work in small teams throughout.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b4e3b7ffe226",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d36c651cec21",
        "text": "We bring together approaches from lean thinking, ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "5738239405f6",
        "text": "process mapping",
        "marks": [
          "fbf2c8b5fc99"
        ]
      },
      {
        "_type": "span",
        "_key": "9b25d668522e",
        "text": ", and systems analysis - choosing the right technique for each situation rather than following a single methodology.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "fbf2c8b5fc99",
        "href": "/courses/process-mapping-training"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "52ff341d0af9",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "b44f2bc86a3c",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "036943d9a5da",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "925d2a1afa8c",
        "text": "Most workflow improvement focuses on the workflow itself - the steps, the sequence, the timing. That matters, but it is not the whole picture. Workflows exist within an ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "a28cf70779ca",
        "text": "organisational system",
        "marks": [
          "a369dbd0da06"
        ]
      },
      {
        "_type": "span",
        "_key": "f287176efde7",
        "text": ". How teams are structured, how decisions get made, how information flows between departments - all of these shape how work moves. We help you see and address the wider patterns, not just the immediate steps.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "a369dbd0da06",
        "href": "/services/organisational-design-consultancy"
      }
    ]
  }
];

const course4Body = [
  {
    "_type": "block",
    "_key": "5b4542f0fb85",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "71039bb6a954",
        "text": "Your organisation solves problems. But does it get better? There is a difference. Solving problems is reactive - something goes wrong, you fix it, you move on. Getting better is proactive - you look for ways to improve before things go wrong, and you build that habit into how your team works every day.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ecd56759ee40",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "dc51eceb3585",
        "text": "That is what continuous improvement is about. Not a one-off programme. Not a transformation initiative with a deadline. A way of working where noticing what could be better and doing something about it is just normal.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "521004712ef8",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "983f36de9f0d",
        "text": "This course teaches your team how to build that habit. It is a practical day where you will learn the core principles and tools of continuous improvement, apply them to real challenges in your organisation, and leave with a plan for making improvement part of your team's rhythm.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b9ca8d601c4b",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "e03b83262467",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4e247890efa2",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "97b1e99507a7",
        "text": "The day is built around learning by doing. You will work on real challenges from your own team, using proven improvement approaches to find practical solutions.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1f7f4568e38f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a97c9e375c3e",
        "text": "Three areas structure the day:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1bdc10239fdd",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "26448a5c2ad2",
        "text": "Seeing improvement opportunities",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "04a6da899646",
        "text": " - The first skill of continuous improvement is noticing. What could work better? Where is effort being wasted? What frustrates your team or the people you serve? You will learn simple techniques for surfacing improvement opportunities - from team retrospectives to process observation to customer feedback analysis. The goal is to make seeing opportunities a daily habit, not a special event.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "713bf71fc6bd",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "7feb812c1d73",
        "text": "Using improvement tools",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "2e2aa2fa241c",
        "text": " - There are excellent, well-tested tools for turning observations into action. You will learn how to use the ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "da21456f76ec",
        "text": "Kaizen Cycle",
        "marks": [
          "93fdec1a75df"
        ]
      },
      {
        "_type": "span",
        "_key": "c9f2f6dda8b7",
        "text": " for small, rapid improvements, ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "953e969eba7d",
        "text": "PDCA",
        "marks": [
          "cd52ea8d11db"
        ]
      },
      {
        "_type": "span",
        "_key": "abb1d686140f",
        "text": " for testing changes before scaling them, and ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "8170824308a1",
        "text": "DMAIC",
        "marks": [
          "800ec383df44"
        ]
      },
      {
        "_type": "span",
        "_key": "9b04a79f7472",
        "text": " for tackling larger, data-driven problems. We do not teach these as abstract frameworks - you will apply each one to a real issue during the session.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "93fdec1a75df",
        "href": "/tools/kaizen-cycle"
      },
      {
        "_type": "link",
        "_key": "cd52ea8d11db",
        "href": "/tools/pdca-cycle"
      },
      {
        "_type": "link",
        "_key": "800ec383df44",
        "href": "/tools/dmaic"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "0eb29f3df909",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a522653dbce4",
        "text": "Building improvement into your rhythm",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "bb4b06d9b00c",
        "text": " - Individual improvements are good. A team that improves continuously is transformational. You will design a practical rhythm for your team - regular check-ins, improvement boards, learning reviews - that keeps improvement happening week after week without adding bureaucracy. The best continuous improvement practices are lightweight and energising, not heavy and draining.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b7aafc2da164",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "9a5121053bdc",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6ad15f1d7479",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "7a0c8a2cd4e6",
        "text": "This course is for teams who want to get better at getting better. It works well for operations teams, service teams, project teams, and any group that delivers work together and wants to improve how they do it. Team leaders and managers benefit particularly, because building improvement habits depends on leadership as much as technique.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "20eb6c69ffae",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "fdf13d9083b1",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6608b677ab73",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "3e9131d12a6d",
        "text": "You will leave with practical improvement tools you can use straight away, a completed improvement project on a real challenge from your team, and a plan for building continuous improvement into your team's regular rhythm. You will also have a shared language and approach that makes improvement feel like a natural part of the work, not something extra on top.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "730eae967637",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "e18587b4ebb0",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "19e64cff4a75",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "74edb7386c84",
        "text": "The day alternates between short input on improvement principles, hands-on exercises where you apply them, and reflection on what is working. You will work in small groups, sharing challenges and solutions with other teams. The facilitator brings a range of ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "71f384deaff2",
        "text": "globally recognised improvement approaches",
        "marks": [
          "4a45605a2cc2"
        ]
      },
      {
        "_type": "span",
        "_key": "964b09314b21",
        "text": ", adapted to fit your context.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "4a45605a2cc2",
        "href": "/services/operational-effectiveness-consultancy"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "42332775484a",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "85b13fe365c6",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "47ca56281a7d",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "254f40da6919",
        "text": "A lot of continuous improvement training comes from a manufacturing background and can feel like it belongs in a factory, not an office, a school, or a public service. This course is designed for any organisation. The principles are universal. The examples and exercises are tailored to your world.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d0325ae9de64",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "67eefcde822b",
        "text": "We also connect continuous improvement to the bigger picture. Improvement is not just about fixing processes - it is about building an ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "a0124755a406",
        "text": "organisation that keeps getting better",
        "marks": [
          "dc2632ccd34d"
        ]
      },
      {
        "_type": "span",
        "_key": "b8f82eda4ae4",
        "text": " as a way of working. When improvement becomes part of the culture, the benefits compound over time.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "dc2632ccd34d",
        "href": "/services/organisational-development-consultancy"
      }
    ]
  }
];

const course5Body = [
  {
    "_type": "block",
    "_key": "957013fef377",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "0cebb771bd47",
        "text": "You have a problem to solve - a service that is not working, a process that frustrates people, a product that is not landing the way you hoped. You have tried the usual approaches - meetings, reports, incremental tweaks - but nothing has shifted the fundamental issue.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4d2ee1b3c363",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "f3c761f6bd7c",
        "text": "Design thinking offers a different starting point. Instead of beginning with what the organisation wants to deliver, you begin with what the people you serve actually need. You watch, you listen, you understand their real experience - and then you design solutions around that.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cbe873507879",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "7bc6b3304712",
        "text": "This course teaches your team how to use design thinking on real challenges. It is a practical, creative day where you will work through the full design thinking process and leave with a tested prototype for a genuine problem in your organisation.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "cc3722a0a202",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "73baf31c328f",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1edb0c8aa4a0",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "9d1e6021c57b",
        "text": "You will work on a real challenge from your organisation - a service, a process, or an experience that needs improving. The day takes you through the full design thinking cycle:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f4e8d7978e98",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b4a272144786",
        "text": "Understanding the people",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "9c07a66149ae",
        "text": " - Good design starts with empathy. You will learn techniques for understanding the real experience of the people your work affects - customers, service users, colleagues, or communities. Not what you think they need. Not what they say on a survey. What they actually experience, feel, and struggle with. This is often the most eye-opening part of the day.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "64b25279f5ee",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b5a436a589b3",
        "text": "Defining the real problem",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "c176a2cb7d5c",
        "text": " - Most organisations jump to solutions too quickly. Design thinking slows you down at the right moment - helping you define the problem properly before trying to fix it. You will learn to reframe challenges from the user's perspective, which often reveals that the real problem is different from the one you started with.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d34ab89c8080",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "204a7d7f138b",
        "text": "Generating and testing ideas",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "64b83c4de9a4",
        "text": " - With a clearly defined problem, you will generate a wide range of possible solutions - deliberately pushing beyond the obvious first ideas. Then you will build rapid prototypes and test them. Not polished proposals. Quick, rough versions that let you learn fast and cheaply whether an idea works before investing in building it properly.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "257dedf3b823",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "031f88f92c3d",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "34017a90cb70",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "26763d7cd8b7",
        "text": "This course is for anyone who solves problems that affect people - service designers, product teams, policy teams, operations teams, customer experience teams, and leaders who want their organisation to think differently about how it designs and delivers.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4fe32534492e",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d0f818ce93e2",
        "text": "It is particularly valuable for teams who are stuck - who have tried conventional approaches and need a fresh perspective. No design background is needed. Design thinking is a way of approaching problems, not a specialist discipline.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "042f0f42e4ed",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "8d0064c3f4d9",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "a7c29e8c021b",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "99bfb6fa831e",
        "text": "You will leave with a tested prototype for a real challenge, a clear understanding of the design thinking process, and practical skills you can apply to any problem where understanding people matters. You will also have a shared language and approach that helps your team tackle future challenges more creatively and collaboratively.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "42fc81fffef2",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "98c669071fdc",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "a3dd1ffeda46",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5dab7ca73312",
        "text": "This is a creative, energetic day. You will move between research exercises, group brainstorming, rapid prototyping, and user testing. The pace is deliberately fast - design thinking works best when you think with your hands and test ideas quickly rather than deliberating endlessly. We keep groups small and the atmosphere collaborative.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "2e561a2738da",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "f48b378c84c3",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6197e5887bdf",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "0ffc40c4fe51",
        "text": "Design thinking has become fashionable, which means a lot of training treats it as a set of steps to follow. We treat it as a way of seeing. The empathy phase is not a box to tick - it is the foundation everything else rests on. And we connect design thinking to the organisational system that has to deliver whatever gets designed. A brilliant idea that your ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "018b29ba34c1",
        "text": "organisation cannot sustain",
        "marks": [
          "09697f006382"
        ]
      },
      {
        "_type": "span",
        "_key": "8cc30a0bf5d5",
        "text": " is not a solution - it is a frustration. We help you design things that work in practice, not just in a workshop.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "09697f006382",
        "href": "/services/service-design-consultancy"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "2edc72c5ed63",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "26b1f47f0273",
        "text": "We also connect design thinking to the wider challenge of building a ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "5d048fe4b9c1",
        "text": "customer-centred organisation",
        "marks": [
          "6565bcf3d449"
        ]
      },
      {
        "_type": "span",
        "_key": "33086e923643",
        "text": " - because one workshop is a start, but real change comes when this way of thinking becomes part of how your organisation approaches every problem.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "6565bcf3d449",
        "href": "/services/customer-experience-consultancy"
      }
    ]
  }
];

// ─── Course definitions ─────────────────────────────────────────────────────

const courses = [
  {
    id: 'course-introduction-to-process-mapping-workshop',
    title: 'Process mapping training',
    slug: { _type: 'slug', current: 'process-mapping-training' },
    category: 'structure-operations',
    seoTitle: 'Process Mapping Training | Mutomorro',
    seoDescription: 'Practical process mapping training that teaches your team to see how work really flows - then design something better. Hands-on, collaborative, and built around your real processes.',
    relatedServices: [{ _type: 'reference', _ref: 'service-operational-effectiveness-consultancy', _key: 'rs1' }],
    body: course1Body,
  },
  {
    id: 'course-simple-lean-process-design-workshop',
    title: 'Lean process design training',
    slug: { _type: 'slug', current: 'lean-process-design-training' },
    category: 'structure-operations',
    seoTitle: 'Lean Process Design Training | Mutomorro',
    seoDescription: 'Lean process design training that helps your team strip out waste and design simpler, faster ways of working. Practical, hands-on, and focused on your real processes.',
    relatedServices: [{ _type: 'reference', _ref: 'service-operational-effectiveness-consultancy', _key: 'rs1' }],
    body: course2Body,
  },
  {
    id: 'course-workflow-optimisation-workshop',
    title: 'Workflow optimisation training',
    slug: { _type: 'slug', current: 'workflow-optimisation-training' },
    category: 'structure-operations',
    seoTitle: 'Workflow Optimisation Training | Mutomorro',
    seoDescription: 'Workflow optimisation training that helps your team find and fix the bottlenecks, friction, and wasted effort in how work gets done. Practical, collaborative, and focused on your real workflows.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-operational-effectiveness-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-organisational-design-consultancy', _key: 'rs2' },
    ],
    body: course3Body,
  },
  {
    id: 'course-continuous-improvement-training-for-teams',
    title: 'Continuous improvement training',
    slug: { _type: 'slug', current: 'continuous-improvement-training' },
    category: 'structure-operations',
    seoTitle: 'Continuous Improvement Training | Mutomorro',
    seoDescription: 'Continuous improvement training that helps your team build a habit of getting better - not through big transformation programmes, but through practical, ongoing improvements that add up over time.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-operational-effectiveness-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-organisational-development-consultancy', _key: 'rs2' },
    ],
    body: course4Body,
  },
  {
    id: 'course-introduction-to-design-thinking-workshop',
    title: 'Design thinking training',
    slug: { _type: 'slug', current: 'design-thinking-training' },
    category: 'service-experience',
    seoTitle: 'Design Thinking Training | Mutomorro',
    seoDescription: 'Design thinking training that teaches your team to solve problems by starting with the people affected. Practical, creative, and focused on your real challenges.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-service-design-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-customer-experience-consultancy', _key: 'rs2' },
    ],
    body: course5Body,
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Batch 4 - Push 5 rewritten courses to Sanity    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

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
      console.log(`✓ ${course.title}`);
      success++;
    } catch (err) {
      console.log(`✗ ${course.title}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
  console.log('Review drafts in Sanity Studio before publishing.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
