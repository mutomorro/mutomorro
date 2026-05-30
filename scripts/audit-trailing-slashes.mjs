import { createClient } from '@sanity/client'
import { writeFileSync, mkdirSync } from 'node:fs'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = createClient({
  projectId: 'c6pg4t4h',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

const APPLY = process.argv.includes('--fix')
const TARGET = process.argv.includes('--published') ? 'published' : 'draft'

// --types=tool,service,article  (comma-separated). Defaults to `tool` — the brief's original scope.
const typesArg = process.argv.find((a) => a.startsWith('--types='))
const TYPES = typesArg
  ? typesArg.slice('--types='.length).split(',').map((s) => s.trim()).filter(Boolean)
  : ['tool']

function classify(href) {
  const l = String(href).toLowerCase()
  if (l.startsWith('http://mutomorro.com') || l.startsWith('https://mutomorro.com')) return 'absolute-internal'
  if (!href.startsWith('/')) return 'external'
  if (href !== '/' && href.endsWith('/')) return 'trailing-slash'
  return 'clean'
}

// Walk any value, yielding link markDefs with a keyed path we can patch later.
function* findLinks(node, path) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const item = node[i]
      const seg = item && item._key ? `[_key=="${item._key}"]` : `[${i}]`
      yield* findLinks(item, `${path}${seg}`)
    }
  } else if (node && typeof node === 'object') {
    if (Array.isArray(node.markDefs)) {
      for (const md of node.markDefs) {
        if (md && md._type === 'link' && typeof md.href === 'string') {
          const text = (node.children || [])
            .filter((c) => (c.marks || []).includes(md._key))
            .map((c) => c.text).join('')
          yield { blockPath: path, markKey: md._key, href: md.href, text }
        }
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === 'markDefs' || k.startsWith('_')) continue
      if (v && typeof v === 'object') yield* findLinks(v, path ? `${path}.${k}` : k)
    }
  }
}

const docs = await client.fetch('*[_type in $types]', { types: TYPES })
const rows = []

for (const doc of docs) {
  const links = [...findLinks(doc, '')]
  const trailing = links.filter((l) => classify(l.href) === 'trailing-slash')
  const absolute = links.filter((l) => classify(l.href) === 'absolute-internal')
  if (trailing.length || absolute.length) {
    rows.push({ doc, trailing, absolute })
  }

  if (APPLY && trailing.length) {
    const baseId = doc._id.replace(/^drafts\./, '')
    const id = TARGET === 'published' ? baseId : `drafts.${baseId}`
    if (TARGET === 'draft') {
      // ensure a draft exists, based on the published doc, before patching
      await client.createIfNotExists({ ...doc, _id: id })
    }
    let p = client.patch(id)
    for (const o of trailing) {
      const setPath = `${o.blockPath}.markDefs[_key=="${o.markKey}"].href`
      p = p.set({ [setPath]: o.href.replace(/\/+$/, '') })
    }
    await p.commit()
    console.log(`Fixed ${trailing.length} link(s) in ${id}`)
  }
}

// console summary
console.log(`\nAudited types: ${TYPES.join(', ')}  (${docs.length} docs scanned)`)
console.log('\nDocument | type | slug | trailing-slash | absolute-internal')
for (const { doc, trailing, absolute } of rows) {
  console.log(`${doc.title ?? doc._id} | ${doc._type} | ${doc.slug?.current ?? ''} | ${trailing.length} | ${absolute.length}`)
}

// detailed report — a --fix run writes to a separate file so it never clobbers the audit record
mkdirSync('docs/seo', { recursive: true })
const isToolOnly = TYPES.length === 1 && TYPES[0] === 'tool'
const base = APPLY
  ? 'trailing-slash-audit-after-fix'
  : (isToolOnly ? 'trailing-slash-audit' : 'trailing-slash-audit-extended')
const outPath = `docs/seo/${base}-2026-05-30.md`

let md = `# Trailing-slash internal link audit${APPLY ? ' — links patched (changelog)' : ''}\n\n_${new Date().toISOString()}_\n\n`
md += `Audited types: ${TYPES.join(', ')}\n\n`
md += `Documents with issues: ${rows.length} of ${docs.length} scanned\n\n`
for (const { doc, trailing, absolute } of rows) {
  md += `## ${doc.title ?? doc._id} — \`${doc._type}\` (\`${doc._id}\`)\n\n`
  if (trailing.length) {
    md += `**Trailing slash (${trailing.length}):**\n\n`
    for (const o of trailing) md += `- \`${o.href}\` — "${o.text}" — _${o.blockPath}_\n`
    md += `\n`
  }
  if (absolute.length) {
    md += `**Absolute internal (report only, ${absolute.length}):**\n\n`
    for (const o of absolute) md += `- \`${o.href}\` — "${o.text}" — _${o.blockPath}_\n`
    md += `\n`
  }
}
writeFileSync(outPath, md)
console.log(`\nReport written to ${outPath}`)
