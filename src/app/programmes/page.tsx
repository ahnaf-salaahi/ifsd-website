import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProgrammesClient, {
  type PublicProgramme,
} from "@/components/ProgrammesClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Programmes | Institute for Skills Development",
  description:
    "Explore published skills, education, leadership, and community development programmes.",
};

export default async function ProgrammesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programmes")
    .select(
      "id, title, slug, short_summary, full_description, description, category, delivery_mode, duration, location, featured, featured_image_path, image_url"
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Programmes are temporarily unavailable
        </h1>
        <p className="mt-4 text-gray-600">
          We could not load the Programme catalogue. Please try again later.
        </p>
      </div>
    );
  }

  const programmes: PublicProgramme[] = await Promise.all(
    (data ?? []).map(async (programme) => {
      let displayImageUrl = programme.image_url;

      if (programme.featured_image_path) {
        const { data: signedImage } = await supabase.storage
          .from("content-images")
          .createSignedUrl(programme.featured_image_path, 3600);
        displayImageUrl = signedImage?.signedUrl ?? displayImageUrl;
      }

      return {
        id: programme.id,
        title: programme.title,
        slug: programme.slug,
        short_summary: programme.short_summary,
        full_description: programme.full_description,
        description: programme.description,
        category: programme.category,
        delivery_mode: programme.delivery_mode,
        duration: programme.duration,
        location: programme.location,
        featured: programme.featured,
        display_image_url: displayImageUrl,
      };
    })
  );

  return <ProgrammesClient programmes={programmes} />;
}
