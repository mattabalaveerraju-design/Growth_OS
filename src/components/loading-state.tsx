export function LoadingState() {
  return (
    <div className="space-y-3 rounded-[20px] border border-border/70 bg-card/60 p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-[14px] bg-muted/70" />
      ))}
    </div>
  );
}
