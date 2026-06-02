"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Home, Plus } from "lucide-react";

export default function AppNavbar() {
  const pathname = usePathname();

  const navClass = (href: string) =>
    `flex items-center gap-2 rounded-t-2xl px-6 py-4 font-bold ${
      pathname === href ? "bg-white text-black" : "text-black hover:bg-white/40"
    }`;

  return (
    <nav className="border-t border-black/10 bg-[#277d7b]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className={navClass("/")}>
            <Home size={16} />
            Dashboard
          </Link>

          <Link href="/chainsaw-records" className={navClass("/chainsaw-records")}>
            <FileText size={16} />
            Chainsaw Records
          </Link>

          <Link href="/reports" className={navClass("/reports")}>
            <BarChart3 size={16} />
            Reports
          </Link>
        </div>

        <Link
          href="/new-registration"
          className="flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 font-extrabold text-black hover:bg-yellow-500"
        >
          <Plus size={18} />
          New Registration
        </Link>
      </div>
    </nav>
  );
}