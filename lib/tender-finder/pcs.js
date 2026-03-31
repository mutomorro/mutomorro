/**
 * Channel 5: Public Contracts Scotland (PCS)
 * OCDS API client for Scottish public sector procurement
 * API docs: https://api.publiccontractsscotland.gov.uk/v1
 *
 * Scottish law requires all regulated procurement (£50k+ goods/services)
 * to be advertised on PCS. Also includes below-threshold notices.
 */

const API_BASE = 'https://api.publiccontractsscotland.gov.uk/v1';

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
      const url = `${API_BASE}/Notices?dateFrom=${dateFrom}&noticeType=${noticeType}&outputType=0`;
      console.log(`[PCS] Fetching notice type ${noticeType} for ${dateFrom}...`);

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        console.warn(`[PCS] API returned ${response.status} for notice type ${noticeType}`);
        continue;
      }

      const data = await response.json();
      const releases = Array.isArray(data) ? data : (data.releases || []);

      for (const release of releases) {
        try {
          const tender = release.tender || {};
          const buyer = (release.parties || []).find(
            (p) => p.roles && p.roles.includes('buyer')
          ) || {};

          let value = null;
          if (tender.value?.amount) value = tender.value.amount;
          else if (tender.minValue?.amount) value = tender.minValue.amount;

          let deadline = null;
          if (tender.tenderPeriod?.endDate) deadline = tender.tenderPeriod.endDate;

          const ocid = release.ocid || '';
          const pcsId = ocid.replace('ocds-r6ebe6-', '');
          const sourceUrl = pcsId
            ? `https://www.publiccontractsscotland.gov.uk/search/show/search_view.aspx?ID=${pcsId}`
            : null;

          results.push({
            title: tender.title || 'Untitled',
            description: tender.description || '',
            organisation: buyer.name || 'Unknown Scottish Public Body',
            value_low: value,
            value_high: value,
            currency: tender.value?.currency || 'GBP',
            deadline,
            source: 'pcs',
            source_id: ocid || `pcs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            source_url: sourceUrl,
            published_date: release.date || null,
            location: 'Scotland',
          });
        } catch (parseErr) {
          console.warn('[PCS] Failed to parse release:', parseErr.message);
        }
      }

      console.log(`[PCS] ${releases.length} notices for type ${noticeType}`);
    }

    // Check previous month if first 3 days of the month
    if (now.getDate() <= 3) {
      const prev = new Date(now);
      prev.setMonth(prev.getMonth() - 1);
      const prevDate = `${String(prev.getMonth() + 1).padStart(2, '0')}-${prev.getFullYear()}`;
      console.log(`[PCS] Also checking previous month ${prevDate}...`);

      for (const noticeType of noticeTypes) {
        try {
          const url = `${API_BASE}/Notices?dateFrom=${prevDate}&noticeType=${noticeType}&outputType=0`;
          const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (!resp.ok) continue;
          const data = await resp.json();
          const releases = Array.isArray(data) ? data : (data.releases || []);

          for (const release of releases) {
            try {
              const tender = release.tender || {};
              const buyer = (release.parties || []).find(
                (p) => p.roles && p.roles.includes('buyer')
              ) || {};

              let value = null;
              if (tender.value?.amount) value = tender.value.amount;
              else if (tender.minValue?.amount) value = tender.minValue.amount;

              const ocid = release.ocid || '';
              const pcsId = ocid.replace('ocds-r6ebe6-', '');

              results.push({
                title: tender.title || 'Untitled',
                description: tender.description || '',
                organisation: buyer.name || 'Unknown Scottish Public Body',
                value_low: value,
                value_high: value,
                currency: tender.value?.currency || 'GBP',
                deadline: tender.tenderPeriod?.endDate || null,
                source: 'pcs',
                source_id: ocid || `pcs-prev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                source_url: pcsId
                  ? `https://www.publiccontractsscotland.gov.uk/search/show/search_view.aspx?ID=${pcsId}`
                  : null,
                published_date: release.date || null,
                location: 'Scotland',
              });
            } catch (_) {}
          }
        } catch (_) {}
      }
    }

    console.log(`[PCS] Total: ${results.length} notices`);
  } catch (error) {
    console.error('[PCS] Fetch failed:', error.message);
  }

  return results;
}
