import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useSettingsStore } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — GrowthOS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: keyof typeof settings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    updateSettings({ [key]: value });
  };

  return (
    <AppShell title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Settings</h1>
          <p className="text-[13.5px] text-ink-soft">Tune GrowthOS to fit your day</p>
        </div>

        <div className="flex items-center gap-1.5 border-b border-border">
          {["Preferences", "Account", "Notifications", "AI Assistant", "Appearance"].map((t, i) => (
            <button
              key={t}
              className={`px-3 h-9 text-[13px] font-medium transition-colors relative ${
                i === 0 ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t}
              {i === 0 && <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.section
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="card-soft p-6"
          >
            <h2 className="font-display text-[16px] font-semibold tracking-tight">Preferences</h2>

            <Field label="Work Hours">
              <div className="grid grid-cols-2 gap-3">
                <EditableInput
                  value={localSettings.workHoursStart}
                  sub="Start Time"
                  onChange={(v) => handleChange("workHoursStart", v)}
                />
                <EditableInput
                  value={localSettings.workHoursEnd}
                  sub="End Time"
                  onChange={(v) => handleChange("workHoursEnd", v)}
                />
              </div>
            </Field>

            <Field label="Weekly Goal">
              <div className="grid grid-cols-2 gap-3">
                <EditableInput
                  value={localSettings.weeklyGoalHours.toString()}
                  sub="Total Hours Goal"
                  onChange={(v) => handleChange("weeklyGoalHours", isNaN(Number(v)) ? 0 : Number(v))}
                />
                <EditableInput
                  value={localSettings.weeklyGoalFocus}
                  sub="Focus on"
                  onChange={(v) => handleChange("weeklyGoalFocus", v)}
                />
              </div>
            </Field>

            <Field label="Theme">
              <div className="flex rounded-[10px] bg-muted p-0.5">
                {["Light", "Dark", "System"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange("theme", t as "Light" | "Dark" | "System")}
                    className={`flex-1 h-9 text-[12.5px] font-medium rounded-[8px] transition-colors ${
                      localSettings.theme === t ? "bg-card shadow-sm text-ink" : "text-ink-soft"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Language">
                <EditableInput
                  value={localSettings.language}
                  onChange={(v) => handleChange("language", v)}
                />
              </Field>
              <Field label="Time Zone">
                <EditableInput
                  value={localSettings.timeZone}
                  onChange={(v) => handleChange("timeZone", v)}
                />
              </Field>
            </div>

            <Field label="Default Task View">
              <EditableInput
                value={localSettings.defaultTaskView}
                onChange={(v) => handleChange("defaultTaskView", v)}
              />
            </Field>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="card-soft p-6"
          >
            <h2 className="font-display text-[16px] font-semibold tracking-tight">Focus Preferences</h2>

            <Toggle
              title="Focus Mode"
              sub="Block distractions during focus time"
              checked={localSettings.focusMode}
              onChange={(v) => handleChange("focusMode", v)}
            />
            <Toggle
              title="Pomodoro Timer"
              sub="Enable pomodoro intervals"
              checked={localSettings.pomodoroTimer}
              onChange={(v) => handleChange("pomodoroTimer", v)}
            />
            <Toggle
              title="Break Reminders"
              sub="Remind me to take breaks"
              checked={localSettings.breakReminders}
              onChange={(v) => handleChange("breakReminders", v)}
            />
            <Toggle
              title="Daily Review"
              sub="Daily review at the end of day"
              checked={localSettings.dailyReview}
              onChange={(v) => handleChange("dailyReview", v)}
            />
            <Toggle
              title="Weekly Recap"
              sub="Sunday recap with AI summary"
              checked={localSettings.weeklyRecap}
              onChange={(v) => handleChange("weeklyRecap", v)}
            />
            <Toggle
              title="Auto-schedule"
              sub="Let AI block calendar for me"
              checked={localSettings.autoSchedule}
              onChange={(v) => handleChange("autoSchedule", v)}
            />
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-[11.5px] font-semibold tracking-[0.1em] text-ink-soft/80 uppercase mb-2">{label}</div>
      {children}
    </div>
  );
}

function EditableInput({ value, sub, onChange }: { value: string; sub?: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-2.5">
      {sub && <div className="text-[10.5px] text-ink-soft/70 mb-0.5">{sub}</div>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px] font-medium text-ink bg-transparent outline-none w-full"
      />
    </div>
  );
}

function Toggle({ title, sub, checked, onChange }: { title: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-border/60 last:border-0">
      <div className="min-w-0 pr-6">
        <div className="text-[13.5px] font-semibold text-ink">{title}</div>
        <div className="text-[12px] text-ink-soft">{sub}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}
