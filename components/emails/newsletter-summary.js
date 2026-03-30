/**
 * Daily newsletter send summary email.
 * Operational email - plain and scannable, not designed.
 */

const fontFamily = "'Source Sans 3', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

function row(label, value, highlight) {
  return `<tr>
    <td style="padding:4px 0;font-family:${fontFamily};font-size:15px;font-weight:300;color:rgba(0,0,0,0.5);">${label}</td>
    <td style="padding:4px 0 4px 16px;font-family:${fontFamily};font-size:15px;font-weight:${highlight ? '400' : '300'};color:${highlight || '#221C2B'};text-align:right;">${value}</td>
  </tr>`
}

function sectionHeading(text) {
  return `<tr><td colspan="2" style="padding:24px 0 8px;font-family:${fontFamily};font-size:12px;font-weight:400;color:rgba(0,0,0,0.35);text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid rgba(0,0,0,0.06);">${text}</td></tr>`
}

export function buildSummaryEmail({
  date,
  type = 'normal', // 'normal' | 'skipped' | 'alert' | 'exhausted'
  skipReason,
  // Today's send stats
  batchSize,
  verified,
  zbExcluded,
  sent,
  domainExcluded,
  // Yesterday's results
  yesterdayOpened,
  yesterdayOpenRate,
  yesterdayClicked,
  yesterdayClickRate,
  yesterdayBounced,
  yesterdayBounceRate,
  // Running totals
  totalSent,
  remaining,
  estimatedCompletion,
  // Alert details
  alertBounceRate,
  alertThreshold,
  // Config snapshot
  config,
}) {
  const adminUrl = 'https://mutomorro.com/admin/newsletter'

  let bodyContent = ''

  if (type === 'alert') {
    bodyContent = `
      <tr><td colspan="2" style="padding:20px;background:rgba(255,66,121,0.08);border-left:3px solid #FF4279;font-family:${fontFamily};font-size:16px;font-weight:400;color:#221C2B;line-height:1.6;">
        Newsletter sends have been <strong style="font-weight:400;color:#FF4279;">automatically paused</strong>.<br />
        Yesterday's bounce rate was ${alertBounceRate}%, exceeding the ${alertThreshold}% threshold.<br /><br />
        <a href="${adminUrl}" style="color:#9B51E0;font-weight:400;">Review and resume in the Command Centre</a>
      </td></tr>
    `
  } else if (type === 'skipped') {
    bodyContent = `
      <tr><td colspan="2" style="padding:16px 0;font-family:${fontFamily};font-size:16px;font-weight:300;color:rgba(0,0,0,0.5);line-height:1.6;">
        No send today: ${skipReason}
      </td></tr>
    `
  } else if (type === 'exhausted') {
    bodyContent = `
      <tr><td colspan="2" style="padding:20px;background:rgba(45,212,191,0.08);border-left:3px solid #2DD4BF;font-family:${fontFamily};font-size:16px;font-weight:400;color:#221C2B;line-height:1.6;">
        All eligible contacts have been sent to. The warm-up pool is exhausted.<br />
        Total unique recipients: <strong style="font-weight:400;">${totalSent || 0}</strong><br /><br />
        Sends have been paused automatically. <a href="${adminUrl}" style="color:#9B51E0;font-weight:400;">View in Command Centre</a>
      </td></tr>
    `
  } else {
    // Normal send
    bodyContent = `
      ${sectionHeading("Today's send")}
      ${row('Batch size', batchSize)}
      ${row('Verified', `${verified} (${zbExcluded} excluded by ZeroBounce)`)}
      ${row('Sent', sent, '#221C2B')}
      ${domainExcluded > 0 ? row('Domain-excluded', domainExcluded) : ''}

      ${yesterdayBounceRate !== undefined ? `
        ${sectionHeading("Yesterday's results")}
        ${row('Opened', `${yesterdayOpened || 0} (${yesterdayOpenRate || '-'})`)}
        ${row('Clicked', `${yesterdayClicked || 0} (${yesterdayClickRate || '-'})`)}
        ${row('Bounced', `${yesterdayBounced || 0} (${yesterdayBounceRate || '-'})`, yesterdayBounced > 0 ? '#FF4279' : null)}
      ` : ''}

      ${sectionHeading('Running totals')}
      ${row('Total unique recipients', totalSent || 0)}
      ${row('Remaining in pool', remaining || 0)}
      ${estimatedCompletion ? row('Estimated completion', estimatedCompletion) : ''}
    `
  }

  // Config section (always shown)
  const configSection = config ? `
    ${sectionHeading('Settings')}
    ${row('Batch size', config.batch_size)}
    ${row('Daily cap', config.daily_cap)}
    ${row('Bounce threshold', config.bounce_rate_threshold + '%')}
    ${row('Domain exclusions', config.domain_exclusions_enabled ? 'ON' : 'OFF')}
    ${row('Weekend sends', config.skip_weekends ? 'OFF' : 'ON')}
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Newsletter Summary</title>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#FAF6F1;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF6F1;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;background-color:#ffffff;">

          <!-- Gradient bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#80388F,#FF4279,#FFA200);height:4px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 36px 0;">
              <p style="margin:0 0 4px;font-family:${fontFamily};font-size:12px;font-weight:400;color:rgba(0,0,0,0.35);text-transform:uppercase;letter-spacing:0.1em;">
                Daily Newsletter Summary
              </p>
              <p style="margin:0;font-family:${fontFamily};font-size:22px;font-weight:400;color:#221C2B;letter-spacing:-0.02em;">
                ${date}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:16px 36px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${bodyContent}
                ${configSection}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-family:${fontFamily};font-size:13px;font-weight:300;color:rgba(0,0,0,0.35);">
                <a href="${adminUrl}" style="color:#9B51E0;text-decoration:none;">Manage settings</a>
                <span style="color:rgba(0,0,0,0.15);"> · </span>
                Mutomorro Newsletter System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
