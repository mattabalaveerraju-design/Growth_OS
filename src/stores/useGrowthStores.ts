import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Priority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Todo" | "In Progress" | "Done" | "Blocked" | "Review";
export type FocusStatus = "Planned" | "In Progress" | "Completed";
export type ApplicationStatus = "Wishlist" | "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  notes?: string;
}

export interface LearningItem {
  id: string;
  topic: string;
  category: string;
  source: string;
  timeHours: number;
  notes?: string;
  confidence: number;
  date: string;
}

export interface ApplicationItem {
  id: string;
  company: string;
  position: string;
  country: string;
  salary: string;
  appliedDate: string;
  status: ApplicationStatus;
  interviewStage: string;
  portfolioSent: boolean;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date
  time?: string; // HH:MM
  category?: string;
  notes?: string;
}

export interface VaultItem {
  id: string;
  title: string;
  type: "note" | "file";
  filename?: string;
  url?: string;
  content?: string;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  files?: string[];
  createdAt: string;
}

export interface ReadingEntry {
  id: string;
  book: string;
  pages: number;
  timeMinutes: number;
  progress: number;
  date: string;
}

export interface ExerciseEntry {
  id: string;
  exercise: string;
  durationMinutes: number;
  calories: number;
  date: string;
}

export interface FocusItem {
  id: string;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  status: FocusStatus;
  priority: Priority;
  notes: string;
  order: number;
}

export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  startDate: string;
  endDate: string;
  type: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  category?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface SettingsItem {
  workHoursStart: string;
  workHoursEnd: string;
  weeklyGoalHours: number;
  weeklyGoalFocus: string;
  theme: "Light" | "Dark" | "System";
  language: string;
  timeZone: string;
  defaultTaskView: string;
  focusMode: boolean;
  pomodoroTimer: boolean;
  breakReminders: boolean;
  dailyReview: boolean;
  weeklyRecap: boolean;
  autoSchedule: boolean;
}

type StorageApi = ReturnType<typeof createJSONStorage>;
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};
const storage: StorageApi | typeof noopStorage =
  typeof window === "undefined" ? (noopStorage as any) : createJSONStorage(() => localStorage);

const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

interface TaskState {
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, "id">) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
}

interface LearningState {
  learning: LearningItem[];
  addLearning: (item: Omit<LearningItem, "id">) => void;
  updateLearning: (id: string, updates: Partial<LearningItem>) => void;
  deleteLearning: (id: string) => void;
}

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (e: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

interface VaultState {
  vault: VaultItem[];
  addVaultItem: (item: Omit<VaultItem, "id" | "createdAt">) => void;
  updateVaultItem: (id: string, updates: Partial<VaultItem>) => void;
  deleteVaultItem: (id: string) => void;
}

interface InterviewState {
  interviewNotes: VaultItem[];
  addInterviewNote: (item: Omit<VaultItem, "id" | "createdAt">) => void;
  updateInterviewNote: (id: string, updates: Partial<VaultItem>) => void;
  deleteInterviewNote: (id: string) => void;
}

interface ProjectsState {
  projects: ProjectItem[];
  addProject: (p: Omit<ProjectItem, "id" | "createdAt">) => void;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
}

interface ApplicationState {
  applications: ApplicationItem[];
  addApplication: (item: Omit<ApplicationItem, "id">) => void;
  updateApplication: (id: string, updates: Partial<ApplicationItem>) => void;
  deleteApplication: (id: string) => void;
}

interface ReadingState {
  reading: ReadingEntry[];
  addReading: (entry: Omit<ReadingEntry, "id">) => void;
  deleteReading: (id: string) => void;
}

interface ExerciseState {
  exercise: ExerciseEntry[];
  addExercise: (entry: Omit<ExerciseEntry, "id">) => void;
  deleteExercise: (id: string) => void;
}

interface FocusState {
  focusItems: FocusItem[];
  addFocusItem: (item: Omit<FocusItem, "id" | "order">) => void;
  updateFocusItem: (id: string, updates: Partial<FocusItem>) => void;
  deleteFocusItem: (id: string) => void;
  reorderFocusItem: (fromIndex: number, toIndex: number) => void;
  toggleFocusComplete: (id: string) => void;
}

interface GoalState {
  goals: GoalItem[];
  addGoal: (item: Omit<GoalItem, "id" | "createdAt">) => void;
  updateGoal: (id: string, updates: Partial<GoalItem>) => void;
  deleteGoal: (id: string) => void;
}

interface SettingsState {
  settings: SettingsItem;
  updateSettings: (updates: Partial<SettingsItem>) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      // daily checklist mode
      // stored separately so dashboard can display and it can reset each day
      // We'll add functions to manage and auto-reset based on date
      // (kept lightweight here)
      // Note: not part of TaskState type above to avoid TS noise in callers that use TaskState only.
      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, { id: createId(), ...task }] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
    }),
    { name: "growthos_tasks", storage },
  ),
);

// Daily checklist store separate from tasks for clarity
interface DailyChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface DailyChecklistState {
  items: DailyChecklistItem[];
  lastResetDate: string;
  addItem: (title: string) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  resetIfNeeded: () => void;
}

export const useDailyChecklistStore = create<DailyChecklistState>()(
  persist(
    (set, get) => ({
      items: [] as DailyChecklistItem[],
      lastResetDate: new Date(0).toISOString(),
      addItem: (title: string) =>
        set((s) => ({ items: [...s.items, { id: createId(), title, completed: false }] })),
      toggleItem: (id: string) =>
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it)) })),
      deleteItem: (id: string) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      resetIfNeeded: () => {
        const today = new Date().toISOString().slice(0, 10);
        const state = get();
        if (!state.lastResetDate || state.lastResetDate.slice(0, 10) !== today) {
          set({ items: state.items.map((it) => ({ ...it, completed: false })), lastResetDate: new Date().toISOString() });
        }
      },
    }),
    { name: "growthos_daily_checklist", storage },
  ),
);

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      learning: [],
      addLearning: (item) => set((state) => ({ learning: [...state.learning, { id: createId(), ...item }] })),
      updateLearning: (id, updates) =>
        set((state) => ({ learning: state.learning.map((item) => (item.id === id ? { ...item, ...updates } : item)) })),
      deleteLearning: (id) => set((state) => ({ learning: state.learning.filter((item) => item.id !== id) })),
    }),
    { name: "growthos_learning", storage },
  ),
);

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (e) => set((s) => ({ events: [...s.events, { id: createId(), ...e }] })),
      updateEvent: (id, updates) => set((s) => ({ events: s.events.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev)) })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((ev) => ev.id !== id) })),
    }),
    { name: "growthos_calendar", storage },
  ),
);

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      vault: [],
      addVaultItem: (item) =>
        set((s) => ({ vault: [...s.vault, { id: createId(), createdAt: new Date().toISOString(), ...item }] })),
      updateVaultItem: (id, updates) => set((s) => ({ vault: s.vault.map((v) => (v.id === id ? { ...v, ...updates } : v)) })),
      deleteVaultItem: (id) => set((s) => ({ vault: s.vault.filter((v) => v.id !== id) })),
    }),
    { name: "growthos_vault", storage },
  ),
);

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      interviewNotes: [],
      addInterviewNote: (item) =>
        set((s) => ({ interviewNotes: [...s.interviewNotes, { id: createId(), createdAt: new Date().toISOString(), ...item }] })),
      updateInterviewNote: (id, updates) => set((s) => ({ interviewNotes: s.interviewNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)) })),
      deleteInterviewNote: (id) => set((s) => ({ interviewNotes: s.interviewNotes.filter((n) => n.id !== id) })),
    }),
    { name: "growthos_interview", storage },
  ),
);

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (p) => set((s) => ({ projects: [...s.projects, { id: createId(), createdAt: new Date().toISOString(), ...p }] })),
      updateProject: (id, updates) => set((s) => ({ projects: s.projects.map((pr) => (pr.id === id ? { ...pr, ...updates } : pr)) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((pr) => pr.id !== id) })),
    }),
    { name: "growthos_projects", storage },
  ),
);

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      applications: [],
      addApplication: (item) =>
        set((state) => ({ applications: [...state.applications, { id: createId(), ...item }] })),
      updateApplication: (id, updates) =>
        set((state) => ({ applications: state.applications.map((item) => (item.id === id ? { ...item, ...updates } : item)) })),
      deleteApplication: (id) =>
        set((state) => ({ applications: state.applications.filter((item) => item.id !== id) })),
    }),
    { name: "growthos_applications", storage },
  ),
);

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      reading: [],
      addReading: (entry) => set((state) => ({ reading: [...state.reading, { id: createId(), ...entry }] })),
      deleteReading: (id) => set((state) => ({ reading: state.reading.filter((entry) => entry.id !== id) })),
    }),
    { name: "growthos_reading", storage },
  ),
);

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set) => ({
      exercise: [],
      addExercise: (entry) => set((state) => ({ exercise: [...state.exercise, { id: createId(), ...entry }] })),
      deleteExercise: (id) => set((state) => ({ exercise: state.exercise.filter((entry) => entry.id !== id) })),
    }),
    { name: "growthos_exercise", storage },
  ),
);

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      focusItems: [],
      addFocusItem: (item) =>
        set((state) => ({
          focusItems: [
            ...state.focusItems,
            { id: createId(), order: state.focusItems.length, ...item },
          ],
        })),
      updateFocusItem: (id, updates) =>
        set((state) => ({
          focusItems: state.focusItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),
      deleteFocusItem: (id) =>
        set((state) => ({
          focusItems: state.focusItems
            .filter((item) => item.id !== id)
            .map((item, index) => ({ ...item, order: index })),
        })),
      reorderFocusItem: (fromIndex, toIndex) =>
        set((state) => {
          const items = [...state.focusItems].sort((a, b) => a.order - b.order);
          const [moved] = items.splice(fromIndex, 1);
          if (!moved) return { focusItems: state.focusItems };
          items.splice(toIndex, 0, moved);
          return { focusItems: items.map((item, index) => ({ ...item, order: index })) };
        }),
      toggleFocusComplete: (id) =>
        set((state) => ({
          focusItems: state.focusItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === "Completed" ? "Planned" : "Completed",
                }
              : item,
          ),
        })),
    }),
    { name: "growthos_focus", storage },
  ),
);

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (item) =>
        set((state) => ({
          goals: [...state.goals, { id: createId(), createdAt: new Date().toISOString(), ...item }],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({ goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)) })),
      deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),
    }),
    { name: "growthos_goals", storage },
  ),
);

const defaultSettings: SettingsItem = {
  workHoursStart: "09:00",
  workHoursEnd: "18:00",
  weeklyGoalHours: 40,
  weeklyGoalFocus: "Work & Learning",
  theme: "System",
  language: "English",
  timeZone: "GMT+00:00",
  defaultTaskView: "List View",
  focusMode: false,
  pomodoroTimer: true,
  breakReminders: false,
  dailyReview: true,
  weeklyRecap: true,
  autoSchedule: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
    }),
    { name: "growthos_settings", storage },
  ),
);
