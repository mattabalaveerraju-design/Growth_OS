import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BriefcaseBusiness, ChartColumn, Check, CircleDollarSign, Clock3, Pencil, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFreelanceStore, useGoalStore, type FreelanceItem, type FreelanceStatus } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/freelancing")({
  head: () => ({ meta: [{ title: "Freelancing — GrowthOS" }] }),
  component: FreelancingPage,
});

const statuses: FreelanceStatus[] = ["Lead", "Contacted", "Proposal Sent", "Active", "Waiting", "Completed", "Paid", "Lost"];
const statusClasses: Record<FreelanceStatus, string> = {
  Lead: "bg-muted text-ink-soft", Contacted: "bg-blue-50 text-blue-700", "Proposal Sent": "bg-violet-50 text-violet-700", Active: "bg-blue-50 text-blue-700", Waiting: "bg-orange-50 text-orange-700", Completed: "bg-emerald-50 text-emerald-700", Paid: "bg-emerald-50 text-emerald-700", Lost: "bg-rose-50 text-rose-700",
};
const emptyForm: Omit<FreelanceItem, "id"> = { client: "", project: "", description: "", category: "", status: "Lead", startDate: "", deadline: "", amount: 0, paymentStatus: "Pending", nextAction: "", notes: "", hoursWorked: 0 };

