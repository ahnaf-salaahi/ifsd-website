import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";
import { databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";
import { requireUuid } from "./validation";

const PUBLIC_TEAM_COLUMNS =
  "id,full_name,designation,biography,biography_format,photo_path,linkedin_url,display_order,is_featured";

async function listVisibleTeam(featuredOnly: boolean) {
  const supabase = createPublicClient();
  let query = supabase
    .from("team_members")
    .select(PUBLIC_TEAM_COLUMNS)
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(24);
  if (featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) throw databaseError("team.public.list", error);
  return data;
}

export function listPublicTeam() {
  return listVisibleTeam(false);
}

export function listFeaturedTeam() {
  return listVisibleTeam(true);
}

export async function listAdminTeam(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("team_members")
    .select("*", { count: "exact" })
    .order("display_order")
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("team.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}

export async function getAdminTeamContacts(teamMemberIds: string[]) {
  const { supabase } = await requireAdmin();
  const ids = [...new Set(teamMemberIds.map((id) => requireUuid(id)))];
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("team_member_contacts")
    .select(
      "team_member_id,email,phone,created_at,updated_at,created_by,updated_by",
    )
    .in("team_member_id", ids);
  if (error) throw databaseError("team.admin.contacts", error);
  return data;
}
