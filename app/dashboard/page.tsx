"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";

type TaskType = {
  id: string;
  description: string;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
  attachedPhotos: string[];
};

const initialNotes = [
  {
    id: "1",
    title: "Date night ideas",
    body: "Try the little Italian bakery and then walk by the river at sunset.",
    category: "Date Ideas",
    created_at: "2026-06-15T10:00:00",
    author: "Marie-Laure",
    tasks: [
      {
        id: "t1",
        description: "Reserve a table",
        is_complete: true,
        completed_by: "Marie-Laure",
        completed_at: "2026-06-14T18:00:00",
        attachedPhotos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"],
      },
      {
        id: "t2",
        description: "Buy matching flowers",
        is_complete: false,
        completed_by: null,
        completed_at: null,
        attachedPhotos: [],
      },
    ] as TaskType[],
  },
  {
    id: "2",
    title: "Weekend grocery list",
    body: "Pasta, candles, strawberries, and tea.",
    category: "Groceries",
    created_at: "2026-06-18T09:30:00",
    author: "William",
    tasks: [{ id: "t3", description: "Pick up strawberries", is_complete: false, completed_by: null, completed_at: null, attachedPhotos: [] }] as TaskType[],
  },
  {
    id: "3",
    title: "Summer trip plans",
    body: "Check ferry schedules and book the little harbor hotel.",
    category: "Travel",
    created_at: "2026-06-20T07:15:00",
    author: "Marie-Laure",
    tasks: [{ id: "t4", description: "Send passport copies", is_complete: true, completed_by: "William", completed_at: "2026-06-21T11:20:00", attachedPhotos: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"] }] as TaskType[],
  },
];

const events = [
  { id: "e1", title: "Anniversary dinner", start_time: "2026-07-04T19:30:00", category: "anniversary", creator_id: "1" },
  { id: "e2", title: "Doctor appointment", start_time: "2026-07-06T10:00:00", category: "reminder", creator_id: "2" },
  { id: "e3", title: "Beach picnic", start_time: "2026-07-11T16:00:00", category: "date night", creator_id: "1" },
];

export default function DashboardPage() {
  const [notes, setNotes] = useState(initialNotes);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>(["1"]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(notes.map((note) => note.category)))], [notes]);

  const filteredNotes = categoryFilter === "All" ? notes : notes.filter((note) => note.category === categoryFilter);

  const toggleNote = (noteId: string) => {
    setExpandedNoteIds((current) => (current.includes(noteId) ? current.filter((id) => id !== noteId) : [...current, noteId]));
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

            if (checked && !task.attachedPhotos?.length) {
              window.alert("Please upload at least one photo before completing this task.");
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
              <h2 className="text-xl font-bold text-slate-900">Notes</h2>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

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
                                  <label className="inline-flex cursor-pointer rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-500">
                                    Upload photo
                                    <input type="file" accept="image/*" multiple hidden onChange={(event) => handlePhotoUpload(note.id, task.id, event.target.files)} />
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[28px] bg-white p-4 shadow-soft">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Calendar</h2>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="rounded-2xl bg-slate-50 px-3 py-3">
                    <div className="font-semibold text-slate-800">{event.title}</div>
                    <div className="text-xs text-slate-500">{new Date(event.start_time).toLocaleString()}</div>
                  </div>
                ))}
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
