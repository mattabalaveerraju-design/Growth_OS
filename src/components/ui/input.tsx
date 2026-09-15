import * as React from "react";
import { Calendar } from "lucide-react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const input = (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[8px] border border-[#D9DEE7] bg-white px-3 py-2 text-sm font-normal text-[#10233F] shadow-none transition-colors placeholder:font-normal placeholder:text-[#8A96A8] hover:border-[#C7CEDA] focus-visible:border-[#4263EB] focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-[#E9ECF1] disabled:bg-[#F5F6F8] disabled:text-[#8A96A8] disabled:opacity-100 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
          type === "date" && "pr-10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (type === "date") {
      return (
        <div className="relative w-full">
          {input}
          <Calendar
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#526684]"
            strokeWidth={1.75}
          />
        </div>
      );
    }

    return (
      input
    );
  },
);
Input.displayName = "Input";

export { Input };
