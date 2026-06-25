import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendSubscriptionEmail = async ({
  email,
  name,
  planName,
  amount,
  invoiceNumber,
  invoicePath,
  expiryDate,
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Subscription Activated Successfully",
    html: `
      <h2>Hello ${name},</h2>

      <p>Your subscription has been activated successfully.</p>

      <h3>Subscription Details</h3>

      <ul>
        <li><strong>Plan:</strong> ${planName}</li>
        <li><strong>Amount:</strong> ₹${amount}</li>
        <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
        <li><strong>Expiry Date:</strong> ${expiryDate.toDateString()}</li>
      </ul>

      <p>Thank you for choosing our platform.</p>
    `,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        path: invoicePath,
      },
    ],
  });
};

export const sendPasswordRecoveryEmail = async (
  email,
  username,
  resetLink,
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Recovery",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Password Reset Request</h2>

    <p>Hello ${username},</p>

    <p>We received a request to reset your password.</p>

    <p>
      Click the button below to create a new password:
    </p>

    <div style="margin: 20px 0;">
      <a
        href="${resetLink}"
        style="
          background-color: #1DA1F2;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
        "
      >
        Reset Password
      </a>
    </div>

    <p>
      This link will expire in 15 minutes.
    </p>

    <p>
      If you did not request a password reset, you can safely ignore this email.
    </p>

    <hr />

    <small>
      This is an automated email from Twitter Clone.
    </small>
  </div>
`,
  });
};
