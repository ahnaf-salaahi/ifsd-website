import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ScholarshipForm from "@/components/admin/ScholarshipForm";

export default async function EditScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: scholarship } = await supabase
    .from("scholarships")
    .select("*")
    .eq("id", id)
    .single();

  if (!scholarship) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Scholarship</h1>
      <ScholarshipForm scholarship={scholarship} />
    </div>
  );
}