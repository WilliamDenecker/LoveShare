"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TopNav } from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { Note, Category } from "@/lib/types";
import { getCurrentUser, formatDateTime, convertFileToBase64 } from "@/lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "category">("date");

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Form States
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [notesRes, catRes] = await Promise.all([
      supabase.from("notes").select("*, categories(name, color)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name", { ascending: true })
    ]);

    if (notesRes.data) setNotes(notesRes.data as Note[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openModal(note?: Note) {
    setEditingNoteId(note?.id || null);
    setNewTitle(note?.title || "");
    setNewBody(note?.body || "");
    setSelectedCategoryId(note?.category_id || "");
    setIsNoteModalOpen(true);
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title: newTitle,
      body: newBody.trim() || null,
      category_id: selectedCategoryId || null,
    };

    const request = editingNoteId 
      ? supabase.from("notes").update(payload).eq("id", editingNoteId)
      : supabase.from("notes").insert({ ...payload, author: getCurrentUser(), is_complete: false });

    const { error } = await request;
    if (error) alert("Failed to save: " + error.message);
    else {
      setIsNoteModalOpen(false);
      await fetchData();
    }
    setIsSaving(false);
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

  async function handleDelete(table: "notes" | "categories", id: string, warningMsg: string) {
    if (!confirm(warningMsg)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(`Failed to delete ${table}: ` + error.message);
    else await fetchData();
  }

  async function toggleNoteCompletion(id: string, file?: File) {
    try {
      const isCompleting = !!file;
      const image_url = file ? await convertFileToBase64(file) : null;
      
      const { error } = await supabase.from("notes").update({ is_complete: isCompleting, image_url }).eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
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
            <button onClick={() => setIsCatModalOpen(true)} className="rounded-2xl border border-rose-200 bg-white px-4 py-2 font-semibold text-rose-500 shadow-soft hover:border-rose-300 transition-colors">Categories</button>
            <button onClick={() => openModal()} className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft hover:bg-rose-600 transition-colors">New Note</button>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-slate-500">Order by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "category")} className="rounded-xl border border-rose-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-rose-300">
              <option value="date">Newest first</option>
              <option value="category">Category</option>
            </select>
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading your notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-rose-200 p-10 text-center text-slate-500">No notes yet. Click &quot;New Note&quot; to start sharing!</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedNotes.map((note) => (
              <article key={note.id} className={`relative flex flex-col rounded-[28px] bg-white p-5 shadow-soft transition-colors ${note.is_complete ? 'border border-rose-200 bg-rose-50/30' : ''}`}>
                <div className="absolute right-4 top-4 flex gap-2">
                  <button onClick={() => openModal(note)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors">✎</button>
                  <button onClick={() => handleDelete("notes", note.id, "Are you sure you want to delete this note?")} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
                </div>

                <div className="mb-4 pr-20 flex items-start justify-between">
                  <div>
                    {note.categories && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.categories.name}</span>}
                    <h2 className={`font-bold text-slate-900 ${note.is_complete ? 'line-through text-slate-500' : ''} ${note.categories ? 'mt-3 text-xl' : 'text-xl'}`}>{note.title}</h2>
                  </div>
                </div>
                
                {note.body && <p className={`text-sm whitespace-pre-wrap flex-grow ${note.is_complete ? 'text-slate-400' : 'text-slate-600'}`}>{note.body}</p>}
                
                <div className={`flex items-center justify-between border-t border-rose-50 pt-3 ${note.body ? 'mt-5' : 'mt-2'}`}>
                  <div className="text-xs font-medium text-slate-400">By {note.author}</div>
                  <div className="text-xs text-slate-400">{formatDateTime(note.created_at).full}</div>
                </div>

                <div className="mt-4 border-t border-rose-50 pt-4">
                  {note.is_complete ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-rose-500">✓ Completed</div>
                        <button onClick={() => toggleNoteCompletion(note.id)} className="text-xs text-slate-400 underline hover:text-slate-600">Revert</button>
                      </div>
                      {note.image_url && <div className="mt-2 h-40 w-full relative"><Image src={note.image_url} alt="Note memory" fill className="rounded-xl object-cover shadow-sm" unoptimized /></div>}
                    </div>
                  ) : (
                    <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors">
                      + Upload photo to complete
                      <input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) toggleNoteCompletion(note.id, e.target.files[0]); }} />
                    </label>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{editingNoteId ? "Edit Note" : "Add a new note"}</h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300" placeholder="E.g., Date ideas" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300">
                  <option value="">No category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Details (Optional)</label><textarea rows={4} value={newBody} onChange={(e) => setNewBody(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 outline-none focus:border-rose-300 resize-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsNoteModalOpen(false)} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white">{isSaving ? "Saving..." : "Save note"}</button>
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
                  <button onClick={() => handleDelete("categories", cat.id, "Delete category? Notes using it will become 'Uncategorized'.")} className="text-slate-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddCategory} className="border-t border-rose-50 pt-5">
              <div className="flex gap-2">
                <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 outline-none focus:border-rose-300" placeholder="New category..." />
                <button type="submit" disabled={isSavingCat} className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}