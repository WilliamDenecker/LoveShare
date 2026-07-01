"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  // Default to Marie-Laure to save a click
  const [username, setUsername] = useState("Marie-Laure"); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const user = username.trim();

    // 1. Check our specific users and passwords
    if (
      (user === "Marie-Laure" && password === "1512") ||
      (user === "William" && password === "2709")
    ) {
      // 2. Set a browser cookie to remember the session (lasts 30 days)
      document.cookie = `loveshare_user=${user}; path=/; max-age=2592000`;
      
      // 3. Redirect to the dashboard
      router.push("/dashboard");
    } else {
      setError("Incorrect password. Please try again.");
      setLoading(false);
    }
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
          <button type="button" onClick={() => { setUsername("Marie-Laure"); setPassword(""); setError(""); }} className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors ${username === "Marie-Laure" ? "border-rose-300 bg-rose-50 text-rose-500" : "border-rose-100 bg-white text-slate-600"}`}>
            Marie-Laure
          </button>
          <button type="button" onClick={() => { setUsername("William"); setPassword(""); setError(""); }} className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors ${username === "William" ? "border-rose-300 bg-rose-50 text-rose-500" : "border-rose-100 bg-white text-slate-600"}`}>
            William
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input
              value={username}
              readOnly
              className="w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 outline-none text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none ring-0 focus:border-rose-300"
              type="password"
              placeholder={`Enter ${username}'s password`}
              required
            />
          </div>
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</div> : null}
          <button className="w-full rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}