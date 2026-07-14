const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT, // Ensure this is 2525
      secure: false,
      auth: {
        user: process.env.SMTP_LOGIN,
        pass: process.env.SMTP_PASSWORD,
      },
      family: 4,
      connectionTimeout: 10000, // Force timeout in 10s so you don't wait 4 minutes
      socketTimeout: 10000 
    });

    const message = {
      from: `"Polyglot Phonebook" <${process.env.SMTP_EMAIL}>`,
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