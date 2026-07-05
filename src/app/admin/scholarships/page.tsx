import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export const revalidate = 0;

export default async function AdminScholarshipsPage() {
  const supabase = await createClient();
  const { data: scholarships } = await supabase
    .from("scholarships")
    .select("*")
    .order("deadline", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Scholarships</h1>
        <Link
          href="/admin/scholarships/new"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} /> New Scholarship
        </Link>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Country</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {(scholarships ?? []).map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-900 font-medium">{s.title}</td>
                <td className="px-6 py-4 text-gray-600">{s.country}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/scholarships/${s.id}`}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!scholarships || scholarships.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No scholarships yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}