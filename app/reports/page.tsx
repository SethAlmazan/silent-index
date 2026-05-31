import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/chainventory/app";
import {
  DateButton,
  ExportButton,
  HeroBanner,
  ReportChoiceCard,
  StatCard,
} from "@/components/chainventory/ui";

type ChainsawRecord = {
  id?: string;
  owner_name?: string | null;
  municipality?: string | null;
  barangay?: string | null;
  registration_date?: string | null;
  expiry_date?: string | null;
  expiration_date?: string | null;
  permit_expiry_date?: string | null;
  created_at?: string | null;
};

const TABLE_NAME = "permits";

function getExpiryDate(record: ChainsawRecord) {
  return (
    record.expiry_date ||
    record.expiration_date ||
    record.permit_expiry_date ||
    null
  );
}

function isActive(expiryDate: string | null) {
  if (!expiryDate) return false;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return expiry >= today;
}

function isExpired(expiryDate: string | null) {
  if (!expiryDate) return false;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return expiry < today;
}

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  const records = (data ?? []) as ChainsawRecord[];

  const totalRegistrations = records.length;

  const activePermits = records.filter((record) =>
    isActive(getExpiryDate(record))
  ).length;

  const expiredPermits = records.filter((record) =>
    isExpired(getExpiryDate(record))
  ).length;

  const complianceRate =
    totalRegistrations === 0
      ? 0
      : Math.round((activePermits / totalRegistrations) * 100);

  const averageRegistrationsPerMonth =
    totalRegistrations === 0
      ? 0
      : Number((totalRegistrations / 12).toFixed(1));

  const renewalDue30Days = records.filter((record) => {
    const expiryDate = getExpiryDate(record);

    if (!expiryDate) return false;

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const complianceAlerts = expiredPermits;

  return (
    <AppShell active="reports">
      <HeroBanner
        title="Reports & Analytics"
        subtitle="Comprehensive insights and statistics for chainsaw registrations"
        leftBadges={<span className="badge-live">📊 Live Data</span>}
        actions={
          <div className="mt-2 flex flex-wrap gap-3">
            <ExportButton label="Export All Reports" />
            <DateButton label="Custom Date Range" />
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load Supabase data: {error.message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Registrations"
          value={totalRegistrations}
          kind="blue"
        />

        <StatCard
          label="Active Permits"
          value={activePermits}
          kind="green"
        />

        <StatCard
          label="Expired Permits"
          value={expiredPermits}
          kind="red"
        />

        <div className="soft-card rounded-[26px] p-6 stat-panel-green">
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
            <div className="rounded-[20px] border border-blue-200 bg-blue-50 p-5">
              <div className="text-sm text-slate-600">
                Total Permit Holders
              </div>
              <div className="mt-1 text-4xl font-extrabold">
                {totalRegistrations}
              </div>
            </div>

            <div className="rounded-[20px] border border-green-200 bg-green-50 p-5">
              <div className="text-sm text-slate-600">
                Average Registration/Month
              </div>
              <div className="mt-1 text-4xl font-extrabold">
                {averageRegistrationsPerMonth}
              </div>
            </div>

            <div className="rounded-[20px] border border-yellow-200 bg-yellow-50 p-5">
              <div className="text-sm text-slate-600">
                Renewals Due (30 days)
              </div>
              <div className="mt-1 text-4xl font-extrabold">
                {renewalDue30Days}
              </div>
            </div>

            <div className="rounded-[20px] border border-red-200 bg-red-50 p-5">
              <div className="text-sm text-slate-600">Compliance Alerts</div>
              <div className="mt-1 text-4xl font-extrabold">
                {complianceAlerts}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-card mt-6 rounded-3xl p-6">
        <div className="mb-5 text-2xl font-extrabold">
          Generate Custom Reports
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportChoiceCard
            title="Full Registry Report"
            subtitle="All registrations"
            tone="blue"
          />

          <ReportChoiceCard
            title="Compliance Report"
            subtitle="Expired permits"
            tone="red"
          />

          <ReportChoiceCard
            title="Annual Summary"
            subtitle="Year overview"
            tone="green"
          />

          <ReportChoiceCard
            title="Custom Analytics"
            subtitle="Build your own"
            tone="teal"
          />
        </div>
      </section>
    </AppShell>
  );
}