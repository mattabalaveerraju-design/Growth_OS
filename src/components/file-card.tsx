import { Download, FileText, Image, Trash2 } from "lucide-react";
import type { ResourceFileItem } from "@/lib/resource-types";

interface FileCardProps {
  file: ResourceFileItem;
  onPreview?: (file: ResourceFileItem) => void;
  onDelete?: (id: string) => void;
  onDownload?: (file: ResourceFileItem) => void;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
}

export function FileCard({ file, onPreview, onDelete, onDownload }: FileCardProps) {
  const icon = file.previewType === "image" ? Image : FileText;
  const Icon = icon;

  return (
    <div className="rounded-[16px] border border-border/70 bg-background/80 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onPreview?.(file)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{file.fileName}</p>
            <p className="text-[11px] text-ink-soft">
              {file.previewType?.toUpperCase() ?? file.fileType} · {formatFileSize(file.fileSize)}
            </p>
            <p className="mt-1 text-[11px] text-ink-soft">
              {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : "Added recently"}
            </p>
          </div>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {onPreview ? (
            <button
              type="button"
              onClick={() => onPreview(file)}
              className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              View
            </button>
          ) : null}
          {onDownload ? (
            <button
              type="button"
              onClick={() => onDownload(file)}
              className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-ink-soft"
            >
              Download
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="rounded-full p-1.5 text-destructive hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
