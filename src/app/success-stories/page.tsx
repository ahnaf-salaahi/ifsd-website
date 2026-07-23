import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SuccessStoriesClient, {
  type PublicSuccessStory,
} from "@/components/SuccessStoriesClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Success Stories | Institute for Skills Development",
  description:
    "Read stories from students, scholarship recipients, participants, parents, and mentors in our community.",
};

export default async function SuccessStoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("success_stories")
    .select(
      "id, slug, person_name, story_title, short_summary, testimonial_quote, role_or_achievement, location, featured, profile_image_path, cover_image_path"
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Success Stories are temporarily unavailable
        </h1>
        <p className="mt-4 text-gray-600">
          We could not load the stories. Please try again later.
        </p>
      </div>
    );
  }

  const stories: PublicSuccessStory[] = await Promise.all(
    (data ?? []).map(async (story) => {
      const [profileResult, coverResult] = await Promise.all([
        story.profile_image_path
          ? supabase.storage
              .from("content-images")
              .createSignedUrl(story.profile_image_path, 3600)
          : Promise.resolve({ data: null }),
        story.cover_image_path
          ? supabase.storage
              .from("content-images")
              .createSignedUrl(story.cover_image_path, 3600)
          : Promise.resolve({ data: null }),
      ]);

      return {
        id: story.id,
        slug: story.slug,
        person_name: story.person_name,
        story_title: story.story_title,
        short_summary: story.short_summary,
        testimonial_quote: story.testimonial_quote,
        role_or_achievement: story.role_or_achievement,
        location: story.location,
        featured: story.featured,
        profile_image_url: profileResult.data?.signedUrl ?? null,
        cover_image_url: coverResult.data?.signedUrl ?? null,
      };
    })
  );

  return <SuccessStoriesClient stories={stories} />;
}