function FreelancingPage() {
  const freelance = useFreelanceStore((state) => state.freelance);
  const addFreelance = useFreelanceStore((state) => state.addFreelance);
  const updateFreelance = useFreelanceStore((state) => state.updateFreelance);
  const deleteFreelance = useFreelanceStore((state) => state.deleteFreelance);
  const goals = useGoalStore((state) => state.goals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [active, setActive] = useState<FreelanceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState("");
  const [form, setForm] = useState<Omit<FreelanceItem, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const completed = freelance.filter((item) => item.status === "Completed" || item.status === "Paid").length;
  const inProgress = freelance.filter((item) => item.status === "Active" || item.status === "Waiting").length;
  const pendingPayments = freelance.filter((item) => item.paymentStatus === "Pending" && item.amount).reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const hoursWorked = freelance.reduce((sum, item) => sum + (item.hoursWorked ?? 0), 0);
  const openLeads = freelance.filter((item) => ["Lead", "Contacted", "Proposal Sent"].includes(item.status)).length;
  const activeClients = new Set(
    freelance
      .filter((item) => item.status === "Active")
      .map((item) => item.client.trim().toLowerCase())
      .filter(Boolean),
  ).size;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = freelance
    .filter(
      (item) =>
        (item.status === "Paid" || item.paymentStatus === "Paid") &&
        item.startDate?.startsWith(currentMonth),
    )
    .reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const activeGoals = goals.filter((goal) => goal.status !== "Completed" && goal.status !== "Done").slice(0, 3);

  const openNew = () => { setActive(null); setForm({ ...emptyForm }); setError(""); setDialogOpen(true); };
  const openEdit = (item: FreelanceItem) => { setActive(item); setForm({ client: item.client, project: item.project, description: item.description, category: item.category, status: item.status, startDate: item.startDate, deadline: item.deadline, amount: item.amount, paymentStatus: item.paymentStatus, nextAction: item.nextAction, notes: item.notes, hoursWorked: item.hoursWorked }); setError(""); setDialogOpen(true); };
  const handleSave = async () => {
    if (saving) return;
    if (!form.client.trim() || !form.project.trim()) { setError("Client and project are required."); return; }
    setSaving(true); setError(""); await Promise.resolve();
    if (active) updateFreelance(active.id, { ...form, client: form.client.trim(), project: form.project.trim() });
    else addFreelance({ ...form, client: form.client.trim(), project: form.project.trim() });
    setSaving(false); setDialogOpen(false);
  };
  const handleDelete = async () => { if (!deleteTarget || deleting) return; setDeleting(true); await Promise.resolve(); deleteFreelance(deleteTarget); setDeleting(false); setDeleteOpen(false); setDeleteTarget(""); };

  return <AppShell title="Freelancing"><div className="mx-auto max-w-4xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Freelancing</h1>
        <p className="text-[13.5px] text-ink-soft">Pipeline, pricing, and projects without losing track of your leads.</p>
      </div>
      <button type="button" onClick={openNew} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Freelance Work</button>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard label="Open leads" value={String(openLeads)} icon={Sparkles} />
      <SummaryCard label="Active clients" value={String(activeClients)} icon={BriefcaseBusiness} />
      <SummaryCard label="Monthly revenue" value={monthlyRevenue ? `$${monthlyRevenue.toLocaleString()}` : "—"} icon={ChartColumn} />
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)]">
      <section className="card-soft p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-[18px] font-semibold">Freelance projects</h2><p className="mt-1 text-[12.5px] text-ink-soft">Keep your pipeline and client work in view.</p></div><BriefcaseBusiness className="h-5 w-5 text-[#4263EB]" /></div>
        {freelance.length ? <div className="divide-y divide-border/70">{freelance.map((item) => <div key={item.id} className="group flex flex-wrap items-center gap-3 py-4 first:pt-2 last:pb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4263EB]/10 text-[#4263EB]"><BriefcaseBusiness className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-ink">{item.project}</p><p className="mt-1 truncate text-[12px] text-ink-soft">{item.client}{item.description ? ` · ${item.description}` : ""}</p><div className="mt-2 flex flex-wrap gap-2 text-[11px] text-ink-soft">{item.category ? <span className="rounded-full bg-muted px-2 py-1">{item.category}</span> : null}{item.nextAction ? <span className="rounded-full bg-muted px-2 py-1">Next: {item.nextAction}</span> : null}</div></div><div className="text-right text-[12px] text-ink-soft"><p>{item.deadline || "No deadline"}</p><span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClasses[item.status]}`}>{item.status}</span></div><div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100"><button type="button" aria-label={`Edit ${item.project}`} onClick={() => openEdit(item)} className="rounded-full p-2 text-ink-soft hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button><button type="button" aria-label={`Delete ${item.project}`} onClick={() => { setDeleteTarget(item.id); setDeleteOpen(true); }} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}</div> : <div className="rounded-[16px] border border-dashed border-border bg-muted/30 px-5 py-10 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-[#4263EB]/60" /><p className="mt-3 text-[14px] font-semibold text-ink">No freelancing records yet.</p><p className="mt-1 text-[12.5px] text-ink-soft">Track your projects, earnings and grow your freelance career.</p><button type="button" onClick={openNew} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-[12.5px] font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Freelance Work</button></div>}
      </section>
      <aside className="space-y-5"><section className="card-soft p-5"><h2 className="font-display text-[18px] font-semibold">Quick Stats</h2><div className="mt-4 grid grid-cols-2 gap-4"><Metric icon={BriefcaseBusiness} label="Total Projects" value={String(freelance.length)} /><Metric icon={Clock3} label="Hours Worked" value={hoursWorked ? `${hoursWorked}h` : "—"} /><Metric icon={Check} label="Completed" value={String(completed)} /><Metric icon={Users} label="In Progress" value={String(inProgress)} /><Metric icon={CircleDollarSign} label="Pending Payments" value={pendingPayments ? `$${pendingPayments.toLocaleString()}` : "—"} /></div></section><section className="card-soft p-5"><div className="flex items-center justify-between"><h2 className="font-display text-[18px] font-semibold">Recent Goals</h2><Link to="/goals" className="text-[12px] font-medium text-primary hover:underline">View Goals →</Link></div>{activeGoals.length ? <div className="mt-4 space-y-4">{activeGoals.map((goal) => <div key={goal.id}><div className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A878]" /><div className="min-w-0"><p className="text-[12.5px] font-medium text-ink">{goal.title}</p><p className="mt-0.5 text-[11px] text-ink-soft">{goal.status}</p></div></div>{goal.targetValue ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#4263EB]" style={{ width: `${Math.min(100, ((goal.currentValue ?? 0) / goal.targetValue) * 100)}%` }} /></div> : null}</div>)}</div> : <p className="mt-4 text-[12.5px] text-ink-soft">No active goals yet.</p>}</section></aside>
    </div>
  </div>
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="w-[calc(100vw-24px)] max-w-2xl overflow-hidden p-0 sm:rounded-[20px]"><div className="flex max-h-[calc(100vh-24px)] flex-col"><DialogHeader className="px-4 py-4 sm:px-6"><DialogTitle>{active ? "Edit Freelance Work" : "Add Freelance Work"}</DialogTitle><p className="text-sm text-ink-soft">Track a client opportunity or active project.</p></DialogHeader><div className="grid gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Client" required><Input value={form.client} onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))} placeholder="Enter client name" /></Field><Field label="Project / Service" required><Input value={form.project} onChange={(e) => setForm((p) => ({ ...p, project: e.target.value }))} placeholder="Enter project name" /></Field></div><Field label="Description" optional><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the work" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Category" optional><Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. UI/UX Design" /></Field><Field label="Status" required><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FreelanceStatus }))} className="h-10 rounded-[10px] border border-border bg-background px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30">{statuses.map((status) => <option key={status}>{status}</option>)}</select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Start Date" optional><Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} /></Field><Field label="Deadline" optional><Input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Amount" optional><Input type="number" min={0} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} placeholder="Enter amount" /></Field><Field label="Payment Status" optional><select value={form.paymentStatus} onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value as FreelanceItem["paymentStatus"] }))} className="h-10 rounded-[10px] border border-border bg-background px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"><option>Pending</option><option>Paid</option><option>Not applicable</option></select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Hours Worked" optional><Input type="number" min={0} value={form.hoursWorked} onChange={(e) => setForm((p) => ({ ...p, hoursWorked: Number(e.target.value) }))} placeholder="Hours" /></Field><Field label="Next Action" optional><Input value={form.nextAction} onChange={(e) => setForm((p) => ({ ...p, nextAction: e.target.value }))} placeholder="Enter next action" /></Field></div><Field label="Notes" optional><Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" /></Field>{error ? <p className="text-sm text-destructive">{error}</p> : null}</div><DialogFooter className="border-t border-border px-4 py-4 sm:px-6"><button type="button" onClick={() => setDialogOpen(false)} className="h-9 rounded-[10px] border border-border px-4 text-sm text-ink-soft hover:bg-muted">Cancel</button><button type="button" disabled={saving} onClick={handleSave} className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{saving ? "Saving..." : active ? "Save Changes" : "Add Freelance Work"}</button></DialogFooter></div></DialogContent></Dialog>
  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this freelance work?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={deleting} onClick={handleDelete}>{deleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </AppShell>;
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof BriefcaseBusiness; label: string; value: string }) {
  return <section className="card-soft p-5"><div className="flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft/70">{label}</p><h2 className="mt-2 text-[24px] font-semibold tracking-tight text-ink">{value}</h2></div><div className="rounded-[10px] bg-muted p-2 text-ink-soft"><Icon className="h-4 w-4" /></div></div></section>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof BriefcaseBusiness; label: string; value: string }) { return <div><div className="flex items-center gap-1.5 text-[11px] text-ink-soft"><Icon className="h-3.5 w-3.5 text-[#4263EB]" />{label}</div><p className="mt-1 text-[20px] font-semibold text-ink">{value}</p></div>; }
function Field({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: ReactNode }) { return <label className="grid gap-1.5 text-[12px] font-medium text-ink-soft"><span>{label} {required ? <span className="text-destructive">*</span> : null}{optional ? <span className="font-normal"> (Optional)</span> : null}</span>{children}</label>; }
