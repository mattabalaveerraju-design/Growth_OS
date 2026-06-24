"use client";

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash, GripVertical, CheckCircle2, Circle, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { useFocusStore } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — GrowthOS" }] }),
  component: FocusPage,
});

const statuses = ["Planned", "In Progress", "Completed"] as const;
const priorities = ["Low", "Medium", "High"] as const;

function FocusPage() {
  const focusItemsRaw = useFocusStore((state) => state.focusItems);
  const focusItems = [...focusItemsRaw].sort((a, b) => a.order - b.order);
  const addFocusItem = useFocusStore((state) => state.addFocusItem);
  const deleteFocusItem = useFocusStore((state) => state.deleteFocusItem);
  const updateFocusItem = useFocusStore((state) => state.updateFocusItem);
  const reorderFocusItem = useFocusStore((state) => state.reorderFocusItem);
  const toggleFocusComplete = useFocusStore((state) => state.toggleFocusComplete);

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
                notes: "",
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
                focusItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                    className="group rounded-[28px] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[15px] font-semibold text-ink">{item.title}</div>
                            <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-ink-soft">
                              <span>{item.category}</span>
                              <span>{item.startTime}–{item.endTime}</span>
                              <span>{item.priority} priority</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-ink-soft">
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-ink-soft hover:text-ink transition-colors"
                              onClick={() => toggleFocusComplete(item.id)}
                              aria-label="Toggle completion"
                            >
                              {item.status === "Completed" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-ink-soft hover:text-ink transition-colors"
                              onClick={() => deleteFocusItem(item.id)}
                              aria-label="Delete item"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <select
                            value={item.status}
                            onChange={(event) => updateFocusItem(item.id, { status: event.target.value as typeof statuses[number] })}
                            className="rounded-[16px] border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <select
                            value={item.priority}
                            onChange={(event) => updateFocusItem(item.id, { priority: event.target.value as typeof priorities[number] })}
                            className="rounded-[16px] border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {priorities.map((priority) => (
                              <option key={priority} value={priority}>{priority}</option>
                            ))}
                          </select>
                          <Input
                            value={item.notes}
                            onChange={(event) => updateFocusItem(item.id, { notes: event.target.value })}
                            placeholder="Notes"
                            className="rounded-[16px] border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-ink-soft">
                      <span>Order {item.order + 1}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
                        onClick={() => reorderFocusItem(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4" /> Move up
                      </button>
                    </div>
                  </motion.div>
                ))
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
                  <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">Focus stats</div>
                  <div className="mt-2 text-[15px] font-semibold text-ink">{hasItems ? `${focusItems.filter((item) => item.status === "Completed").length} completed` : "No sessions"}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-ink-soft">
                <div className="rounded-2xl bg-surface p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Active items</div>
                  <div className="mt-1 font-semibold text-ink">{focusItems.filter((item) => item.status !== "Completed").length}</div>
                </div>
                <div className="rounded-2xl bg-surface p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Planned length</div>
                  <div className="mt-1 font-semibold text-ink">{focusItems.length ? focusItems.length * 45 : 0} min</div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5">
              <div className="text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">Quick note</div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                Keep your focus list lean. Add only the items that move your main goal forward and update status as you complete them.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
