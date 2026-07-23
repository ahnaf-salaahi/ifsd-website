import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  RegistrationAnswerPayload,
  RegistrationFieldDefinition,
  RegistrationFieldType,
} from "@/lib/registration/types";
import { validateRegistrationAnswers } from "@/lib/registration/validation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isAnswerPayload(value: unknown): value is RegistrationAnswerPayload {
  if (!value || typeof value !== "object") return false;
  const answer = value as Record<string, unknown>;
  return (
    typeof answer.field_id === "string" &&
    UUID_PATTERN.test(answer.field_id) &&
    (answer.value_text === undefined ||
      typeof answer.value_text === "string") &&
    (answer.value_json === undefined ||
      (Array.isArray(answer.value_json) &&
        answer.value_json.every((item) => typeof item === "string"))) &&
    (answer.upload_token === undefined ||
      (typeof answer.upload_token === "string" &&
        UUID_PATTERN.test(answer.upload_token)))
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 1024 * 1024) {
    return NextResponse.json(
      { error: "The submission is too large." },
      { status: 413 }
    );
  }

  let body: {
    formId?: unknown;
    idempotencyKey?: unknown;
    answers?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The submission could not be read." },
      { status: 400 }
    );
  }

  if (
    typeof body.formId !== "string" ||
    !UUID_PATTERN.test(body.formId) ||
    typeof body.idempotencyKey !== "string" ||
    !UUID_PATTERN.test(body.idempotencyKey) ||
    !Array.isArray(body.answers) ||
    body.answers.length > 100 ||
    !body.answers.every(isAnswerPayload)
  ) {
    return NextResponse.json(
      { error: "The submission contains invalid data." },
      { status: 400 }
    );
  }

  const answers = body.answers;
  const supabase = await createClient();
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id")
    .eq("id", body.formId)
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle();

  if (formError || !form) {
    return NextResponse.json(
      { error: "This form is no longer accepting submissions." },
      { status: 409 }
    );
  }

  const { data: fieldRows, error: fieldsError } = await supabase
    .from("form_fields")
    .select(
      "id, field_type, label, field_key, description, display_order, is_required, selection_options"
    )
    .eq("form_id", form.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (fieldsError || !fieldRows?.length) {
    return NextResponse.json(
      { error: "This form is not configured for submissions." },
      { status: 409 }
    );
  }

  const fields: RegistrationFieldDefinition[] = fieldRows.map((field) => ({
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
  }));
  const validation = validateRegistrationAnswers(fields, answers);

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields.",
        fieldErrors: validation.fieldErrors,
      },
      { status: 422 }
    );
  }

  const { error: submitError } = await supabase.rpc("submit_form", {
    p_form_id: body.formId,
    p_idempotency_key: body.idempotencyKey,
    p_answers: answers,
  });

  if (submitError) {
    return NextResponse.json(
      {
        error:
          "Your submission could not be completed. Please review the form and try again.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
