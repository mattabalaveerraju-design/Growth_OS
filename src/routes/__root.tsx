import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getSupabaseClient } from "@/lib/supabase";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthLoginScreen({
  onLogin,
  pending,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  pending: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    try {
      await onLogin(email.trim(), password);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to log in. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            GrowthOS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Log in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Email / Username</label>
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [sessionUser, setSessionUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setAuthReady(true);
      return;
    }

    let active = true;

    const syncSession = async () => {
      const { data: sessionData } = await client.auth.getSession();
      const { data: userData } = await client.auth.getUser();
      if (!active) return;
      setSessionUser(userData.user ?? sessionData.session?.user ?? null);
      setAuthReady(true);
    };

    void syncSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSessionUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase is not configured.");
    }

    setPending(true);
    setAuthError(null);

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) {
        throw userError;
      }

      const nextUser = userData.user ?? data.user ?? null;
      setSessionUser(nextUser as { id: string; email?: string | null } | null);
      setAuthReady(true);
    } finally {
      setPending(false);
    }
  };

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthError("Supabase is not configured.");
      return;
    }

    const { error } = await client.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }

    setSessionUser(null);
    setAuthReady(true);
  };

  if (!authReady) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-sm text-ink-soft">Loading session...</div>
        </div>
      </QueryClientProvider>
    );
  }

  if (!sessionUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthLoginScreen onLogin={handleLogin} pending={pending} />
        {authError ? (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
            {authError}
          </div>
        ) : null}
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="border-b border-border bg-background/90 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="text-sm text-ink-soft">
            Signed in as <span className="font-medium text-ink">{sessionUser.email ?? "Supabase user"}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-accent"
          >
            Log out
          </button>
        </div>
      </div>
      <Outlet />
    </QueryClientProvider>
  );
}
