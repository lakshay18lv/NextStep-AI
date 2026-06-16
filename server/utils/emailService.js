const nodemailer = require("nodemailer");

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const sendVerificationEmail = async ({ email, name, token }) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("Email transporter is not configured");
  }

  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5000";
  const verificationUrl = `${appBaseUrl}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Verify your NextStep AI account",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2>Verify your NextStep AI account</h2>
        <p>Hello ${name || "User"},</p>
        <p>Click the button below to verify your email address and activate your account.</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background: #111827; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
