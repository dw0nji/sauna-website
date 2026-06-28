import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const noti_email = process.env.EMAIL_ADDRESS
const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL

const FROM = `Cool Coo Sauna <${noti_email}>`

const GOOGLE_LOCATION_URL = process.env.GOOGLE_LOCATION_URL

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function POST(req: NextRequest) {
  const { customerName, customerEmail, customerPhone, date, time, packageName } = await req.json()

  if (!customerEmail || !date || !time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: 'Your Cool Coo Sauna Booking is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background:#111827;padding:36px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">Cool Coo Sauna</h1>
                  <p style="margin:6px 0 0;color:#9ca3af;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Fort William, Scottish Highlands</p>
                </td>
              </tr>

              <!-- Confirmation badge -->
              <tr>
                <td style="padding:36px 40px 0;text-align:center;">
                  
                  <h2 style="margin:20px 0 6px;color:#111827;font-size:22px;">See you soon, ${customerName}!</h2>
                  <p style="margin:0;color:#6b7280;font-size:15px;">Here's a summary of your upcoming session.</p>
                </td>
              </tr>

              <!-- Details card -->
              <tr>
                <td style="padding:28px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="8">
                          <tr>
                            <td style="color:#6b7280;font-size:13px;padding:6px 0;width:40%;">Package</td>
                            <td style="color:#111827;font-size:13px;font-weight:600;padding:6px 0;">${packageName}</td>
                          </tr>
                          <tr>
                            <td style="color:#6b7280;font-size:13px;padding:6px 0;border-top:1px solid #e5e7eb;">Date</td>
                            <td style="color:#111827;font-size:13px;font-weight:600;padding:6px 0;border-top:1px solid #e5e7eb;">${formatDate(date)}</td>
                          </tr>
                          <tr>
                            <td style="color:#6b7280;font-size:13px;padding:6px 0;border-top:1px solid #e5e7eb;">Time</td>
                            <td style="color:#111827;font-size:13px;font-weight:600;padding:6px 0;border-top:1px solid #e5e7eb;">${time}</td>
                          </tr>
                          <tr>
                            <td style="color:#6b7280;font-size:13px;padding:6px 0;border-top:1px solid #e5e7eb;">Name</td>
                            <td style="color:#111827;font-size:13px;font-weight:600;padding:6px 0;border-top:1px solid #e5e7eb;">${customerName}</td>
                          </tr>
                          ${customerPhone ? `
                          <tr>
                            <td style="color:#6b7280;font-size:13px;padding:6px 0;border-top:1px solid #e5e7eb;">Phone</td>
                            <td style="color:#111827;font-size:13px;font-weight:600;padding:6px 0;border-top:1px solid #e5e7eb;">${customerPhone}</td>
                          </tr>` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:0 40px 36px;text-align:center;">
                  <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">
                    If you have any questions, please contact us at<br/>
                    <a href="mailto:${email}" style="color:#d97706;">${email}</a><br/><br/>
                    You can also find us at<br/>
                    <a href="${GOOGLE_LOCATION_URL}" style="color:#d97706;">Fort William, Scottish Highlands</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f3f4f6;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Cool Coo Sauna · Fort William, Scottish Highlands</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  

  await resend.emails.send({
    from: FROM,
    to: email!,
    subject: 'New Booking!',
    html: `
      <p>You have a new booking!</p>
      <ul>
        <li><strong>Name:</strong> ${customerName}</li>
        <li><strong>Email:</strong> ${customerEmail}</li>
        ${customerPhone ? `<li><strong>Phone:</strong> ${customerPhone}</li>` : ''}
        <li><strong>Package:</strong> ${packageName}</li>
        <li><strong>Date:</strong> ${formatDate(date)}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_DOMAIN}">View in admin</a></p>
    `,
  })

  return NextResponse.json({ success: true })
}
