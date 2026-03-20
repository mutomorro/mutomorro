// Batch 6 - Push 4 rewritten courses + 1 SEO polish to Sanity as drafts
// Run: SANITY_TOKEN=your-token node scripts/push-batch6-courses.js

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
    "_key": "e2bac81a2b03",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "3c8225ab766e",
        "text": "Every organisation is a system. Not a machine with separate parts - a living system where everything connects. How teams collaborate affects how services are delivered. How decisions flow affects how quickly things change. How knowledge moves affects how capable the organisation becomes.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "490aaeb448de",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "791fa76d1443",
        "text": "Systems thinking is the skill of seeing these connections. Instead of looking at problems in isolation, you learn to see the patterns that connect them - the feedback loops, the unintended consequences, the leverage points where a small change can make a big difference.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9246ec05b255",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c056cedebeed",
        "text": "This course teaches your team to think in systems. It is a practical day where you will learn core systems thinking tools and apply them directly to real challenges in your organisation.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "87b01905aa3a",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "a77d74feb179",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d5b1ff47ad26",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "51e5a09a14ae",
        "text": "You will spend the day learning to see your organisation differently - not as a collection of departments and processes, but as an interconnected system. You will apply systems thinking tools to real challenges from your own work.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "24f456fe6017",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "466794ce93b4",
        "text": "The day covers three areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d18f7f3f77fb",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "86dad642bb06",
        "text": "Seeing the system",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "28fba079f321",
        "text": " - Most problems look simple until you see what is connected to them. You will learn to map the systems around a challenge - identifying feedback loops, delays, and connections that are not obvious from inside the problem. A team that is struggling with delivery might be dealing with a workload issue - or it might be a symptom of something structural three levels away. Systems thinking helps you tell the difference.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6c833e5621ee",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5ee456bcd1b7",
        "text": "Understanding patterns",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "af39fa89466c",
        "text": " - Organisations tend to fall into recognisable patterns. Growth that creates its own constraints. Quick fixes that make the underlying problem worse. Success in one area that quietly undermines another. You will learn to recognise these patterns using ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "758f7ea95571",
        "text": "system archetypes",
        "marks": [
          "d6cf6a61c783"
        ]
      },
      {
        "_type": "span",
        "_key": "3f43e2234764",
        "text": " - powerful diagnostic tools that help you see why the same problems keep recurring.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "d6cf6a61c783",
        "href": "/courses/system-archetypes-training"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "cb071c61e286",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "8d0a21c47d24",
        "text": "Finding leverage",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "6fb2e456930d",
        "text": " - In any system, there are points where intervention has a disproportionate effect. Systems thinking helps you find them. Instead of pushing harder on something that is not working, you learn to find the places where a different kind of intervention will shift the whole pattern. This is the difference between solving a problem and changing the system that produces it.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "5d5833545538",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "d4758eebc424",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d5d3cf309501",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "6ef47416626a",
        "text": "This course is for leaders, managers, and change practitioners who want to understand how their organisation really works - and use that understanding to make better decisions. It is particularly valuable for people who find themselves dealing with problems that keep coming back, initiatives that do not deliver what was expected, or improvements in one area that seem to create problems in another.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0e0f6de5c6b0",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "fdba50bee986",
        "text": "No prior knowledge of systems thinking is needed. The concepts are powerful but accessible - we teach them through practical application, not academic theory.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9d142428f847",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "c1b562df4fd0",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "5ed16df5dbd6",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "3720e00e00cb",
        "text": "You will leave with a practical toolkit for systems thinking that you can apply immediately - causal loop diagrams, systems maps, and archetype recognition. You will also have a different way of seeing your organisation that makes complex problems feel more navigable. Most importantly, you will have applied these tools to a real challenge during the session, so you know they work in your context.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "df0d765da290",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "57848e94caf7",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e446f128d162",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "bccc3619a33f",
        "text": "The day alternates between short input on systems thinking concepts and hands-on exercises where you apply them to real organisational challenges. You will work in small groups, mapping systems, identifying patterns, and finding leverage points together. The facilitator draws on a wide range of systems thinking approaches, adapted to fit your context.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d0225118f925",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "9dae10232db9",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6355fcf2b1cf",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "74a44af30690",
        "text": "A lot of systems thinking training stays abstract - interesting ideas that are hard to apply. This course is relentlessly practical. Every concept is taught through application to real challenges. You will not just learn about feedback loops - you will map the ones operating in your organisation right now.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "810d010047d6",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b6ccce099a82",
        "text": "We also connect systems thinking to action. Seeing the system is not enough. You need to know what to do with what you see. We help you move from diagnosis to intervention - finding the leverage points where change will actually shift the pattern, not just treat the symptoms. That connection between seeing and acting is what makes systems thinking ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "a13041ef30de",
        "text": "genuinely useful for organisational change",
        "marks": [
          "2218e6997d08"
        ]
      },
      {
        "_type": "span",
        "_key": "d9f3625b8f0c",
        "text": ".",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "2218e6997d08",
        "href": "/services/organisational-development-consultancy"
      }
    ]
  }
];

