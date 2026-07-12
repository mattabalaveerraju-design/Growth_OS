import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-dashed border-border/70 bg-card/60 p-8 text-center text-sm text-ink-soft">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}
