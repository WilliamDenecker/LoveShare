"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Note = {
  id: string;
  title: string;
  body: string | null;
  author: string;
  created_at: string;
  category_id: string | null;
  categories?: { name: string; color: string } | null;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "category">("date");

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Note Form
  const [newTitle, setNewTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Category Form
  const [newCatName, setNewCatName] = useState("");

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
    // Fetch both notes and categories at the same time
    const [notesRes, catRes] = await Promise.all([
      supabase
        .from("notes")
        .select("id, title, body, author, created_at, category_id, categories(name, color)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name", { ascending: true })
    ]);

    if (notesRes.data) setNotes(notesRes.data as any);
    if (catRes.data) setCategories(catRes.data as any);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const currentUser = getCurrentUser();

    const { error } = await supabase.from("notes").insert({
      title: newTitle,
      body: newBody.trim() || null, // Allow empty body
      author: currentUser,
      category_id: selectedCategoryId || null,
    });

    if (error) {
      alert("Failed to save: " + error.message);
    } else {
      setIsNoteModalOpen(false);
      setNewTitle("");
      setSelectedCategoryId("");
      setNewBody("");
      await fetchData();
    }
    setIsSaving(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const { error } = await supabase.from("categories").insert({
      name: newCatName.trim(),
      color: "#f43f5e",
    });

    if (error) {
      alert("Failed to create category: " + error.message);
    } else {
      setIsCatModalOpen(false);
      setNewCatName("");
      await fetchData(); // Refresh so the new category shows in the dropdown
    }
  }

  async function handleDeleteNote(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) alert("Failed to delete note: " + error.message);
    else await fetchData();
  }

  // Handle Frontend Sorting
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === "category") {
      const catA = a.categories?.name || "ZZZ Uncategorized"; // Push empty to bottom
      const catB = b.categories?.name || "ZZZ Uncategorized";
      if (catA !== catB) return catA.localeCompare(catB);
    }
    // Default to date descending (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fef2f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared notes</p>
            <h1 className="text-3xl font-black text-slate-900">Notes</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCatModalOpen(true)}
              className="rounded-2xl border border-rose-200 bg-white px-4 py-2 font-semibold text-rose-500 shadow-soft hover:border-rose-300 transition-colors"
            >
              New Category
            </button>
            <button 
              onClick={() => setIsNoteModalOpen(true)}
              className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors"
            >
              New Note
            </button>
          </div>
        </div>

        {/* Sorting Toggle */}
        {notes.length > 0 && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-slate-500">Order by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as "date" | "category")} 
              className="rounded-xl border border-rose-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-rose-300"
            >
              <option value="date">Newest first</option>
              <option value="category">Category</option>
            </select>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading your notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">
            No notes yet. Click "New Note" to start sharing!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedNotes.map((note) => (
              <article key={note.id} className="relative rounded-[28px] bg-white p-5 shadow-soft">
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Delete note"
                >
                  ✕
                </button>

                <div className="mb-4 pr-10 flex items-start justify-between">
                  <div>
                    {note.categories && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">
                        {note.categories.name}
                      </span>
                    )}
                    <h2 className={`font-bold text-slate-900 ${note.categories ? 'mt-3 text-xl' : 'text-xl'}`}>{note.title}</h2>
                  </div>
                </div>
                
                {note.body && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.body}</p>
                )}
                
                <div className={`flex items-center justify-between border-t border-rose-50 pt-3 ${note.body ? 'mt-5' : 'mt-2'}`}>
                  <div className="text-xs font-medium text-slate-400">By {note.author}</div>
                  <div className="text-xs text-slate-400">
                    {/* EUROPEAN DATE FORMAT */}
                    {new Date(note.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* NEW NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add a new note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Date ideas" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={selectedCategoryId} 
                  onChange={(e) => setSelectedCategoryId(e.target.value)} 
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                {/* Note Details is NO LONGER REQUIRED */}
                <label className="block text-sm font-medium text-slate-700 mb-1">Note Details (Optional)</label>
                <textarea rows={4} value={newBody} onChange={(e) => setNewBody(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300 resize-none" placeholder="What's on your mind?" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsNoteModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Travel" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}