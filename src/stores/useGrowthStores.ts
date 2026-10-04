import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSupabaseClient } from "../lib/supabase";


type Priority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Todo" | "In Progress" | "Done" | "Blocked" | "Review";
export type FocusStatus = "Planned" | "In Progress" | "Completed";
export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  notes?: string;
  checklist?: ChecklistItem[];
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
  favorite?: boolean;
  lastOpenedAt?: string;
  currentPage?: number;
  progressPercentage?: number;
  recentlyViewed?: boolean;
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
  favorite?: boolean;
  lastOpenedAt?: string;
  currentPage?: number;
  progressPercentage?: number;
  recentlyViewed?: boolean;
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

export type FreelanceStatus =
  | "Lead"
  | "Contacted"
  | "Proposal Sent"
  | "Active"
  | "Waiting"
  | "Completed"
  | "Paid"
  | "Lost";

export interface FreelanceItem {
  id: string;
  client: string;
  project: string;
  description?: string;
  category?: string;
  status: FreelanceStatus;
  startDate?: string;
  deadline?: string;
  amount?: number;
  paymentStatus?: "Pending" | "Paid" | "Not applicable";
  nextAction?: string;
  notes?: string;
  hoursWorked?: number;
}

export interface FocusItem {
  id: string;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  status: FocusStatus;
  priority: Priority;
  description: string;
  order: number;
  checklist?: ChecklistItem[];
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
  typeof window === "undefined"
    ? (noopStorage as typeof noopStorage)
    : createJSONStorage(() => localStorage);

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

interface SupabaseTaskRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  notes: string | null;
  checklist: ChecklistItem[] | null;
}

function taskFromSupabase(row: SupabaseTaskRow): TaskItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date ?? "",
    notes: row.notes ?? undefined,
    checklist: row.checklist ?? [],
  };
}

function taskToSupabase(task: TaskItem, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    category: task.category,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate,
    notes: task.notes ?? null,
    checklist: task.checklist ?? [],
  };
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
  exerciseProgress: Record<string, ChecklistItem[]>;
  exerciseWorkouts: Record<string, string>;
  addExercise: (entry: Omit<ExerciseEntry, "id">) => Promise<boolean>;
  updateExercise: (id: string, updates: Partial<ExerciseEntry>) => Promise<boolean>;
  deleteExercise: (id: string) => Promise<boolean>;
  saveExerciseDay: (
    dateKey: string,
    workout: string,
    checklist: ChecklistItem[],
  ) => Promise<boolean>;
  setExerciseProgress: (dateKey: string, checklist: ChecklistItem[]) => Promise<boolean>;
  setExerciseWorkout: (dateKey: string, workout: string) => Promise<boolean>;
  toggleExerciseProgress: (dateKey: string, itemId: string) => Promise<boolean>;
}

interface FreelanceState {
  freelance: FreelanceItem[];
  addFreelance: (item: Omit<FreelanceItem, "id">) => void;
  updateFreelance: (id: string, updates: Partial<FreelanceItem>) => void;
  deleteFreelance: (id: string) => void;
}

interface FocusState {
  focusItems: FocusItem[];
  addFocusItem: (item: Omit<FocusItem, "id" | "order">) => Promise<boolean>;
  updateFocusItem: (id: string, updates: Partial<FocusItem>) => Promise<boolean>;
  deleteFocusItem: (id: string) => Promise<boolean>;
  reorderFocusItem: (fromIndex: number, toIndex: number) => Promise<boolean>;
  toggleFocusComplete: (id: string) => Promise<boolean>;
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
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        const newTask: TaskItem = {
          id: createId(),
          ...task,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        void (async () => {
          const supabase = getSupabaseClient();
          if (!supabase) return;

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { error } = await supabase.from("tasks").insert({
            id: newTask.id,
            user_id: user.id,
            title: newTask.title,
            category: newTask.category,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.dueDate,
            notes: newTask.notes ?? null,
            checklist: newTask.checklist ?? [],
          });

          if (error) {
            console.error("Failed to save task to Supabase:", error);
          }
        })();
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          ),
        }));

        void (async () => {
          const supabase = getSupabaseClient();
          if (!supabase) return;

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const currentTask = get().tasks.find((task) => task.id === id);
          if (!currentTask) return;

          const { error } = await supabase
            .from("tasks")
            .update({
              title: currentTask.title,
              category: currentTask.category,
              priority: currentTask.priority,
              status: currentTask.status,
              due_date: currentTask.dueDate,
              notes: currentTask.notes ?? null,
              checklist: currentTask.checklist ?? [],
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", user.id);

          if (error) {
            console.error("Failed to update task in Supabase:", error);
          }
        })();
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        void (async () => {
          const supabase = getSupabaseClient();
          if (!supabase) return;

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

          if (error) {
            console.error("Failed to delete task from Supabase:", error);
          }
        })();
      },
    }),
    { name: "growthos_tasks", storage },
  ),
);

let taskHydrationComplete = false;
let taskHydrationPromise: Promise<void> | null = null;
let taskRefreshPromise: Promise<void> | null = null;
let lastTaskFetchAt = 0;

export function hydrateTasksFromSupabase(): Promise<void> {
  if (taskHydrationComplete) return Promise.resolve();
  if (taskHydrationPromise) return taskHydrationPromise;

  const supabase = getSupabaseClient();
  if (!supabase) return Promise.resolve();

  taskHydrationPromise = (async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Failed to restore the Tasks auth session:", sessionError);
        return;
      }
      if (!sessionData.session) return;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Failed to get the authenticated user for Tasks:", userError);
        return;
      }

      if (!user) return;

      const { data: cloudTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (fetchError) {
        console.error("Failed to load Tasks from Supabase:", fetchError);
        return;
      }

      if (cloudTasks.length > 0) {
        useTaskStore.setState({
          tasks: cloudTasks.map((task) => taskFromSupabase(task as SupabaseTaskRow)),
        });
        lastTaskFetchAt = Date.now();
        taskHydrationComplete = true;
        return;
      }

      const localTasks = useTaskStore.getState().tasks;
      if (localTasks.length === 0) {
        useTaskStore.setState({ tasks: [] });
        lastTaskFetchAt = Date.now();
        taskHydrationComplete = true;
        return;
      }

      const { error: migrationError } = await supabase
        .from("tasks")
        .upsert(localTasks.map((task) => taskToSupabase(task, user.id)), {
          onConflict: "id",
        });

      if (migrationError) {
        console.error("Failed to migrate local Tasks to Supabase:", migrationError);
        return;
      }

      const { data: migratedTasks, error: reloadError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (reloadError) {
        console.error("Failed to reload migrated Tasks from Supabase:", reloadError);
        return;
      }

      if (migratedTasks.length > 0) {
        useTaskStore.setState({
          tasks: migratedTasks.map((task) => taskFromSupabase(task as SupabaseTaskRow)),
        });
      }

      lastTaskFetchAt = Date.now();
      taskHydrationComplete = true;
    } catch (error) {
      console.error("Failed to hydrate Tasks from Supabase:", error);
    } finally {
      taskHydrationPromise = null;
    }
  })();

  return taskHydrationPromise;
}

export function refreshTasksFromSupabase(
  { force = false }: { force?: boolean } = {},
): Promise<void> {
  if (!force && taskHydrationPromise) {
    return taskHydrationPromise.then(() => {
      if (Date.now() - lastTaskFetchAt < 10_000) return;
      return refreshTasksFromSupabase({ force: true });
    });
  }

  if (!force && Date.now() - lastTaskFetchAt < 10_000) {
    return Promise.resolve();
  }

  if (taskRefreshPromise) return taskRefreshPromise;

  taskRefreshPromise = (async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Failed to restore the Tasks auth session:", sessionError);
      return;
    }
    if (!sessionData.session) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Failed to get the authenticated user for Tasks:", userError);
      return;
    }
    if (!user) return;

    const { data: cloudTasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to refresh Tasks from Supabase:", error);
      return;
    }

    useTaskStore.setState({
      tasks: (cloudTasks ?? []).map((task) => taskFromSupabase(task as SupabaseTaskRow)),
    });
    lastTaskFetchAt = Date.now();
  })().finally(() => {
    taskRefreshPromise = null;
  });

  return taskRefreshPromise;
}

if (typeof window !== "undefined") {
  if (useTaskStore.persist.hasHydrated()) {
    void hydrateTasksFromSupabase();
  } else {
    useTaskStore.persist.onFinishHydration(() => {
      void hydrateTasksFromSupabase();
    });
  }
}

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
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it)),
        })),
      deleteItem: (id: string) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      resetIfNeeded: () => {
        const today = new Date().toISOString().slice(0, 10);
        const state = get();
        if (!state.lastResetDate || state.lastResetDate.slice(0, 10) !== today) {
          set({
            items: state.items.map((it) => ({ ...it, completed: false })),
            lastResetDate: new Date().toISOString(),
          });
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
      addLearning: (item) =>
        set((state) => ({ learning: [...state.learning, { id: createId(), ...item }] })),
      updateLearning: (id, updates) =>
        set((state) => ({
          learning: state.learning.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),
      deleteLearning: (id) =>
        set((state) => ({ learning: state.learning.filter((item) => item.id !== id) })),
    }),
    { name: "growthos_learning", storage },
  ),
);

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (e) => set((s) => ({ events: [...s.events, { id: createId(), ...e }] })),
      updateEvent: (id, updates) =>
        set((s) => ({ events: s.events.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev)) })),
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
        set((s) => ({
          vault: [...s.vault, { id: createId(), createdAt: new Date().toISOString(), ...item }],
        })),
      updateVaultItem: (id, updates) =>
        set((s) => ({ vault: s.vault.map((v) => (v.id === id ? { ...v, ...updates } : v)) })),
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
        set((s) => ({
          interviewNotes: [
            ...s.interviewNotes,
            { id: createId(), createdAt: new Date().toISOString(), ...item },
          ],
        })),
      updateInterviewNote: (id, updates) =>
        set((s) => ({
          interviewNotes: s.interviewNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
      deleteInterviewNote: (id) =>
        set((s) => ({ interviewNotes: s.interviewNotes.filter((n) => n.id !== id) })),
    }),
    { name: "growthos_interview", storage },
  ),
);

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (p) =>
        set((s) => ({
          projects: [...s.projects, { id: createId(), createdAt: new Date().toISOString(), ...p }],
        })),
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((pr) => (pr.id === id ? { ...pr, ...updates } : pr)),
        })),
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
        set((state) => ({
          applications: state.applications.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
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
      addReading: (entry) =>
        set((state) => ({ reading: [...state.reading, { id: createId(), ...entry }] })),
      deleteReading: (id) =>
        set((state) => ({ reading: state.reading.filter((entry) => entry.id !== id) })),
    }),
    { name: "growthos_reading", storage },
  ),
);

interface ExerciseEntryRow {
  id: string;
  user_id: string;
  exercise: string;
  duration_minutes: number;
  calories: number;
  date: string;
}

interface ExerciseDayRow {
  id: string;
  user_id: string;
  date: string;
  workout_name: string;
  checklist: ChecklistItem[] | null;
}

type ExerciseSupabaseClient = NonNullable<ReturnType<typeof getSupabaseClient>>;

let exerciseWriteQueue: Promise<void> = Promise.resolve();
let exerciseHydrationPromise: Promise<void> | null = null;
let exerciseHydratedUserId: string | null = null;

function queueExerciseWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = exerciseWriteQueue.then(operation, operation);
  exerciseWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function exerciseEntryToRow(entry: ExerciseEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    exercise: entry.exercise,
    duration_minutes: entry.durationMinutes,
    calories: entry.calories,
    date: entry.date,
    updated_at: new Date().toISOString(),
  };
}

function exerciseEntryFromRow(row: ExerciseEntryRow): ExerciseEntry {
  return {
    id: row.id,
    exercise: row.exercise,
    durationMinutes: row.duration_minutes,
    calories: row.calories,
    date: row.date,
  };
}

async function stableExerciseDayId(userId: string, dateKey: string) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error("Secure UUID generation is unavailable in this browser.");
  }

  const digest = new Uint8Array(
    await cryptoApi.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`growthos-exercise-day:${userId}:${dateKey}`),
    ),
  );
  const bytes = digest.slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function getExerciseAuthContext() {
  const client = getSupabaseClient();
  if (!client) return { client: null, userId: null };

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user) {
      if (error) console.error("Failed to get the authenticated user for Exercise:", error);
      return { client, userId: null };
    }
    return { client, userId: user.id };
  } catch (error) {
    console.error("Failed to get the authenticated user for Exercise:", error);
    return { client, userId: null };
  }
}

