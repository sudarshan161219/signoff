export interface FileData {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  storageKey: string;
  projectId: string;
  createdAt: string;
}

export type ProjectStatus = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

export type LogAction =
  | "PROJECT_CREATED"
  | "FILE_UPLOADED"
  | "CLIENT_VIEWED"
  | "CLIENT_REQUESTED_CHANGES";

export interface AuditLog {
  id: string;
  action: LogAction;
  ipAddress: string | null;
  userAgent: string | null;
  projectId: string;
  createdAt: string;
}

export interface ApprovalDecision {
  id: string;
  decision: ProjectStatus;
  comment: string | null;
  clientName: string | null;
  clientEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;

  adminToken: string;
  publicToken: string;

  status: ProjectStatus;

  expiresAt?: string | null;
  urlExpiresAt?: string | null;

  createdAt: string;
  updatedAt: string;

  file?: FileData | null;

  logs: AuditLog[];

  approvalDecision: ApprovalDecision[];

  /** Convenience field from backend */
  latestComment?: string | null;
}

export interface ProjectState {
  project: Project | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Actions
  fetchProject: (token: string, silent?: boolean) => Promise<void>;
  fetchPublicProject: (token: string, silent?: boolean) => Promise<void>;
  handleClientDecision: (
    token: string,
    feedback: string,
    status: ProjectStatus
  ) => Promise<void>;
  updateExpiration: (days: number) => Promise<void>;
  uploadDeliverable: (file: File) => Promise<void>;
  deleteProject: () => Promise<void>;
}
