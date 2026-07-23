"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { CmsError, databaseError } from "@/lib/cms/errors";
import {
  executeAdminAction,
  formBoolean,
  formInteger,
  formText,
  formUuid,
} from "./shared";

const refresh = () => {
  revalidatePath("/admin/cms/statistics");
  revalidatePath("/admin/cms");
};

export async function saveStatisticAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.statistics.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const values = {
      label: await formText(formData, "label", {
        required: true,
        max: 200,
      }),
      display_value: await formText(formData, "display_value", {
        required: true,
        max: 100,
      }),
      prefix: (await formText(formData, "prefix", { max: 50 })) || null,
      suffix: (await formText(formData, "suffix", { max: 50 })) || null,
      supporting_text:
        (await formText(formData, "supporting_text", { max: 500 })) || null,
      icon_key: (await formText(formData, "icon_key", { max: 100 })) || null,
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
    };
    const result = id
      ? await supabase.from("homepage_statistics").update(values).eq("id", id)
      : await supabase.from("homepage_statistics").insert(values);
    if (result.error) throw databaseError("cms.statistics.save", result.error);
    refresh();
  });
}

export async function deleteStatisticAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.statistics.delete", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const { error, count } = await supabase
      .from("homepage_statistics")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw databaseError("cms.statistics.delete", error);
    if (!count) throw new CmsError("not_found");
    refresh();
  });
}
