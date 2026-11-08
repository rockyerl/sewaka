import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for serving private Vercel Blob files.
 * 
 * Private blobs cannot be accessed directly from the browser.
 * This route fetches the blob using the SDK (which has BLOB_READ_WRITE_TOKEN)
 * and streams it to the client with the correct Content-Type.
 * 
 * Usage: /api/v1/blob?url=<blob_url>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const result = await get(blobUrl, { access: "private" });

    if (!result || !result.blob) {
      return NextResponse.json({ error: "Blob not found" }, { status: 404 });
    }

    const { stream, blob } = result;

    return new Response(stream, {
      headers: {
        "Content-Type": blob.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch blob:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
