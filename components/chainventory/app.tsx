import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Home, Plus, ScrollText } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";

type AppShellProps = {
  active: "dashboard" | "records" | "reports" | "registration";
  children: React.ReactNode;
};

function NavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-2 rounded-t-2xl border px-4 py-3 text-xs font-semibold transition sm:px-5 sm:py-4 sm:text-sm ${
        active
          ? "border-white/80 bg-white text-slate-900 shadow"
          : "border-transparent bg-transparent text-white/95 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function FooterBar() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="container-shell flex flex-wrap items-center justify-center gap-3 px-4 py-4 text-center text-xs text-slate-600 sm:px-6 sm:text-sm">
        <span>© 2026 DENR, Dolores Eastern Samar - Region VIII</span>
      </div>
    </footer>
  );
}

export async function AppShell({ active, children }: AppShellProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="page-bg min-h-screen">
      {/* HEADER */}
      <div className="topbar-gradient border-b border-black/10">
        <div className="container-shell flex flex-col gap-5 px-4 py-5 text-white lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6">
          {/* LEFT SIDE */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.15)] backdrop-blur-sm sm:h-24 sm:w-24">
              <Image
                src="/chainventory-logo.png"
                alt="Chainventory Logo"
                width={96}
                height={96}
                className="h-[98%] w-[98%] object-contain scale-120"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate text-2xl font-extrabold leading-none tracking-tight sm:text-[2.2rem]">
                Chainventory
              </div>

              <div className="mt-1 text-xs font-semibold text-white/95 sm:text-sm">
                DENR - Eastern Samar Chainsaw Management System
              </div>
            </div>
          </div>

          {/* USER CARD */}
          <div className="flex w-full items-center justify-start lg:w-auto lg:justify-end">
            {user ? (
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#062b33]/80 px-3 py-3 shadow-xl backdrop-blur-xl sm:w-auto sm:px-4">
                <div className="flex items-center gap-3">
                  {/* DENR LOGO */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white shadow-[0_0_10px_rgba(34,197,94,0.35)] sm:h-18 sm:w-18">
                    <Image
                      src="/denr-logo.png"
                      alt="DENR Logo"
                      width={72}
                      height={72}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>

                  {/* USER INFO */}
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <div className="truncate text-xs font-bold text-white sm:max-w-xs sm:text-sm">
                      {user.email}
                    </div>

                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />

                      <span className="text-[11px] font-medium text-emerald-300">
                        Logged In
                      </span>
                    </div>
                  </div>

                  {/* LOGOUT */}
                  <div className="shrink-0">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <button className="rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* NAVBAR */}
        <div className="nav-strip border-t border-black/10">
          <div className="container-shell flex flex-col gap-2 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-end gap-2 overflow-x-auto py-3 hide-scrollbar">
              <NavLink
                href="/"
                active={active === "dashboard"}
                icon={<Home className="h-4 w-4" />}
                label="Dashboard"
              />

              <NavLink
                href="/chainsaw-records"
                active={active === "records"}
                icon={<FileText className="h-4 w-4" />}
                label="Chainsaw Records"
              />

              <NavLink
                href="/reports"
                active={active === "reports"}
                icon={<ScrollText className="h-4 w-4" />}
                label="Reports"
              />
            </div>

            <Link
              href="/chainsaw-registration/new"
              className="btn-primary mb-3 flex w-full items-center justify-center gap-2 lg:my-3 lg:w-auto"
            >
              <Plus className="h-4 w-4" />
              New Registration
            </Link>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="container-shell px-4 py-5 sm:px-5 sm:py-6">
        {children}
      </main>

      {/* FOOTER */}
      <FooterBar />
    </div>
  );
}