"use client";

import React, { useState } from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
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
          <p className="mt-2 text-sm text-ink-soft">We encountered an error while rendering this section.</p>
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
  CheckCircle2,
  GraduationCap,
  Library,
  Briefcase,
  FolderKanban,
  BookOpen,
  Dumbbell,
  Target,
  Calendar,
  BarChart3,
  Sparkles,
  Flame,
  Focus,
  Settings,
  Search,
  Command,
  Plus,
  UploadCloud,
  Download,
  Menu,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { QuickAddDialog } from "@/components/quick-add";
import { ImportCenterDialog } from "@/components/import-center";
import { ExportCenterDialog } from "@/components/export-center";
import { Toaster } from "@/components/ui/sonner";

const modules = [
  { group: "WORKSPACE", items: [
    { to: "/", label: "Command Center", icon: LayoutGrid },
    { to: "/tasks", label: "Tasks", icon: CheckCircle2 },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/focus", label: "Focus Mode", icon: Focus },
  ]},
  { group: "GROWTH", items: [
    { to: "/learning", label: "Learning", icon: GraduationCap },
    { to: "/knowledge", label: "Knowledge Vault", icon: Library },
    { to: "/reading", label: "Reading", icon: BookOpen },
    { to: "/goals", label: "Goals", icon: Target },
  ]},
  { group: "CAREER", items: [
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/coach", label: "AI Coach", icon: Sparkles },
  ]},
  { group: "LIFE", items: [
    { to: "/exercise", label: "Exercise", icon: Dumbbell },
    { to: "/consistency", label: "Consistency", icon: Flame },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

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
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border min-w-0">
            <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-primary to-violet grid place-items-center text-primary-foreground font-display font-bold text-sm shadow-sm">
              G
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-[15px] tracking-tight">GrowthOS</span>
              <span className="text-[11px] text-ink-soft">Personal OS</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {modules.map((group) => (
              <div key={group.group}>
                <div className="px-3 pb-2 text-[10px] font-semibold tracking-[0.12em] text-ink-soft/70">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`group flex items-center gap-2.5 min-w-0 w-full rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-all ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-ink-soft hover:bg-sidebar-accent/50 hover:text-ink"
                        }`}
                      >
                        <Icon className={`h-[16px] w-[16px] ${active ? "text-primary" : "text-ink-soft/70 group-hover:text-ink-soft"}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 px-2 py-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet to-primary grid place-items-center text-primary-foreground text-xs font-semibold">
                AR
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold truncate">Balu Matta</div>
                <div className="text-[11px] text-ink-soft truncate">UX Designer</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-4 md:px-6 lg:px-10 backdrop-blur-xl">
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden w-full">

  <Sheet>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>

    <SheetContent side="left" className="w-72 p-0">

  <div className="flex h-16 items-center border-b border-sidebar-border px-5">
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-violet flex items-center justify-center text-white font-bold">
      G
    </div>

    <div className="ml-3">
      <div className="font-semibold">GrowthOS</div>
      <div className="text-xs text-ink-soft">
        Personal OS
      </div>
    </div>
  </div>

  <nav className="overflow-y-auto p-3 space-y-5">

    {modules.map((group) => (

      <div key={group.group}>

        <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-ink-soft">
          {group.group}
        </div>

        <div className="space-y-1">

          {group.items.map((item) => {

            const Icon = item.icon;

            const active = pathname === item.to;

            return (

              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 min-w-0 rounded-lg px-3 py-3 transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />

                <span>{item.label}</span>

              </Link>

            );

          })}

        </div>

      </div>

    ))}

  </nav>

</SheetContent>
  </Sheet>

  {title && (
    <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-soft/80">
      {title.toUpperCase()}
    </div>
  )}

</div>
            <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end max-w-full">
              <Button variant="secondary" size="sm" onClick={() => setQuickOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Quick Add
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
                <UploadCloud className="h-3.5 w-3.5" /> Import
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setExportOpen(true)}>
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {/* ErrorBoundary keeps the page from collapsing if a widget throws */}
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
