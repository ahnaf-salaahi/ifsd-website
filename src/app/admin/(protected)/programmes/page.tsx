import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export const revalidate = 0;

export default async function AdminProgrammesPage() {
  const supabase = await createClient();
  const { data: programmes } = await supabase
    .from("programmes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Programmes</h1>
        <Link
          href="/admin/programmes/new"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus size={18} className="shrink-0" /> New Programme
        </Link>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {(programmes ?? []).map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-900 font-medium">{p.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      p.category === "past"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {p.category === "past" ? "Past" : "Upcoming"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      p.published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/programmes/${p.id}`}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline whitespace-nowrap"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!programmes || programmes.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No programmes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}