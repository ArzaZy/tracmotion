import type { FixtureProject } from "./types";

/** Built-in sample. Invented test data, not a real Alight Motion preset. */
export function createSampleFixture(): FixtureProject {
  return {
    format: "tracmotion-fixture",
    version: 1,
    name: "Contoh Fixture (bukan preset asli)",
    canvas: { width: 1080, height: 1920, fps: 30 },
    layers: [
      { id: "title", name: "Judul", type: "text", startTime: 0, duration: 4, visible: true, properties: { text: "Make something move", fontSize: 64 } },
      { id: "bg", name: "Background", type: "media", startTime: 0, duration: 8, visible: true, properties: { slot: "media-1", fit: "cover" } },
      { id: "accent", name: "Aksen", type: "shape", startTime: 1, duration: 5, visible: false, properties: { shape: "rounded-rect", opacity: 0.8 } },
      { id: "music", name: "Musik", type: "audio", startTime: 0, duration: 8, visible: true, properties: { volume: 0.7 } },
    ],
  };
}
