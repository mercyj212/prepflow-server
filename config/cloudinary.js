import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    const isAvatar = file.fieldname === "avatar";
    const cleanName = file.originalname
      .replace(/[^\w.-]/g, "_")
      .replace(/\.[^/.]+$/, "");

    return {
      folder: isAvatar ? "prepflow/avatars" : "prepflow/course-materials",
      resource_type: isPdf ? "raw" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
      public_id: `${Date.now()}-${cleanName}`,
    };
  },
});

const materialMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

const avatarMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const createUpload = (allowedMimeTypes, message) => multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error(message));
  },
});

export const upload = createUpload(materialMimeTypes, "Unsupported file type. Use JPG, PNG, GIF, WEBP, or PDF.");
export const avatarUpload = createUpload(avatarMimeTypes, "Unsupported avatar type. Use JPG, PNG, or WEBP.");

export { cloudinary };
