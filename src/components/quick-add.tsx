"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTaskStore, useLearningStore, useApplicationStore, useReadingStore, useExerciseStore, useFocusStore, useGoalStore, useInterviewStore, useVaultStore, useProjectsStore, ApplicationStatus } from "@/stores/useGrowthStores";

const today = new Date().toISOString().slice(0, 10);
const defaultState = {
  task: { title: "", category: "", priority: "Medium", status: "Todo", dueDate: today, notes: "" },
  learning: { topic: "", category: "", source: "", timeHours: "", notes: "", confidence: 60, date: today },
  application: { company: "", position: "", country: "", salary: "", appliedDate: today, status: "Applied" as ApplicationStatus, interviewStage: "", portfolioSent: false, notes: "" },
  reading: { book: "", pages: "", timeMinutes: "", progress: "", date: today },
  exercise: { exercise: "", durationMinutes: "", calories: "", date: today },
  goal: { title: "", category: "", status: "Open", notes: "", type: "Monthly", startDate: today, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), targetValue: 0, currentValue: 0 },
  focus: { title: "", category: "", startTime: "09:00", endTime: "10:00", status: "Planned", priority: "Medium", notes: "" },
  interview: { title: "", type: "note", content: "" },
  vault: { title: "", type: "note", content: "" },
  project: { title: "", description: "", status: "Planning" },
};

type QuickTab = "Task" | "Learning" | "Application" | "Reading" | "Exercise" | "Goal" | "Focus" | "Interview" | "Vault" | "Project";

export function QuickAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const addTask = useTaskStore((state) => state.addTask);
  const addLearning = useLearningStore((state) => state.addLearning);
  const addApplication = useApplicationStore((state) => state.addApplication);
  const addReading = useReadingStore((state) => state.addReading);
  const addExercise = useExerciseStore((state) => state.addExercise);
  const addFocusItem = useFocusStore((state) => state.addFocusItem);
  const addGoal = useGoalStore((state) => state.addGoal);
  const addInterviewNote = useInterviewStore((state) => state.addInterviewNote);
  const addVaultItem = useVaultStore((state) => state.addVaultItem);
  const addProject = useProjectsStore((state) => state.addProject);

  const [activeTab, setActiveTab] = useState<QuickTab>("Task");
  const [values, setValues] = useState<typeof defaultState>(defaultState);

  const title = useMemo(() => `${activeTab} Quick Add`, [activeTab]);

  const handleSave = () => {
    if (activeTab === "Task") {
      addTask({
        title: values.task.title.trim() || "New Task",
        category: values.task.category || "General",
        priority: values.task.priority as any,
        status: values.task.status as any,
        dueDate: values.task.dueDate,
        notes: values.task.notes,
      });
      toast.success("Task added");
    }
    if (activeTab === "Learning") {
      addLearning({
        topic: values.learning.topic.trim() || "New Learning",
        category: values.learning.category || "General",
        source: values.learning.source || "Manual",
        timeHours: Number(values.learning.timeHours) || 0,
        notes: values.learning.notes,
        confidence: Number(values.learning.confidence) || 0,
        date: values.learning.date,
      });
      toast.success("Learning entry added");
    }
    if (activeTab === "Application") {
      addApplication({
        company: values.application.company.trim() || "Company",
        position: values.application.position || "Role",
        country: values.application.country || "",
        salary: values.application.salary || "",
        appliedDate: values.application.appliedDate,
        status: values.application.status,
        interviewStage: values.application.interviewStage || "",
        portfolioSent: values.application.portfolioSent,
        notes: values.application.notes,
      });
      toast.success("Application added");
    }
    if (activeTab === "Reading") {
      addReading({
        book: values.reading.book.trim() || "New Book",
        pages: Number(values.reading.pages) || 0,
        timeMinutes: Number(values.reading.timeMinutes) || 0,
        progress: Number(values.reading.progress) || 0,
        date: values.reading.date,
      });
      toast.success("Reading entry added");
    }
    if (activeTab === "Exercise") {
      addExercise({
        exercise: values.exercise.exercise.trim() || "Exercise",
        durationMinutes: Number(values.exercise.durationMinutes) || 0,
        calories: Number(values.exercise.calories) || 0,
        date: values.exercise.date,
      });
      toast.success("Exercise entry added");
    }
    if (activeTab === "Goal") {
      addGoal({
        title: values.goal.title.trim() || "New Goal",
        category: values.goal.category || "General",
        status: values.goal.status,
        notes: values.goal.notes,
        type: values.goal.type as any,
        startDate: values.goal.startDate,
        endDate: values.goal.endDate,
        targetValue: values.goal.targetValue || 0,
        currentValue: values.goal.currentValue || 0,
      });
      toast.success("Goal added");
    }
    if (activeTab === "Focus") {
      addFocusItem({
        title: values.focus.title.trim() || "Focus Task",
        category: values.focus.category || "General",
        startTime: values.focus.startTime,
        endTime: values.focus.endTime,
        status: values.focus.status as any,
        priority: values.focus.priority as any,
        notes: values.focus.notes,
      });
      toast.success("Focus item added");
    }
    if (activeTab === "Interview") {
      addInterviewNote({
        title: values.interview.title.trim() || "Interview Topic",
        type: values.interview.type as "note" | "file",
        content: values.interview.content || "",
      });
      toast.success("Interview topic added");
    }
    if (activeTab === "Vault") {
      addVaultItem({
        title: values.vault.title.trim() || "Knowledge Note",
        type: values.vault.type as "note" | "file",
        content: values.vault.content || "",
      });
      toast.success("Vault note added");
    }
    if (activeTab === "Project") {
      addProject({
        title: values.project.title.trim() || "New Project",
        description: values.project.description || "",
        status: values.project.status || "Planning",
      });
      toast.success("Project added");
    }
    setValues(defaultState);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QuickTab)}>
          <TabsList>
            {(["Task", "Learning", "Application", "Reading", "Exercise", "Goal", "Focus", "Interview", "Vault", "Project"] as QuickTab[]).map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Task">
            <div className="grid gap-3">
              <Input
                value={values.task.title}
                placeholder="Title"
                onChange={(event) => setValues((current) => ({ ...current, task: { ...current.task, title: event.target.value } }))}
              />
              <Input
                value={values.task.category}
                placeholder="Category"
                onChange={(event) => setValues((current) => ({ ...current, task: { ...current.task, category: event.target.value } }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.task.dueDate}
                  type="date"
                  onChange={(event) => setValues((current) => ({ ...current, task: { ...current.task, dueDate: event.target.value } }))}
                />
                <Input
                  value={values.task.priority}
                  placeholder="Priority"
                  onChange={(event) => setValues((current) => ({ ...current, task: { ...current.task, priority: event.target.value as any } }))}
                />
              </div>
              <Input
                value={values.task.status}
                placeholder="Status"
                onChange={(event) => setValues((current) => ({ ...current, task: { ...current.task, status: event.target.value as any } }))}
              />
              <textarea
                className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Notes"
                value={values.task.notes}
                onChange={(event) => setValues((current) => ({ ...current, task: { ...current.task, notes: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Learning">
            <div className="grid gap-3">
              <Input
                value={values.learning.topic}
                placeholder="Topic"
                onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, topic: event.target.value } }))}
              />
              <Input
                value={values.learning.category}
                placeholder="Category"
                onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, category: event.target.value } }))}
              />
              <Input
                value={values.learning.source}
                placeholder="Source"
                onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, source: event.target.value } }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.learning.timeHours}
                  placeholder="Time (hours)"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, timeHours: event.target.value } }))}
                />
                <Input
                  value={String(values.learning.confidence)}
                  placeholder="Confidence"
                  type="number"
                  min={0}
                  max={100}
                  onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, confidence: Number(event.target.value) } }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.learning.date}
                  type="date"
                  onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, date: event.target.value } }))}
                />
                <div />
              </div>
              <textarea
                className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Notes"
                value={values.learning.notes}
                onChange={(event) => setValues((current) => ({ ...current, learning: { ...current.learning, notes: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Application">
            <div className="grid gap-3">
              <Input
                value={values.application.company}
                placeholder="Company"
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, company: event.target.value } }))}
              />
              <Input
                value={values.application.position}
                placeholder="Position"
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, position: event.target.value } }))}
              />
              <Input
                value={values.application.country}
                placeholder="Country"
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, country: event.target.value } }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.application.appliedDate}
                  type="date"
                  onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, appliedDate: event.target.value } }))}
                />
                <Input
                  value={values.application.status}
                  placeholder="Status"
                  onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, status: event.target.value as ApplicationStatus } }))}
                />
              </div>
              <Input
                value={values.application.salary}
                placeholder="Salary"
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, salary: event.target.value } }))}
              />
              <Input
                value={values.application.interviewStage}
                placeholder="Interview Stage"
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, interviewStage: event.target.value } }))}
              />
              <select
                value={values.application.portfolioSent ? "Yes" : "No"}
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, portfolioSent: event.target.value === "Yes" } }))}
                className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="No">Portfolio Sent: No</option>
                <option value="Yes">Portfolio Sent: Yes</option>
              </select>
              <textarea
                className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Notes"
                value={values.application.notes}
                onChange={(event) => setValues((current) => ({ ...current, application: { ...current.application, notes: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Reading">
            <div className="grid gap-3">
              <Input
                value={values.reading.book}
                placeholder="Book"
                onChange={(event) => setValues((current) => ({ ...current, reading: { ...current.reading, book: event.target.value } }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.reading.pages}
                  placeholder="Pages"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, reading: { ...current.reading, pages: event.target.value } }))}
                />
                <Input
                  value={values.reading.timeMinutes}
                  placeholder="Time (minutes)"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, reading: { ...current.reading, timeMinutes: event.target.value } }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.reading.progress}
                  placeholder="Progress (%)"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, reading: { ...current.reading, progress: event.target.value } }))}
                />
                <Input
                  value={values.reading.date}
                  type="date"
                  onChange={(event) => setValues((current) => ({ ...current, reading: { ...current.reading, date: event.target.value } }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="Exercise">
            <div className="grid gap-3">
              <Input
                value={values.exercise.exercise}
                placeholder="Exercise"
                onChange={(event) => setValues((current) => ({ ...current, exercise: { ...current.exercise, exercise: event.target.value } }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.exercise.durationMinutes}
                  placeholder="Duration (minutes)"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, exercise: { ...current.exercise, durationMinutes: event.target.value } }))}
                />
                <Input
                  value={values.exercise.calories}
                  placeholder="Calories"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, exercise: { ...current.exercise, calories: event.target.value } }))}
                />
              </div>
              <Input
                value={values.exercise.date}
                type="date"
                onChange={(event) => setValues((current) => ({ ...current, exercise: { ...current.exercise, date: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Goal">
            <div className="grid gap-3">
              <Input
                value={values.goal.title}
                placeholder="Goal"
                onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, title: event.target.value } }))}
              />
              <Input
                value={values.goal.category}
                placeholder="Category"
                onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, category: event.target.value } }))}
              />
              <select
                value={values.goal.type}
                onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, type: event.target.value as any } }))}
                className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.goal.startDate}
                  type="date"
                  onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, startDate: event.target.value } }))}
                />
                <Input
                  value={values.goal.endDate}
                  type="date"
                  onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, endDate: event.target.value } }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={String(values.goal.targetValue || 0)}
                  placeholder="Target"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, targetValue: Number(event.target.value) } }))}
                />
                <Input
                  value={String(values.goal.currentValue || 0)}
                  placeholder="Current"
                  type="number"
                  onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, currentValue: Number(event.target.value) } }))}
                />
              </div>
              <Input
                value={values.goal.status}
                placeholder="Status"
                onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, status: event.target.value } }))}
              />
              <textarea
                className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Notes"
                value={values.goal.notes}
                onChange={(event) => setValues((current) => ({ ...current, goal: { ...current.goal, notes: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Focus">
            <div className="grid gap-3">
              <Input
                value={values.focus.title}
                placeholder="Title"
                onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, title: event.target.value } }))}
              />
              <Input
                value={values.focus.category}
                placeholder="Category"
                onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, category: event.target.value } }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={values.focus.startTime}
                  type="time"
                  onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, startTime: event.target.value } }))}
                />
                <Input
                  value={values.focus.endTime}
                  type="time"
                  onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, endTime: event.target.value } }))}
                />
              </div>
              <Input
                value={values.focus.priority}
                placeholder="Priority"
                onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, priority: event.target.value as any } }))}
              />
              <Input
                value={values.focus.status}
                placeholder="Status"
                onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, status: event.target.value as any } }))}
              />
              <textarea
                className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Notes"
                value={values.focus.notes}
                onChange={(event) => setValues((current) => ({ ...current, focus: { ...current.focus, notes: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Interview">
            <div className="grid gap-3">
              <Input
                value={values.interview.title}
                placeholder="Topic or Question"
                onChange={(event) => setValues((current) => ({ ...current, interview: { ...current.interview, title: event.target.value } }))}
              />
              <select
                value={values.interview.type}
                onChange={(event) => setValues((current) => ({ ...current, interview: { ...current.interview, type: event.target.value as "note" | "file" } }))}
                className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="note">Note</option>
                <option value="file">Resource</option>
              </select>
              <textarea
                className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Answer or Notes"
                value={values.interview.content}
                onChange={(event) => setValues((current) => ({ ...current, interview: { ...current.interview, content: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Vault">
            <div className="grid gap-3">
              <Input
                value={values.vault.title}
                placeholder="Title"
                onChange={(event) => setValues((current) => ({ ...current, vault: { ...current.vault, title: event.target.value } }))}
              />
              <select
                value={values.vault.type}
                onChange={(event) => setValues((current) => ({ ...current, vault: { ...current.vault, type: event.target.value as "note" | "file" } }))}
                className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="note">Note</option>
                <option value="file">File</option>
              </select>
              <textarea
                className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Content"
                value={values.vault.content}
                onChange={(event) => setValues((current) => ({ ...current, vault: { ...current.vault, content: event.target.value } }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="Project">
            <div className="grid gap-3">
              <Input
                value={values.project.title}
                placeholder="Project Title"
                onChange={(event) => setValues((current) => ({ ...current, project: { ...current.project, title: event.target.value } }))}
              />
              <textarea
                className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Description"
                value={values.project.description}
                onChange={(event) => setValues((current) => ({ ...current, project: { ...current.project, description: event.target.value } }))}
              />
              <select
                value={values.project.status}
                onChange={(event) => setValues((current) => ({ ...current, project: { ...current.project, status: event.target.value } }))}
                className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={handleSave} type="button">
            Add {activeTab}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
