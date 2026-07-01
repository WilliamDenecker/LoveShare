"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

type TaskType = {
  id: string;
  description: string;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
  attachedPhotos: string[];
};

type NoteType = {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  author: string;
  tasks: TaskType[];
};

export default function DashboardPage() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  
  // State to prevent the React Hydration freeze!
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Fetch real notes, their categories, and their tasks
    const { data: notesData } = await supabase
      .from("notes")
      .select(`
        id, title, body, author, created_at,
        categories(name),
        tasks(id, description, is_complete, completed_by, completed_at)
      `)
      .order("created_at", { ascending: false });

    if (notesData) {
      const formattedNotes = notesData.map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.body || "",
        category: n.categories?.name || "Uncategorized",
        created_at: n.created_at,
        author: n.author || "Unknown",
        tasks: (n.tasks || []).map((t: any) => ({
          ...t,
          attachedPhotos: [] // Local photos for now
        })),
      }));
      setNotes(formattedNotes);
      // Automatically expand the first note if it exists
      if (formattedNotes.length > 0) setExpandedNoteIds([formattedNotes[0].id]);
    }

    // Fetch calendar events
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: true });
      
    if (eventsData) setEvents(eventsData);

    setLoading(false);
  }

  const categories = useMemo(() => ["All", ...Array.from(new Set(notes.map((note) => note.category)))], [notes]);

  const filteredNotes = categoryFilter === "All" ? notes : notes.filter((note) => note.category === categoryFilter);

  const toggleNote = (noteId: string) => {
    setExpandedNoteIds((current) => (current.includes(noteId) ? current.filter((id) => id !== noteId) : [...current, noteId]));
  };

  const handleTaskToggle = async (noteId: string, taskId: string, checked: boolean) => {
    const note = notes.find((n) => n.id === noteId);
    const task = note?.tasks.find((t) => t.id === taskId);

    // Keep your required photo rule!
    if (checked && (!task?.attachedPhotos || task.attachedPhotos.length === 0)) {
      window.alert("Please upload at least one photo before completing this task.");
      return;
    }

    // Get the current logged in person
    const currentUser = document.cookie.match(/(^| )loveshare_user=([^;]+)/)?.[2] || "You";

    // Update UI instantly
    setNotes((currentNotes) =>
      currentNotes.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          tasks: n.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              is_complete: checked,
              completed_by: checked ? currentUser : null,
              completed_at: checked ? new Date().toISOString() : null,
            };
          }),
        };
      })
    );

    // Update Database in the background
    await supabase
      .from("tasks")
      .update({
        is_complete: checked,
        completed_by: checked ? currentUser : null,
        completed_at: checked ? new Date().toISOString() : null,
      })
      .eq("id", taskId);
  };

  const handlePhotoUpload = (noteId: string, taskId: string, files: FileList | null) => {
    if (!files?.length) return;

    // Creates a temporary local URL for the photo so you can see it instantly
    const uploadedUrls = Array.from(files).map((file) => URL.createObjectURL(file));

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              tasks: note.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, attachedPhotos: [...(task.attachedPhotos ?? []), ...uploadedUrls] }
                  : task
              ),
            }
          : note
      )
    );
  };

  // Prevent rendering until the client is ready to avoid the freeze!
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
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading your world...</p>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">
                You haven't written any notes yet! Head to the Notes tab to start.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => {
                  const expanded = expandedNoteIds.includes(note.id);
                  
                  // Bulletproof Date format for Notes
                  const d = new Date(note.created_at);
                  const formattedNoteDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

                  return (
                    <div key={note.id} className="rounded-2xl border border-slate-100 bg-white">
                      <button onClick={() => toggleNote(note.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                        <div>
                          <span className="font-semibold text-slate-900">{note.title}</span>
                          <div className="mt-1 text-xs text-slate-400">{note.author}</div>
                        </div>
                        <span className="text-xl font-semibold text-rose-400">{expanded ? "−" : "+"}</span>
                      </button>

                      {expanded ? (
                        <div className="border-t border-rose-50 px-4 py-3">
                          {note.body && <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.body}</p>}
                          <div className={`mt-3 flex items-center justify-between ${!note.body ? "border-t-0 pt-0" : ""}`}>
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.category}</span>
                            <span className="text-xs text-slate-400">{formattedNoteDate}</span>
                          </div>

                          {note.tasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {note.tasks.map((task) => (
                                <div key={task.id} className="rounded-2xl bg-rose-50 px-3 py-3">
                                  <label className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={task.is_complete}
                                      onChange={(event) => handleTaskToggle(note.id, task.id, event.target.checked)}
                                      className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-300"
                                    />
                                    <span className={task.is_complete ? "line-through text-slate-500" : "text-slate-700"}>{task.description}</span>
                                  </label>

                                  {task.is_complete ? (
                                    <div className="mt-3">
                                      <div className="mb-2 text-xs font-semibold text-rose-500">Shared memories</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {(task.attachedPhotos ?? []).map((photo, index) => (
                                          <Image key={`${task.id}-${index}`} src={photo} alt="Completed task memory" width={300} height={120} unoptimized className="h-24 w-full rounded-xl object-cover" />
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-3">
                                      <label className="inline-flex cursor-pointer rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-100 transition-colors">
                                        Upload photo to complete
                                        <input type="file" accept="image/*" multiple hidden onChange={(event) => handlePhotoUpload(note.id, task.id, event.target.files)} />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
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
                  events.slice(0, 5).map((event) => {
                    // Bulletproof Date format for Dashboard Calendar View
                    const eDate = new Date(event.start_time);
                    const eDay = String(eDate.getDate()).padStart(2, '0');
                    const eMonth = String(eDate.getMonth() + 1).padStart(2, '0');
                    const eYear = eDate.getFullYear();
                    const eHours = String(eDate.getHours()).padStart(2, '0');
                    const eMins = String(eDate.getMinutes()).padStart(2, '0');
                    const formattedEventDate = `${eDay}/${eMonth}/${eYear}, ${eHours}:${eMins}`;

                    return (
                      <div key={event.id} className="rounded-2xl bg-slate-50 px-3 py-3 border border-slate-100">
                        <div className="font-semibold text-slate-800">{event.title}</div>
                        <div className="text-xs text-slate-500">{formattedEventDate}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-4 rounded-[28px] bg-white p-4 shadow-soft">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Overview</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-rose-50 p-4">
              <div className="text-sm text-slate-500">Completed tasks</div>
              <div className="text-2xl font-bold text-slate-900">{notes.flatMap((note) => note.tasks).filter((task) => task.is_complete).length}</div>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <div className="text-sm text-slate-500">Calendar moments</div>
              <div className="text-2xl font-bold text-slate-900">{events.length}</div>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <div className="text-sm text-slate-500">Active notes</div>
              <div className="text-2xl font-bold text-slate-900">{notes.length}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}