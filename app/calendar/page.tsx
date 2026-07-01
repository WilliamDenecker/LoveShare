"use client";

import { TopNav } from "@/components/TopNav";

const events = [
  { id: 1, title: "Anniversary dinner", date: "2026-07-04", category: "anniversary", time: "7:30 PM", startTime: "2026-07-04T19:30:00" },
  { id: 2, title: "Beach picnic", date: "2026-07-11", category: "date night", time: "4:00 PM", startTime: "2026-07-11T16:00:00" },
  { id: 3, title: "Doctor appointment", date: "2026-07-06", category: "reminder", time: "10:00 AM", startTime: "2026-07-06T10:00:00" },
];

export default function CalendarPage() {
  const openAndroidCalendar = (startTime: string) => {
    const startMillis = new Date(startTime).getTime();
    window.location.href = `content://com.android.calendar/time/${startMillis}`;
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fff1f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared calendar</p>
          <h1 className="text-3xl font-black text-slate-900">Calendar</h1>
        </div>

        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-3 rounded-[24px] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">{event.category}</div>
                <div className="text-lg font-semibold text-slate-900">{event.title}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-700">{event.date}</div>
                <div className="text-xs text-slate-500">{event.time}</div>
              </div>
              <button onClick={() => openAndroidCalendar(event.startTime)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-soft">
                Open Android Calendar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
