import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const now = new Date()
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30)

  try {
    const [
      activeCount,
      unsubCount,
      bouncedCount,
      newWeek,
      newMonth,
      sendsResult,
      byTier,
      bySource,
      issueStatsResult,
      sendStatsResult,
    ] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'unsubscribed'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('newsletter_status', 'bounced'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']).gte('newsletter_consent_date', weekAgo.toISOString()),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).in('newsletter_status', ['active', 'confirmed']).gte('newsletter_consent_date', monthAgo.toISOString()),
      supabase
        .from('newsletter_sends')
        .select('id, subject, issue_key, status, total_recipients, total_sent, total_delivered, total_opened, total_clicked, total_bounced, created_at, completed_at, preview_text')
        .gte('total_sent', 1)
        .order('created_at', { ascending: false })
        .range(0, 9999),
      supabase.rpc('get_newsletter_tier_counts'),
      supabase.rpc('get_newsletter_source_counts'),
      // Server-side GROUP BY aggregations (replaces loading the entire
      // newsletter_recipients table into JS): per-issue DISTINCT-contact stats
      // for the headline, per-send row counts for the batch-detail expand.
      supabase.rpc('get_newsletter_issue_stats'),
      supabase.rpc('get_newsletter_send_stats'),
    ])

    const allSends = sendsResult.data || []

    // Per-send row counts (= per-batch distinct recipients) for the expand detail.
    const perSend = new Map()
    for (const r of (sendStatsResult.data || [])) {
      perSend.set(r.send_id, {
        total: Number(r.total),
        opened: Number(r.opened),
        clicked: Number(r.clicked),
        bounced: Number(r.bounced),
      })
    }

    // Per-issue DISTINCT-contact engagement (dedupes multi-batch retries).
    const issueStats = new Map()
    for (const r of (issueStatsResult.data || [])) {
      issueStats.set(r.group_key, {
        recipients: Number(r.recipients),
        delivered: Number(r.delivered),
        opened: Number(r.opened),
        clicked: Number(r.clicked),
        bounced: Number(r.bounced),
      })
    }

    // Group sends by issue_key — sends without an issue_key stand alone (id as the key).
    const groups = new Map()
    for (const s of allSends) {
      const key = s.issue_key || `__no_key__${s.id}`
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          issueKey: s.issue_key || null,
          subject: s.subject,
          sends: [],
          status: s.status,
          createdAt: s.created_at,
        })
      }
      const g = groups.get(key)
      g.sends.push(s)
      // Latest createdAt wins for sort, latest subject wins (for renamed subjects)
      if (new Date(s.created_at) > new Date(g.createdAt)) {
        g.createdAt = s.created_at
        g.subject = s.subject
      }
    }

    const grouped = Array.from(groups.values()).map(g => {
      const stats = issueStats.get(g.key) || { recipients: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 }

      // Determine combined status: any 'sending' wins; else 'failed' if any failed; else 'complete'
      let combinedStatus = 'complete'
      if (g.sends.some(s => s.status === 'sending')) combinedStatus = 'sending'
      else if (g.sends.some(s => s.status === 'failed')) combinedStatus = 'failed'

      return {
        key: g.key,
        issueKey: g.issueKey,
        subject: g.subject,
        createdAt: g.createdAt,
        status: combinedStatus,
        batchCount: g.sends.length,
        // Headline = DISTINCT contacts across all batches of the issue
        // (fixes the old attempt-row sum that showed e.g. 6,120 for 3,818 sent).
        delivered: stats.delivered,
        recipients: stats.recipients,
        opened: stats.opened,
        clicked: stats.clicked,
        bounced: stats.bounced,
        // Per-batch rows for expand-to-detail
        batches: g.sends.map(s => {
          const live = perSend.get(s.id) || { total: 0, opened: 0, clicked: 0, bounced: 0 }
          return {
            id: s.id,
            createdAt: s.created_at,
            status: s.status,
            total: live.total,
            opened: live.opened,
            clicked: live.clicked,
            bounced: live.bounced,
          }
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      }
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Last send summary = most recent group with at least one delivered email
    const lastSend = grouped.find(g => g.delivered > 0) || null

    const tierRows = byTier.data || []
    const sourceRows = bySource.data || []
    const sortedSources = sourceRows
      .map(r => ({ source: r.source, count: Number(r.count) }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      subscribers: {
        active: activeCount.count || 0,
        unsubscribed: unsubCount.count || 0,
        bounced: bouncedCount.count || 0,
        newThisWeek: newWeek.count || 0,
        newThisMonth: newMonth.count || 0,
      },
      lastSend,
      sends: grouped,
      byTier: tierRows
        .map(r => ({ tier: r.tier, count: Number(r.count) }))
        .sort((a, b) => {
          if (a.tier === 'Unset') return 1
          if (b.tier === 'Unset') return -1
          return a.tier.localeCompare(b.tier)
        }),
      bySource: sortedSources,
    })
  } catch (err) {
    console.error('Newsletter API error:', err)
    return NextResponse.json({ error: 'Failed to load newsletter data' }, { status: 500 })
  }
}