async function upsertExerciseEntries(
  client: ExerciseSupabaseClient,
  userId: string,
  entries: ExerciseEntry[],
) {
  if (!entries.length) return true;
  try {
    const { error } = await client
      .from("exercise_entries")
      .upsert(entries.map((entry) => exerciseEntryToRow(entry, userId)), { onConflict: "id" });
    if (error) {
      console.error("Failed to save Exercise entries:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to save Exercise entries:", error);
    return false;
  }
}

async function upsertExerciseDay(
  client: ExerciseSupabaseClient,
  userId: string,
  dateKey: string,
  workout: string,
  checklist: ChecklistItem[],
) {
  try {
    const { data: existing, error: lookupError } = await client
      .from("exercise_days")
      .select("id")
      .eq("user_id", userId)
      .eq("date", dateKey)
      .maybeSingle();

    if (lookupError) {
      console.error("Failed to find Exercise day:", lookupError);
      return false;
    }

    const id = existing?.id ?? (await stableExerciseDayId(userId, dateKey));
    const { error } = await client.from("exercise_days").upsert(
      {
        id,
        user_id: userId,
        date: dateKey,
        workout_name: workout,
        checklist,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) {
      console.error("Failed to save Exercise day:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to save Exercise day:", error);
    return false;
  }
}

async function fetchExerciseCloudData(client: ExerciseSupabaseClient, userId: string) {
  try {
    const [entriesResult, daysResult] = await Promise.all([
      client.from("exercise_entries").select("*").eq("user_id", userId),
      client.from("exercise_days").select("*").eq("user_id", userId),
    ]);

    if (entriesResult.error || daysResult.error) {
      if (entriesResult.error) console.error("Failed to load Exercise entries:", entriesResult.error);
      if (daysResult.error) console.error("Failed to load Exercise days:", daysResult.error);
      return null;
    }

    return {
      entries: (entriesResult.data ?? []) as ExerciseEntryRow[],
      days: (daysResult.data ?? []) as ExerciseDayRow[],
    };
  } catch (error) {
    console.error("Failed to load Exercise data:", error);
    return null;
  }
}

function exerciseDaysToState(days: ExerciseDayRow[]) {
  const exerciseProgress: Record<string, ChecklistItem[]> = {};
  const exerciseWorkouts: Record<string, string> = {};

  for (const day of days) {
    exerciseProgress[day.date] = day.checklist ?? [];
    exerciseWorkouts[day.date] = day.workout_name;
  }

  return { exerciseProgress, exerciseWorkouts };
}

export function hydrateExerciseFromSupabase({ force = false }: { force?: boolean } = {}): Promise<void> {
  if (exerciseHydrationPromise) return exerciseHydrationPromise;

  exerciseHydrationPromise = queueExerciseWrite(async () => {
    try {
      const { client, userId } = await getExerciseAuthContext();
      if (!client || !userId || (!force && exerciseHydratedUserId === userId)) return;

      const cloudData = await fetchExerciseCloudData(client, userId);
      if (!cloudData) return;

      const localState = useExerciseStore.getState();
      let entries = cloudData.entries;
      let days = cloudData.days;

      if (entries.length === 0 && localState.exercise.length > 0) {
        if (!(await upsertExerciseEntries(client, userId, localState.exercise))) return;
        const { data, error } = await client
          .from("exercise_entries")
          .select("*")
          .eq("user_id", userId);
        if (error || !data?.length) {
          if (error) console.error("Failed to reload migrated Exercise entries:", error);
          return;
        }
        entries = data as ExerciseEntryRow[];
      }

      if (days.length === 0) {
        const dateKeys = Array.from(
          new Set([
            ...Object.keys(localState.exerciseProgress),
            ...Object.keys(localState.exerciseWorkouts),
          ]),
        );

        if (dateKeys.length > 0) {
          const migratedDays = await Promise.all(
            dateKeys.map(async (dateKey) => {
              const id = await stableExerciseDayId(userId, dateKey);
              return {
                id,
                user_id: userId,
                date: dateKey,
                workout_name: localState.exerciseWorkouts[dateKey] ?? "",
                checklist: localState.exerciseProgress[dateKey] ?? [],
                updated_at: new Date().toISOString(),
              };
            }),
          );
          const { error } = await client
            .from("exercise_days")
            .upsert(migratedDays, { onConflict: "id" });
          if (error) {
            console.error("Failed to migrate local Exercise days:", error);
            return;
          }

          const { data, error: reloadError } = await client
            .from("exercise_days")
            .select("*")
            .eq("user_id", userId);
          if (reloadError || !data?.length) {
            if (reloadError) console.error("Failed to reload migrated Exercise days:", reloadError);
            return;
          }
          days = data as ExerciseDayRow[];
        }
      }

      const dayState = exerciseDaysToState(days);
      useExerciseStore.setState({
        exercise: entries.map(exerciseEntryFromRow),
        ...dayState,
      });
      exerciseHydratedUserId = userId;
    } catch (error) {
      console.error("Failed to hydrate Exercise from Supabase:", error);
    }
  }).finally(() => {
    exerciseHydrationPromise = null;
  });

  return exerciseHydrationPromise;
}

export function refreshExerciseFromSupabase(): Promise<void> {
  return queueExerciseWrite(async () => {
    try {
      const { client, userId } = await getExerciseAuthContext();
      if (!client) {
        await useExerciseStore.persist.rehydrate();
        return;
      }
      if (!userId) return;

      const cloudData = await fetchExerciseCloudData(client, userId);
      if (!cloudData) return;

      const dayState = exerciseDaysToState(cloudData.days);
      useExerciseStore.setState({
        exercise: cloudData.entries.map(exerciseEntryFromRow),
        ...dayState,
      });
      exerciseHydratedUserId = userId;
    } catch (error) {
      console.error("Failed to refresh Exercise from Supabase:", error);
    }
  });
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercise: [],
      exerciseProgress: {},
      exerciseWorkouts: {},
      addExercise: (input) =>
        queueExerciseWrite(async () => {
          const entry: ExerciseEntry = { id: createId(), ...input };
          const { client, userId } = await getExerciseAuthContext();
          if (client && (!userId || !(await upsertExerciseEntries(client, userId, [entry])))) {
            return false;
          }
          set((state) => ({ exercise: [...state.exercise, entry] }));
          return true;
        }),
      updateExercise: (id, updates) =>
        queueExerciseWrite(async () => {
          const current = get().exercise.find((entry) => entry.id === id);
          if (!current) return false;
          const updated = { ...current, ...updates, id };
          const { client, userId } = await getExerciseAuthContext();
          if (client) {
            if (!userId) return false;
            const { error, data } = await client
              .from("exercise_entries")
              .update({
                exercise: updated.exercise,
                duration_minutes: updated.durationMinutes,
                calories: updated.calories,
                date: updated.date,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .eq("user_id", userId)
              .select("id")
              .maybeSingle();
            if (error || !data) {
              if (error) console.error("Failed to update Exercise entry:", error);
              return false;
            }
          }
          set((state) => ({
            exercise: state.exercise.map((entry) => (entry.id === id ? updated : entry)),
          }));
          return true;
        }),
      deleteExercise: (id) =>
        queueExerciseWrite(async () => {
          const { client, userId } = await getExerciseAuthContext();
          if (client) {
            if (!userId) return false;
            const { error } = await client
              .from("exercise_entries")
              .delete()
              .eq("id", id)
              .eq("user_id", userId);
            if (error) {
              console.error("Failed to delete Exercise entry:", error);
              return false;
            }
          }
          set((state) => ({ exercise: state.exercise.filter((entry) => entry.id !== id) }));
          return true;
        }),
      saveExerciseDay: (dateKey, workout, checklist) =>
        queueExerciseWrite(async () => {
          const { client, userId } = await getExerciseAuthContext();
          if (client && (!userId || !(await upsertExerciseDay(client, userId, dateKey, workout, checklist)))) {
            return false;
          }
          set((state) => ({
            exerciseWorkouts: { ...state.exerciseWorkouts, [dateKey]: workout },
            exerciseProgress: { ...state.exerciseProgress, [dateKey]: checklist },
          }));
          return true;
        }),
      setExerciseProgress: (dateKey, checklist) =>
        get().saveExerciseDay(dateKey, get().exerciseWorkouts[dateKey] ?? "", checklist),
      setExerciseWorkout: (dateKey, workout) =>
        get().saveExerciseDay(dateKey, workout, get().exerciseProgress[dateKey] ?? []),
      toggleExerciseProgress: (dateKey, itemId) =>
        queueExerciseWrite(async () => {
          const state = get();
          const checklist = (state.exerciseProgress[dateKey] ?? []).map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          );
          const workout = state.exerciseWorkouts[dateKey] ?? "";
          const { client, userId } = await getExerciseAuthContext();
          if (client && (!userId || !(await upsertExerciseDay(client, userId, dateKey, workout, checklist)))) {
            return false;
          }
          set((current) => ({
            exerciseProgress: { ...current.exerciseProgress, [dateKey]: checklist },
            exerciseWorkouts: { ...current.exerciseWorkouts, [dateKey]: workout },
          }));
          return true;
        }),
    }),
    { name: "growthos_exercise", storage },
  ),
);

export const useFreelanceStore = create<FreelanceState>()(
  persist(
    (set) => ({
      freelance: [],
      addFreelance: (item) =>
        set((state) => ({ freelance: [...state.freelance, { id: createId(), ...item }] })),
      updateFreelance: (id, updates) =>
        set((state) => ({
          freelance: state.freelance.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
      deleteFreelance: (id) =>
        set((state) => ({ freelance: state.freelance.filter((item) => item.id !== id) })),
    }),
    { name: "growthos_freelance", storage },
  ),
);

interface FocusRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  start_time: string;
  end_time: string;
  status: FocusStatus;
  priority: Priority;
  description: string;
  order: number;
  checklist: ChecklistItem[] | null;
}

function focusFromSupabase(row: FocusRow): FocusItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    priority: row.priority,
    description: row.description,
    order: row.order,
    checklist: row.checklist ?? [],
  };
}

function focusToSupabase(item: FocusItem, userId: string) {
  return {
    id: item.id,
    user_id: userId,
    title: item.title,
    category: item.category,
    start_time: item.startTime,
    end_time: item.endTime,
    status: item.status,
    priority: item.priority,
    description: item.description,
    order: item.order,
    checklist: item.checklist ?? [],
    updated_at: new Date().toISOString(),
  };
}

let focusWriteQueue: Promise<void> = Promise.resolve();
let focusHydrationPromise: Promise<void> | null = null;
let focusHydratedUserId: string | null = null;

function queueFocusWrite<T>(operation: () => Promise<T>) {
  const result = focusWriteQueue.then(operation, operation);
  focusWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function saveFocusRows(items: FocusItem[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Unable to save Focus without an authenticated user:", authError);
      return false;
    }

    const { error } = await supabase
      .from("focus_items")
      .upsert(items.map((item) => focusToSupabase(item, user.id)), { onConflict: "id" });
    if (error) {
      console.error("Failed to save Focus to Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to save Focus to Supabase:", error);
    return false;
  }
}

async function updateFocusRows(items: FocusItem[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return false;

    for (const item of items) {
      const { error, data } = await supabase
        .from("focus_items")
        .update({
          title: item.title,
          category: item.category,
          start_time: item.startTime,
          end_time: item.endTime,
          status: item.status,
          priority: item.priority,
          description: item.description,
          order: item.order,
          checklist: item.checklist ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        if (error) console.error("Failed to update Focus in Supabase:", error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Failed to update Focus in Supabase:", error);
    return false;
  }
}

async function fetchFocusRows(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("focus_items")
    .select("*")
    .eq("user_id", userId)
    .order("order", { ascending: true });

  if (error) {
    console.error("Failed to load Focus from Supabase:", error);
    return null;
  }
  return (data ?? []) as FocusRow[];
}

export function hydrateFocusFromSupabase(): Promise<void> {
  if (focusHydrationPromise) return focusHydrationPromise;

  focusHydrationPromise = queueFocusWrite(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        if (authError) console.error("Failed to get the authenticated user for Focus:", authError);
        return;
      }
      if (focusHydratedUserId === user.id) return;

      const cloudItems = await fetchFocusRows(user.id);
      if (cloudItems === null) return;

      if (cloudItems.length > 0) {
        useFocusStore.setState({ focusItems: cloudItems.map(focusFromSupabase) });
        focusHydratedUserId = user.id;
        return;
      }

      const localItems = useFocusStore.getState().focusItems;
      if (localItems.length === 0) {
        useFocusStore.setState({ focusItems: [] });
        focusHydratedUserId = user.id;
        return;
      }

      const { error: migrationError } = await supabase
        .from("focus_items")
        .upsert(localItems.map((item) => focusToSupabase(item, user.id)), {
          onConflict: "id",
        });
      if (migrationError) {
        console.error("Failed to migrate local Focus items:", migrationError);
        return;
      }

      const migratedItems = await fetchFocusRows(user.id);
      if (migratedItems === null || migratedItems.length === 0) return;

      useFocusStore.setState({ focusItems: migratedItems.map(focusFromSupabase) });
      focusHydratedUserId = user.id;
    } catch (error) {
      console.error("Failed to hydrate Focus from Supabase:", error);
    }
  }).finally(() => {
    focusHydrationPromise = null;
  });

  return focusHydrationPromise;
}

export function refreshFocusFromSupabase(): Promise<void> {
  return queueFocusWrite(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        if (authError) console.error("Failed to get the authenticated user for Focus:", authError);
        return;
      }

      const cloudItems = await fetchFocusRows(user.id);
      if (cloudItems === null) return;
      useFocusStore.setState({ focusItems: cloudItems.map(focusFromSupabase) });
      focusHydratedUserId = user.id;
    } catch (error) {
      console.error("Failed to refresh Focus from Supabase:", error);
    }
  });
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      focusItems: [],
      addFocusItem: (input) =>
        queueFocusWrite(async () => {
          const item: FocusItem = {
            id: createId(),
            order: get().focusItems.length,
            ...input,
          };
          if (!(await saveFocusRows([item]))) return false;
          set((state) => ({ focusItems: [...state.focusItems, item] }));
          return true;
        }),
      updateFocusItem: (id, updates) =>
        queueFocusWrite(async () => {
          const current = get().focusItems.find((item) => item.id === id);
          if (!current) return false;
          const updated = { ...current, ...updates };
          if (!(await updateFocusRows([updated]))) return false;
          set((state) => ({
            focusItems: state.focusItems.map((item) => (item.id === id ? updated : item)),
          }));
          return true;
        }),
      deleteFocusItem: (id) =>
        queueFocusWrite(async () => {
          const existing = get().focusItems;
          if (!existing.some((item) => item.id === id)) return false;

          const supabase = getSupabaseClient();
          if (supabase) {
            try {
              const {
                data: { user },
                error: authError,
              } = await supabase.auth.getUser();
              if (authError || !user) return false;

              const { error } = await supabase
                .from("focus_items")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);
              if (error) {
                console.error("Failed to delete Focus item from Supabase:", error);
                return false;
              }
            } catch (error) {
              console.error("Failed to delete Focus item from Supabase:", error);
              return false;
            }
          }

          const nextItems = existing
            .filter((item) => item.id !== id)
            .map((item, index) => ({ ...item, order: index }));
          if (supabase && nextItems.length > 0 && !(await updateFocusRows(nextItems))) return false;
          set({ focusItems: nextItems });
          return true;
        }),
      reorderFocusItem: (fromIndex, toIndex) =>
        queueFocusWrite(async () => {
          const items = [...get().focusItems].sort((a, b) => a.order - b.order);
          const [moved] = items.splice(fromIndex, 1);
          if (!moved) return false;
          items.splice(toIndex, 0, moved);
          const nextItems = items.map((item, index) => ({ ...item, order: index }));
          if (!(await updateFocusRows(nextItems))) return false;
          set({ focusItems: nextItems });
          return true;
        }),
      toggleFocusComplete: (id) => {
        const item = get().focusItems.find((entry) => entry.id === id);
        if (!item) return Promise.resolve(false);
        return get().updateFocusItem(id, {
          status: item.status === "Completed" ? "Planned" : "Completed",
        });
      },
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
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)),
        })),
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
