import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <AppShell title={title}>
      <div className="mx-auto max-w-[820px] mt-16">
        <div className="card-lifted p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-[14px] bg-gradient-to-br from-primary to-violet grid place-items-center shadow-sm">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="mt-5 font-display text-[28px] font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-[15px] text-ink-soft max-w-[520px] mx-auto leading-relaxed">{blurb}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground text-[11.5px] font-semibold tracking-wide px-3 py-1.5 uppercase">
            Module coming next
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export const moduleMeta: Record<string, { title: string; blurb: string }> = {
  tasks: { title: "Tasks", blurb: "List, board, timeline, calendar, and focus views. AI prioritizes, schedules, and predicts delays so you always know what to do next." },
  calendar: { title: "Calendar", blurb: "Time-block your day. Drag tasks, learning, and goals onto a clean week view." },
  focus: { title: "Focus Mode", blurb: "Full-screen, distraction-free. One task, a timer, your notes, and an AI assistant on standby." },
  learning: { title: "Learning OS", blurb: "Never forget what you learned. Spaced repetition, AI summaries, skill progression, and a personal knowledge graph." },
  knowledge: { title: "Knowledge Vault", blurb: "Your second brain — research, notes, frameworks, and AI prompts, all bi-directionally linked." },
  reading: { title: "Reading", blurb: "Books, articles, newsletters, papers — with highlights, notes, and a reading streak." },
  goals: { title: "Goals", blurb: "Daily, weekly, monthly, quarterly, yearly. Goal → Project → Task. Everything connected." },
  jobs: { title: "Job Tracker", blurb: "Application funnel, interview prep, resume optimization, and offer analytics." },
  projects: { title: "Project Hub", blurb: "Every project with tasks, files, notes, milestones, risks, and AI suggestions." },
  coach: { title: "AI Coach", blurb: "Daily, weekly, and monthly reviews. Skill gap analysis. Career insights. The mentor you didn't know you had." },
  exercise: { title: "Exercise", blurb: "Workouts, recovery, consistency, and a calm health score that respects your time." },
  consistency: { title: "Consistency Engine", blurb: "Check-ins, completion rate, focus sessions, and momentum — quantified." },
  analytics: { title: "Analytics", blurb: "Apple-style charts across productivity, learning, career, and life. Trend lines that mean something." },
  settings: { title: "Settings", blurb: "Appearance, notifications, integrations, AI behavior, and your work schedule." },
};
