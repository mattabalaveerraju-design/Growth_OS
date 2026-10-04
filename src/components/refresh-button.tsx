import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useApplicationStore,
  useCalendarStore,
  useDailyChecklistStore,
  useExerciseStore,
  useFocusStore,
  useFreelanceStore,
  useGoalStore,
  useInterviewStore,
  useLearningStore,
  useProjectsStore,
  useReadingStore,
  useSettingsStore,
  useTaskStore,
  useVaultStore,
  refreshFocusFromSupabase,
  refreshTasksFromSupabase,
} from "@/stores/useGrowthStores";

type RefreshEventDetail = {
  promises: Promise<void>[];
};

export function registerPageRefreshHandler(handler: () => Promise<void>) {
  const listener = (event: Event) => {
    const refreshEvent = event as CustomEvent<RefreshEventDetail>;
    refreshEvent.detail.promises.push(handler());
  };

  window.addEventListener("growthos:refresh", listener);
  return () => window.removeEventListener("growthos:refresh", listener);
}

const refreshAllLocalStores = [
  () => useDailyChecklistStore.persist.rehydrate(),
  () => useLearningStore.persist.rehydrate(),
  () => useCalendarStore.persist.rehydrate(),
  () => useVaultStore.persist.rehydrate(),
  () => useInterviewStore.persist.rehydrate(),
  () => useProjectsStore.persist.rehydrate(),
  () => useApplicationStore.persist.rehydrate(),
  () => useReadingStore.persist.rehydrate(),
  () => useExerciseStore.persist.rehydrate(),
  () => useFreelanceStore.persist.rehydrate(),
  () => useGoalStore.persist.rehydrate(),
  () => useSettingsStore.persist.rehydrate(),
];

function localRefreshersForPath(pathname: string) {
  if (pathname === "/") return refreshAllLocalStores;
  if (pathname.startsWith("/tasks")) return [];
  if (pathname.startsWith("/consistency")) return [refreshAllLocalStores[0]];
  if (pathname.startsWith("/learning")) return [refreshAllLocalStores[1]];
  if (pathname.startsWith("/calendar")) return [refreshAllLocalStores[2]];
  if (pathname.startsWith("/knowledge")) return [refreshAllLocalStores[3]];
  if (pathname.startsWith("/reading")) return [refreshAllLocalStores[4]];
  if (pathname.startsWith("/projects")) return [refreshAllLocalStores[5]];
  if (pathname.startsWith("/jobs")) return [refreshAllLocalStores[6]];
  if (pathname.startsWith("/exercise")) return [refreshAllLocalStores[8]];
  if (pathname.startsWith("/freelancing")) return [refreshAllLocalStores[9]];
  if (pathname.startsWith("/focus")) return [];
  if (pathname.startsWith("/goals")) return [refreshAllLocalStores[10]];
  if (pathname.startsWith("/settings")) return [refreshAllLocalStores[11]];
  return [];
}

export function RefreshButton() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await Promise.all(localRefreshersForPath(pathname).map((refresh) => refresh()));

      if (
        pathname.startsWith("/tasks") ||
        pathname === "/" ||
        pathname.startsWith("/analytics")
      ) {
        await refreshTasksFromSupabase({ force: true });
      }
      if (pathname.startsWith("/focus") || pathname === "/") {
        await refreshFocusFromSupabase();
      }
      const detail: RefreshEventDetail = { promises: [] };
      window.dispatchEvent(new CustomEvent("growthos:refresh", { detail }));
      await Promise.all(detail.promises);
    } catch (error) {
      console.error("Failed to refresh page data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={refreshing}
      className="rounded-lg border border-[#EEF1F5] bg-[#F8FAFC] text-[#344766] shadow-none transition-colors duration-150 hover:border-[#DDE3EA] hover:bg-[#F1F4F8] hover:text-[#10233F] active:bg-[#E9EDF2] focus-visible:border-[#4263EB] focus-visible:ring-0"
      onClick={() => void handleRefresh()}
    >
      <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}