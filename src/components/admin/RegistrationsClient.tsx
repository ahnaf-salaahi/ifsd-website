"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string | null;
  events: { title: string } | null;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Date unavailable";
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function RegistrationsClient({
  registrations,
  title = "Registrations",
}: {
  registrations: Registration[];
  title?: string;
}) {
  const eventTitles = [
    "All",
    ...Array.from(new Set(registrations.map((r) => r.events?.title ?? "Unknown Event"))),
  ];
  const [filter, setFilter] = useState("All");

  const filtered = registrations.filter(
    (r) => filter === "All" || (r.events?.title ?? "Unknown Event") === filter
  );

  function exportCSV() {
    const headers = ["Event", "Full Name", "Email", "Phone", "Notes", "Date"];
    const rows = filtered.map((r) => [
      r.events?.title ?? "Unknown Event",
      r.full_name,
      r.email,
      r.phone ?? "",
      (r.notes ?? "").replace(/,/g, ";"),
      formatDate(r.created_at),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${filter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {eventTitles.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === t
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Event</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-900">{r.events?.title ?? "Unknown Event"}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{r.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{r.email}</td>
                <td className="px-6 py-4 text-gray-600">{r.phone ?? "—"}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(r.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
