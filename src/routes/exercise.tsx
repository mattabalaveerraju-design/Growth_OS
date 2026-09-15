import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Check, Clock3, Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useExerciseStore, type ExerciseEntry } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/exercise")({
  head: () => ({ meta: [{ title: "Exercise — GrowthOS" }] }),
  component: ExercisePage,
});

const today = () => new Date().toISOString().slice(0, 10);

function ExercisePage() {
  const exercise = useExerciseStore((state) => state.exercise);
  const addExercise = useExerciseStore((state) => state.addExercise);
  const updateExercise = useExerciseStore((state) => state.updateExercise);
  const deleteExercise = useExerciseStore((state) => state.deleteExercise);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState<ExerciseEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Omit<ExerciseEntry, "id">>({ exercise: "", durationMinutes: 0, calories: 0, date: today() });
  const thisWeek = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return exercise.filter((entry) => new Date(`${entry.date}T00:00:00`) >= start);
  }, [exercise]);

  const openNew = () => {
    setActiveExercise(null); setError(""); setForm({ exercise: "", durationMinutes: 0, calories: 0, date: today() }); setDialogOpen(true);
  };
  const openEdit = (entry: ExerciseEntry) => {
    setActiveExercise(entry); setError(""); setForm({ exercise: entry.exercise, durationMinutes: entry.durationMinutes, calories: entry.calories, date: entry.date }); setDialogOpen(true);
  };
  const handleSave = async () => {
    if (saving) return;
    if (!form.exercise.trim() || !form.date) { setError("Exercise name and date are required."); return; }
    setSaving(true); setError(""); await Promise.resolve();
    if (activeExercise) updateExercise(activeExercise.id, { ...form, exercise: form.exercise.trim() });
    else addExercise({ ...form, exercise: form.exercise.trim() });
    setSaving(false); setDialogOpen(false);
  };
  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true); await Promise.resolve(); deleteExercise(deleteTarget); setDeleting(false); setDeleteOpen(false); setDeleteTarget("");
  };

  return (
    <AppShell title="Exercise">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#7657D9]/10 text-[#7657D9]"><Activity className="h-5 w-5" /></div><div><h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Exercise</h1><p className="text-[13.5px] text-ink-soft">Stay consistent. Build a healthier you.</p></div></div>
          <button type="button" onClick={openNew} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Exercise</button>
        </header>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)]">
          <section className="card-soft p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-[18px] font-semibold">Exercise records</h2><p className="mt-1 text-[12.5px] text-ink-soft">Your activity, captured over time.</p></div><Dumbbell className="h-5 w-5 text-[#7657D9]" /></div>
            {exercise.length ? <div className="divide-y divide-border/70">{exercise.map((entry) => <div key={entry.id} className="group flex flex-wrap items-center gap-3 py-4 first:pt-2 last:pb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16A878]/10 text-[#16A878]"><Activity className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-ink">{entry.exercise}</p><div className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-soft"><span>{entry.date}</span><span>·</span><span>{entry.durationMinutes} mins</span>{entry.calories ? <><span>·</span><span>{entry.calories} calories</span></> : null}</div></div><span className="rounded-full bg-[#16A878]/10 px-2.5 py-1 text-[11px] font-medium text-[#13825f]">Completed</span><div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100"><button type="button" aria-label={`Edit ${entry.exercise}`} onClick={() => openEdit(entry)} className="rounded-full p-2 text-ink-soft hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button><button type="button" aria-label={`Delete ${entry.exercise}`} onClick={() => { setDeleteTarget(entry.id); setDeleteOpen(true); }} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}</div> : <div className="rounded-[16px] border border-dashed border-border bg-muted/30 px-5 py-10 text-center"><Activity className="mx-auto h-8 w-8 text-[#7657D9]/60" /><p className="mt-3 text-[14px] font-semibold text-ink">No exercise records yet.</p><p className="mt-1 text-[12.5px] text-ink-soft">Start your fitness journey and build healthy habits.</p><button type="button" onClick={openNew} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-[12.5px] font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Exercise</button></div>}
          </section>
          <aside className="space-y-5"><section className="card-soft p-5"><div className="flex items-center justify-between"><h2 className="font-display text-[18px] font-semibold">Weekly Progress</h2><Clock3 className="h-4 w-4 text-[#7657D9]" /></div><p className="mt-4 text-[30px] font-semibold tracking-tight text-ink">{thisWeek.length} <span className="text-[15px] font-normal text-ink-soft">/ {Math.max(thisWeek.length, 0)}</span></p><p className="mt-1 text-[12.5px] text-ink-soft">Workouts completed this week</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#7657D9]" style={{ width: thisWeek.length ? "100%" : "0%" }} /></div></section><section className="card-soft p-5"><h2 className="font-display text-[18px] font-semibold">Quick Tips</h2><ul className="mt-4 space-y-3 text-[12.5px] text-ink-soft">{["Stay hydrated before and after your workout.", "Aim for 7–8 hours of sleep for better recovery.", "Keep your form correct, not just the weight.", "Consistency beats intensity."].map((tip) => <li key={tip} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A878]" />{tip}</li>)}</ul><p className="mt-5 border-t border-border pt-4 text-[12px] font-medium text-ink-soft">A healthier you, a better tomorrow.</p></section></aside>
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="w-[calc(100vw-24px)] max-w-lg overflow-hidden p-0 sm:rounded-[20px]"><div className="flex max-h-[calc(100vh-24px)] flex-col"><DialogHeader className="px-4 py-4 sm:px-6"><DialogTitle>{activeExercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle><p className="text-sm text-ink-soft">Log the details of your workout.</p></DialogHeader><div className="grid gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"><Field label="Exercise Name" required><Input value={form.exercise} onChange={(e) => setForm((p) => ({ ...p, exercise: e.target.value }))} placeholder="Enter exercise name" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Date" required><Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></Field><Field label="Duration" optional><Input type="number" min={0} value={form.durationMinutes} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} placeholder="Minutes" /></Field></div><Field label="Calories" optional><Input type="number" min={0} value={form.calories} onChange={(e) => setForm((p) => ({ ...p, calories: Number(e.target.value) }))} placeholder="Calories burned" /></Field>{error ? <p className="text-sm text-destructive">{error}</p> : null}</div><DialogFooter className="border-t border-border px-4 py-4 sm:px-6"><button type="button" onClick={() => setDialogOpen(false)} className="h-9 rounded-[10px] border border-border px-4 text-sm text-ink-soft hover:bg-muted">Cancel</button><button type="button" disabled={saving} onClick={handleSave} className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{saving ? "Saving..." : activeExercise ? "Save Changes" : "Add Exercise"}</button></DialogFooter></div></DialogContent></Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this exercise?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={deleting} onClick={handleDelete}>{deleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </AppShell>
  );
}

function Field({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: ReactNode }) { return <label className="grid gap-1.5 text-[12px] font-medium text-ink-soft"><span>{label} {required ? <span className="text-destructive">*</span> : null}{optional ? <span className="font-normal"> (Optional)</span> : null}</span>{children}</label>; }
