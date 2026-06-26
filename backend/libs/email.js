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

export const sendPasswordRecoveryEmail = async (email, username, resetLink) => {
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

export const sendOtpEmail = async (email, username,otp, expiryMinutes) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Login OTP",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.08);">

<tr>
<td style="background:#1DA1F2;padding:28px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;">
Twitter Clone
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#111827;">
Verify Your Login
</h2>

<p style="color:#4b5563;font-size:16px;line-height:1.6;">
Hi <strong>${username}</strong>,
</p>

<p style="color:#4b5563;font-size:16px;line-height:1.6;">
We detected a login attempt from Google Chrome.
To continue securely, please verify your identity using the One-Time Password below.
</p>

<div style="margin:40px 0;text-align:center;">

<div
style="
display:inline-block;
background:#f3f4f6;
padding:18px 40px;
border-radius:10px;
font-size:34px;
font-weight:bold;
letter-spacing:10px;
color:#1DA1F2;
">
${otp}
</div>

</div>

<p style="color:#4b5563;font-size:15px;">
This code will expire in
<strong>${expiryMinutes} minutes</strong>.
</p>

<p style="color:#4b5563;font-size:15px;">
If you didn't attempt to sign in, you can safely ignore this email.
No changes will be made to your account.
</p>

<hr style="margin:35px 0;border:none;border-top:1px solid #e5e7eb;">

<p style="font-size:13px;color:#9ca3af;text-align:center;">
This is an automated security message.<br>
Please do not reply to this email.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  });
};
