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
  is_complete: boolean;
  image_url: string | null;
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

  // Note Form State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    const [notesRes, catRes] = await Promise.all([
      supabase
        .from("notes")
        .select("id, title, body, author, created_at, category_id, is_complete, image_url, categories(name, color)")
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

  function openEditModal(note: Note) {
    setEditingNoteId(note.id);
    setNewTitle(note.title);
    setNewBody(note.body || "");
    setSelectedCategoryId(note.category_id || "");
    setIsNoteModalOpen(true);
  }

  function openCreateModal() {
    setEditingNoteId(null);
    setNewTitle("");
    setNewBody("");
    setSelectedCategoryId("");
    setIsNoteModalOpen(true);
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const currentUser = getCurrentUser();

    const payload = {
      title: newTitle,
      body: newBody.trim() || null,
      category_id: selectedCategoryId || null,
    };

    if (editingNoteId) {
      const { error } = await supabase.from("notes").update(payload).eq("id", editingNoteId);
      if (error) alert("Failed to update: " + error.message);
    } else {
      const { error } = await supabase.from("notes").insert({
        ...payload,
        author: currentUser,
        is_complete: false,
      });
      if (error) alert("Failed to save: " + error.message);
    }

    setIsNoteModalOpen(false);
    await fetchData();
    setIsSaving(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCat(true);

    const { error } = await supabase.from("categories").insert({
      name: newCatName.trim(),
      color: "#f43f5e",
    });

    if (error) alert("Failed to create category: " + error.message);
    else {
      setNewCatName("");
      await fetchData(); 
    }
    setIsSavingCat(false);
  }

  // NEW DELETE CATEGORY FUNCTION
  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? Any notes using it will become 'Uncategorized'.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) alert("Failed to delete category: " + error.message);
    else await fetchData();
  }

  async function handleDeleteNote(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) alert("Failed to delete note: " + error.message);
    else await fetchData();
  }

  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function handleCompleteNote(id: string, file: File) {
    try {
      const base64Image = await convertToBase64(file);
      const { error } = await supabase
        .from("notes")
        .update({ is_complete: true, image_url: base64Image })
        .eq("id", id);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert("Error uploading photo: " + err.message);
    }
  }

  async function handleUncompleteNote(id: string) {
    const { error } = await supabase
      .from("notes")
      .update({ is_complete: false, image_url: null })
      .eq("id", id);
    
    if (error) alert("Error reverting completion: " + error.message);
    else await fetchData();
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === "category") {
      const catA = a.categories?.name || "ZZZ Uncategorized"; 
      const catB = b.categories?.name || "ZZZ Uncategorized";
      if (catA !== catB) return catA.localeCompare(catB);
    }
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
              Categories
            </button>
            <button 
              onClick={openCreateModal}
              className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors"
            >
              New Note
            </button>
          </div>
        </div>

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
            {sortedNotes.map((note) => {
              const d = new Date(note.created_at);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;

              return (
                <article key={note.id} className={`relative flex flex-col rounded-[28px] bg-white p-5 shadow-soft transition-colors ${note.is_complete ? 'border border-rose-200 bg-rose-50/30' : ''}`}>
                  <div className="absolute right-4 top-4 flex gap-2">
                    <button onClick={() => openEditModal(note)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors" title="Edit note">✎</button>
                    <button onClick={() => handleDeleteNote(note.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete note">✕</button>
                  </div>

                  <div className="mb-4 pr-20 flex items-start justify-between">
                    <div>
                      {note.categories && (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.categories.name}</span>
                      )}
                      <h2 className={`font-bold text-slate-900 ${note.is_complete ? 'line-through text-slate-500' : ''} ${note.categories ? 'mt-3 text-xl' : 'text-xl'}`}>{note.title}</h2>
                    </div>
                  </div>
                  
                  {note.body && <p className={`text-sm whitespace-pre-wrap flex-grow ${note.is_complete ? 'text-slate-400' : 'text-slate-600'}`}>{note.body}</p>}
                  
                  <div className={`flex items-center justify-between border-t border-rose-50 pt-3 ${note.body ? 'mt-5' : 'mt-2'}`}>
                    <div className="text-xs font-medium text-slate-400">By {note.author}</div>
                    <div className="text-xs text-slate-400">{formattedDate}</div>
                  </div>

                  <div className="mt-4 border-t border-rose-50 pt-4">
                    {note.is_complete ? (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-wider text-rose-500">✓ Completed</div>
                          <button onClick={() => handleUncompleteNote(note.id)} className="text-xs text-slate-400 underline hover:text-slate-600">Revert</button>
                        </div>
                        {note.image_url && <img src={note.image_url} alt="Note memory" className="mt-2 h-40 w-full rounded-xl object-cover shadow-sm" />}
                      </div>
                    ) : (
                      <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors">
                        + Upload photo to complete
                        <input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) handleCompleteNote(note.id, e.target.files[0]); }} />
                      </label>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{editingNoteId ? "Edit Note" : "Add a new note"}</h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Date ideas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300">
                  <option value="">No category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
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

      {/* UPDATED MANAGE CATEGORIES MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
            </div>
            
            <div className="mb-6 max-h-48 overflow-y-auto space-y-2 pr-1">
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No categories yet.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors" title="Delete category">✕</button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 border-t border-rose-50 pt-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Add New Category</label>
                <div className="flex gap-2">
                  <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 outline-none focus:border-rose-300" placeholder="E.g., Groceries" />
                  <button type="submit" disabled={isSavingCat} className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors disabled:opacity-50">
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}