import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Filter, ListFilter, MoreHorizontal, MessageSquare, Paperclip, Edit2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useTaskStore, useDailyChecklistStore, TaskItem } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — GrowthOS" }] }),
  component: TasksPage,
});

type Task = {
  id: string;
  title: string;
  project?: string;
  tag?: string;
  category?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status?: "Todo" | "In Progress" | "Done" | "Blocked" | "Review";
  dueDate?: string;
  date?: string;
  notes?: string;
  comments?: number;
  attachments?: number;
};

const priorityDot: Record<Task["priority"], string> = {
  Critical: "bg-red-600",
  High: "bg-danger",
  Medium: "bg-warning",
  Low: "bg-ink-soft/30",
};

function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks) as TaskItem[];
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const checklist = useDailyChecklistStore((s) => s.items);
  const addChecklistItem = useDailyChecklistStore((s) => s.addItem);
  const toggleChecklistItem = useDailyChecklistStore((s) => s.toggleItem);
  useDailyChecklistStore((s) => s.resetIfNeeded)();

  const cols = [
    { id: "todo", title: "To Do", tone: "bg-muted-foreground/40", tasks: tasks.filter((t) => t.status === "Todo") },
    { id: "progress", title: "In Progress", tone: "bg-primary", tasks: tasks.filter((t) => t.status === "In Progress") },
    { id: "review", title: "Review", tone: "bg-warning", tasks: tasks.filter((t) => t.status === "Blocked") },
    { id: "done", title: "Completed", tone: "bg-success", tasks: tasks.filter((t) => t.status === "Done") },
  ];

  const handleNewTask = () => {
    const title = window.prompt("Task title")?.trim();
    if (!title) return;
    const category = window.prompt("Category (e.g. BluConn)") || "General";
    const priority = (window.prompt("Priority: Low, Medium, High, Critical") || "Medium") as Task["priority"];
    const dueDate = window.prompt("Due date (YYYY-MM-DD)") || new Date().toISOString().slice(0, 10);
    addTask({ title, category, priority, status: "Todo", dueDate, notes: "" });
  };

  return (
    <AppShell title="Tasks">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Tasks</h1>
            <p className="text-[13.5px] text-ink-soft">{tasks.length} active across {new Set(tasks.map((t) => t.category)).size} projects</p>
          </div>
          <div className="flex items-center gap-2">
            <Pill>All Tasks</Pill>
            <Pill>My Tasks</Pill>
            <Pill>Due This Week</Pill>
            <Pill icon={<ListFilter className="h-3.5 w-3.5" />}>Priority</Pill>
            <button onClick={handleNewTask} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-primary text-primary-foreground text-[13px] font-medium shadow-sm hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> New Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cols.map((col, ci) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: ci * 0.05 }}
              className="rounded-[20px] bg-card border border-border p-3 min-h-[640px] flex flex-col"
            >
              <div className="flex items-center justify-between px-2 pt-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.tone}`} />
                  <span className="text-[13px] font-semibold text-ink">{col.title}</span>
                  <span className="text-[11.5px] text-ink-soft">{col.tasks.length}</span>
                </div>
                <button className="text-ink-soft/60 hover:text-ink-soft"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="space-y-2.5 flex-1">
                {col.tasks.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={() => {
                    const newTitle = window.prompt("Edit title", t.title)?.trim();
                    if (!newTitle) return;
                    const newStatus = window.prompt("Status: Todo, In Progress, Done, Blocked", t.status) as Task["status"];
                    updateTask(t.id, { title: newTitle, status: newStatus });
                  }} onDelete={() => {
                    if (window.confirm("Delete this task?")) deleteTask(t.id);
                  }} />
                ))}
                <button onClick={() => {
                  const title = window.prompt("Task title")?.trim();
                  if (!title) return;
                  addTask({ title, category: "General", priority: "Medium", status: col.id === "done" ? "Done" : "Todo", dueDate: new Date().toISOString().slice(0,10), notes: "" });
                }} className="w-full mt-2 rounded-[14px] border border-dashed border-border text-[12.5px] text-ink-soft/70 py-2.5 hover:bg-accent/30 hover:text-ink-soft transition-colors inline-flex items-center justify-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Task
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Pill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-card border border-border text-[12.5px] font-medium text-ink-soft hover:bg-accent/40 transition-colors">
      {icon}
      {children}
    </button>
  );
}

function TaskCard({ task, onEdit, onDelete }: { task: Task; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="group rounded-[14px] bg-surface-elevated border border-border p-3 cursor-grab hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all">
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button onClick={onEdit} className="p-1 rounded hover:bg-accent/20">
            <Edit2 className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-1 rounded hover:bg-accent/20">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="text-[13.5px] font-semibold text-ink leading-snug">{task.title}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-soft">{task.project}</div>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 py-0.5 rounded-full ${tagColors[task.tag || ''] || ''}`}>
            <span className={`h-1 w-1 rounded-full ${priorityDot[task.priority]}`} />
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-ink-soft">
          {task.comments && <span className="inline-flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{task.comments}</span>}
          {task.attachments && <span className="inline-flex items-center gap-0.5"><Paperclip className="h-3 w-3" />{task.attachments}</span>}
          <span>{task.date || task.dueDate}</span>
        </div>
      </div>
    </div>
  );
}

const tagColors: Record<string, string> = {
  Design: "bg-[oklch(0.95_0.04_275)] text-[oklch(0.42_0.18_275)]",
  Research: "bg-[oklch(0.95_0.04_200)] text-[oklch(0.42_0.18_220)]",
  Learning: "bg-[oklch(0.95_0.05_140)] text-[oklch(0.42_0.16_150)]",
  Personal: "bg-[oklch(0.96_0.03_50)] text-[oklch(0.45_0.15_55)]",
  Career: "bg-[oklch(0.95_0.04_295)] text-[oklch(0.42_0.18_295)]",
  Portfolio: "bg-[oklch(0.95_0.04_25)] text-[oklch(0.48_0.18_25)]",
};
