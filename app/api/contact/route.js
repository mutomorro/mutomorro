import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { name, email, organisation, message } = await request.json()

    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'Mutomorro Website <hello@mutomorro.com>',
      to: 'hello@mutomorro.com',
      replyTo: email,
      subject: `New enquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #221C2B;">New enquiry from the Mutomorro website</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600; width: 140px;">Name</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            ${organisation ? `
            <tr>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee; font-weight: 600;">Organisation</td>
              <td style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">${organisation}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 0.75rem 0; font-weight: 600; vertical-align: top;">Message</td>
              <td style="padding: 0.75rem 0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <p style="margin-top: 2rem; color: #888; font-size: 0.85rem;">
            Sent from mutomorro.com/contact - reply directly to this email to respond.
          </p>
        </div>
      `,
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error('Contact form error:', error)
    return Response.json(
      { error: 'Something went wrong - please try again' },
      { status: 500 }
    )
  }
}