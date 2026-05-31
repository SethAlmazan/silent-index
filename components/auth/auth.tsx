import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf2f1_0%,#f7faf9_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-4xl border border-white/60 bg-white shadow-2xl lg:grid-cols-2">
          <div className="topbar-gradient flex flex-col justify-between p-10 text-white">
            <div>
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur">
                  <Image
                    src="/chainventory-logo.png"
                    alt="Chainventory Logo"
                    className="h-20 not-even:w-20 rounded-full object-cover"
                    width={70}
                    height={70}
                  />
                </div>

                <div>
                  <div className="text-[2rem] font-extrabold leading-none drop-shadow-lg">
                    <span className="text-[#ff8c1a]">Chain</span>
                    <span className="text-[#51d116]">ventory</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/90">
                    DENR - Dolores Eastern Samar Chainsaw Management System
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight">{title}</h1>
              <p className="mt-4 max-w-md text-lg text-white/90">{subtitle}</p>
            </div>

            <div className="mt-10 rounded-3xl border border-white/30 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Secure Access
              </div>
              <div className="mt-2 text-sm text-white/90">
                Only authorized DENR personnel should access registration,
                reports, and compliance records.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white p-8 lg:p-12">
            <div className="w-full max-w-md">
              {children}

              <div className="mt-6 text-center text-sm text-slate-600">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-semibold text-teal-700 hover:text-teal-600"
                >
                  {footerLinkText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
