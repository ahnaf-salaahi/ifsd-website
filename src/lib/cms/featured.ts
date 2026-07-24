import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import type {
  FeaturedProgramme,
  FeaturedScholarship,
  FeaturedStory,
} from "./types";

export function resolveFeaturedCta(
  overrideUrl: string | null,
  canonicalUrl: string,
) {
  return overrideUrl || canonicalUrl;
}

export async function listFeaturedProgrammes(): Promise<FeaturedProgramme[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("homepage_featured_programmes")
    .select(
      "id,display_order,custom_heading,custom_summary,image_override_path,cta_label,cta_url,programmes!inner(id,title,slug,short_summary,featured_image_path,programme_state)",
    )
    .eq("is_active", true)
    .neq("programmes.programme_state", "cancelled")
    .order("display_order")
    .order("id")
    .limit(12);
  if (error) throw databaseError("featured.programmes.public", error);

  return data.map((item) => ({
    id: item.id,
    displayOrder: item.display_order,
    heading: item.custom_heading || item.programmes.title,
    summary: item.custom_summary || item.programmes.short_summary,
    imagePath:
      item.image_override_path || item.programmes.featured_image_path,
    ctaLabel: item.cta_label || "View programme",
    ctaUrl: resolveFeaturedCta(
      item.cta_url,
      `/programmes/${item.programmes.slug}`,
    ),
    programme: item.programmes,
  }));
}

export async function listFeaturedScholarships(): Promise<
  FeaturedScholarship[]
> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("homepage_featured_scholarships")
    .select(
      "id,display_order,custom_heading,custom_summary,image_override_path,cta_label,cta_url,scholarships!inner(id,title,slug,description,cover_image_url)",
    )
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(12);
  if (error) throw databaseError("featured.scholarships.public", error);

  return data.map((item) => ({
    id: item.id,
    displayOrder: item.display_order,
    heading: item.custom_heading || item.scholarships.title,
    summary: item.custom_summary || item.scholarships.description,
    imagePath:
      item.image_override_path || item.scholarships.cover_image_url,
    ctaLabel: item.cta_label || "View scholarship",
    ctaUrl: resolveFeaturedCta(
      item.cta_url,
      `/scholarships/${item.scholarships.slug}`,
    ),
    scholarship: item.scholarships,
  }));
}

export async function listFeaturedStories(): Promise<FeaturedStory[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("homepage_featured_stories")
    .select(
      "id,display_order,custom_heading,custom_summary,image_override_path,cta_label,cta_url,success_stories!inner(id,story_title,slug,short_summary,cover_image_path)",
    )
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(12);
  if (error) throw databaseError("featured.stories.public", error);

  return data.map((item) => ({
    id: item.id,
    displayOrder: item.display_order,
    heading: item.custom_heading || item.success_stories.story_title,
    summary: item.custom_summary || item.success_stories.short_summary,
    imagePath:
      item.image_override_path || item.success_stories.cover_image_path,
    ctaLabel: item.cta_label || "Read story",
    ctaUrl: resolveFeaturedCta(
      item.cta_url,
      `/success-stories/${item.success_stories.slug}`,
    ),
    story: item.success_stories,
  }));
}

export async function listAdminFeaturedContent() {
  const { supabase } = await requireAdmin();
  const [programmes, scholarships, stories] = await Promise.all([
    supabase
      .from("homepage_featured_programmes")
      .select("*,programmes(id,title,slug)")
      .order("display_order")
      .order("id"),
    supabase
      .from("homepage_featured_scholarships")
      .select("*,scholarships(id,title,slug)")
      .order("display_order")
      .order("id"),
    supabase
      .from("homepage_featured_stories")
      .select("*,success_stories(id,story_title,slug)")
      .order("display_order")
      .order("id"),
  ]);
  if (programmes.error) {
    throw databaseError("featured.programmes.admin", programmes.error);
  }
  if (scholarships.error) {
    throw databaseError("featured.scholarships.admin", scholarships.error);
  }
  if (stories.error) {
    throw databaseError("featured.stories.admin", stories.error);
  }
  return {
    programmes: programmes.data,
    scholarships: scholarships.data,
    stories: stories.data,
  };
}
