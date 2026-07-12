import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ResourceDetail } from "@/components/resource-detail";
import { ResourcePreview } from "@/components/resource-preview";
import {
  deleteCloudFile,
  listCloudFiles,
  renameCloudFile,
  replaceCloudFile,
  updateCloudCardProgress,
  uploadCloudFile,
} from "@/lib/cloud-data";
import { hasSupabaseConfig } from "@/lib/supabase";
import type { ResourceFileItem, ResourceItem } from "@/lib/resource-types";
import {
  mapBrowserFileToResourceFileItem,
  mapCloudCardToResourceItem,
  mapCloudFileToResourceFileItem,
} from "@/lib/resource-utils";
import { useInterviewStore } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/reading/$id")({
  head: () => ({ meta: [{ title: "Reading Detail — GrowthOS" }] }),
  component: ReadingDetailPage,
});

function ReadingDetailPage() {
  const { id } = useParams({ from: "/reading/$id" });
  const navigate = useNavigate();
  const interviewNotes = useInterviewStore((state) => state.interviewNotes);
  const updateInterviewNote = useInterviewStore((state) => state.updateInterviewNote);
  const [cloudItem, setCloudItem] = useState<ResourceItem | null>(null);
  const [files, setFiles] = useState<ResourceFileItem[]>([]);
  const [previewFile, setPreviewFile] = useState<ResourceFileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const localItem = useMemo(
    () => interviewNotes.find((entry) => entry.id === id) ?? null,
    [interviewNotes, id],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      if (hasSupabaseConfig) {
        const { listCloudCards } = await import("@/lib/cloud-data");
        const cards = await listCloudCards("reading");
        const found = cards.find((card) => card.id === id);
        if (!active) return;
        setCloudItem(found ? mapCloudCardToResourceItem(found, "reading") : null);
        if (found) {
          const cloudFiles = await listCloudFiles("reading", found.id);
          if (!active) return;
          setFiles(cloudFiles.map(mapCloudFileToResourceFileItem));
        }
      } else {
        setCloudItem(null);
      }
      if (!active) return;
      setIsLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  const item =
    cloudItem ??
    (localItem
      ? {
          ...localItem,
          module: "reading" as const,
          description: localItem.content,
          category: localItem.type,
          notes: localItem.content,
          source: localItem.url,
          createdAt: localItem.createdAt,
          updatedAt: localItem.createdAt,
          lastOpenedAt: localItem.createdAt,
        }
      : null);

  const persistCardProgress = async (updates: {
    currentPage?: number;
    progressPercentage?: number;
    lastOpenedAt?: string;
  }) => {
    if (!item) return;
    const lastOpenedAt = updates.lastOpenedAt ?? new Date().toISOString();
    const payload = {
      currentPage: updates.currentPage,
      progressPercentage: updates.progressPercentage,
      lastOpenedAt,
      metadata: {
        currentPage: updates.currentPage,
        progressPercentage: updates.progressPercentage,
        lastOpenedAt,
      },
    };

    if (hasSupabaseConfig) {
      await updateCloudCardProgress("reading", item.id, payload);
      return;
    }

    updateInterviewNote(item.id, {
      currentPage: updates.currentPage,
      progressPercentage: updates.progressPercentage,
      lastOpenedAt,
    });
  };

  const handlePreviewFile = async (file: ResourceFileItem) => {
    setPreviewFile(file);
    await persistCardProgress({ lastOpenedAt: new Date().toISOString() });
  };

  const handleAddFiles = async (incoming: FileList | null) => {
    if (!item) return;
    if (!incoming?.length) return;

    const uploads = Array.from(incoming);
    const entries = uploads.map(mapBrowserFileToResourceFileItem);
    setFiles((prev) => [...entries, ...prev]);

    if (!hasSupabaseConfig) return;
    for (const [index] of entries.entries()) {
      const file = uploads[index];
      if (!file) continue;
      const saved = await uploadCloudFile("reading", item.id, file);
      if (saved) {
        const cloudFiles = await listCloudFiles("reading", item.id);
        setFiles(cloudFiles.map(mapCloudFileToResourceFileItem));
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!hasSupabaseConfig) {
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      return;
    }
    await deleteCloudFile(fileId);
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleRenameFile = async (fileId: string, name: string) => {
    if (!hasSupabaseConfig) {
      setFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, fileName: name } : file)),
      );
      return;
    }
    const updated = await renameCloudFile(fileId, name);
    if (updated) {
      const cloudFiles = await listCloudFiles("reading", item?.id ?? "");
      setFiles(cloudFiles.map(mapCloudFileToResourceFileItem));
    }
  };

  const handleReplaceFile = async (fileId: string, incoming: FileList | null) => {
    const file = incoming?.[0];
    if (!file || !hasSupabaseConfig) return;
    const updated = await replaceCloudFile(fileId, file);
    if (updated) {
      const cloudFiles = await listCloudFiles("reading", item?.id ?? "");
      setFiles(cloudFiles.map(mapCloudFileToResourceFileItem));
    }
  };

  const handleDownloadFile = (file: ResourceFileItem) => {
    if (!file.fileUrl) return;
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.fileName;
    link.click();
  };

  if (isLoading) {
    return (
      <AppShell title="Reading detail">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/reading" })}
            className="inline-flex items-center gap-2 text-sm text-ink-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Back to reading
          </button>
          <div className="rounded-[20px] border border-border/70 bg-card/70 p-4">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading resource…
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell title="Reading detail">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/reading" })}
            className="inline-flex items-center gap-2 text-sm text-ink-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Back to reading
          </button>
          <EmptyState
            title="Item not found"
            description="This reading resource is unavailable right now."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={item.title}>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/reading" })}
          className="inline-flex items-center gap-2 text-sm text-ink-soft"
        >
          <ArrowLeft className="h-4 w-4" /> Back to reading
        </button>
        <ResourceDetail
          item={item}
          files={files}
          onAddFiles={handleAddFiles}
          onDeleteFile={handleDeleteFile}
          onDownloadFile={handleDownloadFile}
          onPreviewFile={handlePreviewFile}
          onRenameFile={handleRenameFile}
          onReplaceFile={handleReplaceFile}
        />
        {previewFile ? (
          <div className="rounded-[24px] border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <FileText className="h-4 w-4 text-primary" /> Preview
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-sm text-ink-soft"
              >
                Close
              </button>
            </div>
            <ResourcePreview
              file={previewFile}
              onProgressChange={({ currentPage, progressPercentage, lastOpenedAt }) => {
                void persistCardProgress({ currentPage, progressPercentage, lastOpenedAt });
              }}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
