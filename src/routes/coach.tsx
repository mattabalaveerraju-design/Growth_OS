import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Zap, Target, GraduationCap, Flame, Award } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from "recharts";

export const Route = createFileRoute("/coach")({
  head: () => ({ meta: [{ title: "AI Coach — GrowthOS" }] }),
  component: CoachPage,
});

const skills = [
  { skill: "UI Design", value: 88 },
  { skill: "UX Research", value: 72 },
  { skill: "Communication", value: 65 },
  { skill: "AI Tools", value: 80 },
  { skill: "Career", value: 60 },
  { skill: "Strategy", value: 70 },
];

function CoachPage() {
  return (
    <AppShell title="AI Coach">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">AI Coach</h1>
            <p className="text-[13.5px] text-ink-soft">Your personal mentor — always learning you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <InsightCard
            tag="Daily Insight"
            tone="warning"
            title="You're most productive in the morning"
            body="9:00 AM – 12:00 PM. Keep this momentum!"
            action="View Details"
          />
          <InsightCard
            tag="Focus Suggestion"
            tone="primary"
            title="Deep Work"
            body="Figma Auto Layout · 90 min"
            action="Start Focus"
            icon={Zap}
          />
          <InsightCard
            tag="Weekly Goal"
            tone="violet"
            title="18 / 24"
            body="75% complete — three days to push."
            action="Go to Goals"
            icon={Target}
            big="75%"
          />
          <InsightCard
            tag="Learning Recommendation"
            tone="success"
            title="Design Systems"
            body="Improve consistency & scalability"
            action="Start Learning"
            icon={GraduationCap}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="card-soft p-6"
          >
            <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">Skill Growth</div>
            <div className="h-[280px] mt-2">
              <ResponsiveContainer>
                <RadarChart data={skills} outerRadius="75%">
                  <PolarGrid stroke="oklch(0.92 0.006 95)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "oklch(0.42 0.02 265)", fontSize: 11, fontWeight: 500 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="oklch(0.52 0.22 275)" fill="oklch(0.62 0.25 295)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="card-soft p-6"
          >
            <div className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-soft/80 uppercase">Recent Achievements</div>
            <div className="mt-4 space-y-3.5">
              <Achievement icon={Flame} title="12 day streak" sub="Your longest learning streak yet." tone="warning" />
              <Achievement icon={Award} title="Completed 7 tasks this week" sub="Above average for your last 6 weeks." tone="primary" />
              <Achievement icon={GraduationCap} title="Learned 4 new topics" sub="Figma Auto Layout, Design Systems, +2 more." tone="violet" />
              <Achievement icon={Zap} title="24h focused work this week" sub="Deep work hours grew 12% vs last week." tone="success" />
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function InsightCard({
  tag, tone, title, body, action, icon: Icon = Sparkles, big,
}: {
  tag: string; tone: "primary" | "violet" | "success" | "warning";
  title: string; body: string; action: string;
  icon?: React.ComponentType<{ className?: string }>;
  big?: string;
}) {
  const toneBg: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 border-primary/20",
    violet: "from-violet/15 to-violet/5 border-violet/20",
    success: "from-success/15 to-success/5 border-success/20",
    warning: "from-warning/20 to-warning/5 border-warning/30",
  };
  const btnBg: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    violet: "bg-violet text-primary-foreground hover:bg-violet/90",
    success: "bg-success text-primary-foreground hover:bg-success/90",
    warning: "bg-warning text-ink hover:bg-warning/90",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-[20px] border bg-gradient-to-br ${toneBg[tone]} p-5`}
    >
      <div className="flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.14em] text-ink-soft/80 uppercase">
        <Icon className="h-3.5 w-3.5" /> {tag}
      </div>
      <div className="mt-3 font-display text-[20px] font-semibold tracking-tight text-ink leading-tight">
        {big ?? title}
      </div>
      {big && <div className="text-[13px] font-semibold text-ink mt-0.5">{title}</div>}
      <p className="mt-1.5 text-[12.5px] text-ink-soft leading-relaxed">{body}</p>
      <button className={`mt-4 inline-flex items-center justify-center h-8 px-3.5 rounded-[8px] text-[12px] font-medium ${btnBg[tone]} transition-colors`}>
        {action}
      </button>
    </motion.div>
  );
}

function Achievement({ icon: Icon, title, sub, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string; tone: string }) {
  const map: Record<string, string> = {
    warning: "bg-warning/15 text-warning",
    primary: "bg-primary/15 text-primary",
    violet: "bg-violet/15 text-violet",
    success: "bg-success/15 text-success",
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`h-9 w-9 rounded-[10px] grid place-items-center shrink-0 ${map[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-ink">{title}</div>
        <div className="text-[12px] text-ink-soft leading-snug">{sub}</div>
      </div>
    </div>
  );
}
