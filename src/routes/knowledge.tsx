import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVaultStore, VaultItem } from "@/stores/useGrowthStores";
import { ResourceGrid } from "@/components/resource-grid";
import type { ResourceItem } from "@/lib/resource-types";
import {
  type CloudCardRecord,
  type CloudFileRecord,
  deleteCloudCard,
  deleteCloudFile,
  hasSupabaseConfig,
  listCloudCards,
  listCloudFiles,
  updateCloudCardProgress,
  uploadCloudFile,
  upsertCloudCard,
} from "@/lib/cloud-data";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge Vault — GrowthOS" }] }),
  component: KnowledgePage,
});

const mapCloudCardToVault = (card: CloudCardRecord): VaultItem => {
  const metadata = (card.metadata ?? {}) as Record<string, unknown>;
  return {
    id: card.id,
    title: card.title,
    type: metadata.type === "file" ? "file" : "note",
    filename: typeof metadata.filename === "string" ? metadata.filename : undefined,
    url: typeof metadata.url === "string" ? metadata.url : undefined,
    content: typeof card.content === "string" ? card.content : undefined,
    createdAt: card.created_at ?? new Date().toISOString(),
  };
};

function KnowledgePage() {
  const navigate = useNavigate();
  const vault = useVaultStore((state) => state.vault);
  const addVaultItem = useVaultStore((state) => state.addVaultItem);
  const updateVaultItem = useVaultStore((state) => state.updateVaultItem);
  const deleteVaultItem = useVaultStore((state) => state.deleteVaultItem);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<VaultItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string>("");
  const [formState, setFormState] = useState<Omit<VaultItem, "id" | "createdAt">>({
    title: "",
    type: "note",
    content: "",
  });
  const [cloudEnabled, setCloudEnabled] = useState(hasSupabaseConfig);
  const [cloudItems, setCloudItems] = useState<CloudCardRecord[]>([]);
  const [cloudStatus, setCloudStatus] = useState(
    hasSupabaseConfig ? "Cloud sync ready" : "Cloud sync not configured",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFiles, setExistingFiles] = useState<CloudFileRecord[]>([]);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setCloudEnabled(false);
      setCloudStatus("Cloud sync not configured");
      return;
    }

    let active = true;
    setCloudEnabled(true);
    setCloudStatus("Connecting to cloud workspace...");
    listCloudCards("knowledge").then((cards) => {
      if (!active) return;
      setCloudItems(cards);
      setCloudStatus(cards.length ? "Cloud sync ready" : "Cloud sync ready — add your first note");
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cloudEnabled || !activeNote?.id || !dialogOpen) {
      setExistingFiles([]);
      return;
    }

    let active = true;
    listCloudFiles("knowledge", activeNote.id).then((files) => {
      if (!active) return;
      setExistingFiles(files);
    });

    return () => {
      active = false;
    };
  }, [activeNote?.id, cloudEnabled, dialogOpen]);

  const visibleVault = useMemo(
    () => (cloudEnabled ? cloudItems.map(mapCloudCardToVault) : vault),
    [cloudEnabled, cloudItems, vault],
  );

  const filteredVault = useMemo(
    () =>
      visibleVault.filter((item) =>
        [item.title, item.content, item.filename]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [visibleVault, search],
  );

  const resourceItems = useMemo<ResourceItem[]>(() => {
    if (cloudEnabled) {
      return cloudItems.map((card) => ({
        id: card.id,
        module: "knowledge" as const,
        title: card.title,
        description: typeof card.summary === "string" ? card.summary : undefined,
        category:
          typeof (card.metadata ?? {}).type === "string"
            ? String((card.metadata ?? {}).type)
            : undefined,
        tags: Array.isArray((card.metadata ?? {}).tags)
          ? ((card.metadata ?? {}).tags as string[])
          : undefined,
        favorite: Boolean((card.metadata ?? {}).favorite),
        notes: typeof card.content === "string" ? card.content : undefined,
        source:
          typeof (card.metadata ?? {}).url === "string"
            ? String((card.metadata ?? {}).url)
            : undefined,
        createdAt: card.created_at ?? undefined,
        updatedAt: card.updated_at ?? undefined,
        lastOpenedAt:
          typeof (card.metadata ?? {}).lastOpenedAt === "string"
            ? String((card.metadata ?? {}).lastOpenedAt)
            : undefined,
        currentPage:
          typeof (card.metadata ?? {}).currentPage === "number"
            ? (card.metadata ?? {}).currentPage
            : undefined,
        progressPercentage:
          typeof (card.metadata ?? {}).progressPercentage === "number"
            ? (card.metadata ?? {}).progressPercentage
            : undefined,
      }));
    }

    return vault.map((item) => ({
      id: item.id,
      module: "knowledge" as const,
      title: item.title,
      description: item.content,
      category: item.type,
      favorite: item.favorite,
      notes: item.content,
      source: item.url,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
      lastOpenedAt: item.lastOpenedAt,
      currentPage: item.currentPage,
      progressPercentage: item.progressPercentage,
    }));
  }, [cloudEnabled, cloudItems, vault]);

  const openNew = () => {
    setActiveNote(null);
    setSelectedFile(null);
    setExistingFiles([]);
    setFormState({
      title: "",
      type: "note",
      content: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: VaultItem) => {
    setActiveNote(item);
    setSelectedFile(null);
    setExistingFiles([]);
    setFormState({
      title: item.title,
      type: item.type,
      content: item.content ?? "",
      filename: item.filename,
      url: item.url,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const title = formState.title.trim();
    if (!title) return;

    if (cloudEnabled) {
      const saved = await upsertCloudCard("knowledge", {
        id: activeNote?.id,
        title,
        content: formState.type === "note" ? (formState.content ?? "") : "",
        metadata: {
          type: formState.type,
          filename: formState.filename,
          url: formState.url,
        },
      });

      if (saved) {
        setCloudItems((prev) => {
          const next = prev.filter((item) => item.id !== saved.id);
          return [saved, ...next];
        });
        if (selectedFile) {
          await uploadCloudFile("knowledge", saved.id, selectedFile);
          const files = await listCloudFiles("knowledge", saved.id);
          setExistingFiles(files);
        }
        setDialogOpen(false);
        setSelectedFile(null);
        setActiveNote(null);
      }
      return;
    }

    if (activeNote) {
      updateVaultItem(activeNote.id, { ...formState, title });
    } else {
      addVaultItem({ ...formState, title });
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (cloudEnabled) {
      await deleteCloudCard("knowledge", deleteTarget);
      setCloudItems((prev) => prev.filter((item) => item.id !== deleteTarget));
      setDeleteOpen(false);
      setDeleteTarget("");
      return;
    }

    deleteVaultItem(deleteTarget);
    setDeleteOpen(false);
    setDeleteTarget("");
  };

  const removeAttachment = async (fileId: string) => {
    if (!cloudEnabled || !activeNote?.id) return;
    await deleteCloudFile(fileId);
    const files = await listCloudFiles("knowledge", activeNote.id);
    setExistingFiles(files);
  };

  const handleFavoriteToggle = async (item: ResourceItem) => {
    if (cloudEnabled) {
      const updated = await updateCloudCardProgress("knowledge", item.id, {
        favorite: !item.favorite,
        metadata: { favorite: !item.favorite },
      });
      if (updated) {
        setCloudItems((prev) =>
          prev.map((card) => (card.id === item.id ? { ...card, ...updated } : card)),
        );
      }
      return;
    }

    updateVaultItem(item.id, { favorite: !item.favorite });
  };

  return (
    <AppShell title="Knowledge Vault">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">
              Knowledge Vault
            </h1>
            <p className="text-[13.5px] text-ink-soft">
              Your second brain — research, notes, frameworks, and AI prompts
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Note
          </button>
        </div>

        <div className="rounded-[12px] border border-border/70 bg-card/80 px-3 py-2 text-[12px] text-ink-soft">
          {cloudStatus}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-soft p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-soft/60" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes…"
                className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-muted border border-transparent text-[13px] focus:bg-card focus:border-border outline-none"
              />
            </div>
          </div>

          {filteredVault.length ? (
            <ResourceGrid
              items={resourceItems.filter((item) =>
                [item.title, item.description, item.notes, item.source]
                  .join(" ")
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              onOpen={(item) => navigate({ to: "/knowledge/$id", params: { id: item.id } })}
              onFavorite={handleFavoriteToggle}
            />
          ) : visibleVault.length ? (
            <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
              No notes match your search.
            </div>
          ) : (
            <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
              No notes yet. Start building your knowledge vault.
              <div className="mt-4">
                <button
                  type="button"
                  onClick={openNew}
                  className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add Note
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-2xl overflow-hidden p-0 sm:rounded-[24px]">
          <div className="flex max-h-[calc(100vh-24px)] flex-col">
            <DialogHeader className="px-4 py-4 sm:px-6">
              <DialogTitle>{activeNote ? "Edit Note" : "Add Note"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-4">
                <Input
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Title"
                />
                <select
                  value={formState.type}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      type: event.target.value as "note" | "file",
                    }))
                  }
                  className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="note">Note</option>
                  <option value="file">File</option>
                </select>
                {formState.type === "note" ? (
                  <Textarea
                    value={formState.content || ""}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, content: event.target.value }))
                    }
                    placeholder="Content"
                  />
                ) : (
                  <>
                    <Input
                      value={formState.filename || ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, filename: event.target.value }))
                      }
                      placeholder="Filename"
                    />
                    <Input
                      value={formState.url || ""}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, url: event.target.value }))
                      }
                      placeholder="File URL or path"
                    />
                  </>
                )}
                {cloudEnabled ? (
                  <div className="space-y-2 rounded-[12px] border border-border/70 bg-muted/30 p-3">
                    <label className="text-[12px] font-medium text-ink-soft">Attach a file</label>
                    <input
                      type="file"
                      onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                      className="block w-full text-[12px] text-ink-soft"
                    />
                    {existingFiles.length ? (
                      <div className="space-y-2">
                        {existingFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between rounded-[10px] border border-border/70 bg-background px-2.5 py-2 text-[12px]"
                          >
                            <span className="truncate">{file.file_name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(file.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <DialogFooter className="border-t border-border px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="h-9 rounded-[10px] border border-border px-4 text-sm text-ink-soft hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
