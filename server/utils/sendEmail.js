const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Forces SSL
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      // Do not fail on invalid certificates
      rejectUnauthorized: false
    },
    // The magic line: Forces Node to use IPv4 instead of IPv6, preventing the 5-minute timeout!
    family: 4 
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