"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { CmsError, databaseError } from "@/lib/cms/errors";
import {
  ActionValidationError,
  executeAdminAction,
  formBoolean,
  formInteger,
  formSafeUrl,
  formText,
  formUuid,
} from "./shared";

const refresh = () => {
  revalidatePath("/admin/cms/featured");
  revalidatePath("/admin/cms");
};

export async function saveFeaturedAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.featured.save", async ({ supabase }) => {
    const kind = await formText(formData, "kind");
    const id = await formUuid(formData, "id", true);
    const sourceId = await formUuid(formData, "source_id");
    const common = {
      custom_heading:
        (await formText(formData, "custom_heading", { max: 300 })) || null,
      custom_summary:
        (await formText(formData, "custom_summary", { max: 2000 })) || null,
      image_override_path:
        (await formText(formData, "image_override_path", { max: 1024 })) ||
        null,
      cta_label:
        (await formText(formData, "cta_label", { max: 100 })) || null,
      cta_url: await formSafeUrl(formData, "cta_url"),
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
    };
    let error;
    if (kind === "programme") {
      const result = id
        ? await supabase
            .from("homepage_featured_programmes")
            .update({ ...common, programme_id: sourceId })
            .eq("id", id)
        : await supabase
            .from("homepage_featured_programmes")
            .insert({ ...common, programme_id: sourceId });
      error = result.error;
    } else if (kind === "scholarship") {
      const result = id
        ? await supabase
            .from("homepage_featured_scholarships")
            .update({ ...common, scholarship_id: sourceId })
            .eq("id", id)
        : await supabase
            .from("homepage_featured_scholarships")
            .insert({ ...common, scholarship_id: sourceId });
      error = result.error;
    } else if (kind === "story") {
      const result = id
        ? await supabase
            .from("homepage_featured_stories")
            .update({ ...common, story_id: sourceId })
            .eq("id", id)
        : await supabase
            .from("homepage_featured_stories")
            .insert({ ...common, story_id: sourceId });
      error = result.error;
    } else {
      throw new ActionValidationError({ kind: ["Invalid featured type."] });
    }
    if (error) throw databaseError("cms.featured.save", error);
    refresh();
  });
}

export async function deleteFeaturedAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.featured.delete", async ({ supabase }) => {
    const kind = await formText(formData, "kind");
    const id = await formUuid(formData, "id");
    let result;
    if (kind === "programme") {
      result = await supabase
        .from("homepage_featured_programmes")
        .delete({ count: "exact" })
        .eq("id", id);
    } else if (kind === "scholarship") {
      result = await supabase
        .from("homepage_featured_scholarships")
        .delete({ count: "exact" })
        .eq("id", id);
    } else if (kind === "story") {
      result = await supabase
        .from("homepage_featured_stories")
        .delete({ count: "exact" })
        .eq("id", id);
    } else {
      throw new ActionValidationError({ kind: ["Invalid featured type."] });
    }
    if (result.error) throw databaseError("cms.featured.delete", result.error);
    if (!result.count) throw new CmsError("not_found");
    refresh();
  });
}
