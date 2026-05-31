import { ReactNode } from "react";
import {
  BellRing,
  CalendarDays,
  Download,
  Filter,
  MapPin,
  Search,
} from "lucide-react";

export function HeroBanner({
  title,
  subtitle,
  leftBadges,
  rightBadge,
  actions,
}: {
  title: string;
  subtitle: string;
  leftBadges?: ReactNode;
  rightBadge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="hero-gradient mb-6 rounded-[28px] border border-white/60 p-8 text-white shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-extrabold leading-none">{title}</h1>
            {leftBadges}
          </div>

          <p className="max-w-2xl text-xl font-semibold text-white/95">
            {subtitle}
          </p>

          {actions}
        </div>

        {rightBadge}
      </div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  kind,
}: {
  label: string;
  value: number | string;
  kind: "blue" | "green" | "yellow" | "red" | "slate";
}) {
  const panelClass =
    kind === "blue"
      ? "stat-panel-blue"
      : kind === "green"
      ? "stat-panel-green"
      : kind === "yellow"
      ? "stat-panel-yellow"
      : kind === "red"
      ? "stat-panel-red"
      : "stat-panel-slate";

  const iconBg =
    kind === "blue"
      ? "bg-blue-500"
      : kind === "green"
      ? "bg-green-500"
      : kind === "yellow"
      ? "bg-yellow-500"
      : kind === "red"
      ? "bg-red-500"
      : "bg-slate-500";

  return (
    <div className={`soft-card rounded-[26px] p-6 ${panelClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm uppercase tracking-wider text-slate-700">
            {label}
          </div>
          <div className="mt-4 text-5xl font-extrabold">{value}</div>
        </div>

        <div className={`h-12 w-12 rounded-2xl ${iconBg} shadow-lg`} />
      </div>
    </div>
  );
}

export function SearchToolbar({
  placeholder,
  right,
}: {
  placeholder: string;
  right?: ReactNode;
}) {
  return (
    <div className="soft-card mb-6 flex flex-col gap-4 rounded-3xl p-5 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input className="field pl-12" placeholder={placeholder} />
      </div>

      {right}
    </div>
  );
}

export function FilterButton({ label }: { label: string }) {
  return (
    <button className="btn-dark" type="button">
      <Filter className="h-4 w-4" />
      {label}
    </button>
  );
}

export function ExportButton({ label }: { label: string }) {
  return (
    <button className="btn-dark" type="button">
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}

export function DateButton({ label }: { label: string }) {
  return (
    <button className="btn-dark" type="button">
      <CalendarDays className="h-4 w-4" />
      {label}
    </button>
  );
}

export function RecentRegistrationCard({
  initials,
  name,
  brand,
  serial,
  location,
  date,
}: {
  initials: string;
  name: string;
  brand: string;
  serial: string;
  location: string;
  date: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-green-600 font-bold text-white">
            {initials}
          </div>

          <div>
            <div className="text-lg font-bold">{name}</div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="rounded-md bg-slate-100 px-2 py-1">
                {brand}
              </span>
              <span>•</span>
              <span className="rounded-md bg-slate-100 px-2 py-1">
                SN: {serial}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="status-active">Active</span>
          <div className="mt-2 text-sm text-slate-500">{date}</div>
        </div>
      </div>
    </div>
  );
}

export function AlertListItem({
  owner,
  registrationNo,
  municipality,
  label,
  expiry,
}: {
  owner: string;
  registrationNo: string;
  municipality: string;
  label: string;
  expiry: string;
}) {
  const initials = owner
    .split(" ")
    .slice(0, 2)
    .map((x: string) => x[0])
    .join("")
    .toUpperCase();

  return (
    <div className="grid gap-4 border-t border-slate-200 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-600 font-bold text-white">
          {initials}
        </div>

        <div>
          <div className="text-lg font-bold">{owner}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>

      <div>
        <div className="inline-flex rounded-xl bg-slate-100 px-4 py-2 font-mono text-sm font-bold">
          {registrationNo}
        </div>
        <div className="mt-2 text-sm text-slate-500">{municipality}</div>
      </div>

      <div className="text-lg font-semibold">{municipality}</div>

      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-600">
          <BellRing className="h-4 w-4" />
          {label}
        </div>
        <div className="mt-2 text-sm text-slate-500">Expiry: {expiry}</div>
      </div>
    </div>
  );
}

export function ReportChoiceCard({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: "blue" | "red" | "green" | "teal";
}) {
  const toneClass = {
    blue: "border-blue-200 bg-blue-50",
    red: "border-red-200 bg-red-50",
    green: "border-green-200 bg-green-50",
    teal: "border-teal-200 bg-teal-50",
  };

  return (
    <div className={`rounded-[22px] border p-5 ${toneClass[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-bold">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}