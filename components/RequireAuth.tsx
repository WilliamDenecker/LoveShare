"use client";

import { createBrowserClient } from "@supabase/ssr";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "loveshare-auth-v1";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/auth/login") {
      setReady(true);
      return;
    }

    const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      setReady(true);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key"
    );

    let active = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!active) return;

      if (!data.session) {
        router.replace("/auth/login");
        return;
      }

      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.session.user.email }));
      setReady(true);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready && pathname !== "/auth/login") {
    return null;
  }

  return <>{children}</>;
}
