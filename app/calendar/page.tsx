"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
  category: string | null;
  author: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  function getCurrentUser() {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(^| )loveshare_user=([^;]+)/);
      if (match) return match[2];
    }
    return "Unknown";
  }

  async function fetchEvents() {
    setLoading(true);
    // Fetch events ordered by the closest upcoming date
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: true });

    if (data) setEvents(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const currentUser = getCurrentUser();

    // Combine the HTML5 Date and Time inputs into a proper ISO String for the database
    const start_time = new Date(`${newDate}T${newTime}`).toISOString();

    const { error } = await supabase.from("events").insert({
      title: newTitle,
      start_time: start_time,
      category: newCategory || "event",
      author: currentUser,
    });

    if (!error) {
      setIsModalOpen(false);
      setNewTitle("");
      setNewDate("");
      setNewTime("");
      setNewCategory("");
      await fetchEvents();
    } else {
      alert("Error saving event: " + error.message);
    }
    setIsSaving(false);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      await fetchEvents();
    } else {
      alert("Failed to delete: " + error.message);
    }
  }

  const openAndroidCalendar = (startTime: string) => {
    const startMillis = new Date(startTime).getTime();
    window.location.href = `content://com.android.calendar/time/${startMillis}`;
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fff1f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared calendar</p>
            <h1 className="text-3xl font-black text-slate-900">Calendar</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors"
          >
            New Event
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading schedule...</p>
        ) : events.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">
            No events scheduled yet. Add one to start planning!
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const eventDate = new Date(event.start_time);
              return (
                <div key={event.id} className="relative flex flex-col gap-3 rounded-[24px] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
                  <div className="pr-8">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">{event.category || "Event"}</div>
                    <div className="text-lg font-semibold text-slate-900">{event.title}</div>
                    <div className="text-xs text-slate-400 mt-1">Added by {event.author}</div>
                  </div>
                  
                  <div className="text-sm font-semibold text-slate-700">
                    {eventDate.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-slate-500">
                    {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button onClick={() => openAndroidCalendar(event.start_time)} className="flex-1 md:flex-none rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-100 transition-colors">
                      Open App
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add a new event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What's happening?</label>
                <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Dinner at Luigi's" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input required type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category / Tag</label>
                <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Date Night, Medical" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {isSaving ? "Saving..." : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}