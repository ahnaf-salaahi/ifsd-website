import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";

const PUBLIC_OFFICE_COLUMNS =
  "id,name,address_line_1,address_line_2,city,district,province,postal_code,country,phone,email,office_hours,office_hours_format,map_url,latitude,longitude,display_order,is_primary";

export async function listPublicOffices() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("office_locations")
    .select(PUBLIC_OFFICE_COLUMNS)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("display_order")
    .order("id");
  if (error) throw databaseError("offices.public.list", error);
  return data;
}

export async function getPrimaryOffice() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("office_locations")
    .select(PUBLIC_OFFICE_COLUMNS)
    .eq("is_active", true)
    .eq("is_primary", true)
    .order("display_order")
    .limit(1)
    .maybeSingle();
  if (error) throw databaseError("offices.public.primary", error);
  return data;
}

export async function listAdminOffices(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("office_locations")
    .select("*", { count: "exact" })
    .order("display_order")
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("offices.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}
