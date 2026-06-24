import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoice = async ({
  user,
  plan,
  payment,
  subscription,
}) => {
  const invoiceDir = path.join(
    process.cwd(),
    "invoices"
  );

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, {
      recursive: true,
    });
  }

  const filePath = path.join(
    invoiceDir,
    `${payment.invoiceNumber}.pdf`
  );

  const doc = new PDFDocument();

  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc
    .fontSize(22)
    .text("Subscription Invoice", {
      align: "center",
    });

  doc.moveDown();

  doc.fontSize(12);

  doc.text(
    `Invoice Number: ${payment.invoiceNumber}`
  );

  doc.text(
    `Payment ID: ${payment.razorpayPaymentId}`
  );

  doc.text(
    `Order ID: ${payment.razorpayOrderId}`
  );

  doc.text(
    `Date: ${new Date().toLocaleDateString()}`
  );

  doc.moveDown();

  doc.text(`Customer: ${user.displayName}`);
  doc.text(`Email: ${user.email}`);

  doc.moveDown();

  doc.text(`Plan: ${plan.name}`);
  doc.text(`Amount: ${payment.amount}`);

  doc.moveDown();

  doc.text(
    `Subscription Start: ${subscription.startDate.toDateString()}`
  );

  doc.text(
    `Subscription End: ${subscription.endDate.toDateString()}`
  );

  doc.moveDown(2);

  doc.text(
    "Thank you for your subscription.",
    {
      align: "center",
    }
  );

  await new Promise(
    (resolve, reject) => {
      stream.on("finish", () => resolve());

      stream.on("error", (err) =>
        reject(err)
      );

      doc.end();
    }
  );

  return filePath;
};