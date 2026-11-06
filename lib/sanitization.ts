/**
 * Input sanitization utilities
 *
 * - Sanitize file names to prevent path traversal
 * - Validate file types against allowlist
 * - Sanitize CSV content to prevent formula injection
 * - Strip HTML tags from user input
 */

/**
 * Allowed file extensions for uploads
 */
export const ALLOWED_FILE_EXTENSIONS = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  // Archives
  "zip",
  // Videos
  "mp4",
  "webm",
  // Audio
  "mp3",
  "wav",
];

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  // Videos
  "video/mp4",
  "video/webm",
  // Audio
  "audio/mpeg",
  "audio/wav",
];

/**
 * Sanitize file name to prevent path traversal attacks
 * Removes ../, ./, and other dangerous patterns
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal sequences
  let sanitized = fileName.replace(/[\.\.\/\\]+/g, "");
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, "");
  // Replace spaces and special chars with underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Limit length
  return sanitized.substring(0, 255);
}

/**
 * Get file extension from file name
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

/**
 * Validate file type against allowlist
 */
export function isValidFileType(fileName: string, mimeType: string): boolean {
  const ext = getFileExtension(fileName);
  return ALLOWED_FILE_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Sanitize CSV content to prevent formula injection
 * Excel/Google Sheets can execute formulas starting with =, +, -, @
 */
export function sanitizeCSVContent(content: string): string {
  return content
    .split("\n")
    .map((line) =>
      line
        .split(",")
        .map((cell) => {
          const trimmed = cell.trim();
          // If cell starts with dangerous characters, prefix with tab
          if (/^[=+\-@]/.test(trimmed)) {
            return "\t" + cell;
          }
          return cell;
        })
        .join(",")
    )
    .join("\n");
}

/**
 * Strip HTML tags from user input to prevent stored XSS
 * Use this for fields that should be plain text
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "javascript:" || parsed.protocol === "data:") {
      return "";
    }
    return url;
  } catch {
    return "";
  }
}

/**
 * Validate and sanitize file upload input
 * Returns { fileName, error } — if error is present, reject the upload
 */
export function validateFileUpload(
  file: File,
  maxSizeBytes: number = 50 * 1024 * 1024 // 50MB default
): { fileName: string; error?: string } {
  // Check size
  if (file.size > maxSizeBytes) {
    const maxMB = maxSizeBytes / (1024 * 1024);
    return { fileName: "", error: `File terlalu besar. Maksimal ${maxMB}MB.` };
  }

  // Check type
  if (!isValidFileType(file.name, file.type)) {
    return { fileName: "", error: "Tipe file tidak diizinkan." };
  }

  // Sanitize name
  const sanitized = sanitizeFileName(file.name);
  if (!sanitized) {
    return { fileName: "", error: "Nama file tidak valid." };
  }

  return { fileName: sanitized };
}
