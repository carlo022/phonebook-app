const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const sendEmail = async (options) => {
  // Use the API token from environment variables
  const transport = Nodemailer.createTransport(
    MailtrapTransport({
      token: process.env.MAILTRAP_TOKEN,
    })
  );

  const message = {
    from: {
      address: process.env.SMTP_EMAIL,
      name: "My Phonebook-App",
    },
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transport.sendMail(message);
    console.log('✅ Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
};

module.exports = sendEmail;