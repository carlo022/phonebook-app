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

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      family: 4,
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    const message = {
      from: `"My Phonebook-App" <${process.env.SMTP_FROM || process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

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