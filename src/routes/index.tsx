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
      <div className="mx-auto w-full max-w-[1440px] px-8 overflow-x-hidden">
        {/* Header */}
        <div className="py-6">
          <DashboardHeader totalHours={totalHours} />
        </div>

        {/* Summary cards (32px below header) */}
        <div className="mt-8">
          <SummaryMetrics focusItems={focusItems} applications={applications} learning={learning} />
        </div>

        {/* Main grid (24px below summary) */}
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-5 items-stretch">
            <main className="col-span-12 lg:col-span-6 flex flex-col gap-6">
              <CommandTodayFocus />
            </main>

            <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
              <TodaySchedule focusItems={focusItems} />
            </aside>

            <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
              <QuickStats learning={learning} applications={applications} reading={reading} />
            </aside>
          </div>
        </div>

        {/* Secondary grid (24px below main) */}
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-5 items-stretch">
            <div className="col-span-12 lg:col-span-6">
              <LearningProgress />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <JobTrackerPreview applications={applications} />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <RecentActivity learning={learning} applications={applications} reading={reading} />
            </div>
          </div>
        </div>

        <footer className="pt-6 pb-6 text-center text-[12px] text-ink-soft/60">GrowthOS · Your second brain</footer>
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
              className="fill-none stroke-[url(#ringGrad)]"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{ strokeDasharray: circumference }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.52 0.22 275)" />
                <stop offset="100%" stopColor="oklch(0.62 0.25 295)" />
              </linearGradient>
            </defs>
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
        <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-primary to-violet grid place-items-center shrink-0 shadow-sm">
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
    <WidgetCard title="Learning" hint={`${learning.length} records`} icon={GraduationCap}>
      {learning.length ? (
        <>
          <div className="text-[13.5px] font-semibold text-ink">{learning[0]?.topic}</div>
          <div className="text-[12px] text-ink-soft">
            {learning[0]?.category} · {learning[0]?.timeHours.toFixed(1)}h
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${suggested}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full bg-violet"
            />
          </div>
          <div className="mt-3 flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-ink-soft">
              <CircleDot className="h-3 w-3 text-violet" /> {learning.length} topics tracked
            </span>
            <span className="inline-flex items-center gap-1.5 text-warning">
              <AlertCircle className="h-3 w-3" /> {Math.max(0, 5 - learning.length)} fresh topics
            </span>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">
          No learning records yet.
        </div>
      )}
    </WidgetCard>
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
    <motion.div {...fadeUp} transition={{ duration: 0.35 }} className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-[34px] font-semibold tracking-[-0.025em] text-ink">
          {greet}{name ? `, ${name}` : ""} 👋
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">Small steps today, big results tomorrow.</p>
      </div>
      <div className="text-[13px] text-ink-soft">
        <HydratedDate value={new Date()} options={{ weekday: "long", month: "long", day: "numeric" }} />
      </div>
    </motion.div>
  );
}

function SummaryMetrics({ focusItems, applications, learning }: any) {
  const todayTotal = focusItems.length;
  const todayCompleted = focusItems.filter((f: any) => f.status === "Completed").length;

  // applications this week
  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  })();
  const appsThisWeek = applications.filter((a: any) => new Date(a.appliedDate) >= weekStart).length;

  const learningHoursThisWeek = learning
    .filter((l: any) => new Date(l.date) >= weekStart)
    .reduce((s: number, l: any) => s + (l.timeHours || 0), 0);

  // focus streak: insufficient data -> show dash
  const completedCount = focusItems.filter((f: any) => f.status === "Completed").length;
  const focusStreak = completedCount >= 1 ? "—" : "—";

  const prefersReduced = useReducedMotion();
  const pct = todayTotal ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Link to="/focus" className="group">
        <div className="rounded-2xl border border-border bg-card p-6 h-full cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold text-ink-soft">Today's Focus</div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-ink-soft">→</div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-2xl font-semibold text-ink">{todayCompleted} / {todayTotal}</div>
            <div className="text-sm text-ink-soft">{todayTotal ? "Completed" : "No focus items"}</div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: prefersReduced ? `${pct}%` : 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: prefersReduced ? 0 : 0.25 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      </Link>

      <Link to="/jobs" className="group">
        <div className="rounded-2xl border border-border bg-card p-6 h-full cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold text-ink-soft">Job Applications</div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-ink-soft">→</div>
          </div>
          <div className="mt-3 text-2xl font-semibold text-ink">{appsThisWeek}</div>
          <div className="mt-1 text-sm text-ink-soft">Applied this week</div>
        </div>
      </Link>

      <Link to="/learning" className="group">
        <div className="rounded-2xl border border-border bg-card p-6 h-full cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold text-ink-soft">Learning</div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-ink-soft">→</div>
          </div>
          <div className="mt-3 text-2xl font-semibold text-ink">{learningHoursThisWeek}</div>
          <div className="mt-1 text-sm text-ink-soft">Hours this week</div>
        </div>
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 h-full">
        <div className="flex items-start justify-between">
          <div className="text-sm font-semibold text-ink-soft">Focus Streak</div>
        </div>
        <div className="mt-3 text-2xl font-semibold text-ink">{completedCount >= 1 ? completedCount : "—"}</div>
        <div className="mt-1 text-sm text-ink-soft">{completedCount >= 1 ? "Days" : "Not enough data"}</div>
      </div>
    </div>
  );
}

function TodaySchedule({ focusItems }: { focusItems: any[] }) {
  const sorted = [...focusItems].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const prefersReduced = useReducedMotion();
  const now = new Date();

  const isCurrent = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(":" ).map(Number);
      const [eh, em] = end.split(":" ).map(Number);
      const s = new Date(); s.setHours(sh, sm, 0, 0);
      const e = new Date(); e.setHours(eh, em, 0, 0);
      return now >= s && now <= e;
    } catch (e) {
      return false;
    }
  };

  return (
    <WidgetCard title="Today" hint="Agenda" icon={Clock}>
      {sorted.length ? (
        <div className="space-y-3">
          {sorted.map((f) => (
            <div key={f.id} className="text-sm flex items-start gap-3 hover:bg-muted/50 p-2 rounded-md">
              <div className="w-10 text-right text-ink-soft">{f.startTime}</div>
              <div className="min-w-0">
                <div className={`font-medium ${isCurrent(f.startTime, f.endTime) ? 'text-ink' : ''}`}>{f.title}</div>
                <div className="text-ink-soft text-xs">{f.category}</div>
              </div>
              <div className="ml-auto">
                {isCurrent(f.startTime, f.endTime) && (
                  <motion.span
                    animate={prefersReduced ? {} : { scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="h-2 w-2 rounded-full bg-primary block"
                  />
                )}
              </div>
            </div>
          ))}
          <div className="mt-3">
            <Link to="/calendar" className="inline-flex items-center text-sm text-primary">
              View full calendar <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        ) : (
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">Nothing scheduled for today.</div>
      )}
    </WidgetCard>
  );
}

function QuickStats({ learning, applications, reading }: any) {
  const totalApplications = applications.length;
  const learningHours = learning.reduce((s: number, l: any) => s + (l.timeHours || 0), 0);
  const booksRead = reading.filter((r: any) => r.progress >= 100).length;
  const focusItems = useFocusStore((s) => s.focusItems);
  const completed = focusItems.filter((f) => f.status === "Completed").length;
  const completionPct = focusItems.length ? Math.round((completed / focusItems.length) * 100) : null;

  return (
    <WidgetCard title="Quick Stats" hint="overview" icon={TrendingUp}>
      <div className="space-y-3 text-sm">
        <Link to="/jobs" className="block hover:bg-muted/60 p-2 rounded-md transition-colors">
          <div className="flex justify-between"><div>Total Applications</div><div className="font-semibold">{totalApplications}</div></div>
        </Link>
        <Link to="/learning" className="block hover:bg-muted/60 p-2 rounded-md transition-colors">
          <div className="flex justify-between"><div>Learning Hours</div><div className="font-semibold">{learningHours}</div></div>
        </Link>
        <Link to="/reading" className="block hover:bg-muted/60 p-2 rounded-md transition-colors">
          <div className="flex justify-between"><div>Books Read</div><div className="font-semibold">{booksRead}</div></div>
        </Link>
        <Link to="/focus" className="block hover:bg-muted/60 p-2 rounded-md transition-colors">
          <div className="flex justify-between"><div>Focus Completion</div><div className="font-semibold">{completionPct !== null ? `${completionPct}%` : "—"}</div></div>
        </Link>
      </div>
    </WidgetCard>
  );
}

function JobTrackerPreview({ applications }: { applications: any[] }) {
  const recent = [...applications].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()).slice(0, 4);

  return (
    <WidgetCard title="Job Tracker" hint={`${applications.length} tracked`} icon={ArrowUpRight}>
      {recent.length ? (
        <div className="space-y-2 text-sm">
          {recent.map((a) => (
            <Link key={a.id} to={`/jobs`} className="flex items-center justify-between hover:bg-muted/60 p-2 rounded-md transition-colors">
              <div className="min-w-0">
                <div className="font-medium truncate">{a.company}</div>
                <div className="text-ink-soft text-xs">{a.position}</div>
              </div>
              <div className="text-ink-soft text-sm">{new Date(a.appliedDate).toLocaleDateString()}</div>
            </Link>
          ))}
          <div className="mt-2">
            <Link to="/jobs" className="text-sm text-primary">View all →</Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">No applications yet.</div>
      )}
    </WidgetCard>
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
    <WidgetCard title="Recent Activity" hint={`${sorted.length} items`} icon={Lightbulb}>
      {sorted.length ? (
        <div className="space-y-3 text-sm">
          {sorted.map((e) => (
            <div key={e.id} className="hover:bg-muted/60 p-2 rounded-md transition-colors">
              <div className="font-medium">{e.title}</div>
              <div className="text-ink-soft text-xs">{e.date ? new Date(e.date).toLocaleString() : ""}</div>
            </div>
          ))}
          <div className="mt-2">
            <span className="text-sm text-primary">View all →</span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">No recent activity.</div>
      )}
    </WidgetCard>
  );
}

function CommandTodayFocus() {
  const focusItemsRaw = useFocusStore((state) => state.focusItems);
  const toggle = useFocusStore((s) => s.toggleFocusComplete);
  const deleteFocus = useFocusStore((s) => s.deleteFocusItem);
  const items = [...focusItemsRaw].sort((a, b) => a.order - b.order);
  const completed = items.filter((i) => i.status === "Completed").length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Today's Focus</div>
          <div className="text-xs text-ink-soft">{completed} / {items.length} completed</div>
        </div>
        <div>
          <Link to="/focus" className="text-sm text-primary">+ Add focus</Link>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {items.length ? (
          items.map((it) => (
            <div key={it.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{it.title}</div>
                  <div className="text-ink-soft text-xs">{it.startTime} – {it.endTime} · {it.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(it.id)} className="text-sm text-ink-soft">{it.status === 'Completed' ? '✓' : '○'}</button>
                  <button onClick={() => deleteFocus(it.id)} className="text-sm text-danger">Delete</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">Nothing planned for today.<div className="mt-3"><Link to="/focus" className="text-primary">+ Add focus</Link></div></div>
        )}
      </div>
    </div>
  );
}
