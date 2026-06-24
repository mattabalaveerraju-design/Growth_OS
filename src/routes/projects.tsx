import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Calendar } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useProjectsStore, ProjectItem } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — GrowthOS" }] }),
  component: ProjectsPage,
});

type ProjectStatus = "Planning" | "Active" | "Review" | "Completed";
type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

function ProjectsPage() {
  const projects = useProjectsStore((state) => state.projects);
  const addProject = useProjectsStore((state) => state.addProject);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const deleteProject = useProjectsStore((state) => state.deleteProject);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string>("");
  const [formState, setFormState] = useState<Omit<ProjectItem, "id" | "createdAt">>({
    title: "",
    description: "",
    status: "Planning",
  });

  const filteredProjects = useMemo(
    () =>
      projects.filter((item) =>
        [item.title, item.description].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()),
      ),
    [projects, search],
  );

  const projectsByStatus = useMemo(
    () => ({
      Planning: filteredProjects.filter((p) => p.status === "Planning"),
      Active: filteredProjects.filter((p) => p.status === "Active"),
      Review: filteredProjects.filter((p) => p.status === "Review"),
      Completed: filteredProjects.filter((p) => p.status === "Completed"),
    }),
    [filteredProjects],
  );

  const openNew = () => {
    setActiveProject(null);
    setFormState({
      title: "",
      description: "",
      status: "Planning",
    });
    setDialogOpen(true);
  };

  const openEdit = (project: ProjectItem) => {
    setActiveProject(project);
    setFormState({
      title: project.title,
      description: project.description,
      status: project.status,
      files: project.files,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const title = formState.title.trim();
    if (!title) return;
    if (activeProject) {
      updateProject(activeProject.id, { ...formState, title });
    } else {
      addProject({ ...formState, title });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget);
    setDeleteOpen(false);
    setDeleteTarget("");
  };

  const statuses: ProjectStatus[] = ["Planning", "Active", "Review", "Completed"];

  const statusColors: Record<ProjectStatus, string> = {
    Planning: "bg-muted text-ink-soft",
    Active: "bg-[oklch(0.92_0.05_220)] text-[oklch(0.42_0.18_220)]",
    Review: "bg-[oklch(0.93_0.05_50)] text-[oklch(0.40_0.18_50)]",
    Completed: "bg-[oklch(0.90_0.05_130)] text-[oklch(0.40_0.17_130)]",
  };

  return (
    <AppShell title="Projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Projects</h1>
            <p className="text-[13.5px] text-ink-soft">Manage your projects from planning through completion</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-soft p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-soft/60" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects…"
                className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-muted border border-transparent text-[13px] focus:bg-card focus:border-border outline-none"
              />
            </div>
          </div>

          {filteredProjects.length ? (
            <div className="space-y-4">
              {statuses.map((status) =>
                projectsByStatus[status].length ? (
                  <div key={status}>
                    <h3 className="text-[13px] font-semibold text-ink-soft uppercase tracking-wide mb-2">
                      {status} ({projectsByStatus[status].length})
                    </h3>
                    <div className="space-y-2">
                      {projectsByStatus[status].map((project) => (
                        <div key={project.id} className="rounded-[14px] border border-border/60 p-4 hover:border-border transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-ink text-[14px]">{project.title}</h3>
                              {project.description && (
                                <p className="text-[12px] text-ink-soft mt-0.5 line-clamp-2">{project.description}</p>
                              )}
                            </div>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[status as ProjectStatus]}`}>
                              {status}
                            </span>
                          </div>

                          {project.files && project.files.length > 0 && (
                            <div className="mt-2 mb-2 text-[11px] text-ink-soft">
                              📁 {project.files.length} file(s)
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                            <button
                              type="button"
                              onClick={() => openEdit(project)}
                              className="flex-1 text-[12px] font-medium text-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(project.id);
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
                  </div>
                ) : null,
              )}
            </div>
          ) : projects.length ? (
            <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
              No projects match your search.
            </div>
          ) : (
            <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft text-center">
              No projects yet. Start building.
              <div className="mt-4">
                <button
                  type="button"
                  onClick={openNew}
                  className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add Project
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeProject ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Project title"
            />
            <Textarea
              value={formState.description || ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Project description"
            />
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
              className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <DialogFooter>
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this project?</AlertDialogDescription>
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
