import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
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
import { useGoalStore, GoalItem } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — GrowthOS" }] }),
  component: GoalsPage,
});

type GoalType = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";

function GoalsPage() {
  const goals = useGoalStore((state) => state.goals);
  const addGoal = useGoalStore((state) => state.addGoal);
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const deleteGoal = useGoalStore((state) => state.deleteGoal);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<GoalItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string>("");
  const [formState, setFormState] = useState<Omit<GoalItem, "id" | "createdAt">>({
    title: "",
    description: "",
    targetValue: 0,
    currentValue: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    type: "Monthly",
    category: "General",
    status: "Active",
    notes: "",
  });

  const goalsByType = useMemo(
    () => ({
      Daily: goals.filter((g) => g.type === "Daily"),
      Weekly: goals.filter((g) => g.type === "Weekly"),
      Monthly: goals.filter((g) => g.type === "Monthly"),
      Quarterly: goals.filter((g) => g.type === "Quarterly"),
      Yearly: goals.filter((g) => g.type === "Yearly"),
    }),
    [goals],
  );

  const openNew = () => {
    setActiveGoal(null);
    setFormState({
      title: "",
      description: "",
      targetValue: 0,
      currentValue: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      type: "Monthly",
      category: "General",
      status: "Active",
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (goal: GoalItem) => {
    setActiveGoal(goal);
    setFormState({
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      startDate: goal.startDate,
      endDate: goal.endDate,
      type: goal.type as GoalType,
      category: goal.category,
      status: goal.status,
      notes: goal.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const title = formState.title.trim();
    if (!title) return;
    if (activeGoal) {
      updateGoal(activeGoal.id, { ...formState, title });
    } else {
      addGoal({ ...formState, title });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteGoal(deleteTarget);
    setDeleteOpen(false);
    setDeleteTarget("");
  };

  const types: GoalType[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

  return (
    <AppShell title="Goals">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Goals</h1>
            <p className="text-[13.5px] text-ink-soft">
              Daily, weekly, monthly, quarterly, yearly. Goal → Project → Task.
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Goal
          </button>
        </div>

        <div className="space-y-6">
          {types.map((type) => (
            <motion.section
              key={type}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="card-soft p-5"
            >
              <h2 className="text-[16px] font-semibold text-ink mb-4">{type} Goals</h2>

              {goalsByType[type].length ? (
                <div className="space-y-3">
                  {goalsByType[type].map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-[14px] border border-border/60 p-4 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ink text-[14px]">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-[12px] text-ink-soft mt-0.5">{goal.description}</p>
                          )}
                        </div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-ink-soft">
                          {goal.status}
                        </span>
                      </div>

                      {goal.targetValue && goal.currentValue !== undefined ? (
                        <div className="mt-3 mb-2">
                          <div className="flex items-center justify-between text-[12px] mb-1">
                            <span className="text-ink-soft">Progress</span>
                            <span className="font-semibold text-ink">
                              {goal.currentValue} / {goal.targetValue}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all"
                              style={{
                                width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-2 pt-2 border-t border-border/60 mt-2">
                        <button
                          type="button"
                          onClick={() => openEdit(goal)}
                          className="flex-1 text-[12px] font-medium text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(goal.id);
                            setDeleteOpen(true);
                          }}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-ink-soft p-4 text-center bg-muted/40 rounded-[12px]">
                  No {type.toLowerCase()} goals yet
                </div>
              )}
            </motion.section>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-2xl overflow-hidden p-0 sm:rounded-[24px]">
          <div className="flex max-h-[calc(100vh-24px)] flex-col">
            <DialogHeader className="px-4 py-4 sm:px-6">
              <DialogTitle>{activeGoal ? "Edit Goal" : "Add Goal"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-4">
                <Input
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Goal title"
                />
                <Textarea
                  value={formState.description || ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Description"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={formState.type}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, type: event.target.value as GoalType }))
                    }
                    className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  <Input
                    value={formState.category || ""}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, category: event.target.value }))
                    }
                    placeholder="Category"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="number"
                    value={formState.targetValue || 0}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, targetValue: Number(event.target.value) }))
                    }
                    placeholder="Target value"
                  />
                  <Input
                    type="number"
                    value={formState.currentValue || 0}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        currentValue: Number(event.target.value),
                      }))
                    }
                    placeholder="Current value"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={formState.startDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                  />
                  <Input
                    type="date"
                    value={formState.endDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, endDate: event.target.value }))
                    }
                  />
                </div>
                <Input
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, status: event.target.value }))
                  }
                  placeholder="Status"
                />
                <Textarea
                  value={formState.notes || ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="Notes"
                />
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
            <AlertDialogTitle>Delete goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal?
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
