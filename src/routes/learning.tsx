import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Flame,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Trash2,
} from "lucide-react";
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
import { useLearningStore, LearningItem } from "@/stores/useGrowthStores";
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

export const Route = createFileRoute("/learning")({
  head: () => ({ meta: [{ title: "Learning — GrowthOS" }] }),
  component: LearningPage,
});

const categories = ["UI Design", "UX Design", "Communication", "AI Tools", "Career"] as const;
const categoryColors: Record<string, string> = {
  "UI Design": "bg-[oklch(0.95_0.04_275)] text-[oklch(0.42_0.18_275)]",
  "UX Design": "bg-[oklch(0.95_0.04_200)] text-[oklch(0.42_0.18_220)]",
  Communication: "bg-[oklch(0.96_0.03_50)] text-[oklch(0.45_0.15_55)]",
  "AI Tools": "bg-[oklch(0.95_0.04_295)] text-[oklch(0.42_0.18_295)]",
  Career: "bg-[oklch(0.95_0.05_140)] text-[oklch(0.42_0.16_150)]",
};

const mapCloudCardToLearning = (card: CloudCardRecord): LearningItem => {
  const metadata = (card.metadata ?? {}) as Record<string, unknown>;
  return {
    id: card.id,
    topic: card.title,
    category: typeof card.category === "string" ? card.category : "Career",
    source: typeof card.summary === "string" ? card.summary : "",
    timeHours: Number(metadata.timeHours ?? 0),
    notes: typeof card.content === "string" ? card.content : "",
    confidence: Number(metadata.confidence ?? 50),
    date: String(
      metadata.date ?? card.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    ),
  };
};

function LearningPage() {
  const navigate = useNavigate();
  const learning = useLearningStore((state) => state.learning);
  const addLearning = useLearningStore((state) => state.addLearning);
  const updateLearning = useLearningStore((state) => state.updateLearning);
  const deleteLearning = useLearningStore((state) => state.deleteLearning);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeLearning, setActiveLearning] = useState<LearningItem | null>(null);
  const [formState, setFormState] = useState<Omit<LearningItem, "id">>({
    topic: "",
    category: "UI Design",
    source: "",
    timeHours: 0,
    notes: "",
    confidence: 50,
    date: new Date().toISOString().slice(0, 10),
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
    listCloudCards("learning").then((cards) => {
      if (!active) return;
      setCloudItems(cards);
      setCloudStatus(cards.length ? "Cloud sync ready" : "Cloud sync ready — add your first card");
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cloudEnabled || !activeLearning?.id || !dialogOpen) {
      setExistingFiles([]);
      return;
    }

    let active = true;
    listCloudFiles("learning", activeLearning.id).then((files) => {
      if (!active) return;
      setExistingFiles(files);
    });

    return () => {
      active = false;
    };
  }, [activeLearning?.id, cloudEnabled, dialogOpen]);

  const visibleLearning = useMemo(
    () => (cloudEnabled ? cloudItems.map(mapCloudCardToLearning) : learning),
    [cloudEnabled, cloudItems, learning],
  );

  const resourceItems = useMemo<ResourceItem[]>(() => {
    if (cloudEnabled) {
      return cloudItems.map((card) => ({
        ...mapCloudCardToLearning(card),
        id: card.id,
        module: "learning" as const,
        title: card.title,
        description: typeof card.summary === "string" ? card.summary : undefined,
        category: typeof card.category === "string" ? card.category : undefined,
        tags: Array.isArray((card.metadata ?? {}).tags)
          ? ((card.metadata ?? {}).tags as string[])
          : undefined,
        favorite: Boolean((card.metadata ?? {}).favorite),
        notes: typeof card.content === "string" ? card.content : undefined,
        source: typeof card.summary === "string" ? card.summary : undefined,
        confidence: Number((card.metadata ?? {}).confidence ?? 0),
        timeHours: Number((card.metadata ?? {}).timeHours ?? 0),
        createdAt: card.created_at ?? undefined,
        updatedAt: card.updated_at ?? undefined,
        lastOpenedAt:
          typeof (card.metadata ?? {}).lastOpenedAt === "string"
            ? (card.metadata ?? {}).lastOpenedAt
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

    return learning.map((item) => ({
      id: item.id,
      module: "learning" as const,
      title: item.topic,
      description: item.source,
      category: item.category,
      tags: [item.category],
      favorite: item.favorite,
      notes: item.notes,
      source: item.source,
      confidence: item.confidence,
      timeHours: item.timeHours,
      createdAt: item.date,
      updatedAt: item.date,
      lastOpenedAt: item.lastOpenedAt,
      currentPage: item.currentPage,
      progressPercentage: item.progressPercentage,
    }));
  }, [cloudEnabled, cloudItems, learning]);

  const filteredLearning = useMemo(
    () =>
      resourceItems
        .filter((item) =>
          [item.title, item.category, item.description, item.notes, item.source]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .filter((item) => (filterCategory === "All" ? true : item.category === filterCategory)),
    [resourceItems, search, filterCategory],
  );

  const totalHours = filteredLearning.reduce((sum, item) => sum + (item.timeHours ?? 0), 0);
  const learningDays = Array.from(
    new Set(resourceItems.map((item) => item.createdAt?.slice(0, 10)).filter(Boolean)),
  ).length;
  const completedPercent = totalHours ? Math.min(100, Math.round((totalHours / 10) * 100)) : 0;

  const openNew = () => {
    setActiveLearning(null);
    setSelectedFile(null);
    setExistingFiles([]);
    setFormState({
      topic: "",
      category: "UI Design",
      source: "",
      timeHours: 0,
      notes: "",
      confidence: 50,
      date: new Date().toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  };

  const openEdit = (item: LearningItem) => {
    setActiveLearning(item);
    setSelectedFile(null);
    setExistingFiles([]);
    setFormState({
      topic: item.topic,
      category: item.category,
      source: item.source,
      timeHours: item.timeHours,
      notes: item.notes ?? "",
      confidence: item.confidence,
      date: item.date,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const normalizedTopic = formState.topic.trim();
    const normalizedSource = formState.source.trim();
    if (!normalizedTopic || !normalizedSource) return;

    if (cloudEnabled) {
      const saved = await upsertCloudCard("learning", {
        id: activeLearning?.id,
        title: normalizedTopic,
        category: formState.category,
        content: formState.notes ?? "",
        summary: normalizedSource,
        metadata: {
          source: normalizedSource,
          timeHours: formState.timeHours,
          confidence: formState.confidence,
          date: formState.date,
        },
      });

      if (saved) {
        setCloudItems((prev) => {
          const next = prev.filter((item) => item.id !== saved.id);
          return [saved, ...next];
        });
        if (selectedFile) {
          await uploadCloudFile("learning", saved.id, selectedFile);
          const files = await listCloudFiles("learning", saved.id);
          setExistingFiles(files);
        }
        setDialogOpen(false);
        setSelectedFile(null);
        setActiveLearning(null);
      }
      return;
    }

    if (activeLearning) {
      updateLearning(activeLearning.id, {
        ...formState,
        topic: normalizedTopic,
        source: normalizedSource,
      });
    } else {
      addLearning({ ...formState, topic: normalizedTopic, source: normalizedSource });
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!activeLearning) return;
    if (cloudEnabled) {
      await deleteCloudCard("learning", activeLearning.id);
      setCloudItems((prev) => prev.filter((item) => item.id !== activeLearning.id));
      setDeleteOpen(false);
      setDialogOpen(false);
      setActiveLearning(null);
      return;
    }

    deleteLearning(activeLearning.id);
    setDeleteOpen(false);
    setDialogOpen(false);
  };

  const removeAttachment = async (fileId: string) => {
    if (!cloudEnabled || !activeLearning?.id) return;
    await deleteCloudFile(fileId);
    const files = await listCloudFiles("learning", activeLearning.id);
    setExistingFiles(files);
  };

  const handleFavoriteToggle = async (item: ResourceItem) => {
    if (cloudEnabled) {
      const updated = await updateCloudCardProgress("learning", item.id, {
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

    updateLearning(item.id, { favorite: !item.favorite });
  };

  const miniCalendarDays = visibleLearning.map((item) => new Date(item.date).getDate());

  return (
    <AppShell title="Learning OS">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Learning</h1>
            <p className="text-[13.5px] text-ink-soft">Never forget what you learned</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Learning
          </button>
        </div>

        <div className="rounded-[12px] border border-border/70 bg-card/80 px-3 py-2 text-[12px] text-ink-soft">
          {cloudStatus}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="card-soft p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-soft/60" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search learning…"
                    className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-muted border border-transparent text-[13px] focus:bg-card focus:border-border outline-none"
                  />
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-muted text-[12.5px] text-ink-soft hover:bg-accent/40 transition-colors">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 border-b border-border pb-3 overflow-x-auto">
              {["All", ...categories].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterCategory(t)}
                  className={`px-3 h-7 rounded-full text-[12px] font-medium transition-colors ${
                    filterCategory === t
                      ? "bg-ink text-background"
                      : "text-ink-soft hover:bg-accent/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {filteredLearning.length ? (
              <ResourceGrid
                items={filteredLearning}
                onOpen={(item) => navigate({ to: "/learning/$id", params: { id: item.id } })}
                onFavorite={handleFavoriteToggle}
              />
            ) : visibleLearning.length ? (
              <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
                No results match your search.
              </div>
            ) : (
              <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
                No learning records yet. Add one to start tracking your knowledge growth.
              </div>
            )}
          </motion.section>

          <aside className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="card-soft p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
                  Learning Streak
                </div>
                <Flame className="h-3.5 w-3.5 text-warning" />
              </div>
              <div className="mt-3 text-center py-3">
                <div className="font-display text-[44px] font-semibold tracking-tight leading-none">
                  {Math.min(30, learningDays)}
                </div>
                <div className="text-[12px] text-ink-soft mt-1">days</div>
              </div>
              <MiniCalendar completed={miniCalendarDays} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="card-soft p-5"
            >
              <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
                Today's Learning
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      strokeWidth="3"
                      className="fill-none stroke-muted"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="fill-none stroke-violet"
                      style={{
                        strokeDasharray: 88,
                        strokeDashoffset: 88 - (88 * completedPercent) / 100,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold">
                    {completedPercent}%
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">
                    {visibleLearning[0]?.topic ?? "No topics yet"}
                  </div>
                  <div className="text-[12px] text-ink-soft">
                    {visibleLearning[0]?.category ?? "Add a topic to begin"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={openNew}
                className="mt-4 w-full h-9 rounded-[10px] bg-primary text-primary-foreground text-[12.5px] font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="h-3.5 w-3.5" /> Continue
              </button>
            </motion.div>
          </aside>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-3xl overflow-hidden p-0 sm:rounded-[24px]">
          <div className="flex max-h-[calc(100vh-24px)] flex-col">
            <DialogHeader className="px-4 py-4 sm:px-6">
              <DialogTitle>{activeLearning ? "Edit Learning" : "Add Learning"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-4">
                <Input
                  value={formState.topic}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, topic: event.target.value }))
                  }
                  placeholder="Topic"
                />
                <Input
                  value={formState.source}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, source: event.target.value }))
                  }
                  placeholder="Source"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formState.timeHours}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, timeHours: Number(event.target.value) }))
                    }
                    placeholder="Hours"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formState.confidence}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, confidence: Number(event.target.value) }))
                    }
                    placeholder="Confidence (%)"
                  />
                  <Input
                    type="date"
                    value={formState.date}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </div>
                <Textarea
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="Notes"
                />
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
            <AlertDialogTitle>Delete learning record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this learning entry?
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

function MiniCalendar({ completed }: { completed: number[] }) {
  const today = new Date().getDate();
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <button className="text-ink-soft/60 hover:text-ink-soft">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="text-[12px] font-semibold">{monthName}</div>
        <button className="text-ink-soft/60 hover:text-ink-soft">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-ink-soft/60 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <div
            key={day}
            className={`aspect-square grid place-items-center text-[10.5px] rounded-md ${
              day === today
                ? "bg-primary text-primary-foreground font-semibold"
                : completed.includes(day)
                  ? "bg-violet/20 text-violet font-medium"
                  : "text-ink-soft/70"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
