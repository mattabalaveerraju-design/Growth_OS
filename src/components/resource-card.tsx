import { BookOpen, FileText, Heart, Star } from "lucide-react";
import type { ResourceItem } from "@/lib/resource-types";

interface ResourceCardProps {
  item: ResourceItem;
  onOpen: (item: ResourceItem) => void;
  onFavorite?: (item: ResourceItem) => void;
}

export function ResourceCard({ item, onOpen, onFavorite }: ResourceCardProps) {
  const icon =
    item.category === "pdf" || item.filename?.toLowerCase().includes("pdf") ? FileText : BookOpen;
  const Icon = icon;
  const tags = [item.category, ...(item.tags ?? [])].filter(Boolean).slice(0, 3);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item);
        }
      }}
      className="group min-h-[220px] cursor-pointer rounded-[22px] border border-border/70 bg-card/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {onFavorite ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFavorite(item);
            }}
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-muted"
          >
            {item.favorite ? (
              <Heart className="h-4 w-4 fill-current text-rose-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{item.title}</p>
          {item.favorite ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
        </div>
        <p className="line-clamp-2 text-xs text-ink-soft">
          {item.description ?? item.notes ?? item.source ?? "No summary yet"}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] text-ink-soft">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
        {item.progressPercentage ? (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-ink-soft">Progress {item.progressPercentage}%</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
