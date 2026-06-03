/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Eye, Filter, Pencil, Search, Trash2 } from "lucide-react";

type RecordData = {
  id: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
};

const TABLE_NAME = "permits";
const supabase = createClient();

export default function ChainsawRecordsClient() {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewRecord, setViewRecord] = useState<RecordData | null>(null);
  const [editingRecord, setEditingRecord] = useState<RecordData | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchRecords() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setRecords((data || []) as RecordData[]);
    setLoading(false);
  }

  useEffect(() => {
    void fetchRecords();
  }, []);

  async function deleteRecord(id: string) {
    const confirmDelete = confirm("Delete this record?");
    if (!confirmDelete) return;

    setDeletingId(id);

    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

    if (error) {
      alert(error.message);
      setDeletingId(null);
      return;
    }

    setRecords((prev) => prev.filter((record) => record.id !== id));
    setDeletingId(null);
  }

  async function saveEdit() {
    if (!editingRecord) return;

    setSaving(true);

    const { id, created_at, updated_at, status, ...cleaned } = editingRecord;

    void created_at;
    void updated_at;
    void status;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(cleaned)
      .eq("id", id)
      .select();

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    if (!data || data.length === 0) {
      alert(
        "No row was updated. Check if the id column exists and if Supabase UPDATE policy allows updates.",
      );
      setSaving(false);
      return;
    }

    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? (data[0] as unknown as RecordData) : record,
      ),
    );

    setEditingRecord(null);
    setSaving(false);

    alert("Record updated successfully.");
  }

  function getFullName(record: RecordData) {
    const savedOwnerName = String(record.owner_name || "").trim();

    if (savedOwnerName) {
      return savedOwnerName;
    }

    const first = String(record.first_name || "");
    const middle = String(record.middle_name || "");
    const last = String(record.last_name || "");

    return `${first} ${middle} ${last}`.replace(/\s+/g, " ").trim() || "N/A";
  }

  function getStatus(record: RecordData) {
    const expiry = record.expiry_date || record.expiration_date;

    if (!expiry) return "active";

    const expiryDate = new Date(String(expiry));
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return "expired";
    }

    return "active";
  }

  function getRecordValue(record: RecordData, key: string) {
    if (key === "street") {
      return record.street ?? record.complete_address;
    }

    if (key === "date_manufactured") {
      return record.date_manufactured ?? record.year_manufactured;
    }

    return record[key];
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const status = getStatus(record);
      const text = Object.values(record).join(" ").toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const columns = [
    "owner_name",
    "municipality",
    "barangay",
    "street",
    "contact_number",
    "email",
    "brand",
    "model",
    "serial_number",
    "length_of_chainsaw",
    "power_rating",
    "description",
    "date_manufactured",
    "status_of_issuance",
    "registration_date",
    "expiry_date",
  ];

  function renderValue(record: RecordData, column: string) {
    if (column === "owner_name") {
      return getFullName(record);
    }

    if (column === "status") {
      return getStatus(record);
    }

    return String(getRecordValue(record, column) ?? "N/A");
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[28px] bg-linear-to-r from-[#0f7c82] to-[#9cc8b8] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Chainsaw Records
              </h1>

              <span className="w-fit rounded-full border border-white/60 px-4 py-1 text-sm font-semibold">
                {filteredRecords.length} Records
              </span>
            </div>

            <p className="mt-3 text-base text-white/90 sm:text-lg">
              Complete database of registered chainsaws in Eastern Samar
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />

            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 sm:w-44"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#162942] px-5 py-3 font-semibold text-white sm:w-auto">
            <Filter className="h-6 w-6" />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[2300px] border-collapse text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-[#162942]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={
                      column === "owner_name"
                        ? "sticky left-0 z-30 w-[230px] min-w-[230px] whitespace-nowrap border-b bg-slate-50 px-5 py-4 text-left shadow-[4px_0_8px_rgba(0,0,0,0.05)]"
                        : "min-w-[150px] whitespace-nowrap border-b px-5 py-4 text-left"
                    }
                  >
                    {column.replaceAll("_", " ")}
                  </th>
                ))}

                <th className="min-w-[130px] whitespace-nowrap border-b bg-slate-50 px-5 py-4 text-left md:sticky md:right-[120px] md:z-30 md:w-[135px] md:min-w-[135px] md:px-4 md:shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                  Status
                </th>

                <th className="min-w-[120px] whitespace-nowrap border-b bg-slate-50 px-4 py-4 text-center md:sticky md:right-0 md:z-40 md:w-[120px] md:min-w-[120px] md:shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-10 text-center"
                  >
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-10 text-center"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = getStatus(record);

                  return (
                    <tr key={record.id} className="border-t hover:bg-slate-50">
                      {columns.map((column) => (
                        <td
                          key={column}
                          className={
                            column === "owner_name"
                              ? "sticky left-0 z-20 w-[230px] min-w-[230px] border-b bg-white px-5 py-4 font-bold shadow-[4px_0_8px_rgba(0,0,0,0.05)]"
                              : "min-w-[150px] border-b px-5 py-4"
                          }
                        >
                          <div
                            className={
                              column === "owner_name"
                                ? "max-w-[190px] truncate"
                                : "max-w-[190px] break-words"
                            }
                          >
                            {renderValue(record, column)}
                          </div>
                        </td>
                      ))}

                      <td className="min-w-[130px] border-b bg-white px-5 py-4 md:sticky md:right-[120px] md:z-20 md:w-[135px] md:min-w-[135px] md:px-4 md:shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                        <span
                          className={`inline-flex min-w-[76px] items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
                            status === "expired"
                              ? "border-red-500 bg-red-100 text-red-600"
                              : "border-green-500 bg-green-100 text-green-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="min-w-[120px] border-b bg-white px-4 py-4 md:sticky md:right-0 md:z-30 md:w-[120px] md:min-w-[120px] md:shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewRecord(record)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setEditingRecord(record)}
                            className="rounded-lg bg-green-50 p-2 text-green-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            disabled={deletingId === record.id}
                            onClick={() => deleteRecord(record.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-black">Record Details</h2>

              <button
                onClick={() => setViewRecord(null)}
                className="w-full rounded-xl bg-red-500 px-4 py-2 font-bold text-white sm:w-auto"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "owner_name",
                "municipality",
                "barangay",
                "street",
                "contact_number",
                "email",
                "brand",
                "model",
                "serial_number",
                "length_of_chainsaw",
                "power_rating",
                "description",
                "date_manufactured",
                "status_of_issuance",
                "registration_date",
                "expiry_date",
                "status",
              ].map((key) => {
                const value =
                  key === "owner_name"
                    ? getFullName(viewRecord)
                    : key === "status"
                      ? getStatus(viewRecord)
                      : getRecordValue(viewRecord, key);

                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {key === "owner_name"
                        ? "Owner Name"
                        : key.replaceAll("_", " ")}
                    </p>

                    <p className="mt-2 break-words text-base font-semibold text-slate-800">
                      {String(value ?? "N/A")}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-2xl font-black text-slate-900">
                Proof of Ownership
              </h3>

              {Array.isArray(viewRecord.proof_ownership_images) &&
              viewRecord.proof_ownership_images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {viewRecord.proof_ownership_images.map((imageUrl, index) => (
                    <a
                      key={index}
                      href={String(imageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <Image
                        src={String(imageUrl)}
                        alt={`Proof of ownership ${index + 1}`}
                        width={400}
                        height={300}
                        unoptimized
                        className="h-48 w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                  No proof of ownership images uploaded.
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-2xl font-black text-slate-900">
                Inspection Images
              </h3>

              {Array.isArray(viewRecord.inspection_images) &&
              viewRecord.inspection_images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {viewRecord.inspection_images.map((imageUrl, index) => (
                    <a
                      key={index}
                      href={String(imageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <Image
                        src={String(imageUrl)}
                        alt={`Inspection image ${index + 1}`}
                        width={400}
                        height={300}
                        unoptimized
                        className="h-48 w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                  No inspection images uploaded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-black">Edit Record</h2>

              <button
                onClick={() => setEditingRecord(null)}
                className="w-full rounded-xl bg-red-500 px-4 py-2 font-bold text-white sm:w-auto"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "owner_name",
                "municipality",
                "barangay",
                "street",
                "contact_number",
                "email",
                "brand",
                "model",
                "serial_number",
                "length_of_chainsaw",
                "power_rating",
                "description",
                "date_manufactured",
                "status_of_issuance",
                "registration_date",
                "expiry_date",
              ].map((key) => {
                const value =
                  key === "owner_name"
                    ? getFullName(editingRecord)
                    : getRecordValue(editingRecord, key);

                return (
                  <div key={key}>
                    <label className="mb-2 block text-sm font-bold capitalize">
                      {key === "owner_name"
                        ? "Owner Name"
                        : key.replaceAll("_", " ")}
                    </label>

                    <input
                      type="text"
                      value={String(value ?? "")}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <button
              disabled={saving}
              onClick={saveEdit}
              className="mt-6 w-full rounded-2xl bg-teal-600 px-6 py-4 font-bold text-white sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}