"use client";

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash, GripVertical, CheckCircle2, Circle, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SelectControl } from "@/components/form-controls";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useFocusStore } from "@/stores/useGrowthStores";
import {
  hydrateFocusFromSupabase,
} from "@/stores/useGrowthStores";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — GrowthOS" }] }),
  component: FocusPage,
});

const statuses = ["Planned", "In Progress", "Completed"] as const;
const priorities = ["Low", "Medium", "High"] as const;

const toTimeMinutes = (time: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const getPlannedDuration = (startTime: string, endTime: string) => {
  const startMinutes = toTimeMinutes(startTime);
  const endMinutes = toTimeMinutes(endTime);
  if (startMinutes === null || endMinutes === null || endMinutes < startMinutes) return null;
  return endMinutes - startMinutes;
};

const formatPlannedDuration = (durationMinutes: number | null) => {
  if (durationMinutes === null) return "Invalid time range";
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours && minutes) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
};

const createChecklistItem = (text = "") => ({
  id:
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `focus-check-${Math.random().toString(36).slice(2, 9)}`,
  text,
  completed: false,
});

function FocusPage() {
  useEffect(() => {
    void hydrateFocusFromSupabase();
  }, []);

  const focusItemsRaw = useFocusStore((s) => s.focusItems);
  const focusItems = [...focusItemsRaw].sort((a, b) => a.order - b.order);
  const addFocusItem = useFocusStore((s) => s.addFocusItem);
  const deleteFocusItem = useFocusStore((s) => s.deleteFocusItem);
  const updateFocusItem = useFocusStore((s) => s.updateFocusItem);
  const reorderFocusItem = useFocusStore((s) => s.reorderFocusItem);
  const toggleFocusComplete = useFocusStore((s) => s.toggleFocusComplete);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    startTime: "",
    endTime: "",
    priority: "Medium",
    status: "Planned",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const hasItems = focusItems.length > 0;
  const plannedDuration = getPlannedDuration(form.startTime, form.endTime);
  const totalPlannedMinutes = focusItems.reduce((total, item) => {
    const duration = getPlannedDuration(item.startTime, item.endTime);
    return total + (duration ?? 0);
  }, 0);

  return (
    <AppShell title="Focus Mode">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">
              Focus Manager
            </h1>
            <p className="text-[13.5px] text-ink-soft">
              Create, prioritize, and reorder your today list.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            onClick={async () => {
              setSaving(true);
              const saved = await addFocusItem({
                title: "New focus item",
                category: "General",
                startTime: "09:00",
                endTime: "10:00",
                status: "Planned",
                priority: "Medium",
                description: "",
                checklist: [],
              });
              setSaving(false);
              if (!saved) toast.error("Couldn't save focus item. Please try again.");
            }}
            disabled={saving}
          >
            <Plus className="h-4 w-4" /> Add focus item
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">
                    Today’s focus
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-ink">
                    {focusItems.length} item{focusItems.length === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">
                  Drag to reorder
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {hasItems ? (
                focusItems.map((item, index) => {
                  const isEditing = editingId === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="group rounded-[28px] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
                    >
                      {/* Header: title + actions */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-ink">{item.title}</div>
                          <div className="text-sm text-ink-soft">
                            {item.category} · {item.startTime}–{item.endTime} · {item.priority}{" "}
                            priority
                          </div>
                          <div className="mt-1 text-xs text-ink-soft">
                            Planned length:{" "}
                            {formatPlannedDuration(
                              getPlannedDuration(item.startTime, item.endTime),
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1 text-sm border border-border bg-background text-ink-soft hover:bg-card"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setForm({
                                    title: item.title || "",
                                    category: item.category || "",
                                    startTime: item.startTime || "",
                                    endTime: item.endTime || "",
                                    priority: item.priority || "Medium",
                                    status: item.status || "Planned",
                                    description: item.description ?? "",
                                  });
                                }}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-ink-soft hover:text-ink transition-colors"
                                onClick={async () => {
                                  const deleted = await deleteFocusItem(item.id);
                                  if (!deleted) toast.error("Couldn't delete focus item. Please try again.");
                                }}
                                aria-label="Delete item"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1 text-sm border border-border bg-background text-ink-soft hover:bg-card"
                                onClick={() => setEditingId(null)}
                                disabled={saving}
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={async () => {
                                  if (plannedDuration === null) {
                                    toast.error(
                                      "End time must be the same as or later than start time.",
                                    );
                                    return;
                                  }
                                  try {
                                    setSaving(true);
                                    const updated = await updateFocusItem(item.id, {
                                      title: form.title,
                                      category: form.category,
                                      startTime: form.startTime,
                                      endTime: form.endTime,
                                      priority: form.priority as (typeof priorities)[number],
                                      status: form.status as (typeof statuses)[number],
                                      description: form.description,
                                    });
                                    if (!updated) {
                                      throw new Error("Couldn't save focus item. Please try again.");
                                    }
                                    setSaving(false);
                                    setEditingId(null);
                                    toast.success("Focus updated successfully");
                                  } catch (err: unknown) {
                                    setSaving(false);
                                    const message =
                                      err instanceof Error
                                        ? err.message
                                        : "Couldn't save focus item. Please try again.";
                                    toast.error(message);
                                  }
                                }}
                                disabled={saving}
                              >
                                {saving ? "Saving..." : "Save changes"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      {isEditing && (
                        <div className="mt-4">
                          <label className="text-[12px] font-medium text-ink-soft">Title</label>

                          <Input
                            value={form.title}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Enter focus title..."
                            className="mt-2 w-full"
                          />
                        </div>
                      )}

                      {/* Fields row: Category | Time | Priority */}
                      {isEditing && (
                        <div className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr_1fr] gap-4">
                            <div>
                              <label className="text-[12px] font-medium text-ink-soft">
                                Category
                              </label>
                              <Input
                                value={form.category}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    category: e.target.value,
                                  }))
                                }
                                className="mt-2"
                              />
                            </div>

                            <div>
                              <label className="text-[12px] font-medium text-ink-soft">Time</label>

                              <div className="mt-2 flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={form.startTime}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      startTime: e.target.value,
                                    }))
                                  }
                                  className="h-10 min-w-0 flex-1 px-3"
                                />

                                <span className="text-ink-soft">—</span>

                                <Input
                                  type="time"
                                  value={form.endTime}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      endTime: e.target.value,
                                    }))
                                  }
                                  className="h-10 min-w-0 flex-1 px-3"
                                />
                              </div>
                              {plannedDuration === null && (form.startTime || form.endTime) ? (
                                <p className="mt-2 text-xs text-destructive">
                                  End time must be the same as or later than start time.
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <label className="text-[12px] font-medium text-ink-soft">
                                Priority
                              </label>

                              <SelectControl
                                value={form.priority}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    priority: e.target.value,
                                  }))
                                }
                                className="mt-2"
                              >
                                {priorities.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </SelectControl>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="mt-5 w-full">
                            <label className="mb-2 block text-[12px] font-medium text-ink-soft">
                              Description
                            </label>

                            <Textarea
                              placeholder="Add a short description..."
                              value={form.description}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  description: e.target.value,
                                }))
                              }
                              className="w-full min-h-[100px] resize-y"
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-4 rounded-[18px] border border-border bg-background/70 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
                            Checklist
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateFocusItem(item.id, {
                                checklist: [
                                  ...(item.checklist ?? []),
                                  createChecklistItem("New checklist item"),
                                ],
                              })
                            }
                            className="text-[11px] font-medium text-primary hover:text-primary/80"
                          >
                            + Add item
                          </button>
                        </div>

                        <div className="space-y-2">
                          {item.checklist && item.checklist.length > 0 ? (
                            item.checklist.map((checkItem) => (
                              <div
                                key={checkItem.id}
                                className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)_36px] items-center gap-2 rounded-[12px]"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateFocusItem(item.id, {
                                      checklist: (item.checklist ?? []).map((entry) =>
                                        entry.id === checkItem.id
                                          ? { ...entry, completed: !entry.completed }
                                          : entry,
                                      ),
                                    })
                                  }
                                  className="flex h-9 w-5 shrink-0 items-center justify-center"
                                  aria-label={
                                    checkItem.completed
                                      ? "Mark item incomplete"
                                      : "Mark item complete"
                                  }
                                >
                                  {checkItem.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-ink-soft" />
                                  )}
                                </button>
                                <Input
                                  value={checkItem.text}
                                  onChange={(event) =>
                                    updateFocusItem(item.id, {
                                      checklist: (item.checklist ?? []).map((entry) =>
                                        entry.id === checkItem.id
                                          ? { ...entry, text: event.target.value }
                                          : entry,
                                      ),
                                    })
                                  }
                                  className="h-10 min-w-0 w-full px-3 text-[13px]"
                                  placeholder="Checklist item"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateFocusItem(item.id, {
                                      checklist: (item.checklist ?? []).filter(
                                        (entry) => entry.id !== checkItem.id,
                                      ),
                                    })
                                  }
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-muted"
                                  aria-label="Remove checklist item"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[12px] text-ink-soft">No checklist items yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Footer: order + move */}
                      <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-[12px] text-ink-soft">
                        <div>⋮⋮ Order {item.order + 1}</div>
                        <div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
                            onClick={() => {
                              void reorderFocusItem(index, Math.max(0, index - 1));
                            }}
                            disabled={index === 0}
                          >
                            <GripVertical className="h-4 w-4" /> Move up
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-border bg-muted p-8 text-center text-sm text-ink-soft">
                  No focus items yet. Use the button above to add a new session.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">
                    Focus stats
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-ink">
                    {hasItems
                      ? `${focusItems.filter((i) => i.status === "Completed").length} completed`
                      : "No sessions"}
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-ink-soft">
                <div className="rounded-2xl bg-surface p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                    Active items
                  </div>
                  <div className="mt-1 font-semibold text-ink">
                    {focusItems.filter((i) => i.status !== "Completed").length}
                  </div>
                </div>
                <div className="rounded-2xl bg-surface p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                    Planned length
                  </div>
                  <div className="mt-1 font-semibold text-ink">
                    {formatPlannedDuration(totalPlannedMinutes)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">
                Quick note
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                Keep your focus list lean. Add only the items that move your main goal forward and
                update status as you complete them.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

export default FocusPage;
