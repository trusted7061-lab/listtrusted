const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Only set SendGrid API key if it exists and is valid
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Gmail SMTP transporter (fallback when SendGrid is not configured)
let gmailTransporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  // Verify connection on startup
  gmailTransporter.verify()
    .then(() => console.log('✅ Gmail SMTP connected successfully'))
    .catch(err => {
      console.error('❌ Gmail SMTP connection failed:', err.message);
      console.log('   → Make sure GMAIL_APP_PASSWORD is a valid Google App Password');
      console.log('   → Generate one at: https://myaccount.google.com/apppasswords');
      gmailTransporter = null;
    });
}

const sendEmail = async (to, subject, text) => {
  // Priority 1: SendGrid
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL,
      subject,
      text
    };
    await sgMail.send(msg);
    console.log(`📧 Email sent via SendGrid to ${to}`);
    return;
  }

  // Priority 2: Gmail SMTP via Nodemailer
  if (gmailTransporter) {
    await gmailTransporter.sendMail({
      from: `"${process.env.SENDGRID_FROM_NAME || 'Trusted Escort'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#333;margin-bottom:16px;">${subject}</h2>
        <p style="font-size:16px;line-height:1.6;color:#555;">${text.replace(/\n/g, '<br>')}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="font-size:12px;color:#999;">Trusted Escort — trustedescort.in</p>
      </div>`
    });
    console.log(`📧 Email sent via Gmail SMTP to ${to}`);
    return;
  }

  // Priority 3: Console simulation (no email service configured)
  console.log('⚠️  === EMAIL SIMULATION (No email service configured) ===');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${text}`);
  console.log('   → To send real emails, set GMAIL_APP_PASSWORD in Render environment variables');
  console.log('   → Generate App Password: https://myaccount.google.com/apppasswords');
  console.log('===============================================');
};

module.exports = sendEmail;