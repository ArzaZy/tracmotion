/**
 * Internal TracMotion worker contract.
 * These are TracMotion-owned methods, NOT AM Runtime API method names.
 */
export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export interface RenderJobInput { projectId: string; options: Record<string, unknown>; }
export interface RenderJob { id: string; status: JobStatus; progress?: number; error?: string; }
export interface RuntimeAdapter {
  healthCheck(): Promise<{ ok: boolean; mode: "mock" | "real"; message: string }>;
  submitJob(input: RenderJobInput): Promise<RenderJob>;
  getJobStatus(jobId: string): Promise<RenderJob>;
  cancelJob(jobId: string): Promise<{ cancelled: boolean }>;
}
