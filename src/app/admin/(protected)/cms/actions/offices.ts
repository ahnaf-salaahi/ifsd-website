"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { CmsError, databaseError } from "@/lib/cms/errors";
import {
  ActionValidationError,
  executeAdminAction,
  formBoolean,
  formEmail,
  formHttpsUrl,
  formInteger,
  formText,
  formUuid,
} from "./shared";

const refresh = (id?: string) => {
  revalidatePath("/admin/cms/offices");
  revalidatePath("/admin/cms");
  if (id) revalidatePath(`/admin/cms/offices/${id}`);
};

function optionalCoordinate(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new ActionValidationError({ [name]: ["Enter a valid coordinate."] });
  }
  return value;
}

export async function saveOfficeAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return executeAdminAction("cms.offices.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const latitude = optionalCoordinate(formData, "latitude");
    const longitude = optionalCoordinate(formData, "longitude");
    if (latitude != null && (latitude < -90 || latitude > 90)) {
      throw new ActionValidationError({ latitude: ["Use -90 through 90."] });
    }
    if (longitude != null && (longitude < -180 || longitude > 180)) {
      throw new ActionValidationError({ longitude: ["Use -180 through 180."] });
    }
    const values = {
      name: await formText(formData, "name", { required: true, max: 200 }),
      address_line_1: await formText(formData, "address_line_1", {
        required: true,
        max: 500,
      }),
      address_line_2:
        (await formText(formData, "address_line_2", { max: 500 })) || null,
      city: await formText(formData, "city", { required: true, max: 200 }),
      district: (await formText(formData, "district", { max: 200 })) || null,
      province: (await formText(formData, "province", { max: 200 })) || null,
      postal_code:
        (await formText(formData, "postal_code", { max: 30 })) || null,
      country: await formText(formData, "country", {
        required: true,
        max: 200,
      }),
      phone: (await formText(formData, "phone", { max: 50 })) || null,
      email: await formEmail(formData, "email"),
      office_hours:
        (await formText(formData, "office_hours", { max: 5000 })) || null,
      office_hours_format: "plain_text",
      map_url: await formHttpsUrl(formData, "map_url"),
      latitude,
      longitude,
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
      is_primary: await formBoolean(formData, "is_primary"),
    };
    if (!values.is_active && values.is_primary) {
      throw new ActionValidationError({
        is_primary: ["An inactive office cannot be primary."],
      });
    }
    if (values.is_primary) {
      const cleared = await supabase
        .from("office_locations")
        .update({ is_primary: false })
        .eq("is_primary", true);
      if (cleared.error) throw databaseError("cms.offices.clearPrimary", cleared.error);
    }
    const result = id
      ? await supabase
          .from("office_locations")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase
          .from("office_locations")
          .insert(values)
          .select("id")
          .single();
    if (result.error) throw databaseError("cms.offices.save", result.error);
    refresh(result.data.id);
    return { id: result.data.id };
  });
}

export async function toggleOfficeAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.offices.toggle", async ({ supabase }) => {
    const id = await formUuid(formData, "id");
    const active = await formBoolean(formData, "active");
    const { data: office, error: loadError } = await supabase
      .from("office_locations")
      .select("is_primary")
      .eq("id", id)
      .maybeSingle();
    if (loadError) throw databaseError("cms.offices.toggle.load", loadError);
    if (!office) throw new CmsError("not_found");
    if (!active && office.is_primary) {
      throw new CmsError("conflict", {
        message: "Choose another primary office before deactivating this one.",
      });
    }
    const { error } = await supabase
      .from("office_locations")
      .update({ is_active: active })
      .eq("id", id);
    if (error) throw databaseError("cms.offices.toggle", error);
    refresh(id);
  });
}
