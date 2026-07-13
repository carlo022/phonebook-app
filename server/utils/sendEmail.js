const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use the built-in 'gmail' service instead of manual host/port
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `"My Phonebook-App" <${process.env.SMTP_EMAIL}>`, 
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('✅ Real Email sent: %s', info.messageId);
};

module.exports = sendEmail;