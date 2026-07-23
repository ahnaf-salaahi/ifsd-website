import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgrammeForm from "@/components/admin/ProgrammeForm";
import type {
  ProgrammeModuleRecord,
  ProgrammeOutcomeRecord,
  ProgrammeRecord,
} from "@/lib/programmes";

export const revalidate = 0;

export default async function EditProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: programme, error: programmeError },
    { data: modules, error: modulesError },
    { data: outcomes, error: outcomesError },
  ] = await Promise.all([
    supabase.from("programmes").select("*").eq("id", id).single(),
    supabase
      .from("programme_modules")
      .select("*")
      .eq("programme_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("programme_learning_outcomes")
      .select("*")
      .eq("programme_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (programmeError || !programme) notFound();

  if (modulesError || outcomesError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Programme
        </h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Could not load the complete Programme:{" "}
          {modulesError?.message ?? outcomesError?.message}
        </p>
      </div>
    );
  }

  let imagePreviewUrl = "";
  if (programme.featured_image_path) {
    const { data: signedImage } = await supabase.storage
      .from("content-images")
      .createSignedUrl(programme.featured_image_path, 3600);
    imagePreviewUrl = signedImage?.signedUrl ?? "";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Programme
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update content, ordering, publication, and search metadata.
        </p>
      </div>
      <ProgrammeForm
        programme={programme as ProgrammeRecord}
        modules={(modules ?? []) as ProgrammeModuleRecord[]}
        outcomes={(outcomes ?? []) as ProgrammeOutcomeRecord[]}
        imagePreviewUrl={imagePreviewUrl}
      />
    </div>
  );
}
