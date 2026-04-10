export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "admin@projectreviewer.com"

  if (!BREVO_API_KEY) {
    console.error("BREVO_ERROR: API Key missing from environment")
    return { success: false, error: "Neural Hub Configuration Missing" }
  }

  const payload = {
    sender: { name: "AI FORGE", email: SENDER_EMAIL },
    to: [{ email }],
    subject: "Reset Your PROR Eviewer Pattern",
    htmlContent: `
      <div style="font-family: sans-serif; background: #020617; color: #f8fafc; padding: 40px; border-radius: 20px;">
        <h1 style="color: #6366f1; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">NEURAL LINK RECOVERY</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">You have requested a recalibration of your PROR Eviewer authentication pattern. High-level security protocols are now active.</p>
        <div style="margin: 40px 0;">
          <a href="${resetLink}" style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Establish Neural Reset</a>
        </div>
        <p style="font-size: 12px; color: #475569;">If you did not initiate this sequence, please ignore this broadcast. This link will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 40px 0;">
        <p style="font-size: 10px; color: #334155; text-align: center; text-transform: uppercase;">A I &nbsp; F O R G E &nbsp; C O R E &nbsp; V 0 . 5 9</p>
      </div>
    `
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("BREVO_CRITICAL_FAULT:", data)
      return { success: false, error: `Neural Rejection: ${(data as any).message || "Unknown"}` }
    }

    console.log("BREVO_SUCCESS [Neural Pulse Transmitted]:", data)
    return { success: true }
  } catch (error: unknown) {
    console.error("BREVO_SYSTEM_ERROR:", error)
    return { success: false, error: "System failed to transmit recall pulse. Verify hub configuration." }
  }
}
export async function sendTwoFactorTokenEmail(email: string, token: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "admin@projectreviewer.com"

  if (!BREVO_API_KEY) {
    console.error("BREVO_ERROR: API Key missing from environment")
    return { success: false, error: "Neural Hub Configuration Missing" }
  }

  const payload = {
    sender: { name: "AI FORGE", email: SENDER_EMAIL },
    to: [{ email }],
    subject: "Your 6-Digit Identity Pulse",
    htmlContent: `
      <div style="font-family: sans-serif; background: #020617; color: #f8fafc; padding: 40px; border-radius: 20px; text-align: center;">
        <h1 style="color: #6366f1; border-bottom: 2px solid #1e293b; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Identity Verification</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">A neural pulse has been requested to authorize your access to the PROR Eviewer core. Use the following synchronization code:</p>
        <div style="margin: 40px 0; background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #6366f1;">
          <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #6366f1;">${token}</span>
        </div>
        <p style="font-size: 12px; color: #475569;">This synchronization pulse will expire in 5 minutes. If you did not initiate this sequence, please ignore this broadcast.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 40px 0;">
        <p style="font-size: 10px; color: #334155; text-transform: uppercase;">A I &nbsp; F O R G E &nbsp; C O R E &nbsp; V 0 . 6 0</p>
      </div>
    `
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("BREVO_CRITICAL_FAULT:", data)
      return { success: false, error: `Neural Rejection: ${(data as any).message || "Unknown"}` }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("BREVO_SYSTEM_ERROR:", error)
    return { success: false, error: "System failed to transmit recall pulse." }
  }
}
