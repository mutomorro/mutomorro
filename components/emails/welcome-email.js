/**
 * Email 2: Welcome from James ("Seeing the Unseen")
 *
 * Personal, text-forward email. Sent 2-3 minutes after confirm.
 * Table-based HTML for email client compatibility.
 */

export function buildWelcomeEmail({ firstName, unsubscribeUrl = '' }) {
  const name = firstName
    ? firstName.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase())
    : ''
  const greeting = name ? `Hi ${name},` : 'Hi there,'

  const photoUrl = 'https://cdn.sanity.io/images/c6pg4t4h/production/ff6e02cb52c63ce401da07f4d81eb74fe0e1f1eb-1944x1944.jpg?w=144&h=144&fit=crop'

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Seeing the unseen</title>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <style>table,td{font-family:Arial,Helvetica,sans-serif!important}</style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F1;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF6F1;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:580px;width:100%;background-color:#ffffff;">

          <!-- Gradient bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#80388F,#FF4279,#FFA200);height:8px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Logo -->
          <tr>
            <td class="email-padding" style="padding:28px 44px 20px 44px;">
              <img src="https://mutomorro.com/images/mutomorro-logo.png" alt="Mutomorro" width="143" style="display:block;border:0;height:auto;" />
            </td>
          </tr>

          <!-- Logo divider -->
          <tr>
            <td style="padding:0 44px;">
              <div style="border-top:1px solid rgba(0,0,0,0.06);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-padding" style="padding:32px 44px 0 44px;">
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                ${greeting}
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                Delighted you've signed up. If you have a moment, I'd love to share a little about what we're all about.
              </p>
              <p style="margin:28px 0 24px 0;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:400;line-height:1.4;color:#9B51E0;">
                Seeing the unseen: the invisible architecture of organisations
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                For the past decade I've been fascinated by an idea: the things you can't easily measure, can't simply quantify, can't put neatly on an organisational chart - are often the things that determine how organisations really work.
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                You can feel it when you walk into a building. You can sense it in the half-second pause before someone speaks in a meeting. It's there in the gap between what a strategy says and what happens on a Monday morning.
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                There's a kind of invisible architecture underneath every organisation - how trust moves, where energy collects and where it drains, the unwritten agreements that no one made but everyone follows. It shapes everything. And almost nobody stops to look at it.
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                It never stops fascinating me.
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                That's what these emails are about. The patterns we notice across the leaders we work with. The quiet connections between things that look unrelated. What shifts when you start paying attention to the spaces between the parts, not just the parts themselves.
              </p>
              <p style="margin:0 0 28px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                If LinkedIn is your thing, that's where we share the most: <a href="https://www.linkedin.com/company/mutomorro/" target="_blank" style="color:#9B51E0;text-decoration:none;">linkedin.com/mutomorro</a>
              </p>
            </td>
          </tr>

          <!-- Sign-off with photo -->
          <tr>
            <td class="email-padding" style="padding:0 44px 44px 44px;">
              <p style="margin:0 0 12px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.5;color:#221C2B;">
                Speak soon,
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:16px;">
                    <p style="margin:0;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:400;line-height:1.5;color:#221C2B;">
                      James
                    </p>
                  </td>
                  <td style="vertical-align:middle;">
                    <img src="${photoUrl}" alt="James Freeman-Gray" width="72" height="72" style="display:block;border:0;border-radius:50%;width:72px;height:72px;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FAF6F1;padding:36px 44px;" class="email-padding">
              <img src="https://mutomorro.com/images/mutomorro-logo.png" alt="Mutomorro" width="88" style="display:block;border:0;height:auto;margin-bottom:16px;opacity:0.5;" />
              <p style="margin:0 0 4px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:300;color:rgba(0,0,0,0.35);">
                Helping organisations become intentional ecosystems
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:300;color:rgba(0,0,0,0.35);">
                86-90 Paul Street, London EC2A 4NE
              </p>
              <div style="border-top:1px solid rgba(0,0,0,0.06);margin:0 0 16px 0;"></div>
              <p style="margin:0;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:300;color:rgba(0,0,0,0.3);line-height:1.6;">
                ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color:rgba(0,0,0,0.3);text-decoration:underline;">Unsubscribe</a><span style="color:rgba(0,0,0,0.15);"> &middot; </span>` : ''}
                <a href="https://www.linkedin.com/company/mutomorro" style="color:rgba(0,0,0,0.3);text-decoration:underline;">LinkedIn</a>
                <span style="color:rgba(0,0,0,0.15);"> &middot; </span>
                <a href="https://mutomorro.com" style="color:rgba(0,0,0,0.3);text-decoration:underline;">mutomorro.com</a>
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
