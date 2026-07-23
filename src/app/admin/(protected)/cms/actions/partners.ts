"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { databaseError } from "@/lib/cms/errors";
import {
  ActionValidationError,
  executeAdminAction,
  formBoolean,
  formHttpsUrl,
  formInteger,
  formText,
  formUuid,
} from "./shared";

const refresh = (id?: string) => {
  revalidatePath("/admin/cms/partners");
  revalidatePath("/admin/cms");
  if (id) revalidatePath(`/admin/cms/partners/${id}`);
};

export async function savePartnerAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return executeAdminAction("cms.partners.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const partnerType = await formText(formData, "partner_type", {
      required: true,
      max: 80,
    });
    const { data: type } = await supabase
      .from("partner_types")
      .select("type_key")
      .eq("type_key", partnerType)
      .eq("is_active", true)
      .maybeSingle();
    if (!type) {
      throw new ActionValidationError({
        partner_type: ["Select an active partner type."],
      });
    }
    const values = {
      name: await formText(formData, "name", { required: true, max: 300 }),
      partner_type: partnerType,
      description:
        (await formText(formData, "description", { max: 5000 })) || null,
      website_url: await formHttpsUrl(formData, "website_url"),
      logo_path:
        (await formText(formData, "logo_path", { max: 1024 })) || null,
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
      is_featured: await formBoolean(formData, "is_featured"),
    };
    const result = id
      ? await supabase
          .from("partners")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase.from("partners").insert(values).select("id").single();
    if (result.error) throw databaseError("cms.partners.save", result.error);
    refresh(result.data.id);
    return { id: result.data.id };
  });
}
