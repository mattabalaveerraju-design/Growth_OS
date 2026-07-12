import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useApplicationStore } from "@/stores/useGrowthStores";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — GrowthOS" }] }),
  component: AnalyticsPage,
});

const hoursData = [
  { day: "Mon", Work: 5, Learning: 2, Personal: 1.5, Exercise: 0.5 },
  { day: "Tue", Work: 4, Learning: 2.5, Personal: 1, Exercise: 1 },
  { day: "Wed", Work: 6, Learning: 1.5, Personal: 1, Exercise: 0.5 },
  { day: "Thu", Work: 4.5, Learning: 2, Personal: 2, Exercise: 1 },
  { day: "Fri", Work: 5.5, Learning: 1.5, Personal: 1, Exercise: 1 },
  { day: "Sat", Work: 2, Learning: 3, Personal: 2.5, Exercise: 1.5 },
  { day: "Sun", Work: 1, Learning: 2, Personal: 3, Exercise: 1 },
];

const productivityData = [
  { d: "Mon", v: 72 },
  { d: "Tue", v: 78 },
  { d: "Wed", v: 75 },
  { d: "Thu", v: 82 },
  { d: "Fri", v: 85 },
  { d: "Sat", v: 89 },
  { d: "Sun", v: 87 },
];

const consistencyData = productivityData.map((p, i) => ({
  d: p.d,
  v: 70 + i * 3 + Math.sin(i) * 2,
}));

const categories = [
  { name: "Work", value: 55, color: "oklch(0.52 0.22 275)" },
  { name: "Learning", value: 18, color: "oklch(0.62 0.25 295)" },
  { name: "Personal", value: 17, color: "oklch(0.78 0.15 75)" },
  { name: "Exercise", value: 10, color: "oklch(0.72 0.16 155)" },
];

function AnalyticsPage() {
  const applications = useApplicationStore((state) => state.applications);
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

  return (
    <AppShell title="Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">
              Analytics
            </h1>
            <p className="text-[13.5px] text-ink-soft">Your growth, quantified</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-[10px] bg-card border border-border h-9 px-1">
              <button className="h-7 w-7 grid place-items-center text-ink-soft hover:text-ink">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="h-7 px-3 text-[12.5px] font-medium text-ink flex items-center">
                May 17 – 24, 2026
              </span>
              <button className="h-7 w-7 grid place-items-center text-ink-soft hover:text-ink">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-b border-border">
          {["Overview", "Work", "Learning", "Goals", "Habits", "Applications"].map((t, i) => (
            <button
              key={t}
              className={`px-3 h-9 text-[13px] font-medium transition-colors relative ${
                i === 0 ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t}
              {i === 0 && (
                <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-soft p-6"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
                  Hours Overview
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-[32px] font-semibold tracking-tight">
                    24h 30m
                  </span>
                  <span className="text-[12px] text-success font-medium inline-flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12% vs last week
                  </span>
                </div>
              </div>
              <Legend2 />
            </div>
            <div className="h-[260px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData} margin={{ left: -16, right: 0, top: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.5 0.015 265)", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.5 0.015 265)", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.92 0.006 95)",
                      fontSize: 12,
                      background: "white",
                    }}
                  />
                  <Bar
                    dataKey="Work"
                    stackId="a"
                    fill="oklch(0.52 0.22 275)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar dataKey="Learning" stackId="a" fill="oklch(0.62 0.25 295)" />
                  <Bar dataKey="Personal" stackId="a" fill="oklch(0.78 0.15 75)" />
                  <Bar
                    dataKey="Exercise"
                    stackId="a"
                    fill="oklch(0.72 0.16 155)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="card-soft p-6 grid place-items-center"
          >
            <div className="text-center">
              <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
                Productivity Score
              </div>
              <div className="font-display text-[68px] font-semibold tracking-tight leading-none mt-3 bg-gradient-to-br from-primary to-violet bg-clip-text text-transparent">
                87%
              </div>
              <div className="text-[13px] text-ink-soft mt-2">Great job!</div>
              <div className="h-[100px] mt-4 -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productivityData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="oklch(0.52 0.22 275)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-soft p-6"
          >
            <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
              Top Categories
            </div>
            <div className="flex items-center gap-5 mt-4">
              <div className="h-32 w-32 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="value"
                      innerRadius={36}
                      outerRadius={56}
                      strokeWidth={0}
                    >
                      {categories.map((c) => (
                        <Cell key={c.name} fill={c.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {categories.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-display font-semibold">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="card-soft p-6"
          >
            <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
              Weekly Goal Progress
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-semibold tracking-tight">18</span>
              <span className="text-[13px] text-ink-soft">/ 24 goals completed</span>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                style={{ width: "75%" }}
              />
            </div>
            <div className="mt-2 text-right text-[12px] font-semibold text-ink">75%</div>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }, (_, i) => {
                const intensity = Math.random();
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-[4px]"
                    style={{
                      background:
                        intensity < 0.3
                          ? "oklch(0.94 0.005 95)"
                          : intensity < 0.6
                            ? "oklch(0.85 0.08 275)"
                            : "oklch(0.55 0.2 275)",
                    }}
                  />
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card-soft p-6"
          >
            <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">
              Consistency
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-semibold tracking-tight">89%</span>
              <span className="text-[12px] text-success font-medium">Great consistency!</span>
            </div>
            <div className="h-[140px] mt-4 -mx-4">
              <ResponsiveContainer>
                <LineChart data={consistencyData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="oklch(0.72 0.16 155)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "oklch(0.72 0.16 155)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function Legend2() {
  const items = [
    { label: "Work", color: "oklch(0.52 0.22 275)" },
    { label: "Learning", color: "oklch(0.62 0.25 295)" },
    { label: "Personal", color: "oklch(0.78 0.15 75)" },
    { label: "Exercise", color: "oklch(0.72 0.16 155)" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <span
          key={i.label}
          className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-soft"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
