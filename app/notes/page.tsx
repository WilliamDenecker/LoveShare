"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

// Define the shape of our data
type Note = {
  id: string;
  title: string;
  body: string;
  author: string;
  created_at: string;
  categories?: { name: string; color: string } | null;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  // Helper to get whoever is logged in right now from our cookie
  function getCurrentUser() {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(^| )loveshare_user=([^;]+)/);
      if (match) return match[2];
    }
    return "Unknown";
  }

  // Fetch all notes from Supabase
  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, body, author, created_at, categories(name, color)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data as any);
    }
    setLoading(false);
  }

  // Load notes when the page opens
  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle saving a new note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const currentUser = getCurrentUser();
    let categoryId = null;

    // 1. If a category was typed, check if it exists or create a new one
    if (newCategory.trim()) {
      const { data: existingCat } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", newCategory.trim())
        .single();

      if (existingCat) {
        categoryId = existingCat.id;
      } else {
        const { data: newCat } = await supabase
          .from("categories")
          .insert({ name: newCategory.trim(), color: "#f43f5e" }) // Default rose color
          .select("id")
          .single();
        if (newCat) categoryId = newCat.id;
      }
    }

    // 2. Insert the actual note
    const { error } = await supabase.from("notes").insert({
      title: newTitle,
      body: newBody,
      author: currentUser,
      category_id: categoryId,
    });

    if (!error) {
      setIsModalOpen(false); // Close the modal
      setNewTitle("");       // Reset fields
      setNewCategory("");
      setNewBody("");
      fetchNotes();          // Refresh the screen to show the new note
    } else {
      alert("Error saving note: " + error.message);
    }
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fef2f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared notes</p>
            <h1 className="text-3xl font-black text-slate-900">Notes</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors"
          >
            New note
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading your notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">
            No notes yet. Click "New note" to start sharing!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <article key={note.id} className="rounded-[28px] bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    {note.categories && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">
                        {note.categories.name}
                      </span>
                    )}
                    <h2 className="mt-3 text-xl font-bold text-slate-900">{note.title}</h2>
                  </div>
                  <span className="text-xs font-medium text-slate-400">{note.author}</span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.body}</p>
                <div className="mt-5 border-t border-rose-50 pt-3 text-xs text-slate-400">
                  Added {new Date(note.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* NEW NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add a new note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300"
                  placeholder="E.g., Date ideas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category (Optional)</label>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300"
                  placeholder="E.g., Groceries"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note Details</label>
                <textarea
                  required
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300 resize-none"
                  placeholder="What's on your mind?"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}