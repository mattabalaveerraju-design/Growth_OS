"use client";

import React, { useState } from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // no-op (could report)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-[900px] p-8">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-soft">
            We encountered an error while rendering this section.
          </p>
          <details className="mt-4 text-xs text-ink-soft">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{String(this.state.error)}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  CheckSquare,
  CalendarDays,
  TimerReset,
  GraduationCap,
  Library,
  Target,
  FolderKanban,
  Briefcase,
  BriefcaseBusiness,
  Dumbbell,
  BarChart3,
  Settings,
  Plus,
  UploadCloud,
  Download,
  Menu,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { QuickAddDialog } from "@/components/quick-add";
import { ImportCenterDialog } from "@/components/import-center";
import { ExportCenterDialog } from "@/components/export-center";
import { Toaster } from "@/components/ui/sonner";

const navGroups = [
  {
    label: "HOME",
    items: [{ to: "/", label: "Command Center", icon: LayoutGrid }],
  },
  {
    label: "PLAN",
    items: [
      { to: "/tasks", label: "Tasks", icon: CheckSquare },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/focus", label: "Focus Mode", icon: TimerReset },
    ],
  },
  {
    label: "GROW",
    items: [
      { to: "/learning", label: "Learning", icon: GraduationCap },
      { to: "/knowledge", label: "Inspiration Library", icon: Library },
    ],
  },
  {
    label: "BUILD",
    items: [
      { to: "/goals", label: "Goals", icon: Target },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/jobs", label: "Jobs", icon: Briefcase },
      { to: "/freelancing", label: "Freelancing", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "LIFE",
    items: [{ to: "/exercise", label: "Exercise", icon: Dumbbell }],
  },
];

const secondaryNav = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

function isActiveNavItem(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [quickOpen, setQuickOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-surface text-ink">
      <Toaster position="bottom-right" />
      <QuickAddDialog open={quickOpen} onOpenChange={setQuickOpen} />
      <ImportCenterDialog open={importOpen} onOpenChange={setImportOpen} />
      <ExportCenterDialog open={exportOpen} onOpenChange={setExportOpen} />

      <div className="hidden lg:block">
        <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          <div className="shrink-0 px-5 pb-4 pt-5">
            <div className="flex items-center gap-2.5 border-b border-sidebar-border pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-border bg-white text-[11px] font-bold tracking-tight text-ink">
                G
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
                  GrowthOS
                </span>
                <span className="text-[11px] text-ink-soft">Personal OS</span>
              </div>
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-5">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft/60">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActiveNavItem(pathname, item.to);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`group flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-ink-soft hover:bg-sidebar-accent/60 hover:text-ink"
                          }`}
                        >
                          <Icon
                            className={`h-[15px] w-[15px] shrink-0 ${
                              active ? "text-primary" : "text-ink-soft/70 group-hover:text-ink-soft"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="shrink-0 border-t border-sidebar-border p-3">
            <div className="space-y-1">
              {secondaryNav.map((item) => {
                const active = isActiveNavItem(pathname, item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-ink-soft hover:bg-sidebar-accent/60 hover:text-ink"
                    }`}
                  >
                    <Icon
                      className={`h-[15px] w-[15px] shrink-0 ${
                        active ? "text-primary" : "text-ink-soft/70 group-hover:text-ink-soft"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-[8px] border border-border/60 bg-muted/40 px-2.5 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.95_0.03_260)] text-[11px] font-semibold text-ink">
                26
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">Balu Matta</div>
                <div className="truncate text-[11px] text-ink-soft">UX Designer</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex min-h-screen w-full lg:pl-64">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border bg-surface/80 px-4 md:px-6 lg:px-10 backdrop-blur-xl">
            <div className="flex w-full min-w-0 flex-1 items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="flex h-screen w-[300px] flex-col overflow-hidden p-0">
                  <div className="flex h-16 items-center border-b border-sidebar-border px-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white font-bold text-ink">
                      G
                    </div>

                    <div className="ml-3">
                      <div className="font-semibold text-ink">GrowthOS</div>
                      <div className="text-xs text-ink-soft">Personal OS</div>
                    </div>
                  </div>

                  <nav className="flex-1 space-y-5 overflow-y-auto p-3">
                    {navGroups.map((group) => (
                      <div key={group.label}>
                        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft/60">
                          {group.label}
                        </div>

                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActiveNavItem(pathname, item.to);

                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
                                  active
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-ink-soft hover:bg-sidebar-accent/60 hover:text-ink"
                                }`}
                              >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-1 border-t border-border pt-4">
                      {secondaryNav.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveNavItem(pathname, item.to);

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-ink-soft hover:bg-sidebar-accent/60 hover:text-ink"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              {title && (
                <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft/80">
                  {title.toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <Button
  variant="secondary"
  size="sm"
  className="rounded-lg border border-[#EEF1F5] bg-[#F8FAFC] text-[#344766] shadow-none transition-colors duration-150 hover:border-[#DDE3EA] hover:bg-[#F1F4F8] hover:text-[#10233F] active:bg-[#E9EDF2] focus-visible:border-[#4263EB] focus-visible:ring-0"
  onClick={() => setQuickOpen(true)}
>
  <Plus className="h-3.5 w-3.5" />
  Quick Add
</Button>

<Button
  variant="secondary"
  size="sm"
  className="rounded-lg border border-[#EEF1F5] bg-[#F8FAFC] text-[#344766] shadow-none transition-colors duration-150 hover:border-[#DDE3EA] hover:bg-[#F1F4F8] hover:text-[#10233F] active:bg-[#E9EDF2] focus-visible:border-[#4263EB] focus-visible:ring-0"
  onClick={() => setImportOpen(true)}
>
  <UploadCloud className="h-3.5 w-3.5" />
  Import
</Button>

<Button
  variant="secondary"
  size="sm"
  className="rounded-lg border border-[#EEF1F5] bg-[#F8FAFC] text-[#344766] shadow-none transition-colors duration-150 hover:border-[#DDE3EA] hover:bg-[#F1F4F8] hover:text-[#10233F] active:bg-[#E9EDF2] focus-visible:border-[#4263EB] focus-visible:ring-0"
  onClick={() => setExportOpen(true)}
>
  <Download className="h-3.5 w-3.5" />
  Export
</Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
