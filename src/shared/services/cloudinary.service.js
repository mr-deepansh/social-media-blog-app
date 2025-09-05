import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = "posts") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      quality: "auto",
      format: "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async publicId => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Delete failed:", error);
  }
};
