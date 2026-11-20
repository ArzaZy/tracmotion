import { RuntimeNotConnectedError, type RuntimeAdapter } from "./adapter";

/**
 * Placeholder used when TRACMOTION_RUNTIME_MODE=real.
 * The real worker client is NOT implemented yet, so every job call fails loudly
 * instead of pretending to render.
 */
export const notConnectedAdapter: RuntimeAdapter = {
  mode: "real",
  async healthCheck() {
    return { ok: false, mode: "real", message: "Real mode requested, but no worker client is implemented yet." };
  },
  async submitJob() {
    throw new RuntimeNotConnectedError();
  },
  async getJobStatus() {
    throw new RuntimeNotConnectedError();
  },
  async cancelJob() {
    throw new RuntimeNotConnectedError();
  },
};
