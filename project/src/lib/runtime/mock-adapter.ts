import type { RenderJob, RenderJobInput, RuntimeAdapter } from "./adapter";

/** MOCK ONLY: simulates job lifecycle; does not call AM Runtime or produce a video. */
const jobs = new Map<string, RenderJob>();
export const mockRuntimeAdapter: RuntimeAdapter = {
  async healthCheck() {
    return { ok: true, mode: "mock", message: "MOCK adapter active; renderer is not connected." };
  },
  async submitJob(_input: RenderJobInput) {
    const job: RenderJob = { id: `mock-${Date.now()}`, status: "queued", progress: 0 };
    jobs.set(job.id, job);
    return job;
  },
  async getJobStatus(jobId: string) {
    const job = jobs.get(jobId);
    if (!job) throw new Error("Mock job not found");
    return job;
  },
  async cancelJob(jobId: string) {
    const job = jobs.get(jobId);
    if (!job) return { cancelled: false };
    jobs.set(jobId, { ...job, status: "cancelled" });
    return { cancelled: true };
  },
};
