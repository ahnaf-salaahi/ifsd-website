import { createClient } from "@/lib/supabase/server";
import ProgrammesAdminClient from "@/components/admin/ProgrammesAdminClient";
import type { ProgrammeRecord } from "@/lib/programmes";

export const revalidate = 0;

export default async function AdminProgrammesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programmes")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Programmes</h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Could not load Programmes: {error.message}
        </p>
      </div>
    );
  }

  return (
    <ProgrammesAdminClient
      initialProgrammes={(data ?? []) as ProgrammeRecord[]}
    />
  );
}
