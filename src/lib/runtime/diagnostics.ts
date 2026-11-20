import type { HealthStatus, RuntimeMode } from "./adapter";
import { getRuntimeAdapter } from "./index";

export interface RuntimeDiagnostics {
  adapter: { mode: RuntimeMode; health: HealthStatus };
  /** Only whether a value is set. Values are never returned. */
  config: { workerUrlSet: boolean; workerTokenSet: boolean };
  /** Copied from docs/AM_RUNTIME_RESEARCH.md. Not independently verified. */
  documented: { source: string; packageVersion: string; nodeRequirement: string; ffmpegRequirement: string };
  /** What has actually been run. All false until a real worker test is done. */
  verified: {
    amRuntimeInstalled: boolean;
    amRenderDoctorRun: boolean;
    presetLoaded: boolean;
    videoRendered: boolean;
  };
  /** Node.js of the web app host, NOT of a render worker. */
  host: { nodeVersion: string };
}

export async function getRuntimeDiagnostics(): Promise<RuntimeDiagnostics> {
  const adapter = getRuntimeAdapter();
  return {
    adapter: { mode: adapter.mode, health: await adapter.healthCheck() },
    config: {
      workerUrlSet: Boolean(process.env.TRACMOTION_WORKER_URL),
      workerTokenSet: Boolean(process.env.TRACMOTION_WORKER_TOKEN),
    },
    documented: {
      source: "docs/AM_RUNTIME_RESEARCH.md (official page https://am.zervida.my.id/runtime/docs.html#install)",
      packageVersion: "am-render v0.2.2",
      nodeRequirement: "Node.js 24+",
      ffmpegRequirement: "FFmpeg and FFprobe with libx264 and AAC",
    },
    verified: { amRuntimeInstalled: false, amRenderDoctorRun: false, presetLoaded: false, videoRendered: false },
    host: { nodeVersion: process.versions.node },
  };
}
