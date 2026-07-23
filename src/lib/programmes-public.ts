import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createPublishedMediaSignedUrl } from "@/lib/cms/media";
import { databaseError } from "@/lib/cms/errors";
import { getPublicSettings } from "@/lib/cms/settings";

const PAGE_SIZE = 8;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MODES = new Set(["online", "in_person", "hybrid"]);

const LIST_COLUMNS =
  "id,title,slug,short_summary,full_description,description,category,category_id,delivery_mode,duration,location,featured,featured_image_path,image_url,display_order,starts_at,ends_at,programme_state,registration_enabled,registration_opens_at,registration_closes_at,programme_categories(id,name,slug,icon,colour,is_active)";
const DETAIL_COLUMNS =
  "id,title,slug,short_summary,full_description,description,category,category_id,delivery_mode,duration,location,eligibility,entry_requirements,certification,fees,application_deadline,start_date,contact_details,application_link,featured,featured_image_path,image_url,display_order,seo_title,seo_description,starts_at,ends_at,timezone,programme_state,registration_enabled,registration_opens_at,registration_closes_at,capacity,programme_categories(id,name,slug,icon,colour,is_active)";

export type ProgrammeFilters = {
  search: string;
  category: string;
  mode: string;
  page: number;
};

export function parseProgrammeFilters(
  values: Record<string, string | string[] | undefined>,
): ProgrammeFilters {
  const first = (name: string) => {
    const value = values[name];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };
  const rawPage = Number(first("page"));
  const search = first("search")
    .replace(/[^\p{L}\p{N}\s.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100)
    .trim();
  const category = first("category").toLowerCase();
  const mode = first("mode").toLowerCase();
  return {
    search,
    category: SLUG.test(category) ? category : "",
    mode: MODES.has(mode) ? mode : "",
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10_000) : 1,
  };
}

export async function listPublicProgrammeCategories() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("programme_categories")
    .select("id,name,slug,icon,colour,display_order")
    .eq("is_active", true)
    .order("display_order")
    .order("name")
    .limit(100);
  if (error) throw databaseError("programmes.public.categories", error);
  return data;
}

export async function listPublicProgrammes(filters: ProgrammeFilters) {
  await connection();
  const supabase = createPublicClient();
  let categoryId: string | null = null;
  if (filters.category) {
    const categoryResult = await supabase
      .from("programme_categories")
      .select("id")
      .eq("slug", filters.category)
      .eq("is_active", true)
      .maybeSingle();
    if (categoryResult.error) {
      throw databaseError("programmes.public.categoryFilter", categoryResult.error);
    }
    if (!categoryResult.data) {
      return { items: [], page: filters.page, pageSize: PAGE_SIZE, total: 0, totalPages: 1 };
    }
    categoryId = categoryResult.data.id;
  }
  const from = (filters.page - 1) * PAGE_SIZE;
  let query = supabase
    .from("programmes")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("published", true)
    .eq("programme_state", "scheduled")
    .not("slug", "is", null)
    .order("featured", { ascending: false })
    .order("display_order")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,short_summary.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
    );
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.mode) query = query.eq("delivery_mode", filters.mode);
  const { data, error, count } = await query;
  if (error) throw databaseError("programmes.public.list", error);
  const formResult =
    data.length > 0
      ? await supabase
          .from("forms")
          .select("programme_id")
          .in("programme_id", data.map((programme) => programme.id))
          .eq("purpose", "registration")
          .eq("is_active", true)
          .eq("is_public", true)
          .limit(PAGE_SIZE)
      : { data: [], error: null };
  if (formResult.error) {
    console.error("Public Programme registration forms unavailable", {
      operation: "programmes.public.registrationForms",
      code: "database",
    });
  }
  const availableFormOwners = new Set(
    (formResult.data ?? []).flatMap((form) =>
      form.programme_id ? [form.programme_id] : [],
    ),
  );

  const evaluated = await Promise.all(
    data.map(async (programme) => {
      const lifecycleStatus = getRegistrationStatus(programme);
      const registrationStatus =
        lifecycleStatus === "open" && availableFormOwners.has(programme.id)
          ? "open"
          : lifecycleStatus === "not_yet_open"
            ? "not_yet_open"
            : "closed";
      return {
        ...programme,
        registrationStatus,
        displayImageUrl: await resolveProgrammeImage(programme),
      };
    }),
  );
  return {
    items: evaluated,
    page: filters.page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

export const getPublicProgramme = cache(async (slug: string) => {
  if (!SLUG.test(slug) || slug.length > 160) return null;
  await connection();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("programmes")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .eq("programme_state", "scheduled")
    .maybeSingle();
  if (error) throw databaseError("programmes.public.detail", error);
  if (!data) return null;

  const [modules, outcomes, registrationStatus, form] = await Promise.all([
    supabase
      .from("programme_modules")
      .select("id,title,description,display_order")
      .eq("programme_id", data.id)
      .order("display_order")
      .order("id")
      .limit(100),
    supabase
      .from("programme_learning_outcomes")
      .select("id,outcome,display_order")
      .eq("programme_id", data.id)
      .order("display_order")
      .order("id")
      .limit(100),
    Promise.resolve(getRegistrationStatus(data)),
    supabase
      .from("forms")
      .select("id")
      .eq("programme_id", data.id)
      .eq("purpose", "registration")
      .eq("is_active", true)
      .eq("is_public", true)
      .limit(1)
      .maybeSingle(),
  ]);
  if (modules.error) throw databaseError("programmes.public.modules", modules.error);
  if (outcomes.error) throw databaseError("programmes.public.outcomes", outcomes.error);
  return {
    programme: data,
    modules: modules.data,
    outcomes: outcomes.data,
    registrationStatus,
    hasAvailableForm: Boolean(form.data),
    displayImageUrl: await resolveProgrammeImage(data),
  };
});

export const getProgrammeMetadataDefaults = cache(getPublicSettings);

function getRegistrationStatus(programme: {
  registration_enabled: boolean;
  programme_state: string;
  starts_at: string | null;
  ends_at: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
}) {
  if (!programme.registration_enabled) return "disabled";
  if (programme.programme_state === "cancelled") return "closed";
  const now = Date.now();
  if (programme.ends_at && now > new Date(programme.ends_at).getTime()) {
    return "closed";
  }
  if (
    programme.registration_opens_at &&
    now < new Date(programme.registration_opens_at).getTime()
  ) {
    return "not_yet_open";
  }
  if (
    programme.registration_closes_at &&
    now > new Date(programme.registration_closes_at).getTime()
  ) {
    return "closed";
  }
  return "open";
}

async function resolveProgrammeImage(programme: {
  id: string;
  featured_image_path: string | null;
  image_url: string | null;
}) {
  if (programme.featured_image_path?.startsWith("programmes/")) {
    try {
      return await createPublishedMediaSignedUrl({
        kind: "programme",
        ownerId: programme.id,
        objectPath: programme.featured_image_path,
      });
    } catch (error) {
      console.error("Public Programme media unavailable", {
        operation: "programmes.public.media.cms",
        code: error instanceof Error ? error.name : "unknown",
      });
    }
  }
  if (programme.featured_image_path) {
    const supabase = createPublicClient();
    const { data } = await supabase.storage
      .from("content-images")
      .createSignedUrl(programme.featured_image_path, 300);
    if (data?.signedUrl) return data.signedUrl;
  }
  if (!programme.image_url) return null;
  if (programme.image_url.startsWith("/") && !programme.image_url.startsWith("//")) {
    return programme.image_url;
  }
  try {
    return new URL(programme.image_url).protocol === "https:"
      ? programme.image_url
      : null;
  } catch {
    return null;
  }
}

export function safeProgrammeCta(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
