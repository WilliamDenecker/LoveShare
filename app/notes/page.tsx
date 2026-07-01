import { TopNav } from "@/components/TopNav";

const notes = [
  {
    id: 1,
    title: "Date ideas",
    category: "Date Ideas",
    author: "Ava",
    body: "Maybe we can try the tiny café in the square and then watch the sunset from the hill.",
    updated_at: "2026-06-22T18:30:00",
  },
  {
    id: 2,
    title: "Weekend errands",
    category: "Groceries",
    author: "Noah",
    body: "Milk, oranges, gas for the car, and a card for the anniversary.",
    updated_at: "2026-06-21T09:15:00",
  },
];

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f7,#fef2f2,#ffe4e6)]">
      <TopNav />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">Shared notes</p>
            <h1 className="text-3xl font-black text-slate-900">Notes</h1>
          </div>
          <button className="rounded-2xl bg-rose-500 px-4 py-2 font-semibold text-white shadow-soft">New note</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <article key={note.id} className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">{note.category}</span>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{note.title}</h2>
                </div>
                <span className="text-xs text-slate-400">{note.author}</span>
              </div>
              <p className="text-sm text-slate-600">{note.body}</p>
              <div className="mt-5 border-t border-rose-50 pt-3 text-xs text-slate-400">Updated {new Date(note.updated_at).toLocaleString()}</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
