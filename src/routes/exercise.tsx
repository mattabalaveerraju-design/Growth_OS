import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon, moduleMeta } from "@/components/coming-soon";

export const Route = createFileRoute("/exercise")({
  component: () => <ComingSoon {...moduleMeta.exercise} />,
});
