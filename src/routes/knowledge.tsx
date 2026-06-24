import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge Vault — GrowthOS" }] }),
  component: KnowledgePage,
});

function KnowledgePage() {
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

  const filteredVault = useMemo(
    () =>
      vault.filter((item) =>
        [item.title, item.content, item.filename]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [vault, search],
  );

  const openNew = () => {
    setActiveNote(null);
    setFormState({
      title: "",
      type: "note",
      content: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: VaultItem) => {
    setActiveNote(item);
    setFormState({
      title: item.title,
      type: item.type,
      content: item.content ?? "",
      filename: item.filename,
      url: item.url,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const title = formState.title.trim();
    if (!title) return;
    if (activeNote) {
      updateVaultItem(activeNote.id, { ...formState, title });
    } else {
      addVaultItem({ ...formState, title });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteVaultItem(deleteTarget);
    setDeleteOpen(false);
    setDeleteTarget("");
  };

  return (
    <AppShell title="Knowledge Vault">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Knowledge Vault</h1>
            <p className="text-[13.5px] text-ink-soft">Your second brain — research, notes, frameworks, and AI prompts</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Note
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVault.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[16px] border border-border bg-card p-4 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-ink text-[14px] line-clamp-2 flex-1">{item.title}</h3>
                    <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-muted text-ink-soft">
                      {item.type}
                    </span>
                  </div>
                  {item.content && <p className="text-[12.5px] text-ink-soft line-clamp-3 mb-3">{item.content}</p>}
                  {item.filename && <p className="text-[12px] text-ink-soft/70 mb-3">📄 {item.filename}</p>}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex-1 text-[12px] font-medium text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(item.id);
                        setDeleteOpen(true);
                      }}
                      className="h-8 w-8 rounded-[8px] flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : vault.length ? (
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeNote ? "Edit Note" : "Add Note"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Title"
            />
            <select
              value={formState.type}
              onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value as "note" | "file" }))}
              className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="note">Note</option>
              <option value="file">File</option>
            </select>
            {formState.type === "note" ? (
              <Textarea
                value={formState.content || ""}
                onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="Content"
              />
            ) : (
              <>
                <Input
                  value={formState.filename || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, filename: event.target.value }))}
                  placeholder="Filename"
                />
                <Input
                  value={formState.url || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="File URL or path"
                />
              </>
            )}
          </div>
          <DialogFooter>
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this note?</AlertDialogDescription>
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
