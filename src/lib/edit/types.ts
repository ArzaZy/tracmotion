import type { FixtureProject } from "../import/types";

/**
 * TracMotion-owned editing contract. These are NOT AM Runtime method names.
 * The only implementation today is the MOCK adapter, which edits in-memory fixture data.
 */
export type EditErrorCode =
  | "invalid-layer"
  | "wrong-layer-type"
  | "invalid-text"
  | "invalid-media"
  | "adapter-failed";

export interface EditError {
  code: EditErrorCode;
  message: string;
}

export type EditResult = { ok: true; project: FixtureProject } | { ok: false; error: EditError };

export interface MediaInfo {
  name: string;
  /** May be an empty string: some mobile browsers do not report a type. */
  mimeType: string;
  size: number;
}

export interface EditAdapter {
  readonly mode: "mock" | "real";
  /** Returns a new project. Must never mutate the project it receives. */
  setText(project: FixtureProject, layerId: string, text: string): Promise<EditResult>;
  applyMedia(project: FixtureProject, layerId: string, media: MediaInfo): Promise<EditResult>;
}
