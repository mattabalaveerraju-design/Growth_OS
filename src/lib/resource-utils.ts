import type { CloudCardRecord, CloudFileRecord } from "@/lib/cloud-data";
import type { ResourceFileItem, ResourceItem } from "@/lib/resource-types";

export function mapCloudCardToResourceItem(
  card: CloudCardRecord,
  module: "learning" | "knowledge" | "reading",
): ResourceItem {
  const metadata = (card.metadata ?? {}) as Record<string, unknown>;
  return {
    id: card.id,
    module,
    title: card.title,
    description: typeof card.summary === "string" ? card.summary : undefined,
    category: typeof metadata.category === "string" ? metadata.category : undefined,
    tags: Array.isArray(metadata.tags)
      ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
    favorite: Boolean(metadata.favorite),
    status: typeof metadata.status === "string" ? metadata.status : "Draft",
    coverImage: typeof metadata.coverImage === "string" ? metadata.coverImage : undefined,
    createdAt: card.created_at ?? undefined,
    updatedAt: card.updated_at ?? undefined,
    lastOpenedAt: typeof metadata.lastOpenedAt === "string" ? metadata.lastOpenedAt : undefined,
    notes: typeof card.content === "string" ? card.content : undefined,
    source: typeof metadata.source === "string" ? metadata.source : undefined,
    confidence: Number(metadata.confidence ?? 0),
    timeHours: Number(metadata.timeHours ?? 0),
    filename: typeof metadata.filename === "string" ? metadata.filename : undefined,
    url: typeof metadata.url === "string" ? metadata.url : undefined,
    metadata,
  };
}

export function getPreviewType(fileName: string, fileType: string) {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf") || fileType === "application/pdf") return "pdf";
  if (name.endsWith(".docx") || fileType.includes("wordprocessingml")) return "docx";
  if (fileType.startsWith("image/")) return "image";
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) return "text";
  return "unknown";
}

export function mapCloudFileToResourceFileItem(file: CloudFileRecord): ResourceFileItem {
  return {
    id: file.id,
    fileName: file.file_name,
    fileSize: file.file_size,
    fileType: file.file_type,
    fileUrl: file.public_url ?? undefined,
    storagePath: file.storage_path,
    uploadedAt: file.created_at,
    previewType: getPreviewType(file.file_name, file.file_type) as ResourceFileItem["previewType"],
  };
}

export function mapBrowserFileToResourceFileItem(file: File): ResourceFileItem {
  return {
    id: `${file.name}-${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || "application/octet-stream",
    previewType: getPreviewType(file.name, file.type) as ResourceFileItem["previewType"],
    uploadedAt: new Date().toISOString(),
    status: "uploading",
    progress: 20,
  };
}
