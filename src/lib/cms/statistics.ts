import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";

const PUBLIC_STATISTIC_COLUMNS =
  "id,label,display_value,prefix,suffix,supporting_text,icon_key,display_order";

export async function listHomepageStatistics() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("homepage_statistics")
    .select(PUBLIC_STATISTIC_COLUMNS)
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(24);
  if (error) throw databaseError("statistics.public.list", error);
  return data;
}

export async function listAdminStatistics(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("homepage_statistics")
    .select("*", { count: "exact" })
    .order("display_order")
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("statistics.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}
