"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";

type TaskType = {
  id: string;
  description: string;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
  attachedPhotos: string[];
};

type NoteItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  author: string;
  tasks: TaskType[];
};

type EventItem = {
  id: string;
  title: string;
  start_time: string;
  category: string;
  creator_id: string;
};

const SHARED_STORAGE_KEY = "loveshare-shared-state-v1";

export default function DashboardPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const [noteForm, setNoteForm] = useState({ title: "", body: "", category: "General" });
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", category: "General" });
  const [categoryDraft, setCategoryDraft] = useState("");

  const readSharedState = () => {
    const saved = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (!saved) {
      return { notes: [] as NoteItem[], events: [] as EventItem[], categories: ["General"] as string[] };
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        notes: parsed.notes ?? [],
        events: parsed.events ?? [],
        categories: parsed.categories?.length ? parsed.categories : ["General"],
      };
    } catch {
      return { notes: [] as NoteItem[], events: [] as EventItem[], categories: ["General"] as string[] };
    }
  };

  const persistSharedState = (nextState: Partial<{ notes: NoteItem[]; events: EventItem[]; categories: string[] }>) => {
    const current = readSharedState();
    const merged = {
      notes: nextState.notes ?? current.notes,
      events: nextState.events ?? current.events,
      categories: nextState.categories ?? current.categories,
    };

    window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("loveshare-state-changed"));
  };

  useEffect(() => {
    const loadSharedState = () => {
      const state = readSharedState();
      setNotes(state.notes);
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
    persistSharedState({ notes, events, categories });
  }, [notes, events, categories]);

  const availableCategories = useMemo(() => ["All", ...categories], [categories]);
  const filteredNotes = categoryFilter === "All" ? notes : notes.filter((note) => note.category === categoryFilter);

  const toggleNote = (noteId: string) => {
    setExpandedNoteIds((current) => (current.includes(noteId) ? current.filter((id) => id !== noteId) : [...current, noteId]));
  };

  const addCategory = () => {
    const value = categoryDraft.trim();
    if (!value) return;

    setCategories((current) => (current.includes(value) ? current : [...current, value]));
    setCategoryDraft("");
    setNoteForm((current) => ({ ...current, category: value }));
    setEventForm((current) => ({ ...current, category: value }));
  };

  const removeCategory = (category: string) => {
    if (category === "General") return;
    setCategories((current) => current.filter((item) => item !== category));
    setNotes((currentNotes) => currentNotes.map((note) => (note.category === category ? { ...note, category: "General" } : note)));
    setEvents((currentEvents) => currentEvents.map((event) => (event.category === category ? { ...event, category: "General" } : event)));
  };

  const addNote = (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteForm.title.trim() || !noteForm.body.trim()) return;

    const category = noteForm.category || "General";
    if (!categories.includes(category)) {
      setCategories((current) => [...current, category]);
    }

    const newNote: NoteItem = {
      id: crypto.randomUUID(),
      title: noteForm.title.trim(),
      body: noteForm.body.trim(),
      category,
      created_at: new Date().toISOString(),
      author: "You",
      tasks: [],
    };

    setNotes((current) => [newNote, ...current]);
    setNoteForm({ title: "", body: "", category });
    setExpandedNoteIds((current) => [newNote.id, ...current]);
  };

  const removeNote = (noteId: string) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
    setExpandedNoteIds((current) => current.filter((id) => id !== noteId));
  };

  const handleTaskToggle = (noteId: string, taskId: string, checked: boolean) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note.id !== noteId) {
          return note;
        }

        return {
          ...note,
          tasks: note.tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return {
              ...task,
              is_complete: checked,
              completed_by: checked ? "You" : null,
              completed_at: checked ? new Date().toISOString() : null,
            };
          }),
        };
      })
    );
  };

  const handlePhotoUpload = (noteId: string, taskId: string, files: FileList | null) => {
    if (!files?.length) return;

    const uploadedUrls = Array.from(files).map((file) => URL.createObjectURL(file));

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              tasks: note.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      attachedPhotos: [...(task.attachedPhotos ?? []), ...uploadedUrls],
                    }
                  : task
              ),
            }
          : note
      )
    );
  };

  const addTask = (noteId: string) => {
    const taskDescription = window.prompt("What should we remember?");
    if (!taskDescription?.trim()) return;

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              tasks: [
                ...note.tasks,
                {
                  id: crypto.randomUUID(),
                  description: taskDescription.trim(),
                  is_complete: false,
                  completed_by: null,
                  completed_at: null,
                  attachedPhotos: [],
                },
              ],
            }
          : note
      )
    );
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
      start_time: new Date(startTime).toISOString(),
      category,
      creator_id: "you",
    };

    setEvents((current) => [newEvent, ...current]);
    setEventForm({ title: "", date: "", time: "", category });
  };

  const removeEvent = (eventId: string) => {
    setEvents((current) => current.filter((event) => event.id !== eventId));
  };

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

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Notes</h2>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm">
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={addNote} className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-3">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input value={noteForm.title} onChange={(event) => setNoteForm((current) => ({ ...current, title: event.target.value }))} placeholder="Note title" className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm" required />
                <select value={noteForm.category} onChange={(event) => setNoteForm((current) => ({ ...current, category: event.target.value }))} className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                  Add note
                </button>
              </div>
              <textarea value={noteForm.body} onChange={(event) => setNoteForm((current) => ({ ...current, body: event.target.value }))} placeholder="Note" className="mt-3 min-h-24 w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm" required />
            </form>

            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category} onClick={() => removeCategory(category)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {category} ×
                </button>
              ))}
              <input value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} placeholder="New category" className="rounded-full border border-rose-100 px-3 py-1 text-xs" />
              <button onClick={addCategory} className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                Add category
              </button>
            </div>

            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-200 p-4 text-sm text-slate-500">No notes yet. Add one above to start your shared list.</div>
              ) : (
                filteredNotes.map((note) => {
                  const expanded = expandedNoteIds.includes(note.id);

                  return (
                    <div key={note.id} className="rounded-2xl border border-slate-100 bg-white">
                      <div className="flex w-full items-center justify-between px-4 py-3 text-left">
                        <button onClick={() => toggleNote(note.id)} className="flex-1 text-left">
                          <span className="font-semibold text-slate-900">{note.title}</span>
                          <div className="mt-1 text-xs text-slate-400">{note.author}</div>
                        </button>
                        <button onClick={() => removeNote(note.id)} className="ml-2 text-sm font-semibold text-rose-500">
                          Remove
                        </button>
                      </div>

                      {expanded ? (
                        <div className="border-t border-rose-50 px-4 py-3">
                          <p className="text-sm text-slate-600">{note.body}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.category}</span>
                            <span className="text-xs text-slate-400">{new Date(note.created_at).toLocaleDateString()}</span>
                          </div>

                          <div className="mt-4 space-y-2">
                            {note.tasks.map((task) => (
                              <div key={task.id} className="rounded-2xl bg-rose-50 px-3 py-3">
                                <label className="flex items-start gap-3">
                                  <input type="checkbox" checked={task.is_complete} onChange={(event) => handleTaskToggle(note.id, task.id, event.target.checked)} className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-300" />
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
                                  <div className="mt-3 flex items-center justify-between">
                                    <label className="inline-flex cursor-pointer rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-500">
                                      Upload photo
                                      <input type="file" accept="image/*" multiple hidden onChange={(event) => handlePhotoUpload(note.id, task.id, event.target.files)} />
                                    </label>
                                    <button type="button" onClick={() => addTask(note.id)} className="text-xs font-semibold text-rose-500">
                                      + Task
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}

                            {note.tasks.length === 0 ? (
                              <button type="button" onClick={() => addTask(note.id)} className="rounded-xl border border-dashed border-rose-200 px-3 py-2 text-sm font-semibold text-rose-500">
                                Add first task
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[28px] bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Calendar</h2>
              <form onSubmit={addEvent} className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-3">
                <input value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} placeholder="Event title" className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm" required />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input type="date" value={eventForm.date} onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))} className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm" required />
                  <input type="time" value={eventForm.time} onChange={(event) => setEventForm((current) => ({ ...current, time: event.target.value }))} className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm" />
                </div>
                <div className="mt-3 flex gap-2">
                  <select value={eventForm.category} onChange={(event) => setEventForm((current) => ({ ...current, category: event.target.value }))} className="flex-1 rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm">
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                    Add
                  </button>
                </div>
              </form>
              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-rose-200 p-3 text-sm text-slate-500">No calendar moments yet.</div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-800">{event.title}</div>
                          <div className="text-xs text-slate-500">{new Date(event.start_time).toLocaleString()}</div>
                        </div>
                        <button onClick={() => removeEvent(event.id)} className="text-sm font-semibold text-rose-500">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-4 rounded-[28px] bg-white p-4 shadow-soft">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Monthly recap</h2>
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
