import type { FixtureLayer, FixtureProject, ImportError, LayerType, ParseResult, PropertyValue } from "./types";

const LAYER_TYPES: readonly LayerType[] = ["text", "media", "shape", "audio"];
const MAX_LAYERS = 500;
const MAX_DIMENSION = 16384;
const MAX_FPS = 240;

type Rec = Record<string, unknown>;

function isRecord(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function bad(code: ImportError["code"], message: string): ParseResult {
  return { ok: false, error: { code, message } };
}

function fieldError(path: string, expected: string): ParseResult {
  return bad("invalid-field", `Field "${path}" tidak valid: ${expected}.`);
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Rec)) deepFreeze(child);
  }
  return value;
}

/**
 * Parses text as a TracMotion fixture (version 1). Unknown fields are dropped.
 * The input string is never modified and the returned project is deeply frozen.
 */
export function parseFixture(text: string): ParseResult {
  if (text.trim() === "") return bad("empty-file", "File kosong.");

  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch (e) {
    const detail = e instanceof Error ? ` (${e.message})` : "";
    return bad("invalid-json", `File bukan JSON yang valid${detail}.`);
  }

  if (!isRecord(root)) return bad("invalid-format", "Isi file harus berupa objek JSON.");
  if (root.format !== "tracmotion-fixture") {
    return bad(
      "invalid-format",
      'Bukan fixture TracMotion: field "format" harus "tracmotion-fixture". Preset Alight Motion tidak didukung.'
    );
  }
  if (root.version !== 1) {
    return bad("invalid-format", `Versi fixture ${String(root.version)} tidak didukung. Hanya versi 1.`);
  }
  if (typeof root.name !== "string" || root.name.trim() === "") return fieldError("name", "harus berupa teks tidak kosong");

  const canvas = root.canvas;
  if (!isRecord(canvas)) return fieldError("canvas", "harus berupa objek");
  const { width, height, fps } = canvas;
  if (typeof width !== "number" || !Number.isInteger(width) || width < 1 || width > MAX_DIMENSION) {
    return fieldError("canvas.width", `bilangan bulat 1 sampai ${MAX_DIMENSION}`);
  }
  if (typeof height !== "number" || !Number.isInteger(height) || height < 1 || height > MAX_DIMENSION) {
    return fieldError("canvas.height", `bilangan bulat 1 sampai ${MAX_DIMENSION}`);
  }
  if (typeof fps !== "number" || !Number.isFinite(fps) || fps <= 0 || fps > MAX_FPS) {
    return fieldError("canvas.fps", `angka lebih dari 0 sampai ${MAX_FPS}`);
  }

  if (!Array.isArray(root.layers)) return fieldError("layers", "harus berupa array");
  if (root.layers.length > MAX_LAYERS) return bad("invalid-field", `Jumlah layer melebihi batas ${MAX_LAYERS}.`);

  const layers: FixtureLayer[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < root.layers.length; i++) {
    const raw: unknown = root.layers[i];
    const at = `layers[${i}]`;
    if (!isRecord(raw)) return fieldError(at, "harus berupa objek");
    if (typeof raw.id !== "string" || raw.id === "") return fieldError(`${at}.id`, "harus berupa teks tidak kosong");
    if (seen.has(raw.id)) return fieldError(`${at}.id`, `id "${raw.id}" duplikat`);
    seen.add(raw.id);
    if (typeof raw.name !== "string" || raw.name.trim() === "") return fieldError(`${at}.name`, "harus berupa teks tidak kosong");
    const type = LAYER_TYPES.find((t) => t === raw.type);
    if (!type) return fieldError(`${at}.type`, `salah satu dari ${LAYER_TYPES.join(", ")}`);
    if (!isNonNegative(raw.startTime)) return fieldError(`${at}.startTime`, "angka 0 atau lebih");
    if (!isNonNegative(raw.duration)) return fieldError(`${at}.duration`, "angka 0 atau lebih");
    if (raw.visible !== undefined && typeof raw.visible !== "boolean") return fieldError(`${at}.visible`, "harus true atau false");

    const properties: Record<string, PropertyValue> = {};
    if (raw.properties !== undefined) {
      if (!isRecord(raw.properties)) return fieldError(`${at}.properties`, "harus berupa objek");
      for (const [key, value] of Object.entries(raw.properties)) {
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
          return fieldError(`${at}.properties.${key}`, "harus berupa teks, angka, atau true/false");
        }
        properties[key] = value;
      }
    }

    layers.push({ id: raw.id, name: raw.name, type, startTime: raw.startTime, duration: raw.duration, visible: raw.visible ?? true, properties });
  }

  const project: FixtureProject = {
    format: "tracmotion-fixture",
    version: 1,
    name: root.name,
    canvas: { width, height, fps },
    layers,
  };
  return { ok: true, project: deepFreeze(project) };
}
