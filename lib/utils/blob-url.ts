/**
 * Utility to check if a URL is a Vercel Blob URL and convert it to a proxy URL
 * for private blob stores.
 * 
 * Private blobs cannot be accessed directly from the browser.
 * This function wraps the blob URL with our proxy route.
 */

const BLOB_HOST_PATTERN = /\.blob\.vercel-storage\.com/;

export function getBlobUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }

  // If it's a Vercel Blob URL, wrap it with the proxy
  if (BLOB_HOST_PATTERN.test(url)) {
    return `/api/v1/blob?url=${encodeURIComponent(url)}`;
  }

  // Otherwise, return the URL as-is (public URL, placeholder, etc.)
  return url;
}
