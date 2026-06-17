/**
 * Leaf write-path relay — the remote MCP endpoint.
 *
 * A thin wrapper: the whole doorman lives in lib/leaf-relay.mjs (so it can be tested in
 * isolation, with no server). The connector URL a Claude.ai chat adds is:
 *   https://<this-site>/api/leaf-relay?k=<LEAF_RELAY_SECRET>
 * See lib/leaf-relay.mjs for the contract, the auth model and the required env vars.
 */

import { handleMcpRequest } from '@/lib/leaf-relay.mjs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// One handler for every verb: POST carries JSON-RPC; GET/DELETE answer 405; a wrong or
// absent ?k= secret answers 404 (handled inside handleMcpRequest).
export { handleMcpRequest as GET, handleMcpRequest as POST, handleMcpRequest as DELETE }
