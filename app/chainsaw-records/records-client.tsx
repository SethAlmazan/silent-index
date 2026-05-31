/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Eye, Filter, Pencil, Search, Trash2 } from "lucide-react";

type RecordData = {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
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
      .from("permits")
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

    console.log("Editing record ID:", id);
    console.log("Data to update:", cleaned);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(cleaned)
      .eq("id", id)
      .select();

    console.log("Update result:", data);
    console.log("Update error:", error);

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
    const first = String(record.first_name || "");

    const middle = String(record.middle_name || "");

    const last = String(record.last_name || "");

    return `${first} ${middle} ${last}`.replace(/\s+/g, " ").trim();
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
    <div className="space-y-6">
      <section className="rounded-[28px] bg-linear-to-r from-[#0f7c82] to-[#9cc8b8] p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black">Chainsaw Records</h1>

              <span className="rounded-full border border-white/60 px-4 py-1 text-sm font-semibold">
                {filteredRecords.length} Records
              </span>
            </div>

            <p className="mt-3 text-lg text-white/90">
              Complete database of registered chainsaws in Eastern Samar
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-62.5 flex-1">
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
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="all">All Statuses</option>

            <option value="active">Active</option>

            <option value="expired">Expired</option>
          </select>

          <button className="flex items-center gap-2 rounded-xl bg-[#162942] px-5 py-3 font-semibold text-white">
            <Filter className="h-6 w-6" />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-550 border-collapse text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-[#162942]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={
                      column === "owner_name"
                        ? "sticky left-0 z-20 min-w-55 whitespace-nowrap border-b bg-slate-50 px-5 py-4 text-left shadow-[4px_0_8px_rgba(0,0,0,0.05)]"
                        : "whitespace-nowrap border-b px-5 py-4 text-left"
                    }
                  >
                    {column.replaceAll("_", " ")}
                  </th>
                ))}

                <th className="sticky right-35 z-20 border-b bg-slate-50 px-5 py-4 text-left">
                  Status
                </th>

                <th className="sticky right-0 z-20 border-b bg-slate-50 px-5 py-4 text-left">
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
                              ? "sticky left-0 z-10 min-w-55 border-b bg-white px-5 py-4 font-bold shadow-[4px_0_8px_rgba(0,0,0,0.05)]"
                              : "border-b px-5 py-4"
                          }
                        >
                          <div className="min-w-35 wrap-break-word">
                            {renderValue(record, column)}
                          </div>
                        </td>
                      ))}

                      <td className="sticky right-35 z-10 border-b bg-white px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            status === "expired"
                              ? "border-red-500 bg-red-100 text-red-600"
                              : "border-green-500 bg-green-100 text-green-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="sticky right-0 z-10 border-b bg-white px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewRecord(record)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setEditingRecord(record)}
                            className="rounded-lg bg-green-50 p-2 text-green-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            disabled={deletingId === record.id}
                            onClick={() => deleteRecord(record.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-black">Record Details</h2>

              <button
                onClick={() => setViewRecord(null)}
                className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

                    <p className="mt-2 wrap-break-words text-base font-semibold text-slate-800">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-black">Edit Record</h2>

              <button
                onClick={() => setEditingRecord(null)}
                className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    : key === "status"
                      ? getStatus(editingRecord)
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
              className="mt-6 rounded-2xl bg-teal-600 px-6 py-4 font-bold text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
