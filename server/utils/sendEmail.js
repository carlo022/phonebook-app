const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_LOGIN || process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('Email configuration is incomplete. Check SMTP_HOST, SMTP_USER/SMTP_EMAIL, and SMTP_PASSWORD.');
    }

    console.log(`📧 Connecting to SMTP: ${smtpHost}:${smtpPort} as ${smtpUser}...`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // Mailtrap uses STARTTLS on port 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Required for Mailtrap
      },
      connectionTimeout: 30000, // 30 seconds for Mailtrap connection
      socketTimeout: 30000,     // 30 seconds for socket operations
    });

    // Use api@mailtrap.io as the sender for Mailtrap sandbox
    const fromEmail = process.env.SMTP_FROM || 'api@mailtrap.io';
    const message = {
      from: fromEmail,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    console.log(`📤 Sending email from ${fromEmail} to ${options.email}...`);
    const info = await transporter.sendMail(message);
    console.log('✅ Email sent successfully: %s', info.messageId);
    return info;

  } catch (error) {
    // THIS IS THE MOST IMPORTANT LINE
    console.error("❌ FULL EMAIL ERROR DETAILS:", error); 
    throw error; // This ensures the API still returns the 500, but now you see the WHY in logs
  }
};

module.exports = sendEmail;