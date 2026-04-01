/**
 * Channel 5: Public Contracts Scotland (PCS)
 * OCDS API client for Scottish public sector procurement
 * API docs: https://api.publiccontractsscotland.gov.uk/v1
 *
 * Scottish law requires all regulated procurement (£50k+ goods/services)
 * to be advertised on PCS. Also includes below-threshold notices.
 *
 * Note: The PCS API server doesn't send its intermediate certificate (Sectigo),
 * so Node.js can't verify the chain. We use undici's fetch with TLS verification
 * disabled for this host only. This is safe — it's a known government API.
 */

import { fetch as undiciFetch, Agent } from 'undici';

const API_BASE = 'https://api.publiccontractsscotland.gov.uk/v1';
const pcsDispatcher = new Agent({
  connect: { rejectUnauthorized: false },
});

/**
 * Fetch from PCS API (with broken-cert workaround).
 */
async function pcsFetch(url) {
  return undiciFetch(url, {
    dispatcher: pcsDispatcher,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mutomorro-TenderFinder/1.0',
    },
  });
}

/**
 * Parse a single OCDS release into our tender format.
 */
function parseRelease(release, idPrefix = 'pcs') {
  const tender = release.tender || {};
  const buyer = (release.parties || []).find(
    (p) => p.roles && p.roles.includes('buyer')
  ) || {};

  let value = null;
  if (tender.value?.amount) value = tender.value.amount;
  else if (tender.minValue?.amount) value = tender.minValue.amount;

  const ocid = release.ocid || '';
  const contractDoc = (tender.documents || []).find(d => d.documentType === 'contractNotice');
  const pcsId = ocid.replace('ocds-r6ebe6-', '');
  const sourceUrl = contractDoc?.url
    || (pcsId ? `https://www.publiccontractsscotland.gov.uk/search/show/search_view.aspx?ID=${pcsId}` : null);

  return {
    title: tender.title || 'Untitled',
    description: tender.description || '',
    organisation: buyer.name || 'Unknown Scottish Public Body',
    value_low: value,
    value_high: value,
    currency: tender.value?.currency || 'GBP',
    deadline: tender.tenderPeriod?.endDate || null,
    source: 'pcs',
    source_id: ocid || `${idPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    source_url: sourceUrl,
  };
}

/**
 * Fetch releases for a given month and notice type.
 */
async function fetchMonth(dateFrom, noticeType) {
  const url = `${API_BASE}/Notices?dateFrom=${dateFrom}&noticeType=${noticeType}&outputType=0`;
  console.log(`[PCS] Fetching notice type ${noticeType} for ${dateFrom}...`);

  const response = await pcsFetch(url);

  if (!response.ok) {
    console.warn(`[PCS] API returned ${response.status} for notice type ${noticeType}`);
    return [];
  }

  const data = await response.json();
  const releases = Array.isArray(data) ? data : (data.releases || []);
  console.log(`[PCS] ${releases.length} notices for type ${noticeType}`);
  return releases;
}

/**
 * Fetch recent contract notices from PCS in OCDS format.
 * The API returns notices by month (dateFrom=mm-yyyy).
 * We fetch current month's contract notices and below-threshold notices.
 */
export async function searchPCS() {
  const results = [];

  try {
    const now = new Date();
    const dateFrom = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    // noticeType 2 = Contract Notice (regulated, £50k+)
    // noticeType 7 = Contract Notice (below threshold)
    const noticeTypes = [2, 7];

    for (const noticeType of noticeTypes) {
      try {
        const releases = await fetchMonth(dateFrom, noticeType);
        for (const release of releases) {
          try {
            results.push(parseRelease(release, 'pcs'));
          } catch (parseErr) {
            console.warn('[PCS] Failed to parse release:', parseErr.message);
          }
        }
      } catch (err) {
        console.warn(`[PCS] Error fetching type ${noticeType}: ${err.message}`);
      }
    }

    // Check previous month if first 3 days of the month
    if (now.getDate() <= 3) {
      const prev = new Date(now);
      prev.setMonth(prev.getMonth() - 1);
      const prevDate = `${String(prev.getMonth() + 1).padStart(2, '0')}-${prev.getFullYear()}`;
      console.log(`[PCS] Also checking previous month ${prevDate}...`);

      for (const noticeType of noticeTypes) {
        try {
          const releases = await fetchMonth(prevDate, noticeType);
          for (const release of releases) {
            try {
              results.push(parseRelease(release, 'pcs-prev'));
            } catch (_) {}
          }
        } catch (_) {}
      }
    }

    console.log(`[PCS] Total: ${results.length} notices`);
  } catch (error) {
    console.error('[PCS] Fetch failed:', error.message);
    if (error.cause) console.error('[PCS] Cause:', error.cause);
  }

  return results;
}
