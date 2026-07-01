"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBookOpen, FiCalendar, FiCheckSquare, FiHeart, FiLogOut } from "react-icons/fi";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: FiBookOpen },
  { href: "/notes", label: "Notes", icon: FiCheckSquare },
  { href: "/calendar", label: "Calendar", icon: FiCalendar },
  //{ href: "/recap", label: "Recap", icon: FiHeart },
];

export function TopNav() {
  const pathname = usePathname();

  function handleLogout() {
    // 1. Delete the cookie by setting it to expire in the past
    document.cookie = "loveshare_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // 2. Force a hard browser redirect to the login page.
    // This guarantees Next.js completely clears the current session 
    // and the middleware sees the deleted cookie immediately.
    window.location.href = "/auth/login";
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-rose-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">❤</span>
          <span className="text-lg font-bold text-slate-900 hidden sm:block">CoupleNotes</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${active ? "bg-rose-500 text-white" : "text-slate-500 hover:bg-rose-50"}`}>
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
          
          {/* Vertical divider */}
          <div className="mx-1 h-6 w-px bg-slate-200"></div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            title="Log out"
          >
            <FiLogOut className="h-4 w-4" />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}