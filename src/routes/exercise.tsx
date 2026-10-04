import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Check, ChevronLeft, Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useExerciseStore, type ChecklistItem } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/exercise")({
  head: () => ({ meta: [{ title: "Exercise — GrowthOS" }] }),
  component: ExercisePage,
});

const weeklyWorkoutTemplate = [
  {
    day: "Monday",
    workout: "Arms & Shoulders",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
  {
    day: "Tuesday",
    workout: "Chest & Back",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
  {
    day: "Wednesday",
    workout: "Arms & Shoulders",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
  {
    day: "Thursday",
    workout: "Chest & Back",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
  {
    day: "Friday",
    workout: "Abs",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
  {
    day: "Saturday",
    workout: "Legs",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
  {
    day: "Sunday",
    workout: "Rest / Legs",
    items: ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
  },
] as const;

const createChecklistItem = (text: string): ChecklistItem => ({
  id:
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `exercise-${Math.random().toString(36).slice(2, 9)}`,
  text,
  completed: false,
});

const buildDefaultChecklist = (items: readonly string[]): ChecklistItem[] =>
  items.map((text) => createChecklistItem(text));

const startOfCurrentWeek = () => {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + offset);
  return monday;
};

const buildWeeklyPlan = () => {
  const weekStart = startOfCurrentWeek();

  return weeklyWorkoutTemplate.map((entry, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      ...entry,
      dateKey: date.toISOString().slice(0, 10),
    };
  });
};

const getWorkoutStatus = (checklist: ChecklistItem[]) => {
  if (!checklist.length) return "Not started";

  const completed = checklist.filter((item) => item.completed).length;
  if (completed === checklist.length) return "Completed";
  if (completed > 0) return "In Progress";
  return "Not started";
};

function ExercisePage() {
  const exerciseProgress = useExerciseStore((state) => state.exerciseProgress);
  const exerciseWorkouts = useExerciseStore((state) => state.exerciseWorkouts ?? {});
  const setExerciseProgress = useExerciseStore((state) => state.setExerciseProgress);
  const setExerciseWorkout = useExerciseStore((state) => state.setExerciseWorkout);
  const toggleExerciseProgress = useExerciseStore((state) => state.toggleExerciseProgress);

  const weeklyPlan = useMemo(() => buildWeeklyPlan(), []);

  useEffect(() => {
    weeklyPlan.forEach((day) => {
      if (!exerciseProgress[day.dateKey]) {
        setExerciseProgress(day.dateKey, buildDefaultChecklist(day.items));
      }
    });
  }, [exerciseProgress, setExerciseProgress, weeklyPlan]);

  const records = weeklyPlan.map((day) => {
    const checklist = exerciseProgress[day.dateKey] ?? buildDefaultChecklist(day.items);
    const completed = checklist.filter((item) => item.completed).length;

    return {
      ...day,
      workout: exerciseWorkouts[day.dateKey] ?? day.workout,
      checklist,
      completed,
      status: getWorkoutStatus(checklist),
      progressPercent: checklist.length ? (completed / checklist.length) * 100 : 0,
    };
  });

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const selectedRecord = records.find((record) => record.dateKey === selectedDateKey) ?? null;
  const [editingDateKey, setEditingDateKey] = useState<string | null>(null);
  const editingRecord = records.find((record) => record.dateKey === editingDateKey) ?? null;
  const [workoutDraft, setWorkoutDraft] = useState("");
  const [checklistDraft, setChecklistDraft] = useState<ChecklistItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const openEditor = (dateKey: string) => {
    const record = records.find((item) => item.dateKey === dateKey);
    if (!record) return;
    setWorkoutDraft(record.workout);
    setChecklistDraft(record.checklist.map((item) => ({ ...item })));
    setEditingItemId(null);
    setEditingDateKey(dateKey);
  };

  const saveEditor = () => {
    if (!editingDateKey || !workoutDraft.trim()) return;
    setExerciseWorkout(editingDateKey, workoutDraft.trim());
    setExerciseProgress(
      editingDateKey,
      checklistDraft.map((item) => ({ ...item, text: item.text.trim() })),
    );
    setEditingDateKey(null);
  };

  const addChecklistItem = () => {
    const item = createChecklistItem("");
    setChecklistDraft((items) => [...items, item]);
    setEditingItemId(item.id);
  };

  return (
    <AppShell title="Exercise">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#7657D9]/10 text-[#7657D9]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
                Exercise records
              </h1>
              <p className="text-[13.5px] text-ink-soft">Your activity, captured over time.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-ink-soft">
            <Dumbbell className="h-3.5 w-3.5 text-[#7657D9]" />
            Weekly plan
          </div>
        </header>

        <section className="card-soft p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {records.map((record) => {
              const statusClass =
                record.status === "Completed"
                  ? "bg-[#16A878]/10 text-[#13825f]"
                  : record.status === "In Progress"
                    ? "bg-[#7657D9]/10 text-[#7657D9]"
                    : "bg-muted text-ink-soft";

              return (
                <div
                  key={record.dateKey}
                  onClick={() => setSelectedDateKey(record.dateKey)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDateKey(record.dateKey);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-[22px] border border-border bg-card p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7657D9]/30 hover:bg-[#7657D9]/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7657D9]/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                        {record.day}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-ink">{record.workout}</h2>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass}`}
                      >
                        {record.status}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditor(record.dateKey);
                        }}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] border border-border bg-background px-3 text-[12px] font-medium text-ink-soft transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7657D9]/70 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-[12px] text-ink-soft">
                      {record.dateKey} · {record.checklist.length} exercises
                    </p>
                    <p className="text-[13px] font-medium text-ink">
                      {record.completed} / {record.checklist.length} completed
                    </p>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#7657D9] transition-all"
                      style={{ width: `${record.progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <Dialog
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDateKey(null);
        }}
      >
        {selectedRecord ? (
          <DialogContent className="max-w-lg rounded-[24px] p-0 sm:rounded-[24px]">
            <div className="space-y-5 p-5 sm:p-6">
              <DialogHeader className="space-y-3 text-left">
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(null)}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <div>
                  <DialogTitle className="text-left text-[22px] font-semibold text-ink">
                    {selectedRecord.day}
                  </DialogTitle>
                  <p className="mt-2 text-[13px] text-ink-soft">{selectedRecord.workout}</p>
                </div>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    Progress
                  </p>
                  <p className="mt-2 text-[20px] font-semibold tracking-tight text-ink">
                    {selectedRecord.completed} / {selectedRecord.checklist.length}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-soft">completed</p>
                </div>

                <div className="rounded-[18px] border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    Status
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-ink">{selectedRecord.status}</p>
                  <p className="mt-1 text-[12px] text-ink-soft">{selectedRecord.dateKey}</p>
                </div>
              </div>

              <div className="rounded-[18px] border border-border bg-card p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    Checklist
                  </p>
                  <span className="text-[12px] text-ink-soft">
                    {selectedRecord.completed} of {selectedRecord.checklist.length} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedRecord.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-3 rounded-[12px] px-2 py-2 transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleExerciseProgress(selectedRecord.dateKey, item.id)}
                        className="h-4 w-4 accent-[#7657D9]"
                      />
                      <span
                        className={
                          item.completed
                            ? "text-[14px] text-ink-soft line-through"
                            : "text-[14px] text-ink"
                        }
                      >
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog
        open={editingRecord !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDateKey(null);
        }}
      >
        {editingRecord ? (
          <DialogContent className="w-[calc(100vw-24px)] max-w-lg p-0">
            <DialogHeader>
              <DialogTitle>Edit {editingRecord.day} exercise</DialogTitle>
              <p className="text-sm text-ink-soft">Update the workout name and checklist items.</p>
            </DialogHeader>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
              <label className="grid gap-2 text-[12px] font-medium text-ink-soft">
                Workout name
                <Input
                  value={workoutDraft}
                  onChange={(event) => setWorkoutDraft(event.target.value)}
                  placeholder="Workout name"
                />
              </label>

              <section>
                <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Checklist
                </h3>
                <div className="divide-y divide-border rounded-[14px] border border-border bg-card px-3">
                  {checklistDraft.map((item) => (
                    <div key={item.id} className="flex min-h-12 items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          setChecklistDraft((items) =>
                            items.map((current) =>
                              current.id === item.id
                                ? { ...current, completed: !current.completed }
                                : current,
                            ),
                          )
                        }
                        className="h-4 w-4 shrink-0 accent-[#7657D9]"
                        aria-label={`Mark ${item.text || "checklist item"} completed`}
                      />
                      {editingItemId === item.id ? (
                        <Input
                          autoFocus
                          value={item.text}
                          onChange={(event) =>
                            setChecklistDraft((items) =>
                              items.map((current) =>
                                current.id === item.id
                                  ? { ...current, text: event.target.value }
                                  : current,
                              ),
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") setEditingItemId(null);
                          }}
                          placeholder="Checklist item name"
                          className="h-9 min-w-0 flex-1"
                        />
                      ) : (
                        <span
                          className={`min-w-0 flex-1 text-[13px] ${item.completed ? "text-ink-soft line-through" : "text-ink"}`}
                        >
                          {item.text || "Unnamed checklist item"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}
                        className="inline-flex h-8 items-center gap-1 rounded-[8px] px-2 text-[12px] font-medium text-ink-soft hover:bg-muted hover:text-ink"
                        aria-label={`Edit ${item.text || "checklist item"}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChecklistDraft((items) =>
                            items.filter((current) => current.id !== item.id),
                          );
                          if (editingItemId === item.id) setEditingItemId(null);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-soft hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${item.text || "checklist item"}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-2 text-[13px] font-medium text-[#7657D9] hover:bg-[#7657D9]/10"
                >
                  <Plus className="h-4 w-4" />
                  Add checklist
                </button>
              </section>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditingDateKey(null)}
                className="h-9 rounded-[10px] border border-border px-4 text-sm text-ink-soft hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditor}
                disabled={!workoutDraft.trim() || checklistDraft.some((item) => !item.text.trim())}
                className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Check className="mr-1.5 inline h-4 w-4" />
                Save changes
              </button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </AppShell>
  );
}
