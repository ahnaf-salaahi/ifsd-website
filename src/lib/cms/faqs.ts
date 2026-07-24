import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";
import { requireUuid } from "./validation";

const PUBLIC_FAQ_COLUMNS =
  "id,page_id,question,answer,answer_format,category,display_order";

async function listVisibleFaqs(pageId: string | null) {
  const supabase = createPublicClient();
  let query = supabase
    .from("site_faqs")
    .select(PUBLIC_FAQ_COLUMNS)
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(40);
  query = pageId
    ? query.eq("page_id", requireUuid(pageId, "pageId"))
    : query.is("page_id", null);
  const { data, error } = await query;
  if (error) throw databaseError("faqs.public.list", error);
  return data;
}

export function listGlobalFaqs() {
  return listVisibleFaqs(null);
}

export function listPageFaqs(pageId: string) {
  return listVisibleFaqs(pageId);
}

export async function listAdminFaqs(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("site_faqs")
    .select("*", { count: "exact" })
    .order("display_order")
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("faqs.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}
