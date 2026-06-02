"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/action";

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 rounded-xl border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
      >
        Logout
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/45 backdrop-blur-md">
            <div className="w-[90%] max-w-95 overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex flex-col items-center px-8 pb-8 pt-9">
                <div className="grid h-22.5 w-22.5 place-items-center rounded-full bg-red-100">
                  <LogOut className="h-11 w-11 text-red-500" strokeWidth={2.5} />
                </div>

                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                  Confirm Logout
                </h2>

                <p className="mt-3 text-center text-base leading-7 text-slate-500">
                  Are you sure you want to logout?
                  <br />
                  from Chainventory?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-red-500 py-3 text-base font-semibold text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}