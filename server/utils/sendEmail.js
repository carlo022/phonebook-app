const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using your SMTP credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for port 465, false for port 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Define the email payload
  const message = {
    from: `"My Phonebook-App" <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email
  const info = await transporter.sendMail(message);
  console.log('✅ Email sent: %s', info.messageId);
};

module.exports = sendEmail;