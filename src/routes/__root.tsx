import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getSupabaseClient } from "@/lib/supabase";
import { hydrateTasksFromSupabase } from "@/stores/useGrowthStores";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-5 py-10">
      <div className="w-full max-w-[420px] rounded-[22px] border border-[#e8e6df] bg-white px-6 py-8 shadow-[0_8px_32px_rgba(30,35,28,0.045)] sm:px-9 sm:py-10">
        <div>
          <p className="text-xs font-semibold tracking-[0.02em] text-ink">
            GrowthOS
          </p>
          <h1 className="mt-8 text-[30px] font-semibold leading-tight tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Continue where you left off.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="login-email"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-[13px] border border-[#dcded9] bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-[#92958f] focus:border-[#6b7068] focus-visible:ring-2 focus-visible:ring-[#27352d]/15"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="login-password" className="text-sm font-medium text-ink">
                Password
              </label>
              <span className="text-xs font-medium text-ink-soft">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-[13px] border border-[#dcded9] bg-white px-3.5 pr-12 text-sm text-ink outline-none transition placeholder:text-[#92958f] focus:border-[#6b7068] focus-visible:ring-2 focus-visible:ring-[#27352d]/15"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-[13px] text-ink-soft transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27352d]/30"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="h-[17px] w-[17px]" />
                ) : (
                  <Eye aria-hidden="true" className="h-[17px] w-[17px]" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <div role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 min-h-12 w-full rounded-[13px] bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100"
          >
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-7 border-t border-[#eeede8] pt-5 text-center">
          <p className="text-xs text-[#858981]">Your personal operating system.</p>
        </div>
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
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

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
      let currentUser = sessionData.session?.user ?? null;
      if (currentUser) {
        try {
          const { data: userData, error: userError } = await client.auth.getUser();
          if (!userError) currentUser = userData.user ?? currentUser;
        } catch (error) {
          console.error("Failed to restore the authenticated user:", error);
        }
      }
      if (!active) return;
      setSessionUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        void hydrateTasksFromSupabase();
      }
    };

    void syncSession();

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setSessionUser(session?.user ?? null);
        setAuthReady(true);
        return;
      }

      setSessionUser(session?.user ?? null);
      setAuthReady(true);
      if (session?.user) {
        window.setTimeout(() => {
          if (active) void hydrateTasksFromSupabase();
        }, 0);
      }
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

  const handlePasswordUpdate = async () => {
    const client = getSupabaseClient();

    if (!client) {
      setRecoveryError("Supabase is not configured.");
      return;
    }

    if (newPassword.length < 6) {
      setRecoveryError("Password must be at least 6 characters.");
      return;
    }

    setPending(true);
    setRecoveryError(null);

    try {
      const { error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setRecoverySuccess(true);
      setNewPassword("");

      const { data } = await client.auth.getUser();
      setSessionUser(data.user ?? null);
    } catch (error) {
      setRecoveryError(
        error instanceof Error
          ? error.message
          : "Unable to update password. Please try again.",
      );
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

  useEffect(() => {
    (globalThis as typeof globalThis & { __growthos_handleLogout?: () => Promise<void> }).__growthos_handleLogout = handleLogout;
  }, [handleLogout]);

  if (!authReady) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-sm text-ink-soft">Loading session...</div>
        </div>
      </QueryClientProvider>
    );
  }

  if (isRecovery) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
          <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                GrowthOS
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                Set new password
              </h1>
              <p className="mt-2 text-sm text-ink-soft">
                Enter a new password for your GrowthOS account.
              </p>
            </div>

            {recoverySuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  Password updated successfully.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsRecovery(false);
                    setSessionUser(null);
                    setRecoverySuccess(false);
                  }}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Continue to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handlePasswordUpdate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">
                    New password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                </div>

                {recoveryError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {recoveryError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Updating..." : "Update password"}
                </button>
              </form>
            )}
          </div>
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
      <Outlet />
    </QueryClientProvider>
  );
}
