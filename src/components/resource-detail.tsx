import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Heart,
  MessageSquareText,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { ResourceFileItem, ResourceItem } from "@/lib/resource-types";
import { FileCard } from "@/components/file-card";
import { ResourceHeader } from "@/components/resource-header";
import { ResourceUploadSection } from "@/components/resource-upload-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResourceDetailProps {
  item: ResourceItem;
  files: ResourceFileItem[];
  onAddFiles: (files: FileList | null) => void;
  onDeleteFile: (id: string) => void;
  onDownloadFile: (file: ResourceFileItem) => void;
  onPreviewFile: (file: ResourceFileItem) => void;
  onRenameFile?: (id: string, name: string) => void;
  onReplaceFile?: (id: string, files: FileList | null) => void;
  onRetryFile?: (id: string) => void;
  onBack?: () => void;
  backLabel?: string;
  onFavoriteToggle?: (item: ResourceItem) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function ResourceDetail({
  item,
  files,
  onAddFiles,
  onDeleteFile,
  onDownloadFile,
  onPreviewFile,
  onRenameFile,
  onReplaceFile,
  onRetryFile,
  onBack,
  backLabel,
  onFavoriteToggle,
  onDelete,
  onEdit,
}: ResourceDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tags = useMemo(() => [item.category, ...(item.tags ?? [])].filter(Boolean), [item]);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-sm text-ink-soft"
                >
                  <ArrowLeft className="h-4 w-4" /> {backLabel ?? "Back"}
                </button>
              ) : null}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft"
                >
                  {tag}
                </span>
              ))}
            </div>
            <ResourceHeader
              title={item.title}
              description={
                item.description ?? item.notes ?? "Open this resource to review or expand it."
              }
              badge={item.category}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-[10px] border border-border/70 bg-background/70 px-3 py-2 text-sm text-ink-soft"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className="inline-flex items-center gap-2 rounded-[10px] border border-border/70 bg-background/70 px-3 py-2 text-sm text-ink-soft"
            >
              <UploadCloud className="h-4 w-4" /> Upload Files
            </button>
            {onFavoriteToggle ? (
              <button
                type="button"
                onClick={() => onFavoriteToggle(item)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-border/70 bg-background/70 px-3 py-2 text-sm text-ink-soft"
              >
                {item.favorite ? (
                  <Heart className="h-4 w-4 fill-current text-rose-500" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                Favorite
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-[10px] border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto rounded-[16px] bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-2">
          <section className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-ink">Overview</h3>
            </div>
            <div className="mt-3 space-y-3 text-sm text-ink-soft">
              <p>{item.description ?? item.notes ?? "No summary provided yet."}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[14px] bg-muted/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Status</p>
                  <p className="mt-1 font-semibold text-ink">{item.status ?? "Draft"}</p>
                </div>
                <div className="rounded-[14px] bg-muted/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                    Confidence
                  </p>
                  <p className="mt-1 font-semibold text-ink">{item.confidence ?? 0}%</p>
                </div>
                <div className="rounded-[14px] bg-muted/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Time</p>
                  <p className="mt-1 font-semibold text-ink">{item.timeHours ?? 0}h</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-ink">Continue Reading</h3>
              </div>
              <div className="mt-3 space-y-2 rounded-[14px] bg-muted/50 p-3 text-sm text-ink-soft">
                <p>
                  {item.lastOpenedAt
                    ? `Last opened ${new Date(item.lastOpenedAt).toLocaleString()}`
                    : "No reading sessions yet"}
                </p>
                <p>
                  {item.currentPage
                    ? `Current page ${item.currentPage}`
                    : "Start reading to save a page"}
                </p>
                <p>
                  {item.progressPercentage
                    ? `Progress ${item.progressPercentage}%`
                    : "No progress yet"}
                </p>
              </div>
            </section>
            <section className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-ink">Favorites & Recent Files</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm text-ink-soft">
                <div className="rounded-[12px] bg-muted/50 px-3 py-2">
                  {item.favorite
                    ? "This resource is marked as a favorite."
                    : "Favorite this resource to keep it easy to find."}
                </div>
                {files.length ? (
                  <div className="rounded-[12px] bg-muted/50 px-3 py-2">
                    Recent file: {files[0]?.fileName}
                  </div>
                ) : (
                  <div className="rounded-[12px] bg-muted/50 px-3 py-2">
                    Upload files to build a richer library.
                  </div>
                )}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="files" className="pt-2">
          <section className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-ink">Files</h3>
            </div>
            <div className="mt-3 space-y-3">
              <ResourceUploadSection
                files={files.map((file) => ({
                  id: file.id,
                  fileName: file.fileName,
                  fileSize: file.fileSize,
                  fileType: file.fileType,
                  previewType: file.previewType,
                  progress: file.progress ?? (file.status === "ready" ? 100 : 40),
                  status: file.status ?? "ready",
                }))}
                onAddFiles={onAddFiles}
                onDelete={onDeleteFile}
                onRename={onRenameFile}
                onReplace={onReplaceFile}
                onRetry={onRetryFile}
                onDownload={(id) => {
                  const target = files.find((file) => file.id === id);
                  if (target) onDownloadFile(target);
                }}
              />
              <div className="space-y-2">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onPreview={onPreviewFile}
                    onDelete={onDeleteFile}
                    onDownload={onDownloadFile}
                  />
                ))}
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="notes" className="pt-2">
          <section className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-ink">Notes</h3>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">
              {item.notes ?? "Add notes when you want context around this resource."}
            </p>
          </section>
        </TabsContent>

        <TabsContent value="metadata" className="pt-2">
          <section className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-ink">Metadata</h3>
            </div>
            <div className="mt-3 space-y-2 text-sm text-ink-soft">
              <div className="flex items-center justify-between rounded-[12px] bg-muted/50 px-3 py-2">
                <span>Created</span>
                <span>{item.createdAt ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-muted/50 px-3 py-2">
                <span>Updated</span>
                <span>{item.updatedAt ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-muted/50 px-3 py-2">
                <span>Last opened</span>
                <span>{item.lastOpenedAt ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-muted/50 px-3 py-2">
                <span>Current page</span>
                <span>{item.currentPage ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-[12px] bg-muted/50 px-3 py-2">
                <span>Progress</span>
                <span>{item.progressPercentage ? `${item.progressPercentage}%` : "—"}</span>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
