"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBookOpen, FiCalendar, FiCheckSquare, FiHeart } from "react-icons/fi";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: FiBookOpen },
  { href: "/notes", label: "Notes", icon: FiCheckSquare },
  { href: "/calendar", label: "Calendar", icon: FiCalendar },
  { href: "/recap", label: "Recap", icon: FiHeart },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 border-b border-rose-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">❤</span>
          <span className="text-lg font-bold text-slate-900">LoveShare</span>
        </Link>

        <div className="flex items-center gap-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${active ? "bg-rose-500 text-white" : "text-slate-500 hover:bg-rose-50"}`}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
