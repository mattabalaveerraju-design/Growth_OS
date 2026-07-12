import { useMemo, useState, type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Briefcase, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
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
import { useApplicationStore, ApplicationItem, ApplicationStatus } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Job Tracker — GrowthOS" }] }),
  component: JobsPage,
});

const tabs: (ApplicationStatus | "All")[] = [
  "All",
  "Wishlist",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];
const statuses: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];

const statusStyle: Record<ApplicationStatus, string> = {
  Wishlist: "bg-muted text-ink-soft",
  Applied: "bg-[oklch(0.95_0.04_200)] text-[oklch(0.42_0.18_220)]",
  Screening: "bg-[oklch(0.96_0.06_75)] text-[oklch(0.4_0.16_60)]",
  Interview: "bg-[oklch(0.92_0.08_120)] text-[oklch(0.38_0.16_120)]",
  Offer: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.32_0.16_155)]",
  Rejected: "bg-[oklch(0.95_0.05_25)] text-[oklch(0.42_0.18_25)]",
};

function JobsPage() {
  const applications = useApplicationStore((state) => state.applications);
  const addApplication = useApplicationStore((state) => state.addApplication);
  const updateApplication = useApplicationStore((state) => state.updateApplication);
  const deleteApplication = useApplicationStore((state) => state.deleteApplication);

  const [activeTab, setActiveTab] = useState<ApplicationStatus | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState<ApplicationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string>("");
  const [formState, setFormState] = useState<Omit<ApplicationItem, "id">>({
    company: "",
    position: "",
    country: "",
    salary: "",
    appliedDate: new Date().toISOString().slice(0, 10),
    status: "Wishlist",
    interviewStage: "",
    portfolioSent: false,
    notes: "",
  });

  const filteredApplications = useMemo(
    () =>
      activeTab === "All" ? applications : applications.filter((item) => item.status === activeTab),
    [applications, activeTab],
  );

  const applicationsSent = applications.filter((item) => item.status !== "Wishlist").length;
  const responseRate = applications.length
    ? Math.round((applicationsSent / applications.length) * 100)
    : 0;
  const interviewRate = applications.length
    ? Math.round(
        (applications.filter((item) => item.status === "Interview").length / applications.length) *
          100,
      )
    : 0;
  const offerRate = applications.length
    ? Math.round(
        (applications.filter((item) => item.status === "Offer").length / applications.length) * 100,
      )
    : 0;

  const openNew = () => {
    setActiveApplication(null);
    setFormState({
      company: "",
      position: "",
      country: "",
      salary: "",
      appliedDate: new Date().toISOString().slice(0, 10),
      status: "Wishlist",
      interviewStage: "",
      portfolioSent: false,
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (application: ApplicationItem) => {
    setActiveApplication(application);
    setFormState({
      company: application.company,
      position: application.position,
      country: application.country,
      salary: application.salary,
      appliedDate: application.appliedDate,
      status: application.status,
      interviewStage: application.interviewStage,
      portfolioSent: application.portfolioSent,
      notes: application.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const company = formState.company.trim();
    const position = formState.position.trim();
    if (!company || !position) return;
    if (activeApplication) {
      updateApplication(activeApplication.id, { ...formState, company, position });
    } else {
      addApplication({ ...formState, company, position });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteApplication(deleteTarget);
    setDeleteOpen(false);
    setDeleteTarget("");
  };

  return (
    <AppShell title="Applications">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">
              Applications
            </h1>
            <p className="text-[13.5px] text-ink-soft">
              {applications.length} active · {responseRate}% response rate
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Application
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-soft p-5"
          >
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`px-3 h-7 text-[12px] font-medium rounded-full transition-colors ${
                    activeTab === t ? "bg-ink text-background" : "text-ink-soft hover:bg-accent/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {filteredApplications.length ? (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-[10.5px] font-semibold tracking-[0.12em] text-ink-soft/70 uppercase">
                      <th className="text-left px-2 py-2 font-semibold">Company</th>
                      <th className="text-left px-2 py-2 font-semibold">Position</th>
                      <th className="text-left px-2 py-2 font-semibold">Status</th>
                      <th className="text-left px-2 py-2 font-semibold">Applied Date</th>
                      <th className="text-left px-2 py-2 font-semibold">Next Step</th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr
                        key={application.id}
                        className="border-t border-border/60 hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-2 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-primary/20 to-violet/20 grid place-items-center text-[11px] font-semibold text-ink">
                              {application.company[0]}
                            </div>
                            <span className="font-semibold text-ink">{application.company}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3.5 text-ink-soft">{application.position}</td>
                        <td className="px-2 py-3.5">
                          <div className="space-y-1">
                            <select
                              value={application.status}
                              onChange={(event) =>
                                updateApplication(application.id, {
                                  status: event.target.value as ApplicationStatus,
                                })
                              }
                              className="h-9 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-[12px] outline-none"
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <span
                              className={`inline-block text-[10.5px] font-medium px-2 py-0.5 rounded-full ${statusStyle[application.status]}`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3.5 text-ink-soft">{application.appliedDate}</td>
                        <td className="px-2 py-3.5 text-ink-soft">
                          {application.interviewStage ||
                            (application.portfolioSent ? "Portfolio sent" : "Awaiting next action")}
                        </td>
                        <td className="px-2 py-3.5 text-right">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEdit(application)}
                              className="text-ink-soft/70 hover:text-ink"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(application.id);
                                setDeleteOpen(true);
                              }}
                              className="text-destructive hover:text-destructive-foreground"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : applications.length ? (
              <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
                No applications match this filter.
              </div>
            ) : (
              <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
                No applications yet.
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={openNew}
                    className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Add Application
                  </button>
                </div>
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
              <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
                Application Stats
              </div>
              <div className="mt-4 space-y-3">
                <FunnelRow
                  icon={Briefcase}
                  label="Applications Sent"
                  value={`${applicationsSent}`}
                  pct={Math.min(100, applicationsSent)}
                  tint="primary"
                />
                <FunnelRow
                  icon={MessageSquare}
                  label="Response Rate"
                  value={`${responseRate}%`}
                  pct={responseRate}
                  tint="violet"
                />
                <FunnelRow
                  icon={CheckCircle2}
                  label="Interview Rate"
                  value={`${interviewRate}%`}
                  pct={interviewRate}
                  tint="warning"
                />
                <FunnelRow
                  icon={XCircle}
                  label="Offer Rate"
                  value={`${offerRate}%`}
                  pct={offerRate}
                  tint="success"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="card-soft p-5 bg-gradient-to-br from-card to-accent/20"
            >
              <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
                AI Resume Tip
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink/90">
                Your BluConn case study lifts every Senior PD application. Lead with it on the
                Linear and Stripe resumes.
              </p>
              <button className="mt-3 text-[12.5px] font-medium text-primary hover:underline">
                Apply suggestion →
              </button>
            </motion.div>
          </aside>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-3xl overflow-hidden p-0 sm:rounded-[24px]">
          <div className="flex max-h-[calc(100vh-24px)] flex-col">
            <DialogHeader className="px-4 py-4 sm:px-6">
              <DialogTitle>
                {activeApplication ? "Edit Application" : "Add Application"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-4">
                <Input
                  value={formState.company}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, company: event.target.value }))
                  }
                  placeholder="Company"
                />
                <Input
                  value={formState.position}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, position: event.target.value }))
                  }
                  placeholder="Position"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={formState.country}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, country: event.target.value }))
                    }
                    placeholder="Country"
                  />
                  <Input
                    value={formState.salary}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, salary: event.target.value }))
                    }
                    placeholder="Salary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={formState.appliedDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, appliedDate: event.target.value }))
                    }
                  />
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: event.target.value as ApplicationStatus,
                      }))
                    }
                    className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={formState.interviewStage}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, interviewStage: event.target.value }))
                    }
                    placeholder="Interview Stage"
                  />
                  <select
                    value={formState.portfolioSent ? "Yes" : "No"}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        portfolioSent: event.target.value === "Yes",
                      }))
                    }
                    className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="No">Portfolio Sent: No</option>
                    <option value="Yes">Portfolio Sent: Yes</option>
                  </select>
                </div>
                <Textarea
                  value={formState.notes}
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
            <AlertDialogTitle>Delete application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application?
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

function FunnelRow({
  icon: Icon,
  label,
  value,
  pct,
  tint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  pct: number;
  tint: string;
}) {
  const tintMap: Record<string, string> = {
    primary: "bg-primary",
    violet: "bg-violet",
    warning: "bg-warning",
    success: "bg-success",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="inline-flex items-center gap-2 text-ink-soft">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="font-display font-semibold text-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${tintMap[tint]}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
