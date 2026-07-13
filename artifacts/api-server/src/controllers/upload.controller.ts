import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No image file provided.");
  }

  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "arvind-enterprises-products" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as { secure_url: string });
      },
    );
    stream.end(req.file!.buffer);
  });

  res.json({ url: uploadResult.secure_url });
});
