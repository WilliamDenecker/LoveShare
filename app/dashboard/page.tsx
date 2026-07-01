"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useCallback } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { Note, CalendarEvent } from "@/lib/types";
import { getCurrentUser, formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const { data: notesData } = await supabase
      .from("notes")
      .select("id, title, body, author, created_at, category_id, categories(name), tasks(id, description, is_complete, completed_by, completed_at)")
      .order("created_at", { ascending: false });

    if (notesData) {
      const formattedNotes = notesData.map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.body || "",
        category_id: n.category_id || null,
        category: n.categories?.name || "Uncategorized",
        created_at: n.created_at,
        author: n.author || "Unknown",
        tasks: (n.tasks || []).map((t: any) => ({ ...t, attachedPhotos: [] })),
      }));
      setNotes(formattedNotes);
      if (formattedNotes.length > 0) setExpandedNoteIds([formattedNotes[0].id]);
    }

    const { data: eventsData } = await supabase.from("events").select("*").order("start_time", { ascending: true });
    if (eventsData) setEvents(eventsData as CalendarEvent[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(notes.map((n) => n.category as string)))], [notes]);
  const filteredNotes = categoryFilter === "All" ? notes : notes.filter((n) => n.category === categoryFilter);

  const toggleNote = (noteId: string) => {
    setExpandedNoteIds((current) => current.includes(noteId) ? current.filter((id) => id !== noteId) : [...current, noteId]);
  };

  const handleTaskToggle = async (noteId: string, taskId: string, checked: boolean) => {
    const task = notes.find((n) => n.id === noteId)?.tasks?.find((t) => t.id === taskId);
    if (checked && (!task?.attachedPhotos?.length)) {
      alert("Please upload at least one photo before completing this task.");
      return;
    }

    const currentUser = getCurrentUser();

    setNotes((currentNotes) =>
      currentNotes.map((n) => n.id !== noteId ? n : {
        ...n,
        tasks: n.tasks?.map((t) => t.id !== taskId ? t : {
          ...t, is_complete: checked, completed_by: checked ? currentUser : null, completed_at: checked ? new Date().toISOString() : null,
        }),
      })
    );

    await supabase.from("tasks").update({
      is_complete: checked, completed_by: checked ? currentUser : null, completed_at: checked ? new Date().toISOString() : null,
    }).eq("id", taskId);
  };

  const handlePhotoUpload = (noteId: string, taskId: string, files: FileList | null) => {
    if (!files?.length) return;
    const uploadedUrls = Array.from(files).map((file) => URL.createObjectURL(file));

    setNotes((currentNotes) =>
      currentNotes.map((note) => note.id === noteId ? {
        ...note, tasks: note.tasks?.map((task) => task.id === taskId ? {
          ...task, attachedPhotos: [...(task.attachedPhotos || []), ...uploadedUrls]
        } : task),
      } : note)
    );
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#ffe4e6_52%,#ffd6d9_100%)]">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared home</p>
            <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          </div>
          <div className="rounded-2xl bg-white px-4 py-2 font-semibold text-rose-500 shadow-soft">Marie-Laure & William</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Notes & Tasks</h2>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm outline-none">
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading your world...</p>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">No notes found.</div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => {
                  const expanded = expandedNoteIds.includes(note.id);
                  return (
                    <div key={note.id} className="rounded-2xl border border-slate-100 bg-white">
                      <button onClick={() => toggleNote(note.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                        <div>
                          <span className="font-semibold text-slate-900">{note.title}</span>
                          <div className="mt-1 text-xs text-slate-400">{note.author}</div>
                        </div>
                        <span className="text-xl font-semibold text-rose-400">{expanded ? "−" : "+"}</span>
                      </button>

                      {expanded && (
                        <div className="border-t border-rose-50 px-4 py-3">
                          {note.body && <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.body}</p>}
                          <div className={`mt-3 flex items-center justify-between ${!note.body ? "border-t-0 pt-0" : ""}`}>
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.category}</span>
                            <span className="text-xs text-slate-400">{formatDateTime(note.created_at).dateOnly}</span>
                          </div>

                          {note.tasks && note.tasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {note.tasks.map((task) => (
                                <div key={task.id} className="rounded-2xl bg-rose-50 px-3 py-3">
                                  <label className="flex items-start gap-3">
                                    <input type="checkbox" checked={task.is_complete} onChange={(e) => handleTaskToggle(note.id, task.id, e.target.checked)} className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-500" />
                                    <span className={task.is_complete ? "line-through text-slate-500" : "text-slate-700"}>{task.description}</span>
                                  </label>
                                  {task.is_complete ? (
                                    <div className="mt-3">
                                      <div className="mb-2 text-xs font-semibold text-rose-500">Shared memories</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {(task.attachedPhotos || []).map((photo, i) => <Image key={i} src={photo} alt="Memory" width={300} height={120} unoptimized className="h-24 w-full rounded-xl object-cover" />)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-3">
                                      <label className="inline-flex cursor-pointer rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100">
                                        Upload photo to complete
                                        <input type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotoUpload(note.id, task.id, e.target.files)} />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-[28px] bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Calendar Overview</h2>
              <div className="space-y-2">
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500">No upcoming events.</p>
                ) : (
                  events.slice(0, 5).map((event) => (
                    <div key={event.id} className="rounded-2xl bg-slate-50 px-3 py-3 border border-slate-100">
                      <div className="font-semibold text-slate-800">{event.title}</div>
                      <div className="text-xs text-slate-500">{formatDateTime(event.start_time).full}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}