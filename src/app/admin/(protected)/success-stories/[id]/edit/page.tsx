import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SuccessStoryForm from "@/components/admin/SuccessStoryForm";
import type {
  RelatedContentOption,
  SuccessStoryRecord,
} from "@/lib/success-stories";

export const revalidate = 0;

export default async function EditSuccessStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [
    { data: story, error },
    { data: programmes, error: programmesError },
    { data: scholarships, error: scholarshipsError },
  ] = await Promise.all([
    supabase.from("success_stories").select("*").eq("id", id).single(),
    supabase.from("programmes").select("id, title").order("title"),
    supabase.from("scholarships").select("id, title").order("title"),
  ]);

  if (error || !story) notFound();
  const optionsError = programmesError ?? scholarshipsError;
  if (optionsError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Success Story
        </h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Could not load Programme and Scholarship options:{" "}
          {optionsError.message}
        </p>
      </div>
    );
  }

  let profilePreviewUrl = "";
  let coverPreviewUrl = "";
  if (story.profile_image_path) {
    const { data: signedProfile } = await supabase.storage
      .from("content-images")
      .createSignedUrl(story.profile_image_path, 3600);
    profilePreviewUrl = signedProfile?.signedUrl ?? "";
  }
  if (story.cover_image_path) {
    const { data: signedCover } = await supabase.storage
      .from("content-images")
      .createSignedUrl(story.cover_image_path, 3600);
    coverPreviewUrl = signedCover?.signedUrl ?? "";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Success Story
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the story, relationships, publication, and search metadata.
        </p>
      </div>
      <SuccessStoryForm
        story={story as SuccessStoryRecord}
        programmes={(programmes ?? []) as RelatedContentOption[]}
        scholarships={(scholarships ?? []) as RelatedContentOption[]}
        profilePreviewUrl={profilePreviewUrl}
        coverPreviewUrl={coverPreviewUrl}
      />
    </div>
  );
}
