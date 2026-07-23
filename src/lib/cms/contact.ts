import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { TablesUpdate } from "@/types/database.types";
import { requireAdmin } from "./auth";
import { CmsError, databaseError } from "./errors";

const PUBLIC_CONTACT_COLUMNS =
  "singleton,enabled,recipient_label,success_message,attachment_enabled,allowed_attachment_types,max_attachment_size_bytes,consent_text,spam_protection_mode,updated_at";

export async function getPublicContactFormSettings() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("contact_form_settings")
    .select(PUBLIC_CONTACT_COLUMNS)
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw databaseError("contact.public.settings", error);
  return data;
}

export async function getAdminContactConfiguration() {
  const { supabase } = await requireAdmin();
  const [form, delivery] = await Promise.all([
    supabase
      .from("contact_form_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle(),
    supabase
      .from("contact_form_delivery_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle(),
  ]);
  if (form.error) throw databaseError("contact.admin.form", form.error);
  if (delivery.error) {
    throw databaseError("contact.admin.delivery", delivery.error);
  }
  if (!form.data || !delivery.data) {
    throw new CmsError("not_found", {
      operation: "contact.admin.configuration",
    });
  }
  return { form: form.data, delivery: delivery.data };
}

export async function updateContactFormSettings(
  values: TablesUpdate<"contact_form_settings">,
) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("contact_form_settings")
    .update(values)
    .eq("singleton", true)
    .select("*")
    .maybeSingle();
  if (error) throw databaseError("contact.admin.updateForm", error);
  if (!data) {
    throw new CmsError("not_found", {
      operation: "contact.admin.updateForm",
    });
  }
  return data;
}

export async function updateContactDeliverySettings(
  values: TablesUpdate<"contact_form_delivery_settings">,
) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("contact_form_delivery_settings")
    .update(values)
    .eq("singleton", true)
    .select("*")
    .maybeSingle();
  if (error) throw databaseError("contact.admin.updateDelivery", error);
  if (!data) {
    throw new CmsError("not_found", {
      operation: "contact.admin.updateDelivery",
    });
  }
  return data;
}
