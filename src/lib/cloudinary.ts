import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// ─── Folder Constants ─────────────────────────────────────────────────────────
// IMPORTANT: All uploads MUST go into these strict isolated folders so they
// never mix with other projects in the same Cloudinary account.

export const CLOUDINARY_FOLDERS = {
  products: "devwonder_fashion/products",
  categories: "devwonder_fashion/categories",
  logos: "devwonder_fashion/brand",
  sliders: "devwonder_fashion/sliders",
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

// ─── Upload Functions ─────────────────────────────────────────────────────────

/**
 * Uploads a product image to the strictly isolated products folder.
 * Never uploads to the root directory.
 */
export async function uploadProductImage(
  fileData: string // base64 data URI or URL
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(fileData, CLOUDINARY_FOLDERS.products);
}

/**
 * Uploads a category image to the strictly isolated categories folder.
 * Never uploads to the root directory.
 */
export async function uploadCategoryImage(
  fileData: string // base64 data URI or URL
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(fileData, CLOUDINARY_FOLDERS.categories);
}

/**
 * Core upload function. Requires an explicit folder path from CLOUDINARY_FOLDERS
 * to enforce strict folder isolation. NEVER use a raw string as the folder arg.
 */
async function uploadToCloudinary(
  fileData: string,
  folder: CloudinaryFolder
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    quality: "auto",
    fetch_format: "auto",
    use_filename: false,
    unique_filename: true,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    resource_type: result.resource_type,
  };
}

/**
 * Delete an image from Cloudinary by its public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
