import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useModalBodyScrollLock(active?: boolean) {
  const previousOverflow = useRef("");
  const previousPaddingRight = useRef("");

  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const root = document.documentElement;
    if (!body || !root) return;

    const count = Number(root.dataset.growthosModalOpenCount ?? "0") + 1;
    root.dataset.growthosModalOpenCount = String(count);

    if (count === 1) {
      previousOverflow.current = body.style.overflow;
      previousPaddingRight.current = body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }
      body.style.overflow = "hidden";
      root.style.overflow = "hidden";
    }

    return () => {
      const nextCount = Number(root.dataset.growthosModalOpenCount ?? "1") - 1;
      if (nextCount <= 0) {
        root.removeAttribute("data-growthosModalOpenCount");
        body.style.overflow = previousOverflow.current;
        body.style.paddingRight = previousPaddingRight.current;
        root.style.overflow = "";
      } else {
        root.dataset.growthosModalOpenCount = String(nextCount);
      }
    };
  }, [active]);
}
