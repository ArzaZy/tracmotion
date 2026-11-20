import type { FixtureLayer, FixtureProject } from "../import/types";
import type { EditAdapter, EditError, EditResult, MediaInfo } from "./types";

export type LayerEditState = "unsaved" | "applied" | "original";

/**
 * original: the imported project, never changed.
 * working: a copy that receives applied edits. It lives in memory only and is lost on reload.
 * drafts: typed text that has NOT been applied yet.
 */
export interface EditSession {
  readonly original: FixtureProject;
  readonly working: FixtureProject;
  readonly drafts: ReadonlyMap<string, string>;
}

export interface EditOutcome {
  session: EditSession;
  error: EditError | null;
}

export function createSession(project: FixtureProject): EditSession {
  return { original: project, working: project, drafts: new Map() };
}

function findLayer(project: FixtureProject, id: string): FixtureLayer | undefined {
  return project.layers.find((l) => l.id === id);
}

export function currentText(layer: FixtureLayer): string {
  const value = layer.properties.text;
  return value === undefined ? "" : String(value);
}

function sameProperties(a: FixtureLayer, b: FixtureLayer): boolean {
  const keysA = Object.keys(a.properties);
  if (keysA.length !== Object.keys(b.properties).length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(b.properties, k) && a.properties[k] === b.properties[k]);
}

function isModified(session: EditSession, layer: FixtureLayer): boolean {
  const original = findLayer(session.original, layer.id);
  return original ? !sameProperties(layer, original) : false;
}

/** Records typed text as an unapplied draft. Text equal to the current text clears the draft. */
export function setDraft(session: EditSession, layerId: string, text: string): EditSession {
  const layer = findLayer(session.working, layerId);
  if (!layer || layer.type !== "text") return session;
  const drafts = new Map(session.drafts);
  if (text === currentText(layer)) drafts.delete(layerId);
  else drafts.set(layerId, text);
  return { ...session, drafts };
}

export function discardDraft(session: EditSession, layerId: string): EditSession {
  if (!session.drafts.has(layerId)) return session;
  const drafts = new Map(session.drafts);
  drafts.delete(layerId);
  return { ...session, drafts };
}

/** Converts an adapter that throws into a normal error result. */
export async function safeEdit(run: () => Promise<EditResult>): Promise<EditResult> {
  try {
    return await run();
  } catch (e) {
    const detail = e instanceof Error && e.message ? `: ${e.message}` : "";
    return { ok: false, error: { code: "adapter-failed", message: `Adapter gagal${detail}` } };
  }
}

/** On failure the session is returned unchanged and the draft is kept. */
export async function applyDraft(session: EditSession, layerId: string, adapter: EditAdapter): Promise<EditOutcome> {
  const draft = session.drafts.get(layerId);
  if (draft === undefined) return { session, error: null };
  const result = await safeEdit(() => adapter.setText(session.working, layerId, draft));
  if (!result.ok) return { session, error: result.error };
  const drafts = new Map(session.drafts);
  drafts.delete(layerId);
  return { session: { ...session, working: result.project, drafts }, error: null };
}

export async function applyMediaTo(
  session: EditSession,
  layerId: string,
  media: MediaInfo,
  adapter: EditAdapter
): Promise<EditOutcome> {
  const result = await safeEdit(() => adapter.applyMedia(session.working, layerId, media));
  if (!result.ok) return { session, error: result.error };
  return { session: { ...session, working: result.project }, error: null };
}

/** Restores one layer to its imported state and drops its draft. */
export function revertLayer(session: EditSession, layerId: string): EditSession {
  const original = findLayer(session.original, layerId);
  if (!original) return session;
  const layers = session.working.layers.map((l) => (l.id === layerId ? original : l));
  const drafts = new Map(session.drafts);
  drafts.delete(layerId);
  return { ...session, working: { ...session.working, layers }, drafts };
}

export function getLayerEditState(session: EditSession, layerId: string): LayerEditState {
  if (session.drafts.has(layerId)) return "unsaved";
  const layer = findLayer(session.working, layerId);
  return layer && isModified(session, layer) ? "applied" : "original";
}

export function countPending(session: EditSession): { unsaved: number; applied: number } {
  return { unsaved: session.drafts.size, applied: session.working.layers.filter((l) => isModified(session, l)).length };
}
