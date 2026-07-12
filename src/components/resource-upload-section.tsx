import { AlertCircle, CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface ResourceUploadSectionProps {
  files: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    previewType?: string;
    progress?: number;
    status?: "uploading" | "ready" | "error";
  }>;
  onAddFiles: (files: FileList | null) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onReplace?: (id: string, files: FileList | null) => void;
  onDownload?: (id: string) => void;
  onRetry?: (id: string) => void;
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

export function ResourceUploadSection({
  files,
  onAddFiles,
  onDelete,
  onRename,
  onReplace,
  onDownload,
  onRetry,
}: ResourceUploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.fileSize, 0), [files]);

  return (
    <div className="space-y-3 rounded-[18px] border border-border/70 bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">Upload files</p>
          <p className="text-xs text-ink-soft">PDF, DOCX, TXT, Markdown, and images</p>
        </div>
        <span className="text-xs text-ink-soft">
          {files.length} file{files.length === 1 ? "" : "s"} · {formatFileSize(totalSize)}
        </span>
      </div>

      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-4 py-6 text-center text-sm text-ink-soft transition ${dragActive ? "border-primary bg-primary/10" : "border-border/70 bg-background/70"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          onAddFiles(event.dataTransfer.files);
        }}
      >
        <UploadCloud className="mb-2 h-5 w-5 text-primary" />
        <span className="font-medium text-ink">Drop files here or browse</span>
        <span className="mt-1 text-xs">
          Multiple uploads are supported with progress and retry.
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 h-9 w-full rounded-[10px] bg-primary px-3 text-sm font-medium text-primary-foreground sm:w-auto"
        >
          Upload Files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => onAddFiles(event.target.files)}
        />
      </div>

      {files.length ? (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-[12px] border border-border/70 bg-background/80 px-3 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{file.fileName}</p>
                    {file.status === "uploading" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : null}
                    {file.status === "ready" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : null}
                    {file.status === "error" ? (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-ink-soft">
                    {file.fileType} · {formatFileSize(file.fileSize)}
                  </p>
                  {typeof file.progress === "number" ? (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, file.progress))}%` }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {onRetry && file.status === "error" ? (
                    <button
                      type="button"
                      onClick={() => onRetry(file.id)}
                      className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      Retry
                    </button>
                  ) : null}
                  {onRename ? (
                    <button
                      type="button"
                      onClick={() => onRename(file.id, file.fileName)}
                      className="text-xs text-primary"
                    >
                      Rename
                    </button>
                  ) : null}
                  {onReplace ? (
                    <label className="cursor-pointer text-xs text-primary">
                      Replace
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => onReplace(file.id, event.target.files)}
                      />
                    </label>
                  ) : null}
                  {onDownload ? (
                    <button
                      type="button"
                      onClick={() => onDownload(file.id)}
                      className="text-xs text-primary"
                    >
                      Download
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDelete(file.id)}
                    className="rounded-full p-1 text-ink-soft transition hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-dashed border-border/70 bg-background/60 p-4 text-center text-sm text-ink-soft">
          No files yet. Add your first document to build a lightweight library for this card.
        </div>
      )}
    </div>
  );
}
