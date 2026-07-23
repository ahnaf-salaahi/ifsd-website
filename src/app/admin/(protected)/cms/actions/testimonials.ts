"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { databaseError } from "@/lib/cms/errors";
import {
  ActionValidationError,
  executeAdminAction,
  formBoolean,
  formInteger,
  formText,
  formUuid,
} from "./shared";

const refresh = (id?: string) => {
  revalidatePath("/admin/cms/testimonials");
  revalidatePath("/admin/cms");
  if (id) revalidatePath(`/admin/cms/testimonials/${id}`);
};

export async function saveTestimonialAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return executeAdminAction("cms.testimonials.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const sourceType = await formText(formData, "source_type", {
      required: true,
      max: 80,
    });
    const { data: source } = await supabase
      .from("testimonial_source_types")
      .select("type_key")
      .eq("type_key", sourceType)
      .eq("is_active", true)
      .maybeSingle();
    if (!source) {
      throw new ActionValidationError({
        source_type: ["Select an active source type."],
      });
    }
    const consent = await formBoolean(formData, "consent_confirmed");
    const approved = await formBoolean(formData, "approved_for_publication");
    const rawPublished = await formText(formData, "published_at");
    const publishedAt = rawPublished
      ? new Date(rawPublished).toISOString()
      : null;
    if (publishedAt && (!consent || !approved)) {
      throw new ActionValidationError({
        published_at: [
          "Consent and publication approval are required before scheduling.",
        ],
      });
    }
    const values = {
      author_name: await formText(formData, "author_name", {
        required: true,
        max: 300,
      }),
      author_role:
        (await formText(formData, "author_role", { max: 300 })) || null,
      organisation:
        (await formText(formData, "organisation", { max: 300 })) || null,
      quote: await formText(formData, "quote", {
        required: true,
        max: 10000,
      }),
      photo_path:
        (await formText(formData, "photo_path", { max: 1024 })) || null,
      source_type: sourceType,
      programme_id: await formUuid(formData, "programme_id", true),
      consent_confirmed: consent,
      approved_for_publication: approved,
      is_active: await formBoolean(formData, "is_active"),
      is_featured: await formBoolean(formData, "is_featured"),
      display_order: await formInteger(formData, "display_order"),
      published_at: publishedAt,
    };
    const result = id
      ? await supabase
          .from("testimonials")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase
          .from("testimonials")
          .insert(values)
          .select("id")
          .single();
    if (result.error) throw databaseError("cms.testimonials.save", result.error);
    refresh(result.data.id);
    return { id: result.data.id };
  });
}

export async function saveTestimonialSourceAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.testimonials.source.save", async ({ supabase }) => {
    const testimonialId = await formUuid(formData, "testimonial_id");
    const sourceReference =
      (await formText(formData, "source_reference", { max: 500 })) || null;
    const internalNotes =
      (await formText(formData, "internal_notes", { max: 10000 })) || null;
    if (!sourceReference && !internalNotes) {
      const { error } = await supabase
        .from("testimonial_sources")
        .delete()
        .eq("testimonial_id", testimonialId);
      if (error) throw databaseError("cms.testimonials.source.delete", error);
    } else {
      const { error } = await supabase.from("testimonial_sources").upsert({
        testimonial_id: testimonialId,
        source_reference: sourceReference,
        internal_notes: internalNotes,
      });
      if (error) throw databaseError("cms.testimonials.source.save", error);
    }
    refresh(testimonialId);
  });
}
