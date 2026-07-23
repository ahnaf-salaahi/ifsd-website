"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { databaseError } from "@/lib/cms/errors";
import {
  executeAdminAction,
  formBoolean,
  formEmail,
  formText,
} from "./shared";

export async function saveSettingsAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.settings.save", async ({ supabase }) => {
    const values = {
      institute_name:
        (await formText(formData, "institute_name", { max: 200 })) || null,
      short_name:
        (await formText(formData, "short_name", { max: 100 })) || null,
      tagline: (await formText(formData, "tagline", { max: 500 })) || null,
      primary_logo_path:
        (await formText(formData, "primary_logo_path", { max: 1024 })) || null,
      secondary_logo_path:
        (await formText(formData, "secondary_logo_path", { max: 1024 })) ||
        null,
      favicon_path:
        (await formText(formData, "favicon_path", { max: 1024 })) || null,
      seal_path:
        (await formText(formData, "seal_path", { max: 1024 })) || null,
      primary_email: await formEmail(formData, "primary_email"),
      primary_phone:
        (await formText(formData, "primary_phone", { max: 50 })) || null,
      secondary_phone:
        (await formText(formData, "secondary_phone", { max: 50 })) || null,
      whatsapp_number:
        (await formText(formData, "whatsapp_number", { max: 50 })) || null,
      default_office_address:
        (await formText(formData, "default_office_address", { max: 2000 })) ||
        null,
      footer_description:
        (await formText(formData, "footer_description", { max: 2000 })) ||
        null,
      copyright_text:
        (await formText(formData, "copyright_text", { max: 500 })) || null,
      newsletter_enabled: await formBoolean(formData, "newsletter_enabled"),
      default_seo_title:
        (await formText(formData, "default_seo_title", { max: 200 })) || null,
      default_seo_description:
        (await formText(formData, "default_seo_description", { max: 500 })) ||
        null,
      default_og_image_path:
        (await formText(formData, "default_og_image_path", { max: 1024 })) ||
        null,
      default_robots_index: await formBoolean(
        formData,
        "default_robots_index",
      ),
      default_robots_follow: await formBoolean(
        formData,
        "default_robots_follow",
      ),
      maintenance_mode: await formBoolean(formData, "maintenance_mode"),
      default_timezone: await formText(formData, "default_timezone", {
        required: true,
        max: 100,
      }),
      default_locale: await formText(formData, "default_locale", {
        required: true,
        max: 35,
      }),
    };
    const { error } = await supabase
      .from("site_settings")
      .update(values)
      .eq("singleton", true);
    if (error) throw databaseError("cms.settings.save", error);
    revalidatePath("/admin/cms/settings");
    revalidatePath("/admin/cms");
  });
}

export async function saveContactSettingsAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.contact.save", async ({ supabase }) => {
    const allowedTypes = (await formText(formData, "allowed_attachment_types"))
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const { error } = await supabase
      .from("contact_form_settings")
      .update({
        enabled: await formBoolean(formData, "enabled"),
        recipient_label:
          (await formText(formData, "recipient_label", { max: 200 })) || null,
        success_message: await formText(formData, "success_message", {
          required: true,
          max: 1000,
        }),
        attachment_enabled: await formBoolean(
          formData,
          "attachment_enabled",
        ),
        allowed_attachment_types: allowedTypes,
        consent_text:
          (await formText(formData, "consent_text", { max: 2000 })) || null,
        spam_protection_mode: await formText(
          formData,
          "spam_protection_mode",
          { required: true, max: 50 },
        ),
      })
      .eq("singleton", true);
    if (error) throw databaseError("cms.contact.save", error);
    revalidatePath("/admin/cms/settings");
  });
}

export async function saveDeliverySettingsAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.contact.delivery.save", async ({ supabase }) => {
    const destinationKey =
      (await formText(formData, "destination_key", { max: 200 })) || null;
    const { error } = await supabase
      .from("contact_form_delivery_settings")
      .update({ destination_key: destinationKey })
      .eq("singleton", true);
    if (error) throw databaseError("cms.contact.delivery.save", error);
    revalidatePath("/admin/cms/settings");
  });
}
