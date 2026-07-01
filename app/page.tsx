import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff8fa,#ffe5ec_45%,#ffd3d8_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-white/70 px-6 py-2 shadow-soft">
          <span className="text-sm font-semibold tracking-[0.4em] text-rose-500 uppercase">CoupleNotes</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 sm:text-6xl">Your shared little world, together.</h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Keep notes, plan date nights, remember milestones, and revisit the moments that matter most.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/login" className="rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white shadow-soft hover:bg-rose-600">
            Open your home
          </Link>
        </div>
      </div>
    </main>
  );
}