const course2Body = [
  {
    "_type": "block",
    "_key": "2c756e058830",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "384fc6df5d11",
        "text": "The same problems keep happening. You fix them, they come back. You improve one thing, something else gets worse. Teams are working hard, but the organisation keeps falling into the same traps.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8ba3e3103aa5",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "8d7fd5321d75",
        "text": "These are not random frustrations. They are system archetypes - recognisable patterns that organisations fall into again and again. Once you can see them, you can break out of them. And that changes everything about how you lead and how you solve problems.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "f71221d57dc6",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "dc0add8ae318",
        "text": "This course teaches your team to recognise and work with system archetypes. It is a practical day where you will learn to identify the patterns operating in your organisation and design interventions that actually shift them.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "07c87872491e",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "9eef754a92a7",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "e9c58b66eeac",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "28eba587a5e4",
        "text": "You will spend the day learning to see the hidden patterns that shape how your organisation behaves - and working out what to do about them. You will apply archetype thinking to real challenges from your own work.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "5b8c6f0e5a97",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "76b21b1df5fc",
        "text": "The day covers three areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c4187e775485",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "810b6b0cf9d3",
        "text": "Recognising the patterns",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "78e0926ba93d",
        "text": " - There are a handful of system archetypes that explain a remarkable number of organisational problems. Fixes that backfire. Success that creates its own limits. Shifting the burden from the real problem to a symptomatic fix. You will learn to recognise these patterns in action - not as abstract diagrams, but as living dynamics you can see in your own organisation.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d89aa5331e14",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "3de6b147a76a",
        "text": "Diagnosing your challenges",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "46610a39d5e9",
        "text": " - Armed with the archetypes, you will look at real challenges in your organisation through a new lens. That initiative that lost momentum? It might be a \"limits to growth\" pattern. That quick fix that made things worse? Classic \"fixes that fail.\" You will map the archetype operating behind a real challenge, which often reveals that the solution everyone has been pursuing is actually reinforcing the problem.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "c3a92429b9a2",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "117696809289",
        "text": "Designing archetype-aware interventions",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "fff2d32f8a0b",
        "text": " - Once you can see the pattern, you can design interventions that work with it rather than against it. Each archetype has known leverage points - places where intervention breaks the pattern rather than feeding it. You will learn these leverage strategies and apply them to your specific challenges, designing practical actions that address the systemic pattern, not just the visible symptom.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "1502b87a3e78",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "238ebac553e8",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "48e9104aea80",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b787b59ba665",
        "text": "This course is for leaders, strategists, and change practitioners who want a deeper understanding of why organisations behave the way they do. It builds naturally on ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "fd2f1a0d0080",
        "text": "systems thinking fundamentals",
        "marks": [
          "633b66d40a65"
        ]
      },
      {
        "_type": "span",
        "_key": "e27caaa7d603",
        "text": " but can also be taken as a standalone course - we cover the essential systems thinking concepts as we go.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "633b66d40a65",
        "href": "/courses/systems-thinking-training"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "af98d1cbf05b",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "f3f88d031a11",
        "text": "It is particularly valuable for people who are frustrated by recurring problems, failed initiatives, or improvements that do not stick. Archetypes often explain why - and more importantly, they show you what to do differently.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3af3ec8bb074",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "34c84fe55e59",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8d32255fe8e0",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b6e8cea98cdb",
        "text": "You will leave with the ability to recognise the most common system archetypes in organisational life, a diagnosis of at least one archetype operating in your own organisation, and a practical intervention strategy designed to shift it. You will also have a shared language with your colleagues for talking about systemic patterns - which is surprisingly powerful in its own right.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d5a0ce7a1eb1",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "a16c2db7ffe5",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "53cc20a1b7e9",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "e4939a86c957",
        "text": "The day combines conceptual input with hands-on diagnosis and design. Each archetype is introduced with real-world examples, then you look for it in your own organisation. The afternoon focuses on designing interventions - practical actions that target the leverage points in your specific archetype. You will work in small groups throughout.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "32c01d16723d",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "e823945afc76",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "0a19c4eef730",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "f2cf32079eb2",
        "text": "System archetypes are often taught as academic concepts - interesting to learn about but hard to apply. This course is built entirely around application. Every archetype is taught through the lens of your real organisational challenges. By the end of the day, you will not just understand archetypes in theory - you will have used one to diagnose a real problem and design a real intervention.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3256567e3a52",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "eb4987537774",
        "text": "We also connect archetypes to the broader work of ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "1e25db87bb3f",
        "text": "organisational development",
        "marks": [
          "99f58351bd5d"
        ]
      },
      {
        "_type": "span",
        "_key": "1ce585c8237f",
        "text": ". Recognising a pattern is the first step. Changing it requires working with the wider system - the culture, the structure, the incentives, the leadership behaviours that sustain the pattern. We help you see that full picture.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "99f58351bd5d",
        "href": "/services/organisational-development-consultancy"
      }
    ]
  }
];

const course3Body = [
  {
    "_type": "block",
    "_key": "366dbffd1a27",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "73069c7a9a92",
        "text": "The world your organisation operates in is changing. Some of those changes you can see coming. Others will surprise you. The question is not whether things will change - it is whether your organisation is ready for what comes next.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "47cc8fcae407",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "88b29db8c954",
        "text": "Strategic foresight is the practice of thinking seriously about the future - not to predict it, but to prepare for it. Scenario planning is the practical tool that makes foresight actionable. Instead of betting on a single forecast, you explore multiple plausible futures and develop strategies that work across them.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6e4f6d70bcce",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "d47d2fa65b0c",
        "text": "This course teaches your leadership team how to use scenario planning to make better strategic decisions. It is a practical day where you will build real scenarios for your organisation and use them to stress-test your strategy.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ec25ab47d90c",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "ae6426dcef59",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "895873b708c0",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "cfc068f05e29",
        "text": "You will spend the day building scenarios that are specific to your organisation and its operating environment. These are not generic futures - they are carefully constructed stories about how the world around you could change, and what that would mean for your strategy.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "32898587b7fd",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b2c244cfb1b4",
        "text": "The day covers three areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d92572665a67",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "7d12f105015c",
        "text": "Scanning the horizon",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "808a90bf92ea",
        "text": " - Before you can build scenarios, you need to know what forces are shaping your environment. You will learn structured techniques for identifying the trends, uncertainties, and potential disruptions that matter most to your organisation. This is not about reading trend reports - it is about developing the habit of looking outward and thinking critically about what you see.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "7b32ed5f09be",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "9f9a0274ffda",
        "text": "Building scenarios",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "65d85cff5dc6",
        "text": " - With the key forces identified, you will construct a set of plausible future scenarios - typically three or four distinct futures that are different enough to challenge your thinking. You will learn how to make scenarios vivid and specific enough to be useful, without falling into the trap of prediction. Good scenarios are not forecasts. They are stories that help you think.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "81cce36800bf",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "33c579ce7ec3",
        "text": "Stress-testing strategy",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "211616f9195f",
        "text": " - This is where the real value lands. You will take your current strategy and test it against each scenario. Where does it hold up? Where does it break? What assumptions is it built on, and how robust are those assumptions? You will identify the strategic choices that work across multiple futures and the vulnerabilities that need addressing - giving your leadership team a much more resilient basis for decision-making.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "46daa4a14b51",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "017ddb231ff8",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "786e55bed5a6",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "eff343fa7a7d",
        "text": "This course is designed for leadership teams and senior strategists who are responsible for setting direction. It works best when the people who make strategic decisions attend together, because the scenarios you build and the strategic conversations they provoke are most valuable when shared.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "825ad008bc24",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "036584655dc0",
        "text": "It is also valuable for organisations facing significant uncertainty - a changing market, a shifting policy environment, a sector in transition - where the usual planning assumptions feel less reliable than they used to.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4484ce65cefb",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "1e78bdb950be",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "9287f63ce4a4",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c1d05ec9b61a",
        "text": "You will leave with a set of plausible future scenarios specific to your organisation, a stress-tested view of your current strategy showing where it is robust and where it is vulnerable, and a practical approach to strategic foresight that you can use as an ongoing practice - not just a one-off exercise.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d9826ad90e3b",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "a9654cf56da8",
        "text": "How the session works",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "b5b299a7dd43",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "a1fe57f5dc53",
        "text": "The day is facilitated and collaborative. You will work together as a team through a structured scenario planning process, with the facilitator guiding the conversation and introducing techniques at each stage. The pace balances creative thinking with analytical rigour - building scenarios requires both imagination and discipline.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4fbac6fc9f50",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "4dd3b2388b5a",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "14432fb52dc8",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "de887e3a77b3",
        "text": "A lot of scenario planning feels like an academic exercise - interesting but disconnected from real decisions. This course is built entirely around your real strategy. The scenarios you build are specific to your organisation. The stress-testing targets your actual strategic choices. You leave with insight you can act on, not a report that gathers dust.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "76e8fb43a62a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "b0ea3dc65aee",
        "text": "We also take a ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "2e442584f1e9",
        "text": "systems perspective on strategy",
        "marks": [
          "f842de96fc70"
        ]
      },
      {
        "_type": "span",
        "_key": "b220c8fcdbe5",
        "text": ". Your organisation does not exist in isolation - it operates within a wider ecosystem of stakeholders, competitors, regulators, and communities. The scenarios you build will account for those connections, giving you a more realistic picture of how the future might unfold for your specific organisation.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "f842de96fc70",
        "href": "/services/strategic-alignment-consultancy"
      }
    ]
  }
];

const course4Body = [
  {
    "_type": "block",
    "_key": "4aea4b7b8e82",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "bfb1649e757c",
        "text": "Your organisation is going through change. Maybe a restructure. Maybe a cultural shift. Maybe a strategic pivot that affects how everything works. And the people leading it need more than a project plan - they need to understand the system they are trying to change.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6753e5cdff18",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ed23ab4bcf80",
        "text": "Systems thinking for organisational change is about seeing the whole picture. Not just the process you are redesigning or the team you are restructuring - but how every part of the organisation connects, how changes in one area ripple through others, and how the system will respond to what you are doing.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "2d8e6e38f99a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "2063a15642f3",
        "text": "This course teaches leaders and change practitioners to apply systems thinking directly to the change work they are doing right now. It is a practical, in-depth two-day course where you will map your organisation as a system and design a change approach that works with it, not against it.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "075956c7d0b2",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "5715ffd56f41",
        "text": "What you will work on",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "d536ecb417be",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ea1f64a41dd8",
        "text": "Over two days, you will build a systems-informed approach to a real change in your organisation. This is not theoretical - you will work on something that matters and leave with a practical framework for leading it.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "03215d3f11c1",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "ff35dceef804",
        "text": "The course covers four connected areas:",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "716844da5f9c",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "311130058268",
        "text": "Mapping the organisational system",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "1e54726e6ac5",
        "text": " - Before you can change a system, you need to see it. You will learn to map your organisation as an interconnected whole - the formal structures, the informal networks, the cultural patterns, the decision-making flows, and the feedback loops that keep things the way they are. This map becomes the foundation for everything else. It shows you where the real dynamics are, not just where the org chart says they are.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "6536770a997f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "07547feaef27",
        "text": "Understanding how systems respond to change",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "7a4d50ff6c25",
        "text": " - Organisations are not passive. They respond to change - sometimes in ways you expect, often in ways you do not. You will learn about resistance as a systemic phenomenon (not a people problem), about the delays between action and effect, and about the unintended consequences that catch most change programmes off guard. Understanding these dynamics in advance changes how you design your approach.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ac03c244a890",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "5cd51f81c09b",
        "text": "Designing systems-aware change",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "0019d60cf69f",
        "text": " - With a clear picture of the system and how it is likely to respond, you will design a change approach that works with the system's dynamics rather than against them. This means sequencing interventions wisely, building coalitions around leverage points, managing feedback loops, and creating conditions for the change to be absorbed rather than rejected.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "22ca39b2022a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "f0526e5ea385",
        "text": "Sustaining change in a living system",
        "marks": [
          "strong"
        ]
      },
      {
        "_type": "span",
        "_key": "d56c5133ccc1",
        "text": " - Most change programmes focus on implementation and declare victory too early. A systems perspective shows you that lasting change requires the system to reach a new equilibrium - and that takes time, attention, and adaptive leadership. You will plan for the long game, designing practices that sustain and deepen change after the initial implementation.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "ec5469ebcf69",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "7f0074654d4b",
        "text": "Who this is for",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "80b237ae113f",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "81056e5ac3e5",
        "text": "This course is for senior leaders, change directors, transformation leads, and organisational development practitioners who are leading or supporting significant change. It works best when attended by the core team responsible for the change - so you build your systems understanding together.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "08a2d64aaee9",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "e671a8de937e",
        "text": "It builds naturally on ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "fb7ab4f9aa32",
        "text": "systems thinking fundamentals",
        "marks": [
          "c15f52120bb4"
        ]
      },
      {
        "_type": "span",
        "_key": "90b13641743b",
        "text": " and ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "99455787a280",
        "text": "system archetypes",
        "marks": [
          "6e52df3a7140"
        ]
      },
      {
        "_type": "span",
        "_key": "1f1c61aa2a91",
        "text": ", but can be taken as a standalone course. We cover the essential concepts as we go.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "c15f52120bb4",
        "href": "/courses/systems-thinking-training"
      },
      {
        "_type": "link",
        "_key": "6e52df3a7140",
        "href": "/courses/system-archetypes-training"
      }
    ]
  },
  {
    "_type": "block",
    "_key": "6e392c59c5e9",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "3dcd592e7b31",
        "text": "What you will take away",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "3281af716711",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "887d44fa4bd1",
        "text": "You will leave with a systems map of your organisation relevant to your specific change, a change approach designed around how the system actually works, and a plan for sustaining change over time. You will also have a fundamentally different way of thinking about organisational change - one that sees the whole system, not just the parts being changed.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "4e4c398b5733",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "d6b447f95800",
        "text": "How the two days work",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "2e508cdce637",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "c232a35eebb7",
        "text": "Day one focuses on mapping and understanding - seeing the system as it is and understanding how it will respond to change. Day two focuses on designing and planning - building a change approach that works with the system and sustaining it over time. Throughout both days, you alternate between systems thinking input, facilitated mapping exercises, and design sessions focused on your real change.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "23923e2f5402",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "_key": "680dd2e038bd",
        "text": "What makes this different",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "041cd7027056",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "22bdaf54c7e2",
        "text": "Most change management training teaches you how to manage a change project. This course teaches you how to understand and work with the organisational system you are trying to change. That is a fundamentally different - and much more effective - starting point.",
        "marks": []
      }
    ],
    "markDefs": []
  },
  {
    "_type": "block",
    "_key": "8dd3b8a9820a",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "_key": "6467853e4a13",
        "text": "We draw on globally recognised change frameworks alongside systems thinking, giving you a richer and more realistic approach than any single methodology can offer. The result is change leadership that is informed by how organisations actually work as ",
        "marks": []
      },
      {
        "_type": "span",
        "_key": "4dde093394b6",
        "text": "living systems",
        "marks": [
          "b20f8e9692c8"
        ]
      },
      {
        "_type": "span",
        "_key": "e134a83a93e3",
        "text": ", not how we wish they worked.",
        "marks": []
      }
    ],
    "markDefs": [
      {
        "_type": "link",
        "_key": "b20f8e9692c8",
        "href": "/services/organisational-development-consultancy"
      }
    ]
  }
];

// Full rewrites (new body + metadata)
const fullRewrites = [
  {
    id: 'course-introduction-to-systems-thinking-workshop',
    title: 'Systems thinking training',
    slug: { _type: 'slug', current: 'systems-thinking-training' },
    category: 'purpose-direction',
    seoTitle: 'Systems Thinking Training | Mutomorro',
    seoDescription: 'Systems thinking training that teaches your team to see how your organisation really works - the connections, patterns, and leverage points that make the difference between fixing symptoms and changing the system.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-organisational-development-consultancy', _key: 'rs1' },
    ],
    body: course1Body,
  },
  {
    id: 'course-introduction-to-system-archetypes-workshop',
    title: 'System archetypes training',
    slug: { _type: 'slug', current: 'system-archetypes-training' },
    category: 'purpose-direction',
    seoTitle: 'System Archetypes Training | Mutomorro',
    seoDescription: 'System archetypes training that helps your team recognise the hidden patterns behind recurring organisational problems - and design interventions that actually break them.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-organisational-development-consultancy', _key: 'rs1' },
    ],
    body: course2Body,
  },
  {
    id: 'course-scenario-planning-for-leaders',
    title: 'Scenario planning for leaders',
    slug: { _type: 'slug', current: 'scenario-planning-for-leaders' },
    category: 'purpose-direction',
    seoTitle: 'Scenario Planning for Leaders | Mutomorro',
    seoDescription: 'Scenario planning training for leadership teams. Build plausible futures specific to your organisation, then stress-test your strategy against them. Practical, facilitated, and focused on real decisions.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-strategic-alignment-consultancy', _key: 'rs1' },
    ],
    body: course3Body,
  },
  {
    id: 'course-systems-thinking-for-organisational-change',
    title: 'Systems thinking for organisational change',
    slug: { _type: 'slug', current: 'systems-thinking-for-organisational-change' },
    category: 'purpose-direction',
    seoTitle: 'Systems Thinking for Organisational Change | Mutomorro',
    seoDescription: 'An in-depth course that teaches leaders and change practitioners to apply systems thinking directly to organisational change - seeing the whole system, understanding how it responds, and designing change that lasts.',
    relatedServices: [
      { _type: 'reference', _ref: 'service-organisational-development-consultancy', _key: 'rs1' },
      { _type: 'reference', _ref: 'service-change-management-consultancy', _key: 'rs2' },
    ],
    body: course4Body,
  },
];

// SEO-only polish (body already Gen B quality - don't overwrite)
const seoOnly = {
  id: 'course-building-a-theory-of-change',
  title: 'Building a Theory of Change',
  category: 'purpose-direction',
  seoTitle: 'Building a Theory of Change | Mutomorro',
  seoDescription: 'A practical course for programme teams who want to build a completed Theory of Change in a day. Collaborative, facilitated, and focused on your real programme.',
  relatedServices: [
    { _type: 'reference', _ref: 'service-strategic-alignment-consultancy', _key: 'rs1' },
    { _type: 'reference', _ref: 'service-organisational-purpose-consultancy', _key: 'rs2' },
  ],
};

async function main() {
  console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
  console.log('\u2551  Batch 6 (FINAL) - Push courses to Sanity          \u2551');
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

  // Full rewrites
  for (const course of fullRewrites) {
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
      console.log(`\u2713 ${course.title} (full rewrite)`);
      success++;
    } catch (err) {
      console.log(`\u2717 ${course.title}: ${err.message}`);
      failed++;
    }
  }

  // SEO-only polish (preserve existing body)
  try {
    await client
      .patch(seoOnly.id)
      .set({
        title: seoOnly.title,
        category: seoOnly.category,
        seoTitle: seoOnly.seoTitle,
        seoDescription: seoOnly.seoDescription,
        relatedServices: seoOnly.relatedServices,
      })
      .commit();
    console.log(`\u2713 ${seoOnly.title} (SEO + services only)`);
    success++;
  } catch (err) {
    console.log(`\u2717 ${seoOnly.title}: ${err.message}`);
    failed++;
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
  console.log('\nAll 31 courses now have SEO, services, and Mutomorro voice.');
  console.log('Review drafts in Sanity Studio before publishing.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
