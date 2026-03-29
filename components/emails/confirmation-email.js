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
  <!--[if mso]>
  <style>table,td{font-family:Arial,Helvetica,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FAF6F1;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF6F1;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;width:100%;background-color:#ffffff;">

          <!-- Logo -->
          <tr>
            <td style="padding:40px 40px 32px 40px;">
              <img src="https://mutomorro.com/logo-black.svg" alt="Mutomorro" width="130" style="display:block;border:0;height:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px;">
              <p style="margin:0 0 20px;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#000000;">
                ${greeting}
              </p>
              <p style="margin:0 0 20px;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#000000;">
                Thanks for signing up to our newsletter. Please confirm your address below:
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td style="padding:8px 40px 28px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${confirmUrl}" style="height:52px;v-text-anchor:middle;width:100%;" fill="true" stroke="false">
                      <v:fill type="tile" color="#9B51E0" />
                      <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:400;">Confirm my email address</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${confirmUrl}" target="_blank" style="display:block;width:100%;padding:16px 0;background-color:#9B51E0;color:#ffffff;text-align:center;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:16px;font-weight:400;letter-spacing:0.06em;text-decoration:none;-webkit-text-size-adjust:none;">
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
            <td style="padding:0 40px;">
              <p style="margin:0 0 20px;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:18px;font-weight:300;line-height:1.75;color:#000000;">
                Once confirmed, you'll get the occasional email from us - thinking on how organisations work, the ideas behind the tools, and patterns we're seeing across the leaders we work with. No more than twice a month, and you can unsubscribe any time.
              </p>
              <p style="margin:0 0 0;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:16px;font-weight:300;line-height:1.75;color:rgba(0,0,0,0.45);">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:32px 40px 44px 40px;">
              <p style="margin:0 0 2px;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:18px;font-weight:400;line-height:1.5;color:#000000;">
                James Freeman-Gray
              </p>
              <p style="margin:0;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;font-size:16px;font-weight:300;line-height:1.5;color:rgba(0,0,0,0.5);">
                Mutomorro
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
