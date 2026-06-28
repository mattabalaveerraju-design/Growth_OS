"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
      { name: "description", content: "Continue where you left off. Stay consistent. Grow on purpose." },
      { property: "og:title", content: "GrowthOS — Personal AI productivity OS" },
      { property: "og:description", content: "A second brain for work, learning, and career growth." },
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
  const totalHours = Math.round((totalLearningHours + totalReadingHours + totalExerciseHours + workHours) * 10) / 10;
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
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-4 space-y-8 lg:space-y-10 overflow-x-hidden">
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="font-display text-3xl sm:text-4xl lg:text-[34px] font-semibold tracking-[-0.025em] text-ink">
        Good evening, Balu.
      </h1>

      <p className="mt-1 text-[15px] text-ink-soft">
        You have {totalHours.toFixed(1)} growth hours captured in your current workspace.
      </p>
    </div>

    <div className="text-[13px] text-ink-soft">
      {new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </div>
  </div>
</motion.div>

        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-[var(--shadow-hero)]"
        >
          <div className="pointer-events-none absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-violet/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-0">
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                CONTINUE WHERE YOU LEFT OFF
              </div>

              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[40px] leading-tight font-semibold tracking-[-0.03em]">
                GrowthOS dashboard overview
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {completedFocus} focus item{completedFocus === 1 ? "" : "s"} completed
                </span>
                <span className="text-ink-soft/40">·</span>
                <span>{applications.length} applications tracked</span>
                <span className="text-ink-soft/40">·</span>
                <span>{goals.length} goals active</span>
              </div>

              <div className="mt-7">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-medium text-ink-soft">Week total hours</span>
                  <span className="font-display text-[15px] font-semibold tracking-tight">{totalHours.toFixed(1)}h</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalHours / 40) * 100)}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                  />
                </div>
              </div>

              <div className="mt-7 rounded-[16px] border border-border bg-surface/60 p-4">
                <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft/80">NEXT ACTION</div>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[15.5px] font-semibold text-ink">
                      Plan your next focus session and close the highest-priority item.
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[12.5px] text-ink-soft">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {totalLearningHours.toFixed(1)}h learning
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" /> {totalExerciseHours.toFixed(1)}h exercise
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" /> {upcomingTasks.length} due soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button className="group inline-flex items-center gap-2 rounded-[14px] bg-ink text-background px-5 h-12 text-[14.5px] font-medium shadow-[var(--shadow-lifted)] hover:bg-ink/90 transition-all">
                  <Play className="h-4 w-4 fill-current" />
                  Continue working
                  <span className="ml-1 text-[11px] text-background/60 border border-background/20 rounded px-1.5 py-0.5">↵</span>
                </button>
                <button className="inline-flex items-center gap-1.5 h-12 px-4 rounded-[14px] text-[13.5px] font-medium text-ink-soft hover:text-ink transition-colors">
                  Open analytics
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative border-l border-border/60 bg-gradient-to-b from-surface/40 to-transparent p-6 lg:p-8">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft/80">ALSO IN PROGRESS</div>
              <div className="mt-4 space-y-2">
                {interviewFollowUps.length ? (
                  interviewFollowUps.map((r) => (
                    <button
                      key={r.title}
                      className="group w-full text-left rounded-[14px] border border-transparent hover:border-border hover:bg-card p-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-medium text-ink truncate">{r.title}</div>
                          <div className="mt-0.5 text-[12px] text-ink-soft">{r.meta}</div>
                        </div>
                        <span className="text-[10.5px] font-medium tracking-wide text-accent-foreground bg-accent rounded-full px-2 py-0.5 shrink-0">
                          {r.tag}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  [
                    { title: "Review latest learning session", meta: "25 min · Learning", tag: "Learning" },
                    { title: "Prepare portfolio deliverable", meta: "1h 20m · Work", tag: "Tasks" },
                    { title: "Plan next interview follow-up", meta: "15 min · Jobs", tag: "Applications" },
                  ].map((r) => (
                    <button
                      key={r.title}
                      className="group w-full text-left rounded-[14px] border border-transparent hover:border-border hover:bg-card p-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-medium text-ink truncate">{r.title}</div>
                          <div className="mt-0.5 text-[12px] text-ink-soft">{r.meta}</div>
                        </div>
                        <span className="text-[10.5px] font-medium tracking-wide text-accent-foreground bg-accent rounded-full px-2 py-0.5 shrink-0">
                          {r.tag}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0">
          <div className="min-w-0">
  <TodayFocus />
</div>
          <ConsistencyRing />
          <DeepWork />
          <AIDailySummary />
          <LearningProgress />
          <SmartSuggestions />
          <UpcomingDeadlines />
          <ActiveGoals />
          <WeeklyMomentum />
        </section>

        <footer className="pt-4 pb-2 text-center text-[12px] text-ink-soft/60">GrowthOS · Your second brain</footer>
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
      className={`group card-soft p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)] ${className}`}
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
          <div className="mt-3 text-[13px] text-ink">Add a focus item to keep your day on track.</div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Today's Focus" hint={`${focusItems.length} item${focusItems.length === 1 ? "" : "s"}`} icon={CheckCircle2}>
      <div className="space-y-3">
        {focusItems.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ink">{item.title}</div>
                <div className="mt-1 text-[12px] text-ink-soft">
                  {item.startTime} — {item.endTime} · {item.category}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  item.status === "Completed" ? "bg-success/15 text-success" : "bg-muted text-ink-soft"
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-ink-soft">
              <span>Priority: {item.priority}</span>
              <span>{item.notes ? `${item.notes.slice(0, 30)}${item.notes.length > 30 ? "…" : ""}` : "No notes"}</span>
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
  const score = Math.min(100, Math.max(20, focusItems.filter((item) => item.status === "Completed").length * 8 + tasks.filter((task) => task.status === "Done").length * 4 + learning.length * 2));
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
              <div className="font-display text-[24px] font-semibold tracking-tight leading-none">{score}</div>
              <div className="text-[10px] text-ink-soft mt-0.5">score</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <Stat label="Focus completed" value={`${focusItems.filter((item) => item.status === "Completed").length}`} />
          <Stat label="Tasks done" value={`${tasks.filter((task) => task.status === "Done").length}`} />
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
  const totalHours = Math.round((learning.reduce((sum, item) => sum + item.timeHours, 0) + reading.reduce((sum, item) => sum + item.timeMinutes / 60, 0) + exercise.reduce((sum, item) => sum + item.durationMinutes / 60, 0)) * 10) / 10;
  const max = Math.max(4, totalHours, 6);
  const bars = [1.2, 2.4, 0.8, 3.1, 2.7, 1.8, 2.9];

  return (
    <WidgetCard title="Deep Work" hint="this week" icon={Zap}>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[28px] font-semibold tracking-tight">{totalHours.toFixed(1)}h</span>
          <span className="text-[12px] text-success font-medium">{totalHours >= 8 ? "+2.4h vs last week" : "+0.6h vs last week"}</span>
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
    <WidgetCard title="AI Daily Brief" hint="updated just now" icon={Sparkles} className="md:col-span-2">
      <div className="flex gap-4">
        <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-primary to-violet grid place-items-center shrink-0 shadow-sm">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="text-[14px] leading-[1.6] text-ink/90">
          {learning.length ? (
            <>You have {learning.length} learning entries and {totalLearningHours.toFixed(1)} hours logged. Focus on the top priority item to keep momentum.</>
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
          <div className="text-[12px] text-ink-soft">{learning[0]?.category} · {learning[0]?.timeHours.toFixed(1)}h</div>
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
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">No learning records yet.</div>
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
              <div className="mt-1 text-[10.5px] font-medium tracking-wide text-ink-soft/70 uppercase">{s.tag}</div>
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

          <span className="text-[13px] text-ink truncate min-w-0">
            {d.title}
          </span>
        </div>

        <span className="text-[11.5px] text-ink-soft shrink-0 whitespace-nowrap">
          {new Date(d.dueDate).toLocaleDateString()}
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
              <div className="mt-1 text-[12px] text-ink-soft">{goal.category} · {goal.status}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border p-6 text-sm text-ink-soft">No goals yet. Add one to track your growth.</div>
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
        You have {current} activities logged this week. Keep building momentum with focus and imports.
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
