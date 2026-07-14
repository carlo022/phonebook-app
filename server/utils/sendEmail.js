const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
      user: process.env.SMTP_LOGIN, 
      pass: process.env.SMTP_PASSWORD,
    },
    family: 4 
  });

  const message = {
    from: `"Polyglot Phonebook" <${process.env.SMTP_EMAIL}>`, // Uses your real verified email address
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('✅ Email sent successfully: %s', info.messageId);
};

module.exports = sendEmail;