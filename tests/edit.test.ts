import assert from "node:assert/strict";
import test from "node:test";
import { MAX_MEDIA_BYTES, validateMedia } from "../src/lib/edit/media";
import { MAX_TEXT_LENGTH, mockEditAdapter } from "../src/lib/edit/mock-edit-adapter";
import {
  applyDraft,
  applyMediaTo,
  countPending,
  createSession,
  currentText,
  getLayerEditState,
  revertLayer,
  setDraft,
  type EditSession,
} from "../src/lib/edit/session";
import type { EditAdapter } from "../src/lib/edit/types";
import { parseFixture } from "../src/lib/import/parse-fixture";
import { createSampleFixture } from "../src/lib/import/sample-fixture";

function newSession(): EditSession {
  const result = parseFixture(JSON.stringify(createSampleFixture()));
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("fixture must parse");
  return createSession(result.project);
}

function textOf(session: EditSession, id: string): string {
  const layer = session.working.layers.find((l) => l.id === id);
  return layer ? currentText(layer) : "";
}

const png = { name: "photo.png", mimeType: "image/png", size: 1000 };

test("typing text creates an unsaved draft and leaves the working copy alone", () => {
  const s = setDraft(newSession(), "title", "Halo");
  assert.equal(getLayerEditState(s, "title"), "unsaved");
  assert.equal(textOf(s, "title"), "Make something move");
  assert.deepEqual(countPending(s), { unsaved: 1, applied: 0 });
});

test("typing the current text again clears the draft", () => {
  const s = setDraft(setDraft(newSession(), "title", "Halo"), "title", "Make something move");
  assert.equal(getLayerEditState(s, "title"), "original");
});

test("applying a draft changes the working copy, never the original", async () => {
  const start = newSession();
  const { session, error } = await applyDraft(setDraft(start, "title", "Halo"), "title", mockEditAdapter);
  assert.equal(error, null);
  assert.equal(textOf(session, "title"), "Halo");
  assert.equal(currentText(session.original.layers[0]), "Make something move");
  assert.equal(Object.isFrozen(session.original), true);
  assert.equal(getLayerEditState(session, "title"), "applied");
  assert.deepEqual(countPending(session), { unsaved: 0, applied: 1 });
});

test("reverting a layer restores the original and clears its draft", async () => {
  const applied = (await applyDraft(setDraft(newSession(), "title", "Halo"), "title", mockEditAdapter)).session;
  const reverted = revertLayer(setDraft(applied, "title", "Lagi"), "title");
  assert.equal(textOf(reverted, "title"), "Make something move");
  assert.equal(getLayerEditState(reverted, "title"), "original");
});

test("applying the same text as the source reads as original", async () => {
  const a = (await applyDraft(setDraft(newSession(), "title", "Halo"), "title", mockEditAdapter)).session;
  const b = (await applyDraft(setDraft(a, "title", "Make something move"), "title", mockEditAdapter)).session;
  assert.equal(getLayerEditState(b, "title"), "original");
});

test("empty and too-long text are rejected and the draft is kept", async () => {
  const empty = await applyDraft(setDraft(newSession(), "title", "   "), "title", mockEditAdapter);
  assert.equal(empty.error?.code, "invalid-text");
  assert.equal(getLayerEditState(empty.session, "title"), "unsaved");
  const long = await applyDraft(setDraft(newSession(), "title", "a".repeat(MAX_TEXT_LENGTH + 1)), "title", mockEditAdapter);
  assert.equal(long.error?.code, "invalid-text");
  assert.equal(textOf(long.session, "title"), "Make something move");
});

test("adapter errors on text keep the session unchanged", async () => {
  const wrongType = await mockEditAdapter.setText(newSession().working, "bg", "x");
  assert.equal(wrongType.ok, false);
  if (!wrongType.ok) assert.equal(wrongType.error.code, "wrong-layer-type");
  const missing = await mockEditAdapter.setText(newSession().working, "nope", "x");
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error.code, "invalid-layer");
});

test("an adapter that throws becomes adapter-failed and nothing changes", async () => {
  const broken: EditAdapter = {
    mode: "mock",
    async setText() {
      throw new Error("worker offline");
    },
    async applyMedia() {
      throw new Error("worker offline");
    },
  };
  const drafted = setDraft(newSession(), "title", "Halo");
  const text = await applyDraft(drafted, "title", broken);
  assert.equal(text.error?.code, "adapter-failed");
  assert.match(text.error?.message ?? "", /worker offline/);
  assert.equal(text.session, drafted);
  const media = await applyMediaTo(newSession(), "bg", png, broken);
  assert.equal(media.error?.code, "adapter-failed");
});

test("an adapter that returns ok:false is passed through", async () => {
  const refusing: EditAdapter = {
    mode: "mock",
    async setText() {
      return { ok: false, error: { code: "adapter-failed", message: "ditolak" } };
    },
    async applyMedia() {
      return { ok: false, error: { code: "adapter-failed", message: "ditolak" } };
    },
  };
  const drafted = setDraft(newSession(), "title", "Halo");
  const out = await applyDraft(drafted, "title", refusing);
  assert.equal(out.error?.message, "ditolak");
  assert.equal(out.session, drafted);
});

test("validateMedia accepts supported files", () => {
  assert.equal(validateMedia(png), null);
  assert.equal(validateMedia({ name: "A.JPG", mimeType: "image/jpeg", size: 5 }), null);
  assert.equal(validateMedia({ name: "clip.mp4", mimeType: "", size: 5 }), null);
});

test("validateMedia rejects bad type, mismatch, empty and oversized files", () => {
  assert.equal(validateMedia({ name: "a.exe", mimeType: "", size: 5 })?.code, "invalid-media");
  assert.equal(validateMedia({ name: "a.png", mimeType: "video/mp4", size: 5 })?.code, "invalid-media");
  assert.equal(validateMedia({ name: "a.png", mimeType: "image/png", size: 0 })?.code, "invalid-media");
  assert.equal(validateMedia({ name: "a.png", mimeType: "image/png", size: MAX_MEDIA_BYTES + 1 })?.code, "invalid-media");
  assert.equal(validateMedia({ name: "a.png", mimeType: "image/png", size: MAX_MEDIA_BYTES }), null);
});

test("applying media records file info on a media layer only", async () => {
  const ok = await applyMediaTo(newSession(), "bg", png, mockEditAdapter);
  assert.equal(ok.error, null);
  const layer = ok.session.working.layers.find((l) => l.id === "bg");
  assert.equal(layer?.properties.mediaFile, "photo.png");
  assert.equal(layer?.properties.mediaType, "image/png");
  assert.equal(layer?.properties.slot, "media-1");
  assert.equal(getLayerEditState(ok.session, "bg"), "applied");
  const bad = await applyMediaTo(newSession(), "title", png, mockEditAdapter);
  assert.equal(bad.error?.code, "wrong-layer-type");
  const invalid = await applyMediaTo(newSession(), "bg", { ...png, name: "a.gif" }, mockEditAdapter);
  assert.equal(invalid.error?.code, "invalid-media");
});

test("setDraft ignores non-text layers and unknown layers", () => {
  const s = newSession();
  assert.equal(setDraft(s, "bg", "x"), s);
  assert.equal(setDraft(s, "nope", "x"), s);
});
