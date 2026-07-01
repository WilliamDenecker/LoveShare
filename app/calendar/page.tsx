"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  startTime: string;
  category: string;
};

const SHARED_STORAGE_KEY = "loveshare-shared-state-v1";

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["General"]);
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", category: "General" });
  const [categoryDraft, setCategoryDraft] = useState("");

  const readSharedState = () => {
    const saved = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (!saved) {
      return { events: [] as EventItem[], categories: ["General"] as string[] };
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        events: parsed.events ?? [],
        categories: parsed.categories?.length ? parsed.categories : ["General"],
      };
    } catch {
      return { events: [] as EventItem[], categories: ["General"] as string[] };
    }
  };

  const persistSharedState = (nextState: Partial<{ events: EventItem[]; categories: string[] }>) => {
    const current = readSharedState();
    const merged = {
      events: nextState.events ?? current.events,
      categories: nextState.categories ?? current.categories,
      notes: [] as Array<{ id: string; title: string; body: string; category: string; updated_at: string; author: string }>,
    };

    const existing = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        merged.notes = parsed.notes ?? [];
      } catch {
        merged.notes = [];
      }
    }

    window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("loveshare-state-changed"));
  };

  useEffect(() => {
    const loadSharedState = () => {
      const state = readSharedState();
      setEvents(state.events);
      setCategories(state.categories);
    };

    loadSharedState();
    window.addEventListener("storage", loadSharedState);
    window.addEventListener("loveshare-state-changed", loadSharedState);

    return () => {
      window.removeEventListener("storage", loadSharedState);
      window.removeEventListener("loveshare-state-changed", loadSharedState);
    };
  }, []);

  useEffect(() => {
    persistSharedState({ events, categories });
  }, [events, categories]);

  const addCategory = () => {
    const value = categoryDraft.trim();
    if (!value) return;
    setCategories((current) => (current.includes(value) ? current : [...current, value]));
    setCategoryDraft("");
    setEventForm((current) => ({ ...current, category: value }));
  };

  const removeCategory = (category: string) => {
    if (category === "General") return;
    setCategories((current) => current.filter((item) => item !== category));
    setEvents((current) => current.map((event) => (event.category === category ? { ...event, category: "General" } : event)));
  };

  const addEvent = (event: React.FormEvent) => {
    event.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date) return;

    const category = eventForm.category || "General";
    if (!categories.includes(category)) {
      setCategories((current) => [...current, category]);
    }

    const startTime = eventForm.time ? `${eventForm.date}T${eventForm.time}` : eventForm.date;
    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time || "All day",
      startTime: new Date(startTime).toISOString(),
      category,
    };

    setEvents((current) => [newEvent, ...current]);
    setEventForm({ title: "", date: "", time: "", category });
  };

  const removeEvent = (eventId: string) => {
    setEvents((current) => current.filter((event) => event.id !== eventId));
  };

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

        <form onSubmit={addEvent} className="mb-4 rounded-[28px] bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} placeholder="Event title" className="rounded-xl border border-rose-100 px-3 py-2 text-sm" required />
            <input type="date" value={eventForm.date} onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))} className="rounded-xl border border-rose-100 px-3 py-2 text-sm" required />
            <input type="time" value={eventForm.time} onChange={(event) => setEventForm((current) => ({ ...current, time: event.target.value }))} className="rounded-xl border border-rose-100 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
              Add event
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <select value={eventForm.category} onChange={(event) => setEventForm((current) => ({ ...current, category: event.target.value }))} className="flex-1 rounded-xl border border-rose-100 px-3 py-2 text-sm">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button key={category} onClick={() => removeCategory(category)} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-soft">
              {category} ×
            </button>
          ))}
          <input value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} placeholder="New category" className="rounded-full border border-rose-100 px-3 py-1 text-xs" />
          <button onClick={addCategory} className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
            Add category
          </button>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-[24px] bg-white px-5 py-4 text-sm text-slate-500 shadow-soft">No calendar events yet. Add your first one above.</div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex flex-col gap-3 rounded-[24px] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">{event.category}</div>
                  <div className="text-lg font-semibold text-slate-900">{event.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-700">{event.date}</div>
                  <div className="text-xs text-slate-500">{event.time}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openAndroidCalendar(event.startTime)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-soft">
                    Open Android Calendar
                  </button>
                  <button onClick={() => removeEvent(event.id)} className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-500">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
