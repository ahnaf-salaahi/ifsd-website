import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { CmsError, databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";

const PUBLIC_PARTNER_COLUMNS =
  "id,name,partner_type,logo_path,website_url,description,display_order,is_featured";

async function listVisiblePartners(filters: {
  featured?: boolean;
  partnerType?: string;
}) {
  const supabase = createPublicClient();
  let query = supabase
    .from("partners")
    .select(PUBLIC_PARTNER_COLUMNS)
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(48);
  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.partnerType) {
    if (!/^[a-z][a-z0-9_]{1,79}$/.test(filters.partnerType)) {
      throw new CmsError("validation", {
        safeDetails: { field: "partnerType" },
      });
    }
    query = query.eq("partner_type", filters.partnerType);
  }
  const { data, error } = await query;
  if (error) throw databaseError("partners.public.list", error);
  return data;
}

export function listPublicPartners() {
  return listVisiblePartners({});
}

export function listFeaturedPartners() {
  return listVisiblePartners({ featured: true });
}

export function listPartnersByType(partnerType: string) {
  return listVisiblePartners({ partnerType });
}

export async function listAdminPartners(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("partners")
    .select("*", { count: "exact" })
    .order("display_order")
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("partners.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}
