import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BriefcaseBusiness, ChartColumn, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/freelancing")({
  head: () => ({ meta: [{ title: "Freelancing — GrowthOS" }] }),
  component: FreelancingPage,
});

function FreelancingPage() {
  return (
    <AppShell title="Freelancing">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em]">
              Freelancing
            </h1>
            <p className="text-[13.5px] text-ink-soft">
              Pipeline, pricing, and projects without losing track of your leads.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Open leads",
              value: "4",
              icon: Sparkles,
            },
            {
              label: "Active clients",
              value: "2",
              icon: BriefcaseBusiness,
            },
            {
              label: "Monthly revenue",
              value: "$2.8k",
              icon: ChartColumn,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.section
                key={item.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="card-soft p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft/70">
                      {item.label}
                    </p>
                    <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-ink">
                      {item.value}
                    </h2>
                  </div>
                  <div className="rounded-[10px] bg-muted p-2 text-ink-soft">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card-soft p-6"
        >
          <h2 className="font-display text-[18px] font-semibold tracking-tight">Pipeline overview</h2>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            This workspace is ready for your freelance operations, quoting workflow, and client planning.
          </p>
        </motion.section>
      </div>
    </AppShell>
  );
}
