"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { databaseError, CmsError } from "@/lib/cms/errors";
import type { Json } from "@/types/database.types";
import {
  ActionValidationError,
  executeAdminAction,
  formBoolean,
  formInteger,
  formSafeUrl,
  formText,
  formUuid,
} from "./shared";

const refreshPageRoutes = (id?: string) => {
  revalidatePath("/admin/cms");
  revalidatePath("/admin/cms/pages");
  if (id) revalidatePath(`/admin/cms/pages/${id}`);
};

export async function savePageAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.pages.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const title = await formText(formData, "title", {
      required: true,
      max: 200,
    });
    const slug = await formText(formData, "slug", {
      required: true,
      max: 160,
    });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new ActionValidationError({
        slug: ["Use lowercase letters, numbers, and single hyphens."],
      });
    }
    const { error } = await supabase
      .from("site_pages")
      .update({
        title,
        slug,
        seo_title: (await formText(formData, "seo_title", { max: 200 })) || null,
        seo_description:
          (await formText(formData, "seo_description", { max: 500 })) || null,
        og_title: (await formText(formData, "og_title", { max: 200 })) || null,
        og_description:
          (await formText(formData, "og_description", { max: 500 })) || null,
        og_image_path:
          (await formText(formData, "og_image_path", { max: 1024 })) || null,
        canonical_url: await formSafeUrl(formData, "canonical_url"),
        robots_index: await formBoolean(formData, "robots_index"),
        robots_follow: await formBoolean(formData, "robots_follow"),
      })
      .eq("id", id);
    if (error) throw databaseError("cms.pages.save", error);
    refreshPageRoutes(id);
  });
}

export async function setPagePublicationAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.pages.publication", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const status = await formText(formData, "status");
    if (!["draft", "published"].includes(status)) {
      throw new ActionValidationError({ status: ["Invalid status."] });
    }
    const { error } = await supabase
      .from("site_pages")
      .update({ status })
      .eq("id", id);
    if (error) throw databaseError("cms.pages.publication", error);
    refreshPageRoutes(id);
  });
}

export async function saveSectionAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.sections.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const pageId = await formUuid(formData, "page_id");
    const sectionKey = await formText(formData, "section_key", {
      required: true,
      max: 80,
    });
    if (!/^[a-z][a-z0-9_]{1,79}$/.test(sectionKey)) {
      throw new ActionValidationError({
        section_key: ["Use lowercase letters, numbers, and underscores."],
      });
    }
    const sectionType = await formText(formData, "section_type", {
      required: true,
      max: 80,
    });
    const { data: allowedType, error: typeError } = await supabase
      .from("site_section_types")
      .select("type_key")
      .eq("type_key", sectionType)
      .eq("is_active", true)
      .maybeSingle();
    if (typeError) throw databaseError("cms.sections.type", typeError);
    if (!allowedType) {
      throw new ActionValidationError({
        section_type: ["Select an active section type."],
      });
    }
    let contentConfig: Json = {};
    const rawConfig = await formText(formData, "content_config", { max: 20000 });
    if (rawConfig) {
      try {
        const parsed: unknown = JSON.parse(rawConfig);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
          throw new Error();
        }
        contentConfig = parsed as Json;
      } catch {
        throw new ActionValidationError({
          content_config: ["Enter a valid JSON object."],
        });
      }
    }
    const body = (await formText(formData, "body", { max: 50000 })) || null;
    const { data: markupSafe, error: markupError } = await supabase.rpc(
      "cms_has_no_executable_markup",
      { value: `${body ?? ""}\n${JSON.stringify(contentConfig)}` },
    );
    if (markupError) throw databaseError("cms.sections.markup", markupError);
    if (!markupSafe) {
      throw new ActionValidationError({
        content_config: ["Executable markup and unsafe URLs are not allowed."],
      });
    }
    const values = {
      page_id: pageId,
      section_key: sectionKey,
      section_type: sectionType,
      heading: (await formText(formData, "heading", { max: 300 })) || null,
      subheading:
        (await formText(formData, "subheading", { max: 1000 })) || null,
      body,
      body_format: "plain_text",
      media_path:
        (await formText(formData, "media_path", { max: 1024 })) || null,
      button_label:
        (await formText(formData, "button_label", { max: 100 })) || null,
      button_url: await formSafeUrl(formData, "button_url"),
      content_config: contentConfig,
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
      status: await formBoolean(formData, "published")
        ? "published"
        : "draft",
    };
    const result = id
      ? await supabase.from("site_sections").update(values).eq("id", id)
      : await supabase.from("site_sections").insert(values);
    if (result.error) throw databaseError("cms.sections.save", result.error);
    refreshPageRoutes(pageId);
  });
}

export async function deleteSectionAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.sections.delete", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const pageId = await formUuid(formData, "page_id");
    const { error, count } = await supabase
      .from("site_sections")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("page_id", pageId);
    if (error) throw databaseError("cms.sections.delete", error);
    if (!count) throw new CmsError("not_found");
    refreshPageRoutes(pageId);
  });
}

export async function moveSectionAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.sections.move", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const pageId = await formUuid(formData, "page_id");
    const direction = await formText(formData, "direction");
    if (!["up", "down"].includes(direction)) {
      throw new ActionValidationError({ direction: ["Invalid direction."] });
    }
    const { data: sections, error } = await supabase
      .from("site_sections")
      .select("id,display_order")
      .eq("page_id", pageId)
      .order("display_order")
      .order("id");
    if (error) throw databaseError("cms.sections.move.load", error);
    const index = sections.findIndex((section) => section.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= sections.length) return;
    const current = sections[index];
    const target = sections[targetIndex];
    const first = await supabase
      .from("site_sections")
      .update({ display_order: target.display_order })
      .eq("id", current.id);
    if (first.error) throw databaseError("cms.sections.move.first", first.error);
    const second = await supabase
      .from("site_sections")
      .update({ display_order: current.display_order })
      .eq("id", target.id);
    if (second.error) {
      throw new CmsError("database", {
        message:
          "The first reorder update succeeded, but the second failed. Reload to see the authoritative order.",
        operation: "cms.sections.move.partial",
        cause: second.error,
      });
    }
    refreshPageRoutes(pageId);
  });
}
