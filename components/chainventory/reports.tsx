import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/chainventory/app";
import {
  HeroBanner,
  StatCard,
} from "@/components/chainventory/ui";

type ChainsawRecord = {
  id: string;
  owner_name: string | null;
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

function isActive(expiryDate: string | null) {
  if (!expiryDate) return false;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return expiry >= today;
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
      registration_date,
      expiry_date,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  const records = (data ?? []) as ChainsawRecord[];

  const totalRegistrations = records.length;

  const activePermits = records.filter((record) =>
    isActive(record.expiry_date)
  ).length;

  const expiredPermits = records.filter((record) =>
    isExpired(record.expiry_date)
  ).length;

  const complianceRate = percent(activePermits, totalRegistrations);

  const averageRegistrationsPerMonth =
    totalRegistrations === 0
      ? 0
      : Number((totalRegistrations / 12).toFixed(1));

  const renewalDue30Days = records.filter((record) => {
    if (!record.expiry_date) return false;

    const today = new Date();
    const expiry = new Date(record.expiry_date);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const complianceAlerts = expiredPermits;

  const activePercent = percent(activePermits, totalRegistrations);

  return (
    <AppShell active="reports">
      <HeroBanner
        title="Reports & Analytics"
        subtitle="Comprehensive insights and statistics for chainsaw registrations"
        leftBadges={<span className="badge-live">📊 Live Data</span>}
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load Supabase data: {error.message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Registrations"
          value={totalRegistrations}
          kind="blue"
        />

        <StatCard label="Active Permits" value={activePermits} kind="green" />

        <StatCard label="Expired Permits" value={expiredPermits} kind="red" />

        <div className="soft-card stat-panel-green rounded-[26px] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm uppercase tracking-wider text-slate-700">
                Compliance Rate
              </div>
              <div className="mt-4 text-5xl font-extrabold">
                {complianceRate}%
              </div>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-teal-500 shadow-lg" />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="soft-card rounded-3xl p-7">
          <div className="text-2xl font-extrabold">Quick Statistics</div>
          <div className="mt-1 text-sm text-slate-500">
            Key metrics at a glance
          </div>

          <div className="mt-6 space-y-4">
            <QuickStat
              label="Total Permit Holders"
              value={totalRegistrations}
              color="blue"
            />

            <QuickStat
              label="Average Registration/Month"
              value={averageRegistrationsPerMonth}
              color="green"
            />

            <QuickStat
              label="Renewals Due (30 days)"
              value={renewalDue30Days}
              color="yellow"
            />

            <QuickStat
              label="Compliance Alerts"
              value={complianceAlerts}
              color="red"
            />
          </div>
        </div>

        <div className="soft-card rounded-3xl p-7">
          <div className="text-2xl font-extrabold">Permit Status Pie Graph</div>
          <div className="mt-1 text-sm text-slate-500">
            Active and expired permit distribution
          </div>

          <div className="mt-8 flex flex-col items-center justify-center">
            <div
              className="flex h-64 w-64 items-center justify-center rounded-full shadow-inner"
              style={{
                background:
                  totalRegistrations === 0
                    ? "#e2e8f0"
                    : `conic-gradient(
                        #22c55e 0% ${activePercent}%,
                        #ef4444 ${activePercent}% 100%
                      )`,
              }}
            >
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-lg">
                <div className="text-4xl font-extrabold text-slate-900">
                  {complianceRate}%
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  Compliance
                </div>
              </div>
            </div>

            <div className="mt-8 grid w-full grid-cols-2 gap-4">
              <div className="rounded-[20px] border border-green-200 bg-green-50 p-5 text-center">
                <div className="text-sm font-semibold text-green-700">
                  Active
                </div>
                <div className="mt-1 text-4xl font-extrabold">
                  {activePermits}
                </div>
              </div>

              <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 text-center">
                <div className="text-sm font-semibold text-red-700">
                  Expired
                </div>
                <div className="mt-1 text-4xl font-extrabold">
                  {expiredPermits}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function QuickStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const styles = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    yellow: "border-yellow-200 bg-yellow-50",
    red: "border-red-200 bg-red-50",
  };

  return (
    <div className={`rounded-[20px] border p-5 ${styles[color]}`}>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-4xl font-extrabold">{value}</div>
    </div>
  );
}