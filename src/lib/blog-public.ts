import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { databaseError } from "@/lib/cms/errors";
import { getPublicSettings } from "@/lib/cms/settings";
import { safeLegacyPublicImageUrl } from "@/lib/public-image";

const PAGE_SIZE = 8;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_COLUMNS =
  "id,title,slug,content,author,cover_image_url,created_at,published";

export type BlogFilters = {
  search: string;
  page: number;
};

export function parseBlogFilters(
  values: Record<string, string | string[] | undefined>,
): BlogFilters {
  const first = (name: string) => {
    const value = values[name];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };
  const rawPage = Number(first("page"));
  return {
    search: normalizeSearch(first("search")),
    page:
      Number.isSafeInteger(rawPage) && rawPage > 0
        ? Math.min(rawPage, 10_000)
        : 1,
  };
}

export async function listPublicBlogs(filters: BlogFilters) {
  await connection();
  const supabase = createPublicClient();
  const from = (filters.page - 1) * PAGE_SIZE;
  let query = supabase
    .from("blogs")
    .select(PUBLIC_COLUMNS, { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false, nullsFirst: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,author.ilike.%${filters.search}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw databaseError("blog.public.list", error);
  const total = count ?? 0;
  return {
    items: data.map((post) => ({
      ...post,
      coverImageUrl: safeLegacyPublicImageUrl(post.cover_image_url),
    })),
    page: filters.page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export const getPublicBlog = cache(async (slug: string) => {
  if (!isValidSlug(slug)) return null;
  await connection();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw databaseError("blog.public.detail", error);
  if (!data || !data.published || !isValidSlug(data.slug)) return null;
  return {
    ...data,
    coverImageUrl: safeLegacyPublicImageUrl(data.cover_image_url),
  };
});

export const getBlogMetadataDefaults = cache(getPublicSettings);

export function isValidBlogSlug(slug: string) {
  return isValidSlug(slug);
}

function isValidSlug(slug: string) {
  return slug.length <= 160 && SLUG_PATTERN.test(slug);
}

function normalizeSearch(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100)
    .trim();
}
