"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const AUTH_STORAGE_KEY = "loveshare-auth-v1";

const usernameMap: Record<string, string> = {
  "Marie-Laure": "marie-laure@loveshare.app",
  William: "william@loveshare.app",
};

const fallbackCredentials: Record<string, string> = {
  "Marie-Laure": "1512",
  William: "2709",
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key"
  );

  useEffect(() => {
    async function redirectIfSignedIn() {
      const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        router.replace("/dashboard");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.session.user.email }));
        router.replace("/dashboard");
      }
    }

    redirectIfSignedIn();
  }, [router, supabase]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedUsername = username.trim();
    const email = usernameMap[normalizedUsername];

    if (!email) {
      setError("Choose Marie-Laure or William to continue.");
      setLoading(false);
      return;
    }

    if (fallbackCredentials[normalizedUsername] === password) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: normalizedUsername }));
      router.push("/dashboard");
      return;
    }

    const useSupabase = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("example.supabase.co") &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
    );

    if (!useSupabase) {
      setError("Use the couple password for this preview: 1512 for Marie-Laure or 2709 for William.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: normalizedUsername }));
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff8fa,#ffe5ec_45%,#ffd3d8_100%)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] bg-white/80 p-8 shadow-soft backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-3xl">💞</div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Private space for the two of you</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setUsername("Marie-Laure")} className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${username === "Marie-Laure" ? "border-rose-300 bg-rose-50 text-rose-500" : "border-rose-100 bg-white text-slate-600"}`}>
            Marie-Laure
          </button>
          <button type="button" onClick={() => setUsername("William")} className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${username === "William" ? "border-rose-300 bg-rose-50 text-rose-500" : "border-rose-100 bg-white text-slate-600"}`}>
            William
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none ring-0 focus:border-rose-300"
              placeholder="Marie-Laure or William"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none ring-0 focus:border-rose-300"
              type="password"
              placeholder="1512 or 2709"
              required
            />
          </div>
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</div> : null}
          <button className="w-full rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
