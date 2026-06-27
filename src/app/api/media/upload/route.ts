import { put } from "@vercel/blob";
import type { NextRequest } from "next/server";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return Response.json(
      { error: `Unsupported type: ${file.type}. Accepted: JPG, PNG, WebP, MP4` },
      { status: 400 }
    );
  }

  // Sanitise filename to avoid URL issues
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blobPath = `media/${Date.now()}-${safeName}`;

  const blob = await put(blobPath, file, {
    access: "public",
    contentType: file.type,
  });

  // storagePath = the blob URL — used for deletion
  return Response.json({
    url: blob.url,
    storagePath: blob.url,
    fileName: file.name,
    mimeType: file.type,
  });
}
