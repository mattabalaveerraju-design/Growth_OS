"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApplicationStore, useExerciseStore, useFocusStore, useLearningStore, useReadingStore, useTaskStore } from "@/stores/useGrowthStores";
import { downloadCSV, downloadJSON, downloadXLSX } from "@/lib/exports";

const modules = [
  { key: "Tasks", label: "Tasks" },
  { key: "Learning", label: "Learning" },
  { key: "Applications", label: "Applications" },
  { key: "Reading", label: "Reading" },
  { key: "Exercise", label: "Exercise" },
  { key: "Focus", label: "Focus" },
];

type ModuleKey = typeof modules[number]["key"];

export function ExportCenterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const tasks = useTaskStore((state) => state.tasks);
  const learning = useLearningStore((state) => state.learning);
  const applications = useApplicationStore((state) => state.applications);
  const reading = useReadingStore((state) => state.reading);
  const exercise = useExerciseStore((state) => state.exercise);
  const focusItems = useFocusStore((state) => state.focusItems);

  const handleExport = (module: ModuleKey, format: "csv" | "xlsx" | "json") => {
    const payload: Record<ModuleKey, unknown[]> = {
      Tasks: tasks,
      Learning: learning,
      Applications: applications,
      Reading: reading,
      Exercise: exercise,
      Focus: focusItems,
    };

    const rows = payload[module];
    const name = `growthos-${module.toLowerCase()}`;

    if (format === "json") {
      downloadJSON(name, rows);
    } else if (format === "csv") {
      downloadCSV(name, rows);
    } else if (format === "xlsx") {
      downloadXLSX(name, rows);
    }

    toast.success(`${module} exported to ${format.toUpperCase()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {modules.map((module) => {
              const count = {
                Tasks: tasks.length,
                Learning: learning.length,
                Applications: applications.length,
                Reading: reading.length,
                Exercise: exercise.length,
                Focus: focusItems.length,
              }[module.key];
              return (
                <div key={module.key} className="rounded-3xl border border-border p-4 bg-card">
                  <div className="text-sm font-semibold text-foreground">{module.label}</div>
                  <div className="mt-2 text-3xl font-display font-semibold tracking-tight text-ink">{count}</div>
                </div>
              );
            })}
          </div>
          <div className="grid gap-3">
            {modules.map((module) => (
              <div key={module.key} className="rounded-3xl border border-border p-4 bg-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{module.label}</div>
                    <div className="text-xs text-foreground/70">Export by format</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["csv", "xlsx", "json"] as const).map((format) => (
                      <Button
                        key={format}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExport(module.key as ModuleKey, format)}
                        type="button"
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} type="button">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
