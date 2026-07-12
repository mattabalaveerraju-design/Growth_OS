export type ResourceModule = "learning" | "knowledge" | "reading";

export interface ResourceItem {
  id: string;
  module: ResourceModule;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  favorite?: boolean;
  status?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
  lastOpenedAt?: string;
  notes?: string;
  source?: string;
  confidence?: number;
  timeHours?: number;
  filename?: string;
  url?: string;
  currentPage?: number;
  progressPercentage?: number;
  recentlyViewed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ResourceFileItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl?: string;
  storagePath?: string;
  uploadedAt?: string;
  previewType?: "pdf" | "docx" | "image" | "text" | "unknown";
  status?: "uploading" | "ready" | "error";
  progress?: number;
}
