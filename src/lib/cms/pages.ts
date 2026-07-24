import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";
import { requireAdmin } from "./auth";
import { CmsError, databaseError } from "./errors";
import { normalizePagination, pageResult, type PaginationInput } from "./pagination";
import type { SitePageWithSections } from "./types";
import {
  requireDisplayOrder,
  requirePageKey,
  requireUuid,
} from "./validation";

const PAGE_COLUMNS =
  "id,page_key,title,slug,status,seo_title,seo_description,og_title,og_description,og_image_path,canonical_url,robots_index,robots_follow,published_at,created_at,updated_at,created_by,updated_by";
const PUBLIC_PAGE_COLUMNS =
  "id,page_key,title,slug,seo_title,seo_description,og_title,og_description,og_image_path,canonical_url,robots_index,robots_follow,published_at,updated_at";
const SECTION_COLUMNS =
  "id,page_id,section_key,section_type,heading,subheading,body,body_format,media_path,button_label,button_url,content_config,display_order,is_active,status,published_at,created_at,updated_at,created_by,updated_by";
const PUBLIC_SECTION_COLUMNS =
  "id,page_id,section_key,section_type,heading,subheading,body,body_format,media_path,button_label,button_url,content_config,display_order,published_at,updated_at";

export async function listPages(input: PaginationInput = {}) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  const { data, error, count } = await supabase
    .from("site_pages")
    .select(PAGE_COLUMNS, { count: "exact" })
    .order("updated_at", { ascending: false })
    .order("id")
    .range(pagination.from, pagination.to);
  if (error) throw databaseError("pages.list", error);
  return pageResult(data, count ?? 0, pagination);
}

export async function getPage(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_COLUMNS)
    .eq("id", requireUuid(id))
    .maybeSingle();
  if (error) throw databaseError("pages.get", error);
  if (!data) throw new CmsError("not_found", { operation: "pages.get" });
  return data;
}

export async function getPageByKey(pageKey: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_COLUMNS)
    .eq("page_key", requirePageKey(pageKey))
    .maybeSingle();
  if (error) throw databaseError("pages.getByKey", error);
  if (!data) {
    throw new CmsError("not_found", { operation: "pages.getByKey" });
  }
  return data;
}

export async function listSections(pageId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_sections")
    .select(SECTION_COLUMNS)
    .eq("page_id", requireUuid(pageId, "pageId"))
    .order("display_order")
    .order("id");
  if (error) throw databaseError("sections.list", error);
  return data;
}

export async function getPageWithOrderedSections(
  id: string,
): Promise<SitePageWithSections> {
  const [page, sections] = await Promise.all([getPage(id), listSections(id)]);
  return { ...page, sections };
}

export async function createSection(
  values: TablesInsert<"site_sections">,
) {
  const { supabase } = await requireAdmin();
  requireUuid(values.page_id, "pageId");
  requireDisplayOrder(values.display_order ?? 0);
  const { data, error } = await supabase
    .from("site_sections")
    .insert(values)
    .select(SECTION_COLUMNS)
    .single();
  if (error) throw databaseError("sections.create", error);
  return data;
}

export async function updateSection(
  id: string,
  values: TablesUpdate<"site_sections">,
) {
  const { supabase } = await requireAdmin();
  if (values.display_order !== undefined) {
    requireDisplayOrder(values.display_order);
  }
  const { data, error } = await supabase
    .from("site_sections")
    .update(values)
    .eq("id", requireUuid(id))
    .select(SECTION_COLUMNS)
    .maybeSingle();
  if (error) throw databaseError("sections.update", error);
  if (!data) {
    throw new CmsError("not_found", { operation: "sections.update" });
  }
  return data;
}

export async function reorderSections(
  pageId: string,
  orderedIds: string[],
) {
  const { supabase } = await requireAdmin();
  requireUuid(pageId, "pageId");
  const uniqueIds = [...new Set(orderedIds.map((id) => requireUuid(id)))];
  if (uniqueIds.length !== orderedIds.length) {
    throw new CmsError("validation", {
      safeDetails: { field: "orderedIds" },
    });
  }

  // These updates are intentionally not presented as atomic. A database RPC
  // is required for true transactional reordering.
  for (const [displayOrder, id] of uniqueIds.entries()) {
    const { error } = await supabase
      .from("site_sections")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .eq("page_id", pageId);
    if (error) throw databaseError("sections.reorder", error);
  }
}

export async function publishPage(id: string) {
  return updatePageStatus(id, "published");
}

export async function unpublishPage(id: string) {
  return updatePageStatus(id, "draft");
}

async function updatePageStatus(id: string, status: "draft" | "published") {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .update({ status })
    .eq("id", requireUuid(id))
    .select(PAGE_COLUMNS)
    .maybeSingle();
  if (error) throw databaseError(`pages.${status}`, error);
  if (!data) {
    throw new CmsError("not_found", { operation: `pages.${status}` });
  }
  return data;
}

export async function deleteSection(id: string) {
  const { supabase } = await requireAdmin();
  const { error, count } = await supabase
    .from("site_sections")
    .delete({ count: "exact" })
    .eq("id", requireUuid(id));
  if (error) throw databaseError("sections.delete", error);
  if (!count) {
    throw new CmsError("not_found", { operation: "sections.delete" });
  }
}

export async function getPublishedPage(pageKey: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PUBLIC_PAGE_COLUMNS)
    .eq("page_key", requirePageKey(pageKey))
    .eq("status", "published")
    .maybeSingle();
  if (error) throw databaseError("pages.public.get", error);
  return data;
}

export async function getOrderedPublishedSections(pageId: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_sections")
    .select(PUBLIC_SECTION_COLUMNS)
    .eq("page_id", requireUuid(pageId, "pageId"))
    .eq("status", "published")
    .eq("is_active", true)
    .order("display_order")
    .order("id")
    .limit(100);
  if (error) throw databaseError("sections.public.list", error);
  return data;
}
