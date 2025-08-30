import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOTP(email: string, otp: string) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@maxfitai.com',
    to: email,
    subject: 'Verify your MAXFIT AI account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00ff88; margin-bottom: 10px;">MAXFIT AI</h1>
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email</h2>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin-bottom: 20px;">
            Enter this verification code to complete your registration:
          </p>
          <div style="background: white; padding: 15px; border-radius: 6px; border: 2px solid #00ff88; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #999; margin-top: 20px; font-size: 14px;">
            This code expires in 10 minutes.
          </p>
        </div>
        
        <p style="color: #666; margin-top: 20px; font-size: 14px; text-align: center;">
          If you didn't request this verification, please ignore this email.
        </p>
      </div>
    `,
  }

  return await transporter.sendMail(mailOptions)
}
