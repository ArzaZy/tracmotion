/**
 * TracMotion fixture format, version 1.
 * This is a TracMotion-owned test format. It is NOT the Alight Motion preset format
 * and NOT an AM Runtime data structure.
 */
export type LayerType = "text" | "media" | "shape" | "audio";
export type PropertyValue = string | number | boolean;

export interface FixtureLayer {
  id: string;
  name: string;
  type: LayerType;
  startTime: number;
  duration: number;
  visible: boolean;
  properties: Record<string, PropertyValue>;
}

export interface FixtureProject {
  format: "tracmotion-fixture";
  version: 1;
  name: string;
  canvas: { width: number; height: number; fps: number };
  layers: FixtureLayer[];
}

export type ImportErrorCode =
  | "unsupported-type"
  | "empty-file"
  | "too-large"
  | "read-failed"
  | "invalid-json"
  | "invalid-format"
  | "invalid-field";

export interface ImportError {
  code: ImportErrorCode;
  message: string;
}

export type ParseResult = { ok: true; project: FixtureProject } | { ok: false; error: ImportError };
