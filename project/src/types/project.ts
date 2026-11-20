export type ProjectStatus = "draft" | "ready" | "rendering" | "failed";
export interface TracMotionProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
}
