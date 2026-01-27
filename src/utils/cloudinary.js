import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,});


const uploadToCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;

    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    console.log("✅ CLOUDINARY SUCCESS:", response.secure_url);

    fs.unlinkSync(localfilePath); // delete temp file ONLY on success
    return response.secure_url;

  } catch (error) {
    console.error("❌ CLOUDINARY ERROR:", error); // <-- THIS WAS MISSING

    // delete only if file exists
    if (fs.existsSync(localfilePath)) {
      fs.unlinkSync(localfilePath);
    }

    return null;
  }
};




export {uploadToCloudinary};