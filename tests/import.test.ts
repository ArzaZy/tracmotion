import assert from "node:assert/strict";
import test from "node:test";
import { parseFixture } from "../src/lib/import/parse-fixture";
import { createSampleFixture } from "../src/lib/import/sample-fixture";
import { MAX_IMPORT_BYTES, validateFile } from "../src/lib/import/validate";

function fixtureWith(patch: Record<string, unknown>): string {
  return JSON.stringify({ ...createSampleFixture(), ...patch });
}

function errorCode(text: string): string {
  const result = parseFixture(text);
  assert.equal(result.ok, false);
  return result.ok ? "" : result.error.code;
}

test("validateFile accepts a small .json file", () => {
  assert.equal(validateFile("a.json", 100), null);
  assert.equal(validateFile("A.JSON", 100), null);
});

test("validateFile rejects .xml with an Alight Motion explanation", () => {
  const error = validateFile("preset.xml", 100);
  assert.equal(error?.code, "unsupported-type");
  assert.match(error?.message ?? "", /belum didukung/);
});

test("validateFile rejects other types, empty and oversized files", () => {
  assert.equal(validateFile("a.exe", 100)?.code, "unsupported-type");
  assert.equal(validateFile("a.json", 0)?.code, "empty-file");
  assert.equal(validateFile("a.json", MAX_IMPORT_BYTES + 1)?.code, "too-large");
  assert.equal(validateFile("a.json", MAX_IMPORT_BYTES), null);
});

test("parseFixture accepts the sample fixture", () => {
  const result = parseFixture(JSON.stringify(createSampleFixture()));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.project.layers.length, 4);
    assert.equal(result.project.canvas.fps, 30);
  }
});

test("parseFixture accepts a project with empty layers", () => {
  const result = parseFixture(fixtureWith({ layers: [] }));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.project.layers.length, 0);
});

test("parseFixture defaults visible to true and properties to {}", () => {
  const layers = [{ id: "a", name: "A", type: "shape", startTime: 0, duration: 1 }];
  const result = parseFixture(fixtureWith({ layers }));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.project.layers[0].visible, true);
    assert.deepEqual(result.project.layers[0].properties, {});
  }
});

test("parseFixture reports parse errors and empty text", () => {
  assert.equal(errorCode("{ not json"), "invalid-json");
  assert.equal(errorCode("   "), "empty-file");
  assert.equal(errorCode('<?xml version="1.0"?><preset/>'), "invalid-json");
});

test("parseFixture rejects wrong format, version and root type", () => {
  assert.equal(errorCode("[]"), "invalid-format");
  assert.equal(errorCode('{"name":"x"}'), "invalid-format");
  assert.equal(errorCode(fixtureWith({ version: 2 })), "invalid-format");
});

test("parseFixture rejects invalid fields", () => {
  assert.equal(errorCode(fixtureWith({ name: "" })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ canvas: { width: 0, height: 10, fps: 30 } })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ canvas: { width: 10, height: 10, fps: 0 } })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ layers: "nope" })), "invalid-field");
});

test("parseFixture rejects invalid layers", () => {
  const base = { id: "a", name: "A", type: "text", startTime: 0, duration: 1 };
  assert.equal(errorCode(fixtureWith({ layers: [base, { ...base }] })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ layers: [{ ...base, type: "video" }] })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ layers: [{ ...base, startTime: -1 }] })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ layers: [{ ...base, visible: "yes" }] })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ layers: [{ ...base, properties: { a: { b: 1 } } }] })), "invalid-field");
  assert.equal(errorCode(fixtureWith({ layers: [null] })), "invalid-field");
});

test("parseFixture error message names the failing field", () => {
  const result = parseFixture(fixtureWith({ layers: [{ id: "a", name: "A", type: "video", startTime: 0, duration: 1 }] }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error.message, /layers\[0\]\.type/);
});

test("parseFixture leaves the input unchanged and returns a frozen project", () => {
  const text = JSON.stringify(createSampleFixture());
  const copy = text.slice();
  const result = parseFixture(text);
  assert.equal(text, copy);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(Object.isFrozen(result.project), true);
    assert.equal(Object.isFrozen(result.project.layers[0]), true);
    assert.throws(() => {
      (result.project.layers as unknown as unknown[]).push({});
    }, TypeError);
  }
});

test("parseFixture drops unknown fields", () => {
  const result = parseFixture(fixtureWith({ secret: "x" }));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal("secret" in result.project, false);
});
