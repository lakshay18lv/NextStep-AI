const nodemailer = require("nodemailer");

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendVerificationEmail = async ({ email, name, token }) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || "no-reply@example.com";
  const verifyLink = `${process.env.SERVER_URL.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <p>Hi ${name || ""},</p>
    <p>Click the link below to verify your email for NextStep:</p>
    <p><a href="${verifyLink}">Verify email</a></p>
    <p>If the link does not work, use this token: <code>${token}</code></p>
    <p>This link expires in 24 hours.</p>
  `;

  await transporter.sendMail({
    from,
    to: email,
    subject: "NextStep — verify your email",
    text: `Verify: ${verifyLink}\nToken: ${token}`,
    html,
  });
};

module.exports = { sendVerificationEmail };
