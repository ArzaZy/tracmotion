import { formatBytes } from "../import/validate";
import type { EditError, MediaInfo } from "./types";

/**
 * TracMotion mock validation. This is NOT an official list of media types supported by AM Runtime.
 */
export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

const ALLOWED: readonly { ext: string; mime: string }[] = [
  { ext: ".png", mime: "image/png" },
  { ext: ".jpg", mime: "image/jpeg" },
  { ext: ".jpeg", mime: "image/jpeg" },
  { ext: ".webp", mime: "image/webp" },
  { ext: ".mp4", mime: "video/mp4" },
];

export const MEDIA_ACCEPT = ALLOWED.map((a) => a.ext).join(",");
export const MEDIA_LABEL = `PNG, JPEG, WebP, MP4, maks ${formatBytes(MAX_MEDIA_BYTES)}`;

function entryFor(name: string) {
  const lower = name.toLowerCase();
  return ALLOWED.find((a) => lower.endsWith(a.ext));
}

export function mimeForName(name: string): string | null {
  return entryFor(name)?.mime ?? null;
}

function invalid(message: string): EditError {
  return { code: "invalid-media", message };
}

/** Returns null when the file is acceptable. */
export function validateMedia(info: MediaInfo): EditError | null {
  const entry = entryFor(info.name);
  if (!entry) return invalid(`Tipe file tidak didukung. Gunakan ${MEDIA_LABEL}.`);
  if (info.mimeType !== "" && info.mimeType !== entry.mime) {
    return invalid("Ekstensi file tidak cocok dengan tipe isinya.");
  }
  if (info.size === 0) return invalid("File media kosong.");
  if (info.size > MAX_MEDIA_BYTES) {
    return invalid(`File media terlalu besar (${formatBytes(info.size)}). Batas maksimal ${formatBytes(MAX_MEDIA_BYTES)}.`);
  }
  return null;
}
