import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { TablesUpdate } from "@/types/database.types";
import { requireAdmin } from "./auth";
import { CmsError, databaseError } from "./errors";

const PUBLIC_SETTINGS_COLUMNS =
  "singleton,institute_name,short_name,tagline,primary_logo_path,secondary_logo_path,favicon_path,seal_path,primary_email,primary_phone,secondary_phone,whatsapp_number,default_office_address,footer_description,copyright_text,newsletter_enabled,default_seo_title,default_seo_description,default_og_image_path,default_robots_index,default_robots_follow,maintenance_mode,default_timezone,default_locale,updated_at";

export async function getPublicSettings() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(PUBLIC_SETTINGS_COLUMNS)
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw databaseError("settings.public.get", error);
  return data;
}

export async function getAdminSettings() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw databaseError("settings.admin.get", error);
  if (!data) {
    throw new CmsError("not_found", { operation: "settings.admin.get" });
  }
  return data;
}

export async function updateSettings(values: TablesUpdate<"site_settings">) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .update(values)
    .eq("singleton", true)
    .select("*")
    .maybeSingle();
  if (error) throw databaseError("settings.update", error);
  if (!data) {
    throw new CmsError("not_found", { operation: "settings.update" });
  }
  return data;
}
