import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useCalendarStore } from "@/stores/useGrowthStores";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — GrowthOS" }] }),
  component: CalendarPage,
});

type CalendarView = "Day" | "Week" | "Month";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  category?: string;
  notes?: string;
};

const toneClass: Record<string, string> = {
  default: "bg-[oklch(0.95_0.04_275)] text-[oklch(0.32_0.18_275)] border-l-2 border-primary",
  work: "bg-[oklch(0.96_0.06_75)] text-[oklch(0.4_0.16_60)] border-l-2 border-warning",
  learning: "bg-[oklch(0.95_0.05_140)] text-[oklch(0.42_0.16_150)] border-l-2 border-violet",
  personal: "bg-[oklch(0.94_0.05_155)] text-[oklch(0.32_0.16_155)] border-l-2 border-success",
  exercise: "bg-[oklch(0.95_0.05_25)] text-[oklch(0.42_0.18_25)] border-l-2 border-danger",
};

const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekDays(selected: Date) {
  const date = new Date(selected);
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return next;
  });
}

function getMonthGrid(selected: Date) {
  const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate();
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - startDay + 1;
    const date = new Date(selected.getFullYear(), selected.getMonth(), day);
    return {
      date,
      currentMonth: day >= 1 && day <= daysInMonth,
    };
  });
}

function toTimeLabel(time?: string) {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = minuteStr ?? "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function CalendarPage() {
  const events = useCalendarStore((state) => state.events);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);

  const [view, setView] = useState<CalendarView>("Week");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: formatIso(new Date()),
    time: "09:00",
    category: "",
    notes: "",
  });

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  const visibleEvents = useMemo(() => {
    if (view === "Day") {
      return events.filter((event) => event.date === formatIso(currentDate));
    }
    if (view === "Week") {
      const weekDates = weekDays.map(formatIso);
      return events.filter((event) => weekDates.includes(event.date));
    }
    return events;
  }, [events, view, currentDate, weekDays]);

  const openNewEvent = () => {
    setActiveEvent(null);
    setForm({ title: "", date: formatIso(currentDate), time: "09:00", category: "", notes: "" });
    setDialogOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setActiveEvent(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time ?? "09:00",
      category: event.category ?? "",
      notes: event.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      category: form.category.trim() || "",
      notes: form.notes.trim() || "",
    };

    if (activeEvent) {
      updateEvent(activeEvent.id, payload);
    } else {
      addEvent(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!activeEvent) return;
    deleteEvent(activeEvent.id);
    setDeleteOpen(false);
    setDialogOpen(false);
  };

  const moveDate = (direction: number) => {
    const next = new Date(currentDate);
    if (view === "Day") {
      next.setDate(next.getDate() + direction);
    } else if (view === "Week") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setMonth(next.getMonth() + direction);
    }
    setCurrentDate(next);
  };

  const today = () => setCurrentDate(new Date());

  return (
    <AppShell title="Calendar">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">Calendar</h1>
            <p className="text-[13.5px] text-ink-soft">
              {view === "Month"
                ? currentDate.toLocaleString(undefined, { month: "long", year: "numeric" })
                : `${weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
            </p>
          </div>
          <div className="space-y-2">
            {/* First Row */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex shrink-0 rounded-[10px] border border-border bg-card p-0.5">
                {(["Day", "Week", "Month"] as CalendarView[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`h-8 rounded-[8px] px-3 text-[12.5px] font-medium transition-colors ${
                      view === v ? "bg-ink text-background" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 items-center justify-center gap-0.5 rounded-[10px] border border-border bg-card h-9 px-2">
                <button
                  type="button"
                  onClick={() => moveDate(-1)}
                  className="grid h-7 w-7 place-items-center"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button type="button" onClick={today} className="px-3 text-sm font-medium">
                  Today
                </button>

                <button
                  type="button"
                  onClick={() => moveDate(1)}
                  className="grid h-7 w-7 place-items-center"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Second Row */}
            <button
              type="button"
              onClick={openNewEvent}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Event
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-soft overflow-hidden"
        >
          {visibleEvents.length === 0 ? (
            <div className="p-10 text-center text-ink-soft">
              <div className="text-[15px] font-semibold mb-2">No events yet</div>
              <div className="text-[13px]">
                Create an event to populate your calendar and keep your schedule in one place.
              </div>
            </div>
          ) : view === "Month" ? (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.12em] text-ink-soft/70 mb-2">
                {weekDayNames.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((cell) => {
                  const dateKey = formatIso(cell.date);
                  const dayEvents = events.filter((event) => event.date === dateKey);
                  return (
                    <div
                      key={`${dateKey}-${cell.currentMonth ? "current" : "other"}`}
                      className={`min-h-[96px] rounded-[18px] p-3 ${cell.currentMonth ? "bg-card border border-border" : "bg-muted/60 text-ink-soft"}`}
                    >
                      <div className="text-[11px] font-semibold">{cell.date.getDate()}</div>
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => openEditEvent(event)}
                            className="w-full rounded-[14px] bg-muted p-2 text-left text-[11px] font-medium text-ink-soft hover:bg-accent/30"
                          >
                            <div className="truncate">{event.title}</div>
                            {event.time && (
                              <div className="text-[10px] text-ink-soft/80">
                                {toTimeLabel(event.time)}
                              </div>
                            )}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-ink-soft/80">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
              <div className="px-2 py-3 text-[10.5px] text-ink-soft/60" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="px-3 py-3 text-[12px] font-medium text-ink-soft"
                >
                  <div className="text-[10.5px] tracking-wide uppercase">
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div className="text-[18px] font-display font-semibold text-ink">
                    {day.getDate()}
                  </div>
                </div>
              ))}

              {Array.from({ length: 10 }, (_, index) => {
                const hour = 9 + index;
                return (
                  <div key={hour} className="border-t border-border/60">
                    <div className="h-[60px] px-2 pr-3 text-right pt-1 text-[10.5px] text-ink-soft/60">
                      {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </div>
                  </div>
                );
              })}

              {weekDays.map((day) => (
                <div key={day.toISOString()} className="relative border-l border-border/60">
                  {Array.from({ length: 10 }, (_, index) => (
                    <div key={index} className="h-[60px] border-t border-border/40" />
                  ))}
                  {events
                    .filter((event) => event.date === formatIso(day))
                    .map((event) => {
                      const [hourStr, minuteStr] = event.time?.split(":") ?? ["9", "00"];
                      const hour = Number(hourStr);
                      const minute = Number(minuteStr || "0");
                      const top = (hour - 9) * 60 + minute;
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openEditEvent(event)}
                          style={{ top, height: 50 }}
                          className={`absolute left-1.5 right-1.5 rounded-[10px] px-2.5 py-1.5 text-[11.5px] font-medium text-left ${toneClass[event.category?.toLowerCase() ?? "default"]}`}
                        >
                          <div className="truncate">{event.title}</div>
                          <div className="text-[10px] opacity-70">{toTimeLabel(event.time)}</div>
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-3xl overflow-hidden p-0 sm:rounded-[24px]">
          <div className="flex max-h-[calc(100vh-24px)] flex-col">
            <DialogHeader className="px-4 py-4 sm:px-6">
              <DialogTitle>{activeEvent ? "Edit Event" : "Add Event"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[12px] font-medium text-ink-soft">Title</label>
                    <Input
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, title: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-ink-soft">Date</label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, date: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[12px] font-medium text-ink-soft">Time</label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, time: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-ink-soft">Category</label>
                    <Input
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, category: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-ink-soft">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="mt-2 min-h-[120px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-border px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="h-9 rounded-[10px] border border-border px-4 text-sm text-ink-soft hover:bg-muted"
              >
                Cancel
              </button>
              {activeEvent && (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="h-9 rounded-[10px] border border-danger px-4 text-sm text-danger hover:bg-danger/10"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
