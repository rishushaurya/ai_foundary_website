/**
 * Direct Image URL Helper & Normalizer
 * Converts Google Drive sharing links, Discord CDN, Dropbox, Imgur, Unsplash,
 * and direct HTTPS image URLs into production-safe streaming image sources.
 */

export function normalizeImageUrl(url?: string | null, fallback = "/images/rectangle-899.png"): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return fallback;
  }

  const trimmed = url.trim();

  // 1. Google Drive Sharing Link Normalization
  // Formats:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  const gDriveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // 2. Dropbox Link Normalization (convert ?dl=0 to ?raw=1)
  if (trimmed.includes("dropbox.com")) {
    return trimmed.replace(/\?dl=0/g, "?raw=1").replace(/\?dl=1/g, "?raw=1");
  }

  // 3. Google Photos / Direct URLs / Relative URLs
  return trimmed;
}

/**
 * Checks if a string is a valid remote or local image URL
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
}
