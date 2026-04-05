import * as brevo from '@getbrevo/brevo'

let apiInstance: brevo.TransactionalEmailsApi | null = null

export function getBrevoClient() {
  if (apiInstance) return apiInstance

  apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY || ''
  )
  return apiInstance
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const client = getBrevoClient()
  const sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.subject = "Reset Your PROR Eviewer Pattern"
  sendSmtpEmail.sender = { 
    name: "AI FORGE", 
    email: process.env.BREVO_SENDER_EMAIL || "odewunmimohammed@gmail.com" 
  }
  sendSmtpEmail.to = [{ email }]
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif; background: #020617; color: #f8fafc; padding: 40px; border-radius: 20px;">
      <h1 style="color: #6366f1; border-bottom: 2px solid #1e293b; padding-bottom: 10px;">NEURAL LINK RECOVERY</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">You have requested a recalibration of your PROR Eviewer authentication pattern. High-level security protocols are now active.</p>
      <div style="margin: 40px 0;">
        <a href="${resetLink}" style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Establish Neural Reset</a>
      </div>
      <p style="font-size: 12px; color: #475569;">If you did not initiate this sequence, please ignore this broadcast. This link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 40px 0;">
      <p style="font-size: 10px; color: #334155; text-align: center; text-transform: uppercase;">A I &nbsp; F O R G E &nbsp; C O R E &nbsp; V 0 . 5 5</p>
    </div>
  `

  try {
    await client.sendTransacEmail(sendSmtpEmail)
    return { success: true }
  } catch (error) {
    console.error("BREVO_ERROR:", error)
    return { success: false, error: "System failed to transmit recall pulse. Verify hub configuration." }
  }
}
