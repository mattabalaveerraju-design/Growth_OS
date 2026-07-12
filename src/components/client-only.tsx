"use client";

import { useEffect, useState, type ReactNode } from "react";

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function HydratedDate({
  value,
  fallback = "—",
  options,
}: {
  value: Date | string;
  fallback?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  const date = value instanceof Date ? value : new Date(value);
  const resolved = Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleDateString(undefined, options);

  return <>{resolved}</>;
}
