import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";
import { requireUuid } from "./validation";

const PUBLIC_TESTIMONIAL_COLUMNS =
  "id,author_name,author_role,organisation,quote,photo_path,source_type,programme_id,display_order,is_featured,published_at";

async function listVisibleTestimonials(featuredOnly: boolean) {
  const supabase = createPublicClient();
  let query = supabase
    .from("testimonials")
    .select(PUBLIC_TESTIMONIAL_COLUMNS)
    .eq("is_active", true)
    .eq("approved_for_publication", true)
    .eq("consent_confirmed", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("display_order")
    .order("id")
    .limit(24);
  if (featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) throw databaseError("testimonials.public.list", error);
  return data;
}

export function listPublicTestimonials() {
  return listVisibleTestimonials(false);
}

export function listFeaturedTestimonials() {
  return listVisibleTestimonials(true);
}

export async function listAdminTestimonials(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("testimonials")
    .select("*", { count: "exact" })
    .order("display_order")
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("testimonials.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}

export async function getAdminTestimonialProvenance(
  testimonialIds: string[],
) {
  const { supabase } = await requireAdmin();
  const ids = [...new Set(testimonialIds.map((id) => requireUuid(id)))];
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("testimonial_sources")
    .select(
      "testimonial_id,source_reference,internal_notes,created_at,updated_at,created_by,updated_by",
    )
    .in("testimonial_id", ids);
  if (error) throw databaseError("testimonials.admin.provenance", error);
  return data;
}
