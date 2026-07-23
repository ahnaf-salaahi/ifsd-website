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
  revalidatePath("/admin/cms/faqs");
  revalidatePath("/admin/cms");
};

export async function saveFaqAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.faqs.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const values = {
      page_id: await formUuid(formData, "page_id", true),
      question: await formText(formData, "question", {
        required: true,
        max: 1000,
      }),
      answer: await formText(formData, "answer", {
        required: true,
        max: 20000,
      }),
      answer_format: "plain_text",
      category: (await formText(formData, "category", { max: 200 })) || null,
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
    };
    const result = id
      ? await supabase.from("site_faqs").update(values).eq("id", id)
      : await supabase.from("site_faqs").insert(values);
    if (result.error) throw databaseError("cms.faqs.save", result.error);
    refresh();
  });
}

export async function deleteFaqAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.faqs.delete", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const { error, count } = await supabase
      .from("site_faqs")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw databaseError("cms.faqs.delete", error);
    if (!count) throw new CmsError("not_found");
    refresh();
  });
}
