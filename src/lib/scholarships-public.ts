import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createPublishedMediaSignedUrl } from "@/lib/cms/media";
import { databaseError } from "@/lib/cms/errors";
import { getPublicSettings } from "@/lib/cms/settings";

const PAGE_SIZE = 9;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CLOSING_SOON_DAYS = 14;
const COLUMNS =
  "id,title,slug,description,country,funding_type,study_level,deadline,eligibility,required_documents,apply_link,cover_image_url,created_at";

export type ScholarshipFilters = {
  search: string;
  country: string;
  funding: string;
  level: string;
  page: number;
};

export function parseScholarshipFilters(
  values: Record<string, string | string[] | undefined>,
): ScholarshipFilters {
  const first = (name: string) => {
    const value = values[name];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };
  const clean = (name: string, max = 100) =>
    first(name)
      .replace(/[^\p{L}\p{N}\s.'()-]/gu, " ")
      .replace(/\s+/g, " ")
      .slice(0, max)
      .trim();
  const page = Number(first("page"));
  return {
    search: clean("search"),
    country: clean("country", 100),
    funding: clean("funding", 100),
    level: clean("level", 100),
    page:
      Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

export async function getScholarshipFilterOptions() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("scholarships")
    .select("country,funding_type,study_level")
    .eq("published", true)
    .order("country")
    .limit(200);
  if (error) throw databaseError("scholarships.public.options", error);
  const unique = (values: string[]) =>
    [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b),
    );
  return {
    countries: unique(data.map((item) => item.country)),
    fundingTypes: unique(data.map((item) => item.funding_type)),
    studyLevels: unique(data.map((item) => item.study_level)),
  };
}

export async function listPublicScholarships(filters: ScholarshipFilters) {
  await connection();
  const supabase = createPublicClient();
  const from = (filters.page - 1) * PAGE_SIZE;
  let query = supabase
    .from("scholarships")
    .select(COLUMNS, { count: "exact" })
    .eq("published", true)
    .not("slug", "is", null)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,country.ilike.%${filters.search}%,eligibility.ilike.%${filters.search}%`,
    );
  }
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.funding) query = query.eq("funding_type", filters.funding);
  if (filters.level) query = query.eq("study_level", filters.level);
  const { data, error, count } = await query;
  if (error) throw databaseError("scholarships.public.list", error);

  const forms =
    data.length > 0
      ? await supabase
          .from("forms")
          .select("scholarship_id")
          .in("scholarship_id", data.map((item) => item.id))
          .in("purpose", ["application", "registration"])
          .eq("is_active", true)
          .eq("is_public", true)
          .limit(PAGE_SIZE)
      : { data: [], error: null };
  const formOwners = new Set(
    (forms.data ?? []).flatMap((form) =>
      form.scholarship_id ? [form.scholarship_id] : [],
    ),
  );
  if (forms.error) {
    console.error("Public Scholarship forms unavailable", {
      operation: "scholarships.public.forms",
      code: "database",
    });
  }
  const items = await Promise.all(
    data.map(async (scholarship) => {
      const deadlineStatus = scholarshipDeadlineStatus(scholarship.deadline);
      return {
        ...scholarship,
        applicationStatus:
          formOwners.has(scholarship.id) && deadlineStatus !== "closed"
            ? deadlineStatus === "closing_soon"
              ? "closing_soon"
              : "open"
            : "closed",
        displayImageUrl: await resolveScholarshipImage(scholarship),
      };
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

export const getPublicScholarship = cache(async (slug: string) => {
  if (!SLUG.test(slug) || slug.length > 160) return null;
  await connection();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("scholarships")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw databaseError("scholarships.public.detail", error);
  if (!data) return null;
  const deadlineStatus = scholarshipDeadlineStatus(data.deadline);
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id")
    .eq("scholarship_id", data.id)
    .in("purpose", ["application", "registration"])
    .eq("is_active", true)
    .eq("is_public", true)
    .limit(1)
    .maybeSingle();
  if (formError) {
    console.error("Public Scholarship form check failed", {
      operation: "scholarships.public.form",
      code: "database",
    });
  }
  return {
    scholarship: data,
    deadlineStatus,
    applicationAvailable:
      !formError && Boolean(form) && deadlineStatus !== "closed",
    formId: !formError ? form?.id ?? null : null,
  };
});

export const getScholarshipMetadataDefaults = cache(getPublicSettings);

export function scholarshipDeadlineStatus(deadline: string | null) {
  if (!deadline) return "deadline_unknown" as const;
  // Date-only deadlines remain open through 23:59:59.999 Asia/Colombo.
  const closesAt = new Date(`${deadline}T23:59:59.999+05:30`).getTime();
  const remaining = closesAt - Date.now();
  if (!Number.isFinite(closesAt) || remaining < 0) return "closed" as const;
  if (remaining <= CLOSING_SOON_DAYS * 86_400_000) {
    return "closing_soon" as const;
  }
  return "open" as const;
}

async function resolveScholarshipImage(scholarship: {
  id: string;
  cover_image_url: string | null;
}) {
  const value = scholarship.cover_image_url;
  if (!value) return null;
  if (value.startsWith(`scholarships/${scholarship.id}/`)) {
    try {
      return await createPublishedMediaSignedUrl({
        kind: "scholarship",
        ownerId: scholarship.id,
        objectPath: value,
      });
    } catch (error) {
      console.error("Public Scholarship media unavailable", {
        operation: "scholarships.public.media.cms",
        code: error instanceof Error ? error.name : "unknown",
      });
      return null;
    }
  }
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    const supabase = createPublicClient();
    const { data } = await supabase.storage
      .from("content-images")
      .createSignedUrl(value, 300);
    return data?.signedUrl ?? null;
  }
}
