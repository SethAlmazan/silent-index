"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings, User, KeyRound, X } from "lucide-react";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
      >
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-[90%] max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Settings
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/profile/edit"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <User className="h-5 w-5 text-teal-600" />
                Edit Profile
              </Link>

              <Link
                href="/profile/password"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <KeyRound className="h-5 w-5 text-red-500" />
                Change Password
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}