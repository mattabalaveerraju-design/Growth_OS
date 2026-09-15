import type { ComponentProps, ReactNode } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const controlClassName =
  "h-11 w-full appearance-none rounded-[8px] border border-[#D9DEE7] bg-white px-3 py-2 text-sm font-normal text-[#10233F] shadow-none outline-none transition-colors hover:border-[#C7CEDA] focus:border-[#4263EB] focus:ring-0 disabled:cursor-not-allowed disabled:border-[#E9ECF1] disabled:bg-[#F5F6F8] disabled:text-[#8A96A8]";

export function SelectControl({
  className,
  children,
  ...props
}: ComponentProps<"select"> & { children: ReactNode }) {
  return (
    <div className="relative w-full">
      <select className={cn(className, controlClassName, "pr-10")} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#526684]"
        strokeWidth={1.75}
      />
    </div>
  );
}

export function DateControl({ className, ...props }: ComponentProps<"input">) {
  return (
    <div className="relative w-full">
      <input
        type="date"
        className={cn(controlClassName, "pr-10", className)}
        {...props}
      />
      <Calendar
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526684]"
        strokeWidth={1.75}
      />
    </div>
  );
}
