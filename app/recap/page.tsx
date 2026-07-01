"use client";

import { useState } from "react";
import { TopNav } from "@/components/TopNav";

export default function RecapPage() {
  const [period, setPeriod] = useState("Month");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fff1f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Memory lane</p>
          <h1 className="text-3xl font-black text-slate-900">Recap</h1>
        </div>

        <div className="mb-6 rounded-[28px] bg-white px-5 py-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Focus</span>
            <span className="text-sm font-semibold text-rose-500">{period}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            value={period === "Month" ? 0 : period === "Year" ? 1 : 2}
            onChange={(event) => {
              const value = Number(event.target.value);
              setPeriod(value === 0 ? "Month" : value === 1 ? "Year" : "All time");
            }}
            className="w-full accent-rose-500"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Month</span>
            <span>Year</span>
            <span>All time</span>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
          Your recap will appear here once you add notes, tasks, and calendar moments.
        </div>
      </div>
    </main>
  );
}
