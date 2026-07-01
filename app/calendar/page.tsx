"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  color: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
  category: string | null;
  author: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Filter State
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);

  const supabase = createClient();

  function getCurrentUser() {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(^| )loveshare_user=([^;]+)/);
      if (match) return match[2];
    }
    return "Unknown";
  }

  async function fetchData() {
    setLoading(true);
    const [eventsRes, catRes] = await Promise.all([
      supabase.from("events").select("*").order("start_time", { ascending: true }),
      supabase.from("categories").select("*").order("name", { ascending: true })
    ]);

    if (eventsRes.data) setEvents(eventsRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingEvent(true);
    const currentUser = getCurrentUser();

    // Ensure time is 5 characters (e.g. "9:30" becomes "09:30") to prevent database date errors
    const paddedTime = newTime.length === 4 ? `0${newTime}` : newTime;
    const start_time = new Date(`${newDate}T${paddedTime}`).toISOString();

    const { error } = await supabase.from("events").insert({
      title: newTitle,
      start_time: start_time,
      category: selectedCategoryName || null,
      author: currentUser,
    });

    if (!error) {
      setIsEventModalOpen(false);
      setNewTitle("");
      setNewDate("");
      setNewTime("");
      setSelectedCategoryName("");
      await fetchData();
    } else {
      alert("Error saving event: " + error.message);
    }
    setIsSavingEvent(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCat(true);

    const { error } = await supabase.from("categories").insert({
      name: newCatName.trim(),
      color: "#f43f5e",
    });

    if (error) {
      alert("Failed to create category: " + error.message);
    } else {
      setIsCatModalOpen(false);
      setNewCatName("");
      await fetchData(); 
    }
    setIsSavingCat(false);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      await fetchData();
    } else {
      alert("Failed to delete: " + error.message);
    }
  }

  const openAndroidCalendar = (startTime: string) => {
    const startMillis = new Date(startTime).getTime();
    window.location.href = `content://com.android.calendar/time/${startMillis}`;
  };

  const filteredEvents = selectedFilter === "All" 
    ? events 
    : events.filter(event => event.category === selectedFilter);

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
            <button 
              onClick={() => setIsCatModalOpen(true)}
              className="rounded-2xl border border-rose-200 bg-white px-4 py-2 font-semibold text-rose-500 shadow-soft hover:border-rose-300 transition-colors"
            >
              New Category
            </button>
            <button 
              onClick={() => setIsEventModalOpen(true)}
              className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors"
            >
              New Event
            </button>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-slate-500">Filter by:</span>
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)} 
              className="rounded-xl border border-rose-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-rose-300"
            >
              <option value="All">All Events</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading schedule...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">
            {events.length === 0 ? "No events scheduled yet. Add one to start planning!" : "No events match this category."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.start_time);
              
              // BULLETPROOF DATE FORMATTING: DD/MM/YYYY and strict 24h HH:mm
              const day = String(eventDate.getDate()).padStart(2, '0');
              const month = String(eventDate.getMonth() + 1).padStart(2, '0');
              const year = eventDate.getFullYear();
              const hours = String(eventDate.getHours()).padStart(2, '0');
              const minutes = String(eventDate.getMinutes()).padStart(2, '0');
              
              const formattedDate = `${day}/${month}/${year}`;
              const formattedTime = `${hours}:${minutes}`;

              return (
                <div key={event.id} className="relative flex flex-col gap-3 rounded-[24px] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
                  <div className="pr-8">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
                      {event.category || "Event"}
                    </div>
                    <div className="text-lg font-semibold text-slate-900">{event.title}</div>
                    <div className="text-xs text-slate-400 mt-1">Added by {event.author}</div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <div className="text-sm font-semibold text-slate-700">{formattedDate}</div>
                    <div className="text-xs text-slate-500">{formattedTime}</div>
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
      {isEventModalOpen && (
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time (24h)</label>
                  <input 
                    required 
                    type="text" 
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" 
                    placeholder="19:30"
                    title="Please enter a 24-hour time like 19:30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={selectedCategoryName} 
                  onChange={(e) => setSelectedCategoryName(e.target.value)} 
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSavingEvent} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {isSavingEvent ? "Saving..." : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Travel, Health" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSavingCat} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {isSavingCat ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}