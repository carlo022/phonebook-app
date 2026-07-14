const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    let transporter;

    // If SMTP env vars are not set (common in local dev), create a test account
    const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_LOGIN && process.env.SMTP_PASSWORD;

    if (!hasSMTP) {
      console.warn('⚠️ SMTP credentials missing - falling back to Ethereal test account for email delivery');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: (process.env.SMTP_SECURE === 'true') || false,
        auth: {
          user: process.env.SMTP_LOGIN,
          pass: process.env.SMTP_PASSWORD,
        },
        family: 4,
        connectionTimeout: 10000,
        socketTimeout: 10000,
      });
    }

    const message = {
      from: `"Polyglot Phonebook" <${process.env.SMTP_EMAIL || (process.env.SMTP_LOGIN || 'no-reply@example.com')}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('✅ Email sent successfully: %s', info.messageId);

    // When using Ethereal/Test account, provide preview URL for debugging
    if (nodemailer.getTestMessageUrl) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('🔗 Preview URL: %s', preview);
    }

    return info;
  } catch (error) {
    console.error('❌ FULL EMAIL ERROR DETAILS:', error);
    throw error;
  }
};

module.exports = sendEmail;