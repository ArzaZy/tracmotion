import type { FixtureProject, LayerType, PropertyValue } from "../import/types";
import { mimeForName, validateMedia } from "./media";
import type { EditAdapter, EditErrorCode, EditResult } from "./types";

/**
 * MOCK ONLY. Changes in-memory fixture data and returns a new project.
 * It does NOT call AM Runtime, writes nothing to disk and persists nothing.
 */
export const MAX_TEXT_LENGTH = 500;

function fail(code: EditErrorCode, message: string): EditResult {
  return { ok: false, error: { code, message } };
}

function updateProperties(
  project: FixtureProject,
  layerId: string,
  expected: LayerType,
  props: Record<string, PropertyValue>
): EditResult {
  const layer = project.layers.find((l) => l.id === layerId);
  if (!layer) return fail("invalid-layer", `Layer "${layerId}" tidak ditemukan.`);
  if (layer.type !== expected) {
    return fail("wrong-layer-type", `Layer "${layer.name}" bertipe ${layer.type}, bukan ${expected}.`);
  }
  const layers = project.layers.map((l) => (l.id === layerId ? { ...l, properties: { ...l.properties, ...props } } : l));
  return { ok: true, project: { ...project, layers } };
}

export const mockEditAdapter: EditAdapter = {
  mode: "mock",
  async setText(project, layerId, text) {
    if (text.trim() === "") return fail("invalid-text", "Teks tidak boleh kosong.");
    if (text.length > MAX_TEXT_LENGTH) {
      return fail("invalid-text", `Teks terlalu panjang (${text.length} karakter). Maksimal ${MAX_TEXT_LENGTH}.`);
    }
    return updateProperties(project, layerId, "text", { text });
  },
  async applyMedia(project, layerId, media) {
    const error = validateMedia(media);
    if (error) return { ok: false, error };
    return updateProperties(project, layerId, "media", {
      mediaFile: media.name,
      mediaType: mimeForName(media.name) ?? media.mimeType,
      mediaSize: media.size,
    });
  },
};
