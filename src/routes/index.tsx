"use client";

import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Play,
  Clock,
  ChevronRight,
  Flame,
  Sparkles,
  Zap,
  GraduationCap,
  Target,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Lightbulb,
  TrendingUp,
  Search,
  Bell,
  Briefcase,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HydratedDate } from "@/components/client-only";
import {
  useApplicationStore,
  useExerciseStore,
  useFocusStore,
  useGoalStore,
  useLearningStore,
  useReadingStore,
  useTaskStore,
} from "@/stores/useGrowthStores";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GrowthOS — Your personal operating system" },
      {
        name: "description",
        content: "Continue where you left off. Stay consistent. Grow on purpose.",
      },
      { property: "og:title", content: "GrowthOS — Personal AI productivity OS" },
      {
        property: "og:description",
        content: "A second brain for work, learning, and career growth.",
      },
    ],
  }),
  component: Home,
});

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

function Home() {
  const focusItemsRaw = useFocusStore((state) => state.focusItems);
  const focusItems = [...focusItemsRaw].sort((a, b) => a.order - b.order);
  const tasks = useTaskStore((state) => state.tasks);
  const learning = useLearningStore((state) => state.learning);
  const applications = useApplicationStore((state) => state.applications);
  const reading = useReadingStore((state) => state.reading);
  const exercise = useExerciseStore((state) => state.exercise);
  const goals = useGoalStore((state) => state.goals);

  const totalLearningHours = learning.reduce((sum, item) => sum + item.timeHours, 0);
  const totalReadingHours = reading.reduce((sum, item) => sum + item.timeMinutes / 60, 0);
  const totalExerciseHours = exercise.reduce((sum, item) => sum + item.durationMinutes / 60, 0);
  const workHours = tasks.filter((task) => task.status !== "Done").length * 0.5;
  const totalHours =
    Math.round((totalLearningHours + totalReadingHours + totalExerciseHours + workHours) * 10) / 10;
  const completedFocus = focusItems.filter((item) => item.status === "Completed").length;
  const upcomingTasks = tasks
    .filter((task) => {
      const due = new Date(task.dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const interviewFollowUps = applications
    .filter((app) => app.status === "Interview" || app.status === "Screening")
    .slice(0, 3)
    .map((app) => ({
      title: `Follow up with ${app.company}`,
      meta: `${app.interviewStage || app.status} · ${app.position}`,
      tag: "Applications",
    }));

  return (
    <AppShell title="Command Center">
      <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 pb-8 sm:px-6 lg:px-8">
        <div className="pt-6">
          <DashboardHeader totalHours={totalHours} />
        </div>

        <div className="mt-6">
          <SummaryMetrics focusItems={focusItems} applications={applications} learning={learning} />
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-12 gap-5 items-stretch">
            <main className="col-span-12 lg:col-span-6">
              <CommandTodayFocus />
            </main>

            <aside className="col-span-12 lg:col-span-3">
              <TodaySchedule focusItems={focusItems} />
            </aside>

            <aside className="col-span-12 lg:col-span-3">
              <QuickStats learning={learning} applications={applications} reading={reading} />
            </aside>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-12 gap-5 items-stretch">
            <div className="col-span-12 lg:col-span-4">
              <LearningProgress />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <JobTrackerPreview applications={applications} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <RecentActivity learning={learning} applications={applications} reading={reading} />
            </div>
          </div>
        </div>

        <footer className="pt-8 text-center text-[12px] text-ink-soft/60">GrowthOS · Your second brain</footer>
      </div>
    </AppShell>
  );
}

function WidgetCard({
  title,
  hint,
  icon: Icon,
  className = "",
  children,
}: {
  title: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.45 }}
      className={`group card-soft p-6 h-full transition-colors transition-shadow transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80">
          <Icon className="h-3.5 w-3.5" />
          {title.toUpperCase()}
        </div>
        {hint && <span className="text-[11px] text-ink-soft/70">{hint}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</div>
      <div className="mt-1 font-semibold text-ink">{value}</div>
    </div>
  );
}

function TodayFocus() {
  const focusItemsRaw = useFocusStore((state) => state.focusItems);
  const focusItems = [...focusItemsRaw].sort((a, b) => a.order - b.order);

  if (focusItems.length === 0) {
    return (
      <WidgetCard title="Today's Focus" hint="0 items" icon={CheckCircle2}>
        <div className="rounded-3xl border border-border bg-muted p-6 text-center text-sm text-ink-soft">
          No focus items yet.
          <div className="mt-3 text-[13px] text-ink">
            Add a focus item to keep your day on track.
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Today's Focus"
      hint={`${focusItems.length} item${focusItems.length === 1 ? "" : "s"}`}
      icon={CheckCircle2}
    >
      <div className="space-y-4">
        {focusItems.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink">{item.title}</div>
                <div className="mt-1 text-[12px] text-ink-soft">
                  {item.startTime} — {item.endTime} · {item.category}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  item.status === "Completed"
                    ? "bg-success/15 text-success"
                    : "bg-muted text-ink-soft"
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-ink-soft">
              <span>Priority: {item.priority}</span>
              <span>
                {(item.description ?? (item as any).notes)
                  ? `${(item.description ?? (item as any).notes).slice(0, 30)}${(
                      (item.description ?? (item as any).notes) as string
                    ).length > 30
                    ? "…"
                    : ""}`
                  : "No description"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function ConsistencyRing() {
  const tasks = useTaskStore((state) => state.tasks);
  const focusItems = useFocusStore((state) => state.focusItems);
  const learning = useLearningStore((state) => state.learning);
  const score = Math.min(
    100,
    Math.max(
      20,
      focusItems.filter((item) => item.status === "Completed").length * 8 +
        tasks.filter((task) => task.status === "Done").length * 4 +
        learning.length * 2,
    ),
  );
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;

  return (
    <WidgetCard title="Consistency" hint={`${score}% score`} icon={Flame}>
      <div className="flex items-center gap-5">
        <div className="relative h-[100px] w-[100px] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" strokeWidth="8" className="stroke-muted fill-none" />
            <motion.circle
              cx="50"
              cy="50"
              r="38"
              strokeWidth="8"
              strokeLinecap="round"
              className="fill-none stroke-[var(--cmd-focus-accent)]"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-display text-[24px] font-semibold tracking-tight leading-none">
                {score}
              </div>
              <div className="text-[10px] text-ink-soft mt-0.5">score</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <Stat
            label="Focus completed"
            value={`${focusItems.filter((item) => item.status === "Completed").length}`}
          />
          <Stat
            label="Tasks done"
            value={`${tasks.filter((task) => task.status === "Done").length}`}
          />
          <Stat label="Learning items" value={`${learning.length}`} />
        </div>
      </div>
    </WidgetCard>
  );
}

function DeepWork() {
  const learning = useLearningStore((state) => state.learning);
  const reading = useReadingStore((state) => state.reading);
  const exercise = useExerciseStore((state) => state.exercise);
  const totalHours =
    Math.round(
      (learning.reduce((sum, item) => sum + item.timeHours, 0) +
        reading.reduce((sum, item) => sum + item.timeMinutes / 60, 0) +
        exercise.reduce((sum, item) => sum + item.durationMinutes / 60, 0)) *
        10,
    ) / 10;
  const max = Math.max(4, totalHours, 6);
  const bars = [1.2, 2.4, 0.8, 3.1, 2.7, 1.8, 2.9];

  return (
    <WidgetCard title="Deep Work" hint="this week" icon={Zap}>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[28px] font-semibold tracking-tight">
            {totalHours.toFixed(1)}h
          </span>
          <span className="text-[12px] text-success font-medium">
            {totalHours >= 8 ? "+2.4h vs last week" : "+0.6h vs last week"}
          </span>
        </div>
        <div className="mt-4 flex items-end gap-1.5 h-[64px]">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(h / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-md ${i === 6 ? "bg-primary" : "bg-primary/25"}`}
              />
              <span className="text-[10px] text-ink-soft/70">{"MTWTFSS"[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

function AIDailySummary() {
  const learning = useLearningStore((state) => state.learning);
  const totalLearningHours = learning.reduce((sum, item) => sum + item.timeHours, 0);

  return (
    <WidgetCard
      title="AI Daily Brief"
      hint="updated just now"
      icon={Sparkles}
      className="md:col-span-2"
    >
      <div className="flex gap-4">
        <div className="h-9 w-9 rounded-[10px] bg-[var(--cmd-focus-icon)] grid place-items-center shrink-0 shadow-sm">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="text-[14px] leading-[1.6] text-ink/90">
          {learning.length ? (
            <>
              You have {learning.length} learning entries and {totalLearningHours.toFixed(1)} hours
              logged. Focus on the top priority item to keep momentum.
            </>
          ) : (
            "No learning activity yet. Add a learning entry to see your AI summary."
          )}
        </div>
      </div>
    </WidgetCard>
  );
}

function LearningProgress() {
  const learning = useLearningStore((state) => state.learning);
  const suggested = Math.min(100, Math.max(20, learning.length * 12));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_24px_-20px_rgba(32,36,61,0.2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
          <GraduationCap className="h-3.5 w-3.5" />
          Learning
        </div>
        <div className="text-[11px] text-ink-soft">{learning.length} records</div>
      </div>

      {learning.length ? (
        <div className="mt-5">
          <div className="text-[15px] font-semibold text-ink">{learning[0]?.topic}</div>
          <div className="mt-1 text-[13px] text-ink-soft">
            {learning[0]?.category} · {learning[0]?.timeHours.toFixed(1)}h
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${suggested}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full bg-[var(--cmd-learning-accent)]"
            />
          </div>
          <div className="mt-4 flex items-center gap-3 text-[12px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="h-3 w-3 text-[var(--cmd-learning-accent)]" /> {learning.length} topics tracked
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-white px-5 py-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f6ef] text-[var(--cmd-learning-accent)]">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="text-[15px] font-semibold text-ink">No learning records yet.</div>
          <p className="mt-2 max-w-[240px] text-[13px] leading-5 text-ink-soft">
            Start learning something new and build your skills.
          </p>
          <Link to="/learning" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--cmd-learning-accent)]">
            Go to Learning <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function SmartSuggestions() {
  const exercise = useExerciseStore((state) => state.exercise);
  const focusItems = useFocusStore((state) => state.focusItems);
  const items = [
    {
      text: focusItems.length
        ? "Finish one focus item now to build momentum."
        : "Add a focus item to make today more intentional.",
      tag: "Focus",
    },
    {
      text: exercise.length
        ? "You've logged exercise recently — keep the streak going with a short session."
        : "No workouts yet. Add a workout to improve your energy and consistency.",
      tag: "Health",
    },
  ];

  return (
    <WidgetCard title="Smart Suggestions" icon={Lightbulb}>
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.text} className="flex items-start gap-2.5">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[13px] text-ink leading-snug">{s.text}</div>
              <div className="mt-1 text-[10.5px] font-medium tracking-wide text-ink-soft/70 uppercase">
                {s.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function UpcomingDeadlines() {
  const tasks = useTaskStore((state) => state.tasks);
  const upcoming = tasks
    .filter((task) => {
      const due = new Date(task.dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <WidgetCard title="Upcoming" icon={Clock}>
      <div className="space-y-2.5">
        {upcoming.length ? (
          upcoming.map((d) => (
            <div
              key={d.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2.5 min-w-0 w-full"
            >
              <div className="flex items-center gap-2.5 min-w-0 w-full overflow-x-auto whitespace-nowrap">
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    d.priority === "High" ? "bg-danger" : "bg-ink-soft/30"
                  }`}
                />

                <span className="text-[13px] text-ink truncate min-w-0">{d.title}</span>
              </div>

              <span className="text-[11.5px] text-ink-soft shrink-0 whitespace-nowrap">
                <HydratedDate value={d.dueDate} />
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">
            No deadlines in the next 7 days.
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

function ActiveGoals() {
  const goals = useGoalStore((state) => state.goals);

  return (
    <WidgetCard title="Active Goals" icon={Target}>
      {goals.length ? (
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="rounded-3xl border border-border bg-card p-4">
              <div className="text-[13px] font-semibold text-ink">{goal.title}</div>
              <div className="mt-1 text-[12px] text-ink-soft">
                {goal.category} · {goal.status}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">
          No goals yet. Add one to track your growth.
        </div>
      )}
    </WidgetCard>
  );
}

function WeeklyMomentum() {
  const learning = useLearningStore((state) => state.learning);
  const reading = useReadingStore((state) => state.reading);
  const exercise = useExerciseStore((state) => state.exercise);
  const current = learning.length + reading.length + exercise.length;
  const previous = Math.max(1, current - 2);
  const change = Math.round(((current - previous) / previous) * 100);

  return (
    <WidgetCard title="Weekly Momentum" icon={TrendingUp}>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[28px] font-semibold tracking-tight">{change}%</span>
        <span className="text-[12px] text-success font-medium">growth score</span>
      </div>
      <div className="mt-3 text-[12.5px] text-ink-soft leading-relaxed">
        You have {current} activities logged this week. Keep building momentum with focus and
        imports.
      </div>
      <Link
        to="/analytics"
        className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:gap-1.5 transition-all"
      >
        See breakdown <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </WidgetCard>
  );
}

// Minimal helper components to support the new Command Center layout
function DashboardHeader({ totalHours }: { totalHours: number }) {
  const [name, setName] = React.useState<string | null>(null);

  React.useEffect(() => {
    // attempt to read current user from Supabase client if configured
    (async () => {
      try {
        const mod = await import("@/lib/supabase/client");
        const client = mod.getSupabaseClient();
        if (client && client.auth && typeof client.auth.getUser === "function") {
          const res = await client.auth.getUser();
          if (res?.data?.user?.user_metadata?.full_name) setName(res.data.user.user_metadata.full_name);
          else if (res?.data?.user?.email) setName(res.data.user.email.split("@")[0]);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.header
      {...fadeUp}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 rounded-[28px] border border-border bg-white px-5 py-4 shadow-[0_8px_24px_-22px_rgba(32,36,61,0.2)] sm:px-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="min-w-0">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.04em] text-ink sm:text-[30px]">
          {greet}{name ? `, ${name}` : ""} 👋
        </h1>
        <p className="mt-1 text-[14px] text-ink-soft">Small steps every day create big results.</p>
      </div>

      <div className="flex items-center gap-3 self-start lg:self-auto">
        <div className="hidden rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[12px] font-medium text-ink-soft sm:block">
          <HydratedDate value={new Date()} options={{ weekday: "long", month: "long", day: "numeric" }} />
        </div>

        <button
          type="button"
          aria-label="Search"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-soft transition-colors hover:text-ink"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-soft transition-colors hover:text-ink"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cmd-focus-icon)] text-[12px] font-semibold text-ink">
          BM
        </div>
      </div>
    </motion.header>
  );
}

function SummaryMetrics({ focusItems, applications, learning }: any) {
  const todayTotal = focusItems.length;
  const todayCompleted = focusItems.filter((f: any) => f.status === "Completed").length;

  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  })();

  const appsThisWeek = applications.filter((a: any) => new Date(a.appliedDate) >= weekStart).length;
  const learningHoursThisWeek = learning
    .filter((l: any) => new Date(l.date) >= weekStart)
    .reduce((s: number, l: any) => s + (l.timeHours || 0), 0);

  const completedCount = focusItems.filter((f: any) => f.status === "Completed").length;
  const prefersReduced = useReducedMotion();
  const pct = todayTotal ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const cards = [
    {
      key: "focus",
      link: "/focus",
      tone: "bg-[var(--cmd-focus-bg)] border-[var(--cmd-focus-border)]",
      label: "Today's Focus",
      metric: `${todayCompleted} / ${todayTotal}`,
      meta: todayTotal ? "Completed" : "No focus items",
      icon: CheckCircle2,
      iconTone: "text-[var(--cmd-focus-accent)]",
      bar: true,
    },
    {
      key: "jobs",
      link: "/jobs",
      tone: "bg-[var(--cmd-jobs-bg)] border-[var(--cmd-jobs-border)]",
      label: "Job Applications",
      metric: String(appsThisWeek),
      meta: "Applied this week",
      icon: Briefcase,
      iconTone: "text-[var(--cmd-jobs-accent)]",
      bar: false,
    },
    {
      key: "learning",
      link: "/learning",
      tone: "bg-[var(--cmd-learning-bg)] border-[var(--cmd-learning-border)]",
      label: "Learning",
      metric: String(Number(learningHoursThisWeek).toFixed(0)),
      meta: "Hours this week",
      icon: GraduationCap,
      iconTone: "text-[var(--cmd-learning-accent)]",
      bar: false,
    },
    {
      key: "streak",
      link: "/focus",
      tone: "bg-[var(--cmd-streak-bg)] border-[var(--cmd-streak-border)]",
      label: "Focus Streak",
      metric: completedCount >= 1 ? String(completedCount) : "—",
      meta: completedCount >= 1 ? "Days" : "Not enough data",
      icon: Flame,
      iconTone: "text-[var(--cmd-streak-accent)]",
      bar: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link key={card.key} to={card.link} className="group block h-full">
            <div
              className={`flex h-full min-h-[180px] flex-col justify-between rounded-[22px] border ${card.tone} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--cmd-secondary-border)] hover:shadow-[0_12px_30px_-20px_rgba(32,36,61,0.18)]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/75">
                  <Icon className={`h-3.5 w-3.5 ${card.iconTone}`} />
                  {card.label}
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[30px] font-semibold tracking-[-0.05em] text-ink">{card.metric}</div>
                <div className="mt-1 text-[13px] text-ink-soft">{card.meta}</div>
              </div>

              {card.bar && (
                <div className="mt-5">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--cmd-focus-progress-track)]">
                    <motion.div
                      initial={{ width: prefersReduced ? `${pct}%` : 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: prefersReduced ? 0 : 0.3 }}
                      className="h-full rounded-full bg-[var(--cmd-focus-progress-fill)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function TodaySchedule({ focusItems }: { focusItems: any[] }) {
  const sorted = [...focusItems].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const prefersReduced = useReducedMotion();
  const now = new Date();

  const isCurrent = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const s = new Date();
      s.setHours(sh, sm, 0, 0);
      const e = new Date();
      e.setHours(eh, em, 0, 0);
      return now >= s && now <= e;
    } catch (e) {
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_24px_-20px_rgba(32,36,61,0.2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
          <Clock className="h-3.5 w-3.5" />
          Today
        </div>
        <div className="text-[11px] text-ink-soft">Agenda</div>
      </div>

      {sorted.length ? (
        <div className="mt-5 space-y-3">
          {sorted.map((f) => (
            <div
              key={f.id}
              className="rounded-[16px] border border-border bg-white p-3 transition-colors hover:bg-[#f7f9fc]"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 shrink-0 pt-0.5 text-[12px] font-medium text-ink-soft">
                  {f.startTime}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-ink">{f.title}</div>
                  <div className="mt-1 text-[12px] text-ink-soft">{f.category}</div>
                </div>
                <div className="pt-1">
                  {isCurrent(f.startTime, f.endTime) && (
                    <motion.span
                      animate={prefersReduced ? {} : { scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="block h-2 w-2 rounded-full bg-[var(--cmd-streak-accent)]"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-1">
            <Link to="/calendar" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary">
              View full calendar <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-white px-4 py-6 text-center text-[14px] text-ink-soft">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ebff] text-[var(--cmd-streak-accent)]">
            <Clock className="h-4 w-4" />
          </div>
          <div>Nothing scheduled for today.</div>
        </div>
      )}
    </motion.div>
  );
}

function QuickStats({ learning, applications, reading }: any) {
  const totalApplications = applications.length;
  const learningHours = learning.reduce((s: number, l: any) => s + (l.timeHours || 0), 0);
  const booksRead = reading.filter((r: any) => r.progress >= 100).length;
  const focusItems = useFocusStore((s) => s.focusItems);
  const completed = focusItems.filter((f) => f.status === "Completed").length;
  const completionPct = focusItems.length ? Math.round((completed / focusItems.length) * 100) : 0;

  const stats = [
    { label: "Total Applications", value: totalApplications, to: "/jobs" },
    { label: "Learning Hours", value: learningHours, to: "/learning" },
    { label: "Books Read", value: booksRead, to: "/reading" },
    { label: "Focus Completion", value: `${completionPct}%`, to: "/focus" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full rounded-[24px] border border-[var(--cmd-quick-border)] bg-white p-5 shadow-[0_8px_24px_-20px_rgba(32,36,61,0.2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
          <TrendingUp className="h-3.5 w-3.5" />
          Quick Stats
        </div>
        <div className="text-[11px] text-ink-soft">Overview</div>
      </div>

      <div className="mt-5 divide-y divide-[var(--cmd-border-subtle)] rounded-[18px] border border-[var(--cmd-quick-border)] bg-white">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="group flex items-center justify-between px-3 py-3 transition-colors hover:bg-[#f7f9fc]"
          >
            <span className="text-[14px] text-ink-soft">{stat.label}</span>
            <span className="text-[14px] font-semibold text-ink">{stat.value}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

function JobTrackerPreview({ applications }: { applications: any[] }) {
  const recent = [...applications].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_24px_-20px_rgba(32,36,61,0.2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
          <Briefcase className="h-3.5 w-3.5" />
          Job Tracker
        </div>
        <div className="text-[11px] text-ink-soft">{applications.length} tracked</div>
      </div>

      {recent.length ? (
        <div className="mt-5 space-y-2 text-sm">
          {recent.map((a) => (
            <Link key={a.id} to={`/jobs`} className="flex items-center justify-between rounded-[14px] p-2 transition-colors hover:bg-white">
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium text-ink">{a.company}</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">{a.position}</div>
              </div>
              <div className="ml-3 text-[12px] text-ink-soft">
                {new Date(a.appliedDate).toLocaleDateString()}
              </div>
            </Link>
          ))}
          <div className="pt-2">
            <Link to="/jobs" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary">
              View Jobs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-white px-5 py-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cmd-jobs-icon)] text-[var(--cmd-jobs-accent)]">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="text-[15px] font-semibold text-ink">No applications yet.</div>
          <p className="mt-2 max-w-[220px] text-[13px] leading-5 text-ink-soft">
            Track your applications and move closer to your goals.
          </p>
          <Link to="/jobs" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--cmd-jobs-accent)]">
            View Jobs <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function RecentActivity({ learning, applications, reading }: any) {
  const events: { id: string; title: string; date?: string }[] = [];
  learning.forEach((l: any) => events.push({ id: `l-${l.id}`, title: `Added learning: ${l.topic}`, date: l.date }));
  applications.forEach((a: any) => events.push({ id: `a-${a.id}`, title: `Updated application: ${a.company}`, date: a.appliedDate }));
  reading.forEach((r: any) => events.push({ id: `r-${r.id}`, title: `Reading: ${r.book}`, date: r.date }));

  const sorted = events
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_24px_-20px_rgba(32,36,61,0.2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
          <Lightbulb className="h-3.5 w-3.5" />
          Recent Activity
        </div>
        <div className="text-[11px] text-ink-soft">{sorted.length} items</div>
      </div>

      {sorted.length ? (
        <div className="mt-5 space-y-3 text-sm">
          {sorted.map((e) => (
            <div key={e.id} className="rounded-[14px] border border-border bg-white p-3">
              <div className="font-medium text-[14px] text-ink">{e.title}</div>
              <div className="mt-1 text-[12px] text-ink-soft">
                {e.date ? new Date(e.date).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-white px-5 py-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ebff] text-[var(--cmd-streak-accent)]">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="text-[15px] font-semibold text-ink">No recent activity.</div>
          <p className="mt-2 max-w-[220px] text-[13px] leading-5 text-ink-soft">
            Your latest actions will appear here.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function CommandTodayFocus() {
  const focusItemsRaw = useFocusStore((state) => state.focusItems);
  const toggle = useFocusStore((s) => s.toggleFocusComplete);
  const deleteFocus = useFocusStore((s) => s.deleteFocusItem);
  const items = [...focusItemsRaw].sort((a, b) => a.order - b.order);
  const completed = items.filter((i) => i.status === "Completed").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full rounded-[24px] border border-border bg-white p-5 shadow-[0_8px_24px_-20px_rgba(32,36,61,0.2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/70">
            Today's Focus
          </div>
          <div className="mt-1 text-[14px] text-ink-soft">{completed} / {items.length} completed</div>
        </div>
        <Link
          to="/focus"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-white"
        >
          + Add focus
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((it) => (
            <div key={it.id} className="rounded-[18px] border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-ink">{it.title}</div>
                  <div className="mt-1 text-[13px] text-ink-soft">
                    {it.startTime} – {it.endTime} · {it.category}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={it.status === "Completed" ? "Mark incomplete" : "Mark complete"}
                    onClick={() => toggle(it.id)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-medium transition-colors ${
                      it.status === "Completed"
                        ? "border-[var(--cmd-learning-accent)] bg-[var(--cmd-learning-icon)] text-[var(--cmd-learning-accent)]"
                        : "border-border bg-white text-ink-soft hover:text-ink"
                    }`}
                  >
                    {it.status === "Completed" ? "✓" : "○"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFocus(it.id)}
                    className="text-[12px] font-medium text-ink-soft transition-colors hover:text-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {it.description && (
                <p className="mt-3 text-[13px] leading-5 text-ink-soft">{it.description}</p>
              )}
            </div>
          ))
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-white px-5 py-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8efff] text-[var(--cmd-focus-accent)]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-[15px] font-semibold text-ink">Nothing planned for today.</div>
            <p className="mt-2 max-w-[260px] text-[13px] leading-5 text-ink-soft">
              There is currently nothing planned, but you can start whenever you're ready.
            </p>
            <Link to="/focus" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
              + Add focus
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
