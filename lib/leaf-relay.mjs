/**
 * Leaf write-path relay — the "doorman" (hand-rolled, zero dependencies)
 *
 * A small remote MCP server that lets a Claude.ai chat create, edit and read Leaf
 * documents, and list and create the projects they are filed under. It holds the Leaf
 * bypass credential server-side and forwards each request
 * to Leaf's already-built validating write API (the contract lives in the leaf repo at
 * docs/direct-write-api.md). The chat never sees the credential.
 *
 * Deliberately DUMB: it never parses, validates or reasons about the document tree —
 * Leaf validates every tree against the editor's own schema and returns clean errors,
 * which the relay relays honestly. A non-200 from Leaf means the write did NOT happen;
 * we say so plainly and never paper over it.
 *
 * Transport: Streamable HTTP, stateless (no sessions, no SSE, no Redis). Each POST is a
 * JSON-RPC message answered with a single application/json response — the spec's
 * stateless mode. GET/DELETE return 405 (we offer no server→client stream and hold no
 * session to delete). Implemented by hand on the Web Fetch API (Request/Response/fetch),
 * so it needs no npm packages and runs anywhere the Next runtime does.
 *
 * Endpoint:  /api/leaf-relay?k=<LEAF_RELAY_SECRET>
 * Auth:      the unguessable ?k= secret in the URL (the "secret link"). Wrong/absent → 404.
 *            This gates who may ask the doorman to file documents; the Leaf credential is
 *            never part of this check and never leaves the server.
 *
 * Env (server-only, never echoed back to the chat):
 *   LEAF_RELAY_SECRET   — the relay's own lock; the ?k= value the connector URL carries.
 *   LEAF_BYPASS_SECRET  — the Leaf Vercel Protection-Bypass secret, sent as the
 *                         x-vercel-protection-bypass header so the call clears Leaf's SSO gate.
 *   LEAF_API_BASE_URL   — Leaf's origin (default https://leaf-mutomorro.vercel.app; set to
 *                         http://localhost:3000 to forward to a local Leaf in development).
 */

const SERVER_INFO = { name: 'leaf-relay', version: '1.0.0' }

// What the chat sees. `content` is intentionally unconstrained (no schema) — the relay
// forwards it verbatim and lets Leaf be the single judge of a valid tree.
const TOOLS = [
  {
    name: 'create_document',
    description:
      "Create a new Leaf document and get its id back. Provide `content` as a ProseMirror/TipTap document tree — a doc-topped node, the editor.getJSON() shape (see the Leaf direct-write contract). Omit `content` to create a blank document. Optional: `title`, `project_id` (a project uuid or null), `footer_style` ('tagline' or 'address'). Returns the new document's id — keep it to edit the same document later.",
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'object',
          additionalProperties: true,
          description:
            'The ProseMirror/TipTap document tree (a doc-topped node, the editor.getJSON() shape). Pass it as a JSON object, NOT a stringified JSON. Omit for a blank document.',
        },
        title: { type: 'string' },
        project_id: { type: ['string', 'null'] },
        footer_style: { type: 'string', enum: ['tagline', 'address'] },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'edit_document',
    description:
      'Replace the content of an existing Leaf document by id (a whole-tree replace). `id` is required. Provide `content` (the new ProseMirror/TipTap doc tree) and/or `title`, `project_id`, `footer_style` — whatever you send is applied. On an invalid tree Leaf refuses and the document is left unchanged; that refusal is reported back, not hidden.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        content: {
          type: 'object',
          additionalProperties: true,
          description: 'The new ProseMirror/TipTap document tree (doc-topped). Pass it as a JSON object, NOT a stringified JSON.',
        },
        title: { type: 'string' },
        project_id: { type: ['string', 'null'] },
        footer_style: { type: 'string', enum: ['tagline', 'address'] },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'read_document',
    description:
      'Read a Leaf document by id — its current title, content tree, project and footer style — so you can see the current state before editing. `id` is required.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
  },

  // Projects: the strands documents are filed under. `list_projects` is how the chat
  // discovers what already exists (and the ids to use as a document's project_id above);
  // `create_project` adds a new one.
  {
    name: 'list_projects',
    description:
      "List every Leaf project — each with its id, name, descriptor, type, overview and framing. Use this to see what projects already exist (and to get their ids) before creating a new one, or before filing a document into a project via create_document/edit_document's `project_id`. No arguments.",
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'create_project',
    description:
      "Create a new Leaf project and get its id back. `name` and `type` are required; `type` is one of: client, prospect, internal, admin. Optional prose fields: `descriptor` (a short one-line label, e.g. 'Membership body for housing associations'), `overview` (background for reference — what the project is, in a few sentences) and `framing` (how the in-app Claude should approach this project's documents — tone, audience, what to lead with; it is composed into that chat's system prompt, so write it as guidance, e.g. 'This is a formal funding proposal. Keep the tone measured and evidence-led; lead with outcomes for residents.'). Check list_projects first so you don't duplicate one that already exists. Returns the new project's id — pass it as `project_id` to create_document/edit_document to file documents under it.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['client', 'prospect', 'internal', 'admin'] },
        descriptor: { type: 'string' },
        overview: { type: 'string' },
        framing: { type: 'string' },
      },
      required: ['name', 'type'],
      additionalProperties: false,
    },
  },
]

// The one door to Leaf. Attaches the bypass credential server-side and returns a small,
// honest verdict. The credential and any raw internals are never returned to the chat.
async function callLeaf(method, path, body) {
  const base = process.env.LEAF_API_BASE_URL || 'https://leaf-mutomorro.vercel.app'
  const headers = { 'Content-Type': 'application/json' }
  // Attach the Leaf credential only if configured. A local Leaf has no SSO gate, so the
  // header is unnecessary there and simply absent — no real secret is needed to develop.
  if (process.env.LEAF_BYPASS_SECRET) {
    headers['x-vercel-protection-bypass'] = process.env.LEAF_BYPASS_SECRET
  }

  let res
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (err) {
    return { ok: false, networkError: true, message: String(err?.message || err) }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // These routes always return JSON; a non-JSON body means something upstream is wrong.
  }
  return { ok: res.ok, status: res.status, data }
}

const okResult = (text) => ({ content: [{ type: 'text', text }] })
const failResult = (text) => ({ content: [{ type: 'text', text }], isError: true })

// Forward only the fields the caller actually set, so omitted ones fall to Leaf's own
// defaults (e.g. no content on create → Leaf's blank starter).
function pickBody(args, keys) {
  const body = {}
  for (const k of keys) if (args[k] !== undefined) body[k] = args[k]
  return body
}

// Some MCP clients hand a complex object parameter through as a JSON STRING (it happens
// when a schema is loose, or with how a connector serialises tool arguments). Be tolerant:
// parse `arguments`, and the `content` tree, from a string when needed, so a stringified
// tree is normalised to the object Leaf expects rather than bouncing off Leaf's "must be a
// ProseMirror JSON object" guard. We still never inspect the tree's shape - Leaf remains
// the single judge; we only undo an accidental stringify.
function coerceArgs(params) {
  let args = params && params.arguments
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args)
    } catch {
      args = {}
    }
  }
  if (!args || typeof args !== 'object') args = {}
  if (typeof args.content === 'string' && args.content.trim()) {
    try {
      args.content = JSON.parse(args.content)
    } catch {
      // Leave it; Leaf will return its clear "must be a ProseMirror JSON object" error.
    }
  }
  return args
}

async function callTool(params) {
  const name = params?.name
  const args = coerceArgs(params)

  if (name === 'create_document') {
    const r = await callLeaf('POST', '/api/documents', pickBody(args, ['content', 'title', 'project_id', 'footer_style']))
    if (r.networkError) return failResult(`Could not reach Leaf (network error). The document was NOT created. Details: ${r.message}`)
    if (r.ok) {
      return okResult(
        `Created a Leaf document.\n${JSON.stringify(
          { id: r.data?.id, title: r.data?.title, updatedAt: r.data?.updatedAt, projectId: r.data?.projectId, footerStyle: r.data?.footerStyle },
          null,
          2,
        )}`,
      )
    }
    return failResult(`Leaf refused to create the document (HTTP ${r.status}). The document was NOT created.\nLeaf said: ${r.data?.error || '(no error message)'}`)
  }

  if (name === 'edit_document') {
    if (typeof args.id !== 'string' || !args.id) return failResult('edit_document needs an `id` (the document to replace).')
    const r = await callLeaf('PUT', `/api/documents/${encodeURIComponent(args.id)}`, pickBody(args, ['content', 'title', 'project_id', 'footer_style']))
    if (r.networkError) return failResult(`Could not reach Leaf (network error). Document ${args.id} was NOT changed. Details: ${r.message}`)
    if (r.ok) return okResult(`Edited Leaf document ${args.id}.\n${JSON.stringify({ ok: true, title: r.data?.title, updatedAt: r.data?.updatedAt }, null, 2)}`)
    if (r.status === 404) return failResult(`No Leaf document with id ${args.id} (HTTP 404). Nothing was changed.`)
    return failResult(`Leaf refused the edit (HTTP ${r.status}). Document ${args.id} was left unchanged.\nLeaf said: ${r.data?.error || '(no error message)'}`)
  }

  if (name === 'read_document') {
    if (typeof args.id !== 'string' || !args.id) return failResult('read_document needs an `id`.')
    const r = await callLeaf('GET', `/api/documents/${encodeURIComponent(args.id)}`, undefined)
    if (r.networkError) return failResult(`Could not reach Leaf (network error) while reading ${args.id}. Details: ${r.message}`)
    if (r.ok) return okResult(JSON.stringify(r.data, null, 2))
    if (r.status === 404) return failResult(`No Leaf document with id ${args.id} (HTTP 404).`)
    return failResult(`Leaf could not return document ${args.id} (HTTP ${r.status}).\nLeaf said: ${r.data?.error || '(no error message)'}`)
  }

  if (name === 'list_projects') {
    const r = await callLeaf('GET', '/api/projects', undefined)
    if (r.networkError) return failResult(`Could not reach Leaf (network error) while listing projects. Details: ${r.message}`)
    if (r.ok) return okResult(JSON.stringify(r.data, null, 2))
    return failResult(`Leaf could not list projects (HTTP ${r.status}).\nLeaf said: ${r.data?.error || '(no error message)'}`)
  }

  if (name === 'create_project') {
    const r = await callLeaf('POST', '/api/projects', pickBody(args, ['name', 'type', 'descriptor', 'overview', 'framing']))
    if (r.networkError) return failResult(`Could not reach Leaf (network error). The project was NOT created. Details: ${r.message}`)
    if (r.ok) {
      return okResult(
        `Created a Leaf project.\n${JSON.stringify(
          { id: r.data?.id, name: r.data?.name, type: r.data?.type, descriptor: r.data?.descriptor, updatedAt: r.data?.updatedAt },
          null,
          2,
        )}`,
      )
    }
    return failResult(`Leaf refused to create the project (HTTP ${r.status}). The project was NOT created.\nLeaf said: ${r.data?.error || '(no error message)'}`)
  }

  return failResult(`Unknown tool: ${name}`)
}

const reply = (id, result) => ({ jsonrpc: '2.0', id, result })
const errorReply = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } })

// Answer one JSON-RPC message. Returns a response object for a request, or null for a
// notification (which gets no reply, just a 202 at the transport layer).
async function handleMessage(msg) {
  const method = msg?.method
  const id = msg && msg.id !== undefined && msg.id !== null ? msg.id : null
  if (typeof method !== 'string') return null // a client-side response or garbage — ignore

  switch (method) {
    case 'initialize':
      // Echo the client's protocol version (we speak the basic methods version-agnostically),
      // so negotiation always succeeds.
      return reply(id, {
        protocolVersion: msg.params?.protocolVersion || '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      })
    case 'tools/list':
      return reply(id, { tools: TOOLS })
    case 'tools/call':
      return reply(id, await callTool(msg.params))
    case 'ping':
      return reply(id, {})
    default:
      if (method.startsWith('notifications/')) return null // initialized, cancelled, etc.
      if (id === null) return null // unknown notification — ignore
      return errorReply(id, -32601, `Method not found: ${method}`)
  }
}

// The "secret link" gate: the connector URL must carry ?k=<LEAF_RELAY_SECRET>.
function gateOk(request) {
  const secret = process.env.LEAF_RELAY_SECRET
  const provided = new URL(request.url).searchParams.get('k')
  return Boolean(secret) && provided === secret
}

// The whole doorman as one Web handler, shared by the route's GET/POST/DELETE exports.
export async function handleMcpRequest(request) {
  if (!gateOk(request)) return new Response('Not found', { status: 404 })

  // Stateless Streamable HTTP: only POST carries JSON-RPC. We offer no server→client
  // stream (GET) and hold no session to terminate (DELETE), so both are 405 — which MCP
  // clients handle gracefully.
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json(errorReply(null, -32700, 'Parse error'), { status: 200 })
  }

  const batch = Array.isArray(body)
  const messages = batch ? body : [body]
  const responses = []
  for (const m of messages) {
    const r = await handleMessage(m)
    if (r) responses.push(r)
  }
  // Only notifications (e.g. notifications/initialized) → nothing to return.
  if (responses.length === 0) return new Response(null, { status: 202 })
  return Response.json(batch ? responses : responses[0], { status: 200 })
}
