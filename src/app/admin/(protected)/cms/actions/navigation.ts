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
  revalidatePath("/admin/cms/navigation");
  revalidatePath("/admin/cms");
};

export async function saveNavigationAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.navigation.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const parentId = await formUuid(formData, "parent_id", true);
    if (id && parentId === id) {
      throw new ActionValidationError({
        parent_id: ["An item cannot be its own parent."],
      });
    }
    const location = await formText(formData, "location");
    const target = await formText(formData, "target");
    if (!["header", "footer"].includes(location)) {
      throw new ActionValidationError({ location: ["Invalid placement."] });
    }
    if (!["self", "blank"].includes(target)) {
      throw new ActionValidationError({ target: ["Invalid link target."] });
    }
    if (parentId) {
      const { data: rows, error } = await supabase
        .from("site_navigation_items")
        .select("id,parent_id");
      if (error) throw databaseError("cms.navigation.parents", error);
      const parents = new Map(rows.map((row) => [row.id, row.parent_id]));
      let current: string | null = parentId;
      let depth = 0;
      while (current) {
        if (current === id) {
          throw new ActionValidationError({
            parent_id: ["This parent choice creates a cycle."],
          });
        }
        current = parents.get(current) ?? null;
        depth += 1;
        if (depth > 3) {
          throw new ActionValidationError({
            parent_id: ["Navigation is limited to three levels."],
          });
        }
      }
    }
    const values = {
      label: await formText(formData, "label", {
        required: true,
        max: 100,
      }),
      url: (await formSafeUrl(formData, "url", false))!,
      location,
      target,
      parent_id: parentId,
      display_order: await formInteger(formData, "display_order"),
      is_visible: await formBoolean(formData, "is_visible"),
    };
    const result = id
      ? await supabase.from("site_navigation_items").update(values).eq("id", id)
      : await supabase.from("site_navigation_items").insert(values);
    if (result.error) throw databaseError("cms.navigation.save", result.error);
    refresh();
  });
}

export async function deleteNavigationAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.navigation.delete", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const { count, error: childError } = await supabase
      .from("site_navigation_items")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id);
    if (childError) throw databaseError("cms.navigation.children", childError);
    if (count) {
      throw new CmsError("conflict", {
        message: "Re-parent or delete child items first.",
      });
    }
    const { error, count: deleted } = await supabase
      .from("site_navigation_items")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw databaseError("cms.navigation.delete", error);
    if (!deleted) throw new CmsError("not_found");
    refresh();
  });
}
