import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export const revalidate = 0;

function formatDate(dateStr: string | null) {
  if (!dateStr) return "To be announced";
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          <Plus size={18} /> New Event
        </Link>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Registration</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((e) => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-900 font-medium">{e.title}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(e.event_date)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      e.registration_open
                        ? "bg-rose-50 text-rose-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {e.registration_open ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="inline-flex items-center gap-1 text-rose-700 hover:underline"
                  >
                    <Pencil size={14} /> Manage
                  </Link>
                </td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
