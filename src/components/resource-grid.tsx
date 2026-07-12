import type { ResourceItem } from "@/lib/resource-types";
import { EmptyState } from "@/components/empty-state";
import { ResourceCard } from "@/components/resource-card";

interface ResourceGridProps {
  items: ResourceItem[];
  onOpen: (item: ResourceItem) => void;
  onFavorite?: (item: ResourceItem) => void;
}

export function ResourceGrid({ items, onOpen, onFavorite }: ResourceGridProps) {
  if (!items.length) {
    return (
      <EmptyState
        title="No resources yet"
        description="Create your first resource to start organizing your learning."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ResourceCard key={item.id} item={item} onOpen={onOpen} onFavorite={onFavorite} />
      ))}
    </div>
  );
}
