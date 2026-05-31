import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
} from "lucide-react";

type ChainsawRecord = {
  id: string;
  owner_name: string | null;
  municipality: string | null;
  barangay: string | null;
  permit_number: string | null;
  registration_date: string | null;
  expiry_date: string | null;
  created_at: string | null;
};

const TABLE_NAME = "permits";

function isExpired(expiryDate: string | null) {
  if (!expiryDate) return false;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return expiry < today;
}


function getMonthIndex(dateString: string | null) {
  if (!dateString) return -1;
  return new Date(dateString).getMonth();
}

function percent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      `
      id,
      owner_name,
      municipality,
      barangay,
      permit_number,
      registration_date,
      expiry_date,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  const records = (data ?? []) as ChainsawRecord[];

  const totalRegistrations = records.length;

  const activePermits = records.filter(
    (record) => !isExpired(record.expiry_date)
  ).length;

  const expiredPermits = records.filter((record) =>
    isExpired(record.expiry_date)
  ).length;

  const complianceRate = percent(activePermits, totalRegistrations);

  const totalBarangays = new Set(
    records
      .map((record) => record.barangay?.trim())
      .filter(Boolean)
  ).size;

  const averageRegistrationsPerMonth =
    totalRegistrations === 0
      ? 0
      : Number((totalRegistrations / 12).toFixed(1));

  const renewalDue30Days = records.filter((record) => {
    if (!record.expiry_date) return false;

    const today = new Date();
    const expiry = new Date(record.expiry_date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const complianceAlerts = expiredPermits;

  const municipalityCounts = records.reduce<Record<string, number>>(
    (acc, record) => {
      const municipality = record.municipality?.trim() || "Unknown";
      acc[municipality] = (acc[municipality] || 0) + 1;
      return acc;
    },
    {}
  );

  const topMunicipalities = Object.entries(municipalityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxMunicipalityCount =
    topMunicipalities.length > 0
      ? Math.max(...topMunicipalities.map((item) => item[1]))
      : 1;

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const monthRecords = records.filter(
      (record) => getMonthIndex(record.registration_date || record.created_at) === index
    );

    const registered = monthRecords.length;
    const active = monthRecords.filter(
      (record) => !isExpired(record.expiry_date)
    ).length;
    const expired = monthRecords.filter((record) =>
      isExpired(record.expiry_date)
    ).length;

    return {
      month: new Date(2026, index, 1).toLocaleString("en-US", {
        month: "short",
      }),
      registered,
      active,
      expired,
    };
  });

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyData.map((item) =>
      Math.max(item.registered, item.active, item.expired)
    )
  );

  const activeAngle = percent(activePermits, totalRegistrations);
  const expiredAngle = percent(expiredPermits, totalRegistrations);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="rounded-2xl bg-linear-to-r from-teal-800 via-teal-700 to-emerald-500 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">
                  Reports & Analytics
                </h1>

                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Live Data
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-white/90">
                Comprehensive insights and statistics from Supabase records
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/records"
                className="rounded-lg bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25"
              >
                View Records
              </Link>

              <Link
                href="/registration"
                className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-yellow-300"
              >
                + New Registration
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
              <Download className="h-4 w-4" />
              Export All Reports
            </button>

            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
              <CalendarDays className="h-4 w-4" />
              Custom Date Range
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            Failed to load reports from Supabase: {error.message}
          </div>
        )}

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Registrations"
            value={totalRegistrations}
            color="bg-blue-500"
            bg="bg-blue-50"
          />

          <StatCard
            title="Active Permits"
            value={activePermits}
            color="bg-emerald-500"
            bg="bg-emerald-50"
          />

          <StatCard
            title="Expired Permits"
            value={expiredPermits}
            color="bg-red-500"
            bg="bg-red-50"
          />

          <StatCard
            title="Compliance Rate"
            value={`${complianceRate}%`}
            color="bg-teal-500"
            bg="bg-teal-50"
          />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Monthly Trends
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Registrations, renewals, and expirations over time
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Live
              </span>
            </div>

            <div className="flex h-56 items-end gap-2 border-b border-l border-slate-200 px-2 pb-2">
              {monthlyData.map((item) => (
                <div
                  key={item.month}
                  className="flex flex-1 flex-col items-center justify-end gap-1"
                >
                  <div className="flex h-40 items-end gap-1">
                    <div
                      className="w-2 rounded-t bg-teal-500"
                      style={{
                        height: `${(item.registered / maxMonthlyValue) * 100}%`,
                      }}
                      title={`Registered: ${item.registered}`}
                    />
                    <div
                      className="w-2 rounded-t bg-blue-500"
                      style={{
                        height: `${(item.active / maxMonthlyValue) * 100}%`,
                      }}
                      title={`Active: ${item.active}`}
                    />
                    <div
                      className="w-2 rounded-t bg-red-500"
                      style={{
                        height: `${(item.expired / maxMonthlyValue) * 100}%`,
                      }}
                      title={`Expired: ${item.expired}`}
                    />
                  </div>

                  <span className="text-[10px] font-bold text-slate-500">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-teal-500" />
                Registered
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                Active
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                Expired
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Status Distribution
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Current breakdown of all registered chainsaws
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center">
              <div
                className="flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#22c55e 0% ${activeAngle}%, #ef4444 ${activeAngle}% ${
                    activeAngle + expiredAngle
                  }%, #94a3b8 ${activeAngle + expiredAngle}% 100%)`,
                }}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                  <BarChart3 className="h-9 w-9 text-teal-700" />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs font-bold">
                <span className="text-emerald-600">
                  Active: {activePermits}
                </span>
                <span className="text-red-600">
                  Expired: {expiredPermits}
                </span>
                <span className="text-slate-500">
                  Total: {totalRegistrations}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Top Municipalities
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Registrations by location
                </p>
              </div>

              <Link
                href="/records"
                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                Full List
              </Link>
            </div>

            <div className="space-y-4">
              {topMunicipalities.length > 0 ? (
                topMunicipalities.map(([municipality, count]) => (
                  <div key={municipality}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold">
                      <span>{municipality}</span>
                      <span>{count}</span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{
                          width: `${(count / maxMunicipalityCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  No municipality data yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Quick Statistics
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Key metrics at a glance
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <QuickStat
                label="Total Permit Holders"
                value={totalRegistrations}
                bg="bg-blue-50"
                border="border-blue-300"
              />

              <QuickStat
                label="Average Registrations/Month"
                value={averageRegistrationsPerMonth}
                bg="bg-emerald-50"
                border="border-emerald-300"
              />

              <QuickStat
                label="Renewals Due 30 Days"
                value={renewalDue30Days}
                bg="bg-yellow-50"
                border="border-yellow-300"
              />

              <QuickStat
                label="Compliance Alerts"
                value={complianceAlerts}
                bg="bg-red-50"
                border="border-red-300"
              />

              <QuickStat
                label="Barangays Covered"
                value={totalBarangays}
                bg="bg-teal-50"
                border="border-teal-300"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <h2 className="text-lg font-black text-slate-900">
            Generate Custom Reports
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <ReportButton
              title="Full Registry Report"
              description="All registrations"
              href="/records"
              color="border-blue-300 bg-blue-50"
            />

            <ReportButton
              title="Compliance Report"
              description="Expired permits"
              href="/records"
              color="border-red-300 bg-red-50"
            />

            <ReportButton
              title="Annual Summary"
              description="Year overview"
              href="/reports"
              color="border-emerald-300 bg-emerald-50"
            />

            <ReportButton
              title="Custom Analytics"
              description="Build your own"
              href="/reports"
              color="border-teal-300 bg-teal-50"
            />
          </div>
        </section>

        <p className="mt-8 text-center text-xs font-medium text-slate-500">
          © 2026 DENR, Dolores Eastern Samar - Region VIII
        </p>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  bg,
}: {
  title: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 ${bg} p-5 shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
        </div>

        <div className={`h-9 w-9 rounded-xl ${color}`} />
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  bg,
  border,
}: {
  label: string;
  value: string | number;
  bg: string;
  border: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function ReportButton({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border ${color} p-4 transition hover:scale-[1.02] hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <FileText className="mt-1 h-5 w-5 text-slate-700" />

        <div>
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          <p className="text-xs font-semibold text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}