"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { CalendarEvent, Category } from "@/lib/types";
import { getCurrentUser, formatDateTime } from "@/lib/utils";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);

  const supabase = createClient();

  async function fetchData() {
    setLoading(true);
    const [eventsRes, catRes] = await Promise.all([
      supabase.from("events").select("*").order("start_time", { ascending: true }),
      supabase.from("categories").select("*").order("name", { ascending: true })
    ]);

    if (eventsRes.data) setEvents(eventsRes.data as CalendarEvent[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingEvent(true);

    const paddedTime = newTime.length === 4 ? `0${newTime}` : newTime;
    const start_time = new Date(`${newDate}T${paddedTime}`).toISOString();

    const { error } = await supabase.from("events").insert({
      title: newTitle,
      start_time,
      category: selectedCategoryName || null,
      author: getCurrentUser(),
    });

    if (error) alert("Error saving event: " + error.message);
    else {
      setIsEventModalOpen(false);
      setNewTitle(""); setNewDate(""); setNewTime(""); setSelectedCategoryName("");
      await fetchData();
    }
    setIsSavingEvent(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCat(true);

    const { error } = await supabase.from("categories").insert({ name: newCatName.trim(), color: "#f43f5e" });
    if (error) alert("Failed to create category: " + error.message);
    else {
      setNewCatName("");
      await fetchData(); 
    }
    setIsSavingCat(false);
  }

  async function handleDelete(table: "events" | "categories", id: string, warningMsg: string) {
    if (!confirm(warningMsg)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(`Failed to delete ${table}: ` + error.message);
    else await fetchData();
  }

  const openAndroidCalendar = (startTime: string) => {
    window.location.href = `content://com.android.calendar/time/${new Date(startTime).getTime()}`;
  };

  const filteredEvents = selectedFilter === "All" ? events : events.filter(e => e.category === selectedFilter);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fff1f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared calendar</p>
            <h1 className="text-3xl font-black text-slate-900">Calendar</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsCatModalOpen(true)} className="rounded-2xl border border-rose-200 bg-white px-4 py-2 font-semibold text-rose-500 shadow-soft hover:border-rose-300 transition-colors">Categories</button>
            <button onClick={() => setIsEventModalOpen(true)} className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors">New Event</button>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-slate-500">Filter by:</span>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="rounded-xl border border-rose-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-rose-300">
              <option value="All">All Events</option>
              {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading schedule...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">No events found.</div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const { dateOnly, timeOnly } = formatDateTime(event.start_time);

              return (
                <div key={event.id} className="relative flex flex-col gap-3 rounded-[24px] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
                  <div className="pr-8">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">{event.category || "Event"}</div>
                    <div className="text-lg font-semibold text-slate-900">{event.title}</div>
                    <div className="text-xs text-slate-400 mt-1">Added by {event.author}</div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <div className="text-sm font-semibold text-slate-700">{dateOnly}</div>
                    <div className="text-xs text-slate-500">{timeOnly}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button onClick={() => openAndroidCalendar(event.start_time)} className="flex-1 md:flex-none rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-500">Open App</button>
                    <button onClick={() => handleDelete("events", event.id, "Delete this event?")} className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400 hover:text-red-500">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add a new event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">What's happening?</label><input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none" placeholder="E.g., Dinner at Luigi's" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Date</label><input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Time (24h)</label><input required type="text" pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none" placeholder="19:30" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={selectedCategoryName} onChange={(e) => setSelectedCategoryName(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none">
                  <option value="">No category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSavingEvent} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white">{isSavingEvent ? "Saving..." : "Add Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400">✕</button>
            </div>
            <div className="mb-6 max-h-48 overflow-y-auto space-y-2 pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                  <button onClick={() => handleDelete("categories", cat.id, "Delete category? Events using it will become 'Uncategorized'.")} className="text-slate-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddCategory} className="border-t border-rose-50 pt-5">
              <div className="flex gap-2">
                <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 outline-none" placeholder="New category..." />
                <button type="submit" disabled={isSavingCat} className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}