"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";

type NoteItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  updated_at: string;
  author: string;
};

const SHARED_STORAGE_KEY = "loveshare-shared-state-v1";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["General"]);
  const [noteForm, setNoteForm] = useState({ title: "", body: "", category: "General" });
  const [categoryDraft, setCategoryDraft] = useState("");

  const readSharedState = () => {
    const saved = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (!saved) {
      return { notes: [] as NoteItem[], categories: ["General"] as string[] };
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        notes: parsed.notes ?? [],
        categories: parsed.categories?.length ? parsed.categories : ["General"],
      };
    } catch {
      return { notes: [] as NoteItem[], categories: ["General"] as string[] };
    }
  };

  const persistSharedState = (nextState: Partial<{ notes: NoteItem[]; categories: string[] }>) => {
    const current = readSharedState();
    const merged = {
      notes: nextState.notes ?? current.notes,
      categories: nextState.categories ?? current.categories,
      events: [] as Array<{ id: string; title: string; start_time: string; category: string; creator_id: string }>,
    };

    const existing = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        merged.events = parsed.events ?? [];
      } catch {
        merged.events = [];
      }
    }

    window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("loveshare-state-changed"));
  };

  useEffect(() => {
    const loadSharedState = () => {
      const state = readSharedState();
      setNotes(state.notes);
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
    persistSharedState({ notes, categories });
  }, [notes, categories]);

  const addCategory = () => {
    const value = categoryDraft.trim();
    if (!value) return;
    setCategories((current) => (current.includes(value) ? current : [...current, value]));
    setCategoryDraft("");
    setNoteForm((current) => ({ ...current, category: value }));
  };

  const removeCategory = (category: string) => {
    if (category === "General") return;
    setCategories((current) => current.filter((item) => item !== category));
    setNotes((current) => current.map((note) => (note.category === category ? { ...note, category: "General" } : note)));
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
      updated_at: new Date().toISOString(),
      author: "You",
    };

    setNotes((current) => [newNote, ...current]);
    setNoteForm({ title: "", body: "", category });
  };

  const removeNote = (noteId: string) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fef2f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared notes</p>
            <h1 className="text-3xl font-black text-slate-900">Notes</h1>
          </div>
          <div className="text-sm font-semibold text-slate-500">Add, edit, or remove notes anytime</div>
        </div>

        <form onSubmit={addNote} className="mb-4 rounded-[28px] bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input value={noteForm.title} onChange={(event) => setNoteForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" className="rounded-xl border border-rose-100 px-3 py-2 text-sm" required />
            <select value={noteForm.category} onChange={(event) => setNoteForm((current) => ({ ...current, category: event.target.value }))} className="rounded-xl border border-rose-100 px-3 py-2 text-sm">
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
          <textarea value={noteForm.body} onChange={(event) => setNoteForm((current) => ({ ...current, body: event.target.value }))} placeholder="Note" className="mt-3 min-h-24 w-full rounded-xl border border-rose-100 px-3 py-2 text-sm" required />
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

        <div className="grid gap-4 md:grid-cols-2">
          {notes.length === 0 ? (
            <div className="rounded-[28px] bg-white p-5 text-sm text-slate-500 shadow-soft md:col-span-2">Nothing here yet. Add your first note and category above.</div>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="rounded-[28px] bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.category}</span>
                    <h2 className="mt-3 text-xl font-bold text-slate-900">{note.title}</h2>
                  </div>
                  <button onClick={() => removeNote(note.id)} className="text-sm font-semibold text-rose-500">
                    Remove
                  </button>
                </div>
                <p className="text-sm text-slate-600">{note.body}</p>
                <div className="mt-5 border-t border-rose-50 pt-3 text-xs text-slate-400">Updated {new Date(note.updated_at).toLocaleString()}</div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
