#!/usr/bin/env node

/**
 * Pre-send email verification for Mutomorro newsletter warm-up
 * 
 * Usage:
 *   node verify-batch.mjs email1@example.com email2@example.com
 *   echo "email1@example.com\nemail2@example.com" | node verify-batch.mjs
 *   node verify-batch.mjs --next 30    # Pull next 30 unsent active contacts from Supabase
 * 
 * Requires:
 *   ZEROBOUNCE_API_KEY in .env.local or environment
 * 
 * Optional (for --next mode):
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Load environment
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const ZB_API_KEY = process.env.ZEROBOUNCE_API_KEY;
if (!ZB_API_KEY) {
  console.error('\x1b[31mError: ZEROBOUNCE_API_KEY not found in environment or .env.local\x1b[0m');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// ZeroBounce verification
// ---------------------------------------------------------------------------

async function verifyEmail(email) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const url = new URL('https://api.zerobounce.net/v2/validate');
    url.searchParams.set('api_key', ZB_API_KEY);
    url.searchParams.set('email', email);
    url.searchParams.set('ip_address', '');

    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();

    return {
      email,
      status: data.status?.toLowerCase() || 'unknown',
      subStatus: data.sub_status || '',
      freeEmail: data.free_email || false,
      didYouMean: data.did_you_mean || null,
    };
  } catch (err) {
    return {
      email,
      status: 'unknown',
      subStatus: err.name === 'AbortError' ? 'timeout' : 'api_error',
      freeEmail: false,
      didYouMean: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Supabase helpers (for --next mode and updating zb_status)
// ---------------------------------------------------------------------------

async function supabaseQuery(query) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query }),
  });

  // If the RPC doesn't exist, fall back to the PostgREST approach
  if (!res.ok) return null;
  return res.json();
}

async function fetchNextBatch(count) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('\x1b[31mError: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY needed for --next mode\x1b[0m');
    console.error('Add them to .env.local or pass emails as arguments instead.');
    process.exit(1);
  }

  // Use PostgREST to query contacts
  const params = new URLSearchParams({
    select: 'signup_email',
    newsletter_status: 'eq.active',
    order: 'created_at.asc',
    limit: String(count),
  });

  // Exclude already-sent contacts by fetching sent emails first
  const sentRes = await fetch(`${url}/rest/v1/newsletter_recipients?select=email`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const sentData = await sentRes.json();
  const sentEmails = new Set(sentData.map(r => r.email));

  // Fetch active contacts
  const contactsRes = await fetch(`${url}/rest/v1/contacts?${params}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const contacts = await contactsRes.json();

  // Filter out already-sent and return enough to fill the batch
  const unsent = contacts
    .map(c => c.signup_email)
    .filter(e => !sentEmails.has(e));

  return unsent.slice(0, count);
}

async function updateZbStatus(email, status) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  await fetch(
    `${url}/rest/v1/contacts?signup_email=eq.${encodeURIComponent(email)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ zb_status: status }),
    }
  );
}

// ---------------------------------------------------------------------------
// Collect emails
// ---------------------------------------------------------------------------

async function collectEmails() {
  const args = process.argv.slice(2);

  // --next N mode: pull from Supabase
  if (args[0] === '--next' && args[1]) {
    const count = parseInt(args[1], 10);
    if (isNaN(count) || count < 1) {
      console.error('Usage: node verify-batch.mjs --next <number>');
      process.exit(1);
    }
    console.log(`\x1b[36mFetching next ${count} unsent active contacts from Supabase...\x1b[0m\n`);
    return fetchNextBatch(count);
  }

  // --credits mode: check remaining credits
  if (args[0] === '--credits') {
    const res = await fetch(
      `https://api.zerobounce.net/v2/getcredits?api_key=${ZB_API_KEY}`
    );
    const data = await res.json();
    console.log(`\x1b[36mZeroBounce credits remaining: ${data.Credits}\x1b[0m`);
    process.exit(0);
  }

  // Emails from arguments
  if (args.length > 0 && args[0] !== '-') {
    return args.filter(a => a.includes('@'));
  }

  // Emails from stdin (piped)
  if (!process.stdin.isTTY) {
    const input = readFileSync('/dev/stdin', 'utf-8');
    return input
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));
  }

  console.error('Usage:');
  console.error('  node verify-batch.mjs email1@example.com email2@example.com');
  console.error('  node verify-batch.mjs --next 30');
  console.error('  node verify-batch.mjs --credits');
  console.error('  cat emails.txt | node verify-batch.mjs');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const BLOCK_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail']);
const SAFE_STATUSES = new Set(['valid', 'catch-all']);

function statusColour(status) {
  if (SAFE_STATUSES.has(status)) return '\x1b[32m'; // green
  if (BLOCK_STATUSES.has(status)) return '\x1b[31m'; // red
  return '\x1b[33m'; // yellow for unknown
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const emails = await collectEmails();

  if (emails.length === 0) {
    console.error('No emails to verify.');
    process.exit(1);
  }

  console.log(`\x1b[36mVerifying ${emails.length} emails against ZeroBounce...\x1b[0m\n`);

  const results = [];
  const safe = [];
  const blocked = [];
  const uncertain = [];

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i].toLowerCase().trim();
    process.stdout.write(`  [${i + 1}/${emails.length}] ${email} ... `);

    const result = await verifyEmail(email);
    results.push(result);

    const colour = statusColour(result.status);
    console.log(`${colour}${result.status}\x1b[0m${result.subStatus ? ` (${result.subStatus})` : ''}`);

    if (SAFE_STATUSES.has(result.status)) {
      safe.push(result);
    } else if (BLOCK_STATUSES.has(result.status)) {
      blocked.push(result);
    } else {
      uncertain.push(result);
    }

    // Update Supabase if credentials are available
    await updateZbStatus(email, result.status);

    // Small delay to be kind to the API
    if (i < emails.length - 1) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\x1b[1mSummary\x1b[0m');
  console.log('='.repeat(60));
  console.log(`  Total:     ${emails.length}`);
  console.log(`  \x1b[32mSafe:      ${safe.length}\x1b[0m  (valid + catch-all)`);
  console.log(`  \x1b[31mBlocked:   ${blocked.length}\x1b[0m  (invalid, abuse, spamtrap, do_not_mail)`);
  console.log(`  \x1b[33mUncertain: ${uncertain.length}\x1b[0m  (unknown / API error)`);

  if (blocked.length > 0) {
    console.log('\n\x1b[31mDo NOT send to:\x1b[0m');
    for (const r of blocked) {
      console.log(`  - ${r.email}  (${r.status}${r.subStatus ? ': ' + r.subStatus : ''})`);
    }
  }

  if (uncertain.length > 0) {
    console.log('\n\x1b[33mProceed with caution:\x1b[0m');
    for (const r of uncertain) {
      console.log(`  - ${r.email}  (${r.subStatus || 'unknown'})`);
    }
  }

  // Output clean list for copy-paste
  if (safe.length > 0) {
    console.log('\n\x1b[32mClean list (safe to send):\x1b[0m');
    for (const r of safe) {
      console.log(`  ${r.email}`);
    }
  }

  console.log('');

  // Exit code: 1 if any blocked, 0 if all clear
  process.exit(blocked.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
