import type { RenderJob, RenderJobInput, RuntimeAdapter } from "./adapter";

/**
 * MOCK ONLY. Simulates a job lifecycle with a timer.
 * It does NOT call AM Runtime, does NOT use FFmpeg and produces NO video file.
 * State lives in process memory, so it is not shared between serverless invocations.
 */
const MOCK_NOTE = "MOCK: no video was produced.";
const MOCK_DURATION_MS = 3000;

interface MockJob {
  id: string;
  createdAt: number;
  cancelled: boolean;
}

const jobs = new Map<string, MockJob>();

function snapshot(job: MockJob): RenderJob {
  if (job.cancelled) return { id: job.id, status: "cancelled", note: MOCK_NOTE };
  const ratio = Math.min(1, (Date.now() - job.createdAt) / MOCK_DURATION_MS);
  if (ratio >= 1) return { id: job.id, status: "completed", progress: 100, note: MOCK_NOTE };
  return { id: job.id, status: ratio === 0 ? "queued" : "processing", progress: Math.round(ratio * 100), note: MOCK_NOTE };
}

export const mockRuntimeAdapter: RuntimeAdapter = {
  mode: "mock",
  async healthCheck() {
    return { ok: true, mode: "mock", message: "MOCK adapter active. Renderer is not connected." };
  },
  async submitJob(_input: RenderJobInput) {
    const job: MockJob = { id: `mock-${Date.now()}-${jobs.size}`, createdAt: Date.now(), cancelled: false };
    jobs.set(job.id, job);
    return snapshot(job);
  },
  async getJobStatus(jobId: string) {
    const job = jobs.get(jobId);
    if (!job) throw new Error("Mock job not found");
    return snapshot(job);
  },
  async cancelJob(jobId: string) {
    const job = jobs.get(jobId);
    if (!job) return { cancelled: false };
    job.cancelled = true;
    return { cancelled: true };
  },
};
