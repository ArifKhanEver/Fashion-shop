import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadProductImage, uploadCategoryImage, CLOUDINARY_FOLDERS, cloudinary } from "@/lib/cloudinary";
import { CloudinaryUploadResult } from "@/lib/cloudinary";

/**
 * POST /api/upload
 *
 * Handles image uploads via multipart form data.
 * Query param `type` controls which Cloudinary folder the file goes into:
 *   - "product"  → devwonder_fashion/products
 *   - "category" → devwonder_fashion/categories
 *   - "brand"    → devwonder_fashion/brand
 *   - "slider"   → devwonder_fashion/sliders
 *
 * Files are NEVER uploaded to the root Cloudinary directory.
 */
export async function POST(request: NextRequest) {
  // Protect upload endpoint — admin only
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (request.nextUrl.searchParams.get("type") ?? "product") as
      | "product"
      | "category"
      | "brand"
      | "slider"
      | "variant";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the File to a base64 data URI for the Cloudinary SDK
    const bytes = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;

    // Route to the correct isolated folder based on upload type
    let result: CloudinaryUploadResult;
    if (uploadType === "category") {
      result = await uploadCategoryImage(base64);
    } else if (uploadType === "brand") {
      result = await cloudinary.uploader.upload(base64, { folder: CLOUDINARY_FOLDERS.logos, quality: "auto", fetch_format: "auto" });
    } else if (uploadType === "slider") {
      result = await cloudinary.uploader.upload(base64, { folder: CLOUDINARY_FOLDERS.sliders, quality: "auto", fetch_format: "auto" });
    } else if (uploadType === "variant") {
      result = await cloudinary.uploader.upload(base64, { folder: CLOUDINARY_FOLDERS.variants, quality: "auto", fetch_format: "auto" });
    } else {
      // Default: product
      result = await uploadProductImage(base64);
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message ?? "Upload failed" }, { status: 500 });
  }
}
