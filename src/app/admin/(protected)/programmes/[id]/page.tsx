import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProgrammeForm from "@/components/admin/ProgrammeForm";

export default async function EditProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: programme } = await supabase
    .from("programmes")
    .select("*")
    .eq("id", id)
    .single();

  if (!programme) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Programme</h1>
      <ProgrammeForm programme={programme} />
    </div>
  );
}