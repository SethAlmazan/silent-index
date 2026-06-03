import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/chainventory/app";

type Permit = {
  id: string;
  owner_name: string;
  serial_number: string;
  municipality: string;
  barangay: string;
  status: string;
  expiry_date: string;
  brand?: string;
  model?: string;
  user_id?: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, send them to login page
  if (!user) {
    redirect("/login");
  }

  // Fetch only permits owned by the logged-in user
  const { data, error } = await supabase
    .from("permits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-600">{error.message}</div>;
  }

  const permits: Permit[] = data ?? [];
  const today = new Date();

  const getRealStatus = (permit: Permit) => {
    if (new Date(permit.expiry_date) < today) return "expired";
    return permit.status;
  };

  const total = permits.length;
  const active = permits.filter((p) => getRealStatus(p) === "active").length;
  const forRenewal = permits.filter(
    (p) => getRealStatus(p) === "for_renewal"
  ).length;
  const expired = permits.filter((p) => getRealStatus(p) === "expired").length;
  const deactivated = permits.filter(
    (p) => getRealStatus(p) === "deactivated"
  ).length;

  const recent = permits.slice(0, 5);

  return (
    <AppShell active="dashboard">
      <div className="space-y-5 px-0 py-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          <Stat
            title="TOTAL REGISTERED"
            value={total}
            color="bg-blue-500"
            box="border-blue-200 bg-blue-50"
          />
          <Stat
            title="ACTIVE"
            value={active}
            color="bg-green-500"
            box="border-green-200 bg-green-50"
          />
          <Stat
            title="FOR RENEWAL"
            value={forRenewal}
            color="bg-yellow-500"
            box="border-yellow-200 bg-yellow-50"
          />
          <Stat
            title="EXPIRED"
            value={expired}
            color="bg-red-500"
            box="border-red-200 bg-red-50"
          />
          <Stat
            title="DEACTIVATED"
            value={deactivated}
            color="bg-slate-500"
            box="border-slate-200 bg-slate-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-orange-300 bg-white shadow">
            <div className="bg-orange-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black sm:text-3xl">
                  Registered Permits
                </h2>

                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  {permits.length}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="w-fit rounded-full bg-red-500 px-3 py-2 text-xs font-bold text-white">
                  ⚠ Compliance Risk
                </span>

                <span className="text-xs text-slate-600">
                  Real-time permit monitoring
                </span>
              </div>
            </div>

            {permits.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No permits found for this account.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {permits.map((permit) => {
                  const realStatus = getRealStatus(permit);

                  return (
                    <div
                      key={permit.id}
                      className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[70px_1fr] lg:grid-cols-[70px_1.2fr_1fr_1fr_1.2fr] lg:items-center"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
                        {getInitials(permit.owner_name)}
                      </div>

                      <div className="min-w-0">
                        <p className="wrap-break-words font-bold">
                          {permit.owner_name}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            realStatus === "expired"
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {realStatus}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <span className="inline-block max-w-full wrap-break-words rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold">
                          {permit.serial_number}
                        </span>

                        <p className="mt-2 wrap-break-words text-xs text-slate-500">
                          {permit.barangay}
                        </p>
                      </div>

                      <p className="wrap-break-words font-bold">
                        {permit.municipality}
                      </p>

                      <div>
                        <span
                          className={`inline-block rounded-full border px-4 py-2 text-xs font-bold ${getStatusClass(
                            realStatus
                          )}`}
                        >
                          {realStatus}
                        </span>

                        <p className="mt-2 text-xs text-slate-500">
                          Expiry: {formatDate(permit.expiry_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-cyan-300 bg-white p-4 shadow sm:p-5">
              <div className="flex justify-between gap-4">
                <h2 className="text-2xl font-black leading-6">
                  Monthly
                  <br />
                  Registrations
                </h2>

                <div className="shrink-0 text-right">
                  <p className="text-3xl font-black text-teal-600">{total}</p>
                  <p className="text-xs">Total</p>
                </div>
              </div>

              <div className="mt-5 flex h-24 items-end gap-2 border-b border-l border-slate-300 pl-2">
                {[20, 25, 8, 60, 5, 80, 78, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t-lg bg-teal-500"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-300 bg-white p-4 shadow sm:p-5">
              <h2 className="text-2xl font-black">Recent Registrations</h2>

              <div className="mt-4 space-y-3">
                {recent.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No recent registrations.
                  </p>
                ) : (
                  recent.map((permit) => {
                    const realStatus = getRealStatus(permit);

                    return (
                      <div
                        key={permit.id}
                        className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-sm font-bold text-white">
                              {getInitials(permit.owner_name)}
                            </div>

                            <div className="min-w-0">
                              <p className="wrap-break-words font-bold">
                                {permit.owner_name}
                              </p>

                              <p className="mt-1 wrap-break-words text-xs text-slate-500">
                                {permit.brand} {permit.model}
                              </p>

                              <p className="wrap-break-words text-xs text-slate-500">
                                SN: {permit.serial_number}
                              </p>

                              <p className="wrap-break-words text-xs text-slate-500">
                                📍 {permit.barangay}, {permit.municipality}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`h-fit w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                              realStatus
                            )}`}
                          >
                            {realStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  title,
  value,
  color,
  box,
}: {
  title: string;
  value: number;
  color: string;
  box: string;
}) {
  return (
    <div className={`relative min-w-0 rounded-2xl border p-4 shadow sm:p-5 ${box}`}>
      <p className="max-w-22.5 wrap-break-words text-[10px] font-semibold tracking-wide text-slate-700 sm:max-w-none sm:text-xs">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black sm:text-4xl">{value}</p>

      <div
        className={`absolute right-4 top-4 h-8 w-8 rounded-xl shadow sm:right-5 sm:top-5 sm:h-10 sm:w-10 ${color}`}
      />
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
}

function getStatusClass(status: string) {
  if (status === "active") return "bg-green-100 text-green-600 border-green-500";
  if (status === "expired") return "bg-red-100 text-red-600 border-red-500";
  if (status === "for_renewal")
    return "bg-yellow-100 text-yellow-700 border-yellow-500";
  return "bg-slate-100 text-slate-600 border-slate-500";
}