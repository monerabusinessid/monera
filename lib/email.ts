import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Email configuration
const createTransporter = () => {
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }

  // If no SMTP credentials, use a test account (for development)
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️  SMTP credentials not configured. Using test account.')
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test',
      },
    })
  }

  return nodemailer.createTransport(emailConfig)
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = createTransporter()
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@monera.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Monera!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Monera, ${name}!</h1>
        <p>Thank you for joining our talent hunting platform. We're excited to have you on board.</p>
        <p>Get started by completing your profile and exploring opportunities.</p>
        <p>Best regards,<br>The Monera Team</p>
      </div>
    `,
    text: `Welcome to Monera, ${name}! Thank you for joining our talent hunting platform.`,
  }),

  applicationReceived: (candidateName: string, jobTitle: string, companyName: string) => ({
    subject: `Application Received - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Application Received</h1>
        <p>Hi ${candidateName},</p>
        <p>We've received your application for the position of <strong>${jobTitle}</strong> at ${companyName}.</p>
        <p>Our team will review your application and get back to you soon.</p>
        <p>Best regards,<br>The Monera Team</p>
      </div>
    `,
    text: `Hi ${candidateName}, We've received your application for ${jobTitle} at ${companyName}.`,
  }),

  applicationStatusUpdate: (
    candidateName: string,
    jobTitle: string,
    status: string,
    companyName?: string
  ) => ({
    subject: `Application Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Application Status Update</h1>
        <p>Hi ${candidateName},</p>
        <p>Your application for <strong>${jobTitle}</strong>${companyName ? ` at ${companyName}` : ''} has been updated.</p>
        <p><strong>New Status:</strong> ${status}</p>
        <p>Log in to your account to view more details.</p>
        <p>Best regards,<br>The Monera Team</p>
      </div>
    `,
    text: `Hi ${candidateName}, Your application for ${jobTitle} status has been updated to ${status}.`,
  }),

  newApplication: (recruiterName: string, candidateName: string, jobTitle: string) => ({
    subject: `New Application - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Application Received</h1>
        <p>Hi ${recruiterName},</p>
        <p>You have received a new application from <strong>${candidateName}</strong> for the position of <strong>${jobTitle}</strong>.</p>
        <p>Log in to review the application.</p>
        <p>Best regards,<br>The Monera Team</p>
      </div>
    `,
    text: `Hi ${recruiterName}, You have received a new application from ${candidateName} for ${jobTitle}.`,
  }),

  passwordReset: (name: string, resetToken: string) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    return {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Password Reset Request</h1>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Monera Team</p>
        </div>
      `,
      text: `Hi ${name}, Click this link to reset your password: ${resetUrl}`,
    }
  },

  newTalentRequest: (
    clientName: string,
    email: string,
    company: string | null,
    talentType: string,
    budget: string,
    notes: string | null,
    requestId: string
  ) => {
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/talent-requests/${requestId}`
    return {
      subject: 'New Talent Request Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">New Talent Request Received</h1>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #0070f3;">Request Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Client Name:</td>
                <td style="padding: 8px 0;">${escapeHtml(clientName)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0070f3;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Company:</td>
                <td style="padding: 8px 0;">${company ? escapeHtml(company) : '<em style="color: #999;">Not provided</em>'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Talent Type:</td>
                <td style="padding: 8px 0;"><strong style="color: #0070f3;">${escapeHtml(talentType)}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Budget:</td>
                <td style="padding: 8px 0;"><strong style="color: #28a745;">${escapeHtml(budget)}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Notes:</td>
                <td style="padding: 8px 0; white-space: pre-wrap;">${notes ? escapeHtml(notes).replace(/\n/g, '<br>') : '<em style="color: #999;">No notes provided</em>'}</td>
              </tr>
            </table>
          </div>
          
          <p style="margin: 20px 0;">
            <a href="${adminUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Request in Dashboard</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated notification from the Monera Talent Hunting Platform.
          </p>
        </div>
      `,
      text: `New Talent Request Received\n\nClient Name: ${clientName}\nEmail: ${email}\nCompany: ${company || 'Not provided'}\nTalent Type: ${talentType}\nBudget: ${budget}\nNotes: ${notes || 'No notes provided'}\n\nView request: ${adminUrl}`,
    }
  },

  emailVerification: (name: string, code: string, email: string) => {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?email=${encodeURIComponent(email)}`
    return {
      subject: 'Verify Your Email - Monera',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Monera</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Premium Talent Marketplace</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
            <p style="color: #e9d5ff; margin: 0; font-size: 16px; line-height: 1.6;">
              Hi ${escapeHtml(name || 'there')},<br><br>
              Thank you for signing up for Monera! Please verify your email address by entering the code below:
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; border: 2px dashed #7c3aed;">
            <p style="color: #666; margin: 0 0 15px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #7c3aed;">
              <p style="color: #7c3aed; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>
            <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">This code will expire in 10 minutes</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>💡 Tip:</strong> Enter this code on the verification page, or click the button below to verify automatically.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${verifyUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
              If you didn't create an account with Monera, you can safely ignore this email.
            </p>
            <p style="color: #999; margin: 0; font-size: 12px;">
              This is an automated message from Monera. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `Verify Your Email - Monera\n\nHi ${name || 'there'},\n\nThank you for signing up for Monera! Please verify your email address by entering this code:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nOr visit: ${verifyUrl}\n\nIf you didn't create an account with Monera, you can safely ignore this email.`,
    }
  },
}
