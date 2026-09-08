import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY || "834928174928194",
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
