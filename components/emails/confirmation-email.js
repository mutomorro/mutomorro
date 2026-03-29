/**
 * Email 1: Confirm your email address
 *
 * Minimal, single-purpose transactional email.
 * Table-based HTML for email client compatibility.
 */

export function buildConfirmationEmail({ firstName, confirmUrl }) {
  const name = firstName
    ? firstName.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase())
    : ''
  const greeting = name ? `Hi ${name},` : 'Hi there,'

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Confirm your email address</title>
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
                Thanks for signing up to our newsletter. Please confirm your address below:
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td class="email-padding" style="padding:8px 44px 28px 44px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="${confirmUrl}" style="height:52px;v-text-anchor:middle;width:100%;" fill="true" stroke="false">
                      <v:fill type="tile" color="#9B51E0" />
                      <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:400;letter-spacing:0.06em;">Confirm my email address</center>
                    </v:rect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${confirmUrl}" target="_blank" style="display:block;width:100%;padding:16px 0;background-color:#9B51E0;color:#ffffff;text-align:center;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:16px;font-weight:400;letter-spacing:0.06em;text-decoration:none;border-radius:0;-webkit-text-size-adjust:none;">
                      Confirm my email address
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Post-button text -->
          <tr>
            <td class="email-padding" style="padding:0 44px;">
              <p style="margin:0 0 20px;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#221C2B;">
                Once confirmed, you'll get the occasional email from us - thinking on how organisations work, the ideas behind the tools, and patterns we're seeing across the leaders we work with. No more than twice a month, and you can unsubscribe any time.
              </p>
              <p style="margin:0 0 0;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:16px;font-weight:300;line-height:1.75;color:rgba(34,28,43,0.45);">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td class="email-padding" style="padding:32px 44px 44px 44px;">
              <p style="margin:0;font-family:'Source Sans 3','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:400;line-height:1.5;color:#221C2B;">
                James Freeman-Gray
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
