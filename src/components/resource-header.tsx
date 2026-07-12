interface ResourceHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

export function ResourceHeader({ title, description, badge }: ResourceHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {badge ? (
          <span className="rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-ink-soft">{description}</p>
    </div>
  );
}
