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
import { useState } from "react";
import { useFocusStore } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — GrowthOS" }] }),
  component: FocusPage,
});

const statuses = ["Planned", "In Progress", "Completed"] as const;
const priorities = ["Low", "Medium", "High"] as const;

function FocusPage() {
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

  return (
    <AppShell title="Focus Mode">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Focus Manager</h1>
            <p className="text-[13.5px] text-ink-soft">Create, prioritize, and reorder your today list.</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            onClick={() =>
              addFocusItem({
                title: "New focus item",
                category: "General",
                startTime: "09:00",
                endTime: "10:00",
                status: "Planned",
                priority: "Medium",
                description: "",
              })
            }
          >
            <Plus className="h-4 w-4" /> Add focus item
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">Today’s focus</div>
                  <div className="mt-2 text-[15px] font-semibold text-ink">{focusItems.length} item{focusItems.length === 1 ? "" : "s"}</div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">Drag to reorder</span>
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
                          <div className="text-sm text-ink-soft">{item.category} · {item.startTime}–{item.endTime} · {item.priority} priority</div>
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
                                    description: item.description ?? (item as any).notes ?? "",
                                  });
                                }}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-ink-soft hover:text-ink transition-colors"
                                onClick={() => deleteFocusItem(item.id)}
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
                                  try {
                                    setSaving(true);
                                    updateFocusItem(item.id, {
                                      title: form.title,
                                      category: form.category,
                                      startTime: form.startTime,
                                      endTime: form.endTime,
                                      priority: form.priority as (typeof priorities)[number],
                                      status: form.status as (typeof statuses)[number],
                                      description: form.description,
                                    });
                                    setSaving(false);
                                    setEditingId(null);
                                    toast.success("Focus updated successfully");
                                  } catch (err: any) {
                                    setSaving(false);
                                    toast.error(err?.message || "Couldn't save focus item. Please try again.");
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
    <label className="text-[12px] font-medium text-ink-soft">
      Title
    </label>

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
        <label className="text-[12px] font-medium text-ink-soft">
          Time
        </label>

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
            className="w-32"
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
            className="w-32"
          />
        </div>
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

                      {/* Footer: order + move */}
                      <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-[12px] text-ink-soft">
                        <div>⋮⋮ Order {item.order + 1}</div>
                        <div>
                          <button type="button" className="inline-flex items-center gap-2 text-primary hover:text-primary/80" onClick={() => reorderFocusItem(index, Math.max(0, index - 1))} disabled={index === 0}>
                            <GripVertical className="h-4 w-4" /> Move up
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-border bg-muted p-8 text-center text-sm text-ink-soft">No focus items yet. Use the button above to add a new session.</div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">Focus stats</div>
                  <div className="mt-2 text-[15px] font-semibold text-ink">{hasItems ? `${focusItems.filter((i) => i.status === "Completed").length} completed` : "No sessions"}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-ink-soft">
                <div className="rounded-2xl bg-surface p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Active items</div>
                  <div className="mt-1 font-semibold text-ink">{focusItems.filter((i) => i.status !== "Completed").length}</div>
                </div>
                <div className="rounded-2xl bg-surface p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Planned length</div>
                  <div className="mt-1 font-semibold text-ink">{focusItems.length ? focusItems.length * 45 : 0} min</div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">Quick note</div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">Keep your focus list lean. Add only the items that move your main goal forward and update status as you complete them.</p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

export default FocusPage;
