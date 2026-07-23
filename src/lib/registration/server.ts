import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  RegistrationFieldDefinition,
  RegistrationFieldType,
  RegistrationFormDefinition,
} from "@/lib/registration/types";

export async function getActiveRegistrationForm(
  ownerType: "event" | "scholarship",
  ownerId: string
): Promise<RegistrationFormDefinition | null> {
  const supabase = await createClient();
  const ownerColumn =
    ownerType === "event" ? "event_id" : "scholarship_id";

  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id, name, description")
    .eq(ownerColumn, ownerId)
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle();

  if (formError || !form) return null;

  const { data: fields, error: fieldsError } = await supabase
    .from("form_fields")
    .select(
      "id, field_type, label, field_key, description, display_order, is_required, selection_options"
    )
    .eq("form_id", form.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (fieldsError || !fields?.length) return null;

  return {
    id: form.id,
    name: form.name,
    description: form.description,
    fields: fields.map(
      (field): RegistrationFieldDefinition => ({
        id: field.id,
        field_type: field.field_type as RegistrationFieldType,
        label: field.label,
        field_key: field.field_key,
        description: field.description,
        display_order: field.display_order,
        is_required: field.is_required,
        selection_options: Array.isArray(field.selection_options)
          ? (field.selection_options as string[])
          : null,
      })
    ),
  };
}

