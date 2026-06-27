import { del } from "@vercel/blob";
import type { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.storagePath || typeof body.storagePath !== "string") {
    return Response.json({ error: "storagePath is required" }, { status: 400 });
  }

  // storagePath is the full Vercel Blob URL
  await del(body.storagePath);

  return Response.json({ success: true });
}
