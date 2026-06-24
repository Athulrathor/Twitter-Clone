import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadInvoice = async (pdfPath, invoiceNumber) => {
  try {
    // const result = await cloudinary.uploader.upload(pdfPath, {
    //   resource_type: "raw",
    //   folder: "invoice-creations",
    //   public_id: invoiceNumber,
    // });

    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );

    console.log(result);

    return result.secure_url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
