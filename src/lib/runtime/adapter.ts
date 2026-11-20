/**
 * TracMotion-owned worker contract.
 * These are TracMotion methods, NOT AM Runtime API method names.
 * Server-side only: never import this from client components.
 */
export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export type RuntimeMode = "mock" | "real";

export interface RenderJobInput {
  projectId: string;
  options: Record<string, unknown>;
}

export interface RenderJob {
  id: string;
  status: JobStatus;
  progress?: number;
  error?: string;
  /** Free-text remark, e.g. a MOCK disclaimer. */
  note?: string;
}

export interface HealthStatus {
  ok: boolean;
  mode: RuntimeMode;
  message: string;
}

export interface RuntimeAdapter {
  readonly mode: RuntimeMode;
  healthCheck(): Promise<HealthStatus>;
  submitJob(input: RenderJobInput): Promise<RenderJob>;
  getJobStatus(jobId: string): Promise<RenderJob>;
  cancelJob(jobId: string): Promise<{ cancelled: boolean }>;
}

export class RuntimeNotConnectedError extends Error {
  constructor(message = "Real render worker is not connected.") {
    super(message);
    this.name = "RuntimeNotConnectedError";
  }
}
