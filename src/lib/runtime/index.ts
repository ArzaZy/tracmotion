import type { RuntimeAdapter } from "./adapter";
import { mockRuntimeAdapter } from "./mock-adapter";
import { notConnectedAdapter } from "./not-connected-adapter";

/** Server-side only. Defaults to the explicit MOCK adapter. */
export function getRuntimeAdapter(): RuntimeAdapter {
  return process.env.TRACMOTION_RUNTIME_MODE === "real" ? notConnectedAdapter : mockRuntimeAdapter;
}

export type { RuntimeAdapter } from "./adapter";
