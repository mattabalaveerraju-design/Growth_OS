import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-[8px] border border-[#D9DEE7] bg-white px-3 py-2 text-sm font-normal text-[#10233F] shadow-none transition-colors placeholder:font-normal placeholder:text-[#8A96A8] hover:border-[#C7CEDA] focus-visible:border-[#4263EB] focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-[#E9ECF1] disabled:bg-[#F5F6F8] disabled:text-[#8A96A8] disabled:opacity-100 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
