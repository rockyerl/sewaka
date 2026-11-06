import { put, del, list } from "@vercel/blob";
import { logger } from "@/lib/logger";

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  logger.warn("BLOB_READ_WRITE_TOKEN is not set. File uploads will use placeholder URLs.");
}

export type UploadResult = {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  contentLength: number;
};

export async function uploadFile(
  file: File,
  options?: {
    pathname?: string;
    accessType?: "public" | "private";
  }
): Promise<UploadResult> {
  if (!BLOB_READ_WRITE_TOKEN) {
    // Fallback: return placeholder URL for development without token
    return {
      url: `https://placeholder.example.com/${file.name}`,
      pathname: file.name,
      contentType: file.type,
      contentDisposition: "inline",
      contentLength: file.size,
    };
  }

  const pathname = options?.pathname || `${Date.now()}-${file.name}`;
  const blob = await put(pathname, file, {
    access: options?.accessType || "public",
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    contentDisposition: blob.contentDisposition,
    contentLength: file.size,
  };
}

export async function deleteFile(url: string): Promise<void> {
  if (!BLOB_READ_WRITE_TOKEN) {
    return;
  }

  try {
    await del(url);
  } catch (error) {
    logger.error("Failed to delete file", error);
  }
}

export async function listFiles(prefix?: string): Promise<any[]> {
  if (!BLOB_READ_WRITE_TOKEN) {
    return [];
  }

  try {
    const blobs = await list({ prefix });
    return blobs.blobs;
  } catch (error) {
    logger.error("Failed to list files", error);
    return [];
  }
}
