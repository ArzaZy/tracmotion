import type { ImportError } from "./types";

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Checks file name and size before the file is read. Returns null when acceptable. */
export function validateFile(name: string, size: number): ImportError | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".xml")) {
    return {
      code: "unsupported-type",
      message:
        "File .xml (preset Alight Motion) belum didukung karena formatnya belum diverifikasi. Gunakan fixture TracMotion berformat .json.",
    };
  }
  if (!lower.endsWith(".json")) {
    return { code: "unsupported-type", message: "Tipe file tidak didukung. Gunakan file .json." };
  }
  if (size === 0) {
    return { code: "empty-file", message: "File kosong." };
  }
  if (size > MAX_IMPORT_BYTES) {
    return {
      code: "too-large",
      message: `File terlalu besar (${formatBytes(size)}). Batas maksimal ${formatBytes(MAX_IMPORT_BYTES)}.`,
    };
  }
  return null;
}
