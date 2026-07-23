import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createPublishedMediaSignedUrl } from "@/lib/cms/media";
import { databaseError } from "@/lib/cms/errors";
import { getPublicSettings } from "@/lib/cms/settings";

const PAGE_SIZE = 9;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LIST_COLUMNS =
  "id,slug,person_name,story_title,short_summary,testimonial_quote,role_or_achievement,location,completion_year,featured,profile_image_path,cover_image_path,programme_id,institution_or_employer,display_order,created_at,programmes(id,title,slug,published,programme_state)";
const DETAIL_COLUMNS =
  "id,slug,person_name,story_title,short_summary,full_story,testimonial_quote,programme_id,scholarship_id,institution_or_employer,role_or_achievement,completion_year,location,before_after_description,video_url,featured,profile_image_path,cover_image_path,seo_title,seo_description,created_at,programmes(id,title,slug,published,programme_state),scholarships(id,title,slug,published)";

export type SuccessStoryFilters = {
  search: string;
  location: string;
  year: string;
  programme: string;
  page: number;
};

export function parseSuccessStoryFilters(
  values: Record<string, string | string[] | undefined>,
): SuccessStoryFilters {
  const first = (name: string) => {
    const value = values[name];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };
  const clean = (name: string) =>
    first(name)
      .replace(/[^\p{L}\p{N}\s.'()-]/gu, " ")
      .replace(/\s+/g, " ")
      .slice(0, 100)
      .trim();
  const rawYear = first("year");
  const rawProgramme = first("programme").toLowerCase();
  const rawPage = Number(first("page"));
  return {
    search: clean("search"),
    location: clean("location"),
    year: /^(19|20|21|22)\d{2}$/.test(rawYear) ? rawYear : "",
    programme: SLUG.test(rawProgramme) ? rawProgramme : "",
    page:
      Number.isSafeInteger(rawPage) && rawPage > 0
        ? Math.min(rawPage, 10_000)
        : 1,
  };
}

export async function getSuccessStoryFilterOptions() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("success_stories")
    .select("location,completion_year,programme_id,programmes(id,title,slug)")
    .eq("published", true)
    .order("completion_year", { ascending: false })
    .limit(200);
  if (error) throw databaseError("stories.public.options", error);
  return {
    locations: [...new Set(data.flatMap((item) => item.location ? [item.location] : []))].sort(),
    years: [...new Set(data.flatMap((item) => item.completion_year ? [String(item.completion_year)] : []))].sort().reverse(),
    programmes: [...new Map(data.flatMap((item) => item.programmes?.slug ? [[item.programmes.id, { id: item.programmes.id, title: item.programmes.title, slug: item.programmes.slug }]] : [])).values()],
  };
}

export async function listPublicSuccessStories(filters: SuccessStoryFilters) {
  await connection();
  const supabase = createPublicClient();
  let programmeId: string | null = null;
  if (filters.programme) {
    const programme = await supabase
      .from("programmes")
      .select("id")
      .eq("slug", filters.programme)
      .eq("published", true)
      .eq("programme_state", "scheduled")
      .maybeSingle();
    if (programme.error) throw databaseError("stories.public.programmeFilter", programme.error);
    if (!programme.data) {
      return { items: [], page: filters.page, pageSize: PAGE_SIZE, total: 0, totalPages: 1 };
    }
    programmeId = programme.data.id;
  }
  const from = (filters.page - 1) * PAGE_SIZE;
  let query = supabase
    .from("success_stories")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("published", true)
    .not("slug", "is", null)
    .order("featured", { ascending: false })
    .order("display_order")
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);
  if (filters.search) {
    query = query.or(
      `story_title.ilike.%${filters.search}%,person_name.ilike.%${filters.search}%,short_summary.ilike.%${filters.search}%,location.ilike.%${filters.search}%,institution_or_employer.ilike.%${filters.search}%`,
    );
  }
  if (filters.location) query = query.eq("location", filters.location);
  if (filters.year) query = query.eq("completion_year", Number(filters.year));
  if (programmeId) query = query.eq("programme_id", programmeId);
  const { data, error, count } = await query;
  if (error) throw databaseError("stories.public.list", error);
  const items = await Promise.all(
    data.map(async (story) => {
      const [profileImageUrl, coverImageUrl] = await Promise.all([
        resolveStoryImage(story.id, story.profile_image_path),
        resolveStoryImage(story.id, story.cover_image_path),
      ]);
      return { ...story, profileImageUrl, coverImageUrl };
    }),
  );
  return {
    items,
    page: filters.page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

export const getPublicSuccessStory = cache(async (slug: string) => {
  if (!SLUG.test(slug) || slug.length > 200) return null;
  await connection();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("success_stories")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw databaseError("stories.public.detail", error);
  if (!data) return null;
  const [profileImageUrl, coverImageUrl] = await Promise.all([
    resolveStoryImage(data.id, data.profile_image_path),
    resolveStoryImage(data.id, data.cover_image_path),
  ]);
  const programme =
    data.programmes?.published &&
    data.programmes.programme_state === "scheduled" &&
    SLUG.test(data.programmes.slug)
      ? data.programmes
      : null;
  const scholarship =
    data.scholarships?.published && SLUG.test(data.scholarships.slug)
      ? data.scholarships
      : null;
  return { story: data, profileImageUrl, coverImageUrl, programme, scholarship };
});

export const getSuccessStoryMetadataDefaults = cache(getPublicSettings);

async function resolveStoryImage(storyId: string, path: string | null) {
  if (!path) return null;
  if (path.startsWith(`success-stories/${storyId}/`)) {
    try {
      return await createPublishedMediaSignedUrl({
        kind: "success_story",
        ownerId: storyId,
        objectPath: path,
      });
    } catch {
      // Legacy content-images used the same owner prefix.
    }
    const legacy = createPublicClient();
    const { data } = await legacy.storage
      .from("content-images")
      .createSignedUrl(path, 300);
    return data?.signedUrl ?? null;
  }
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  try {
    return new URL(path).protocol === "https:" ? path : null;
  } catch {
    return null;
  }
}

export function safeStoryVideoUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
