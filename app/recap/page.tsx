"use client";

import Image from "next/image";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";

const recapItems = [
  {
    id: 1,
    title: "Sunset dinner reservation",
    note: "We made our anniversary dinner reservation and saved the evening for our favorite table.",
    date: "2026-06-14",
    period: "Month",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Summer passport check",
    note: "We finished the travel prep and had our passports ready for the trip ahead.",
    date: "2026-06-21",
    period: "Year",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Beach picnic date",
    note: "A simple picnic by the shore, with our favorite snacks and music for the afternoon.",
    date: "2026-07-11",
    period: "All time",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Gift planning",
    note: "We picked out a thoughtful anniversary gift and wrapped it with care.",
    date: "2026-05-18",
    period: "Year",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function RecapPage() {
  const [period, setPeriod] = useState("Month");

  const visibleItems = recapItems.filter((item) => (period === "All time" ? true : item.period === period));

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

        <div className="space-y-4">
          {visibleItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] bg-white shadow-soft">
              <Image src={item.image} alt={item.title} width={800} height={224} unoptimized className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{item.date}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
