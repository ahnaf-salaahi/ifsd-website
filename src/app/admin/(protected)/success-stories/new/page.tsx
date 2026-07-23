import { createClient } from "@/lib/supabase/server";
import SuccessStoryForm from "@/components/admin/SuccessStoryForm";
import type { RelatedContentOption } from "@/lib/success-stories";

export const revalidate = 0;

export default async function NewSuccessStoryPage() {
  const supabase = await createClient();
  const [
    { data: programmes, error: programmesError },
    { data: scholarships, error: scholarshipsError },
  ] = await Promise.all([
    supabase.from("programmes").select("id, title").order("title"),
    supabase.from("scholarships").select("id, title").order("title"),
  ]);

  const optionsError = programmesError ?? scholarshipsError;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          New Success Story
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create the story as a draft or publish it when it is ready.
        </p>
      </div>
      {optionsError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Could not load Programme and Scholarship options:{" "}
          {optionsError.message}
        </p>
      ) : (
        <SuccessStoryForm
          programmes={(programmes ?? []) as RelatedContentOption[]}
          scholarships={(scholarships ?? []) as RelatedContentOption[]}
        />
      )}
    </div>
  );
}
