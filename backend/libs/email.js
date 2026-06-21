import nodemailer from "nodemailer";

export const sendSubscriptionEmail = async ({
  email,
  name,
  planName,
  amount,
  invoiceNumber,
  invoiceUrl,
  expiryDate,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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

      <p>
        <a href="${invoiceUrl}">
          Download Invoice
        </a>
      </p>

      <p>Thank you for choosing our platform.</p>
    `,
  });
};