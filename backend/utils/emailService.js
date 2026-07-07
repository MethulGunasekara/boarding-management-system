const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"BMS Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    // Non-fatal — log but don't crash the request
    console.error(`❌ Email failed to ${to}:`, err.message);
  }
};

const welcomeOwnerEmail = (fullName, planName) => `
  <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; color: #111;">
    <div style="background: linear-gradient(135deg,#564592,#724cf9); padding: 1.5rem 2rem; border-radius: 12px; color: #fff; margin-bottom: 1.5rem;">
      <h1 style="margin:0; font-size: 1.5rem;">Welcome to BMS 🏠</h1>
      <p style="margin: 0.5rem 0 0; opacity: 0.85;">Boarding Management System</p>
    </div>
    <p>Hi <strong>${fullName}</strong>,</p>
    <p>Your owner account has been successfully created. You're now on the <strong>${planName}</strong> plan.</p>
    <p>You can now:</p>
    <ul>
      <li>Register your boarding places</li>
      <li>Admit tenants digitally</li>
      <li>Track rent and split utility bills</li>
    </ul>
    <a href="http://localhost:5173/login" style="display:inline-block; margin-top:1rem; padding: 0.75rem 1.5rem; background: #724cf9; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Sign In Now →
    </a>
    <p style="margin-top: 2rem; color: #6b7280; font-size: 0.85rem;">
      If you have any issues, contact your platform admin.
    </p>
  </div>
`;

module.exports = { sendEmail, welcomeOwnerEmail };