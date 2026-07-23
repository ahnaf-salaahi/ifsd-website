import {
  RegistrationAnswerPayload,
  RegistrationFieldDefinition,
} from "@/lib/registration/types";

const EMAIL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const PHONE_PATTERN = /^[0-9+() .-]{7,30}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RegistrationValidationResult =
  | { valid: true }
  | { valid: false; fieldErrors: Record<string, string> };

export function validateRegistrationAnswers(
  fields: RegistrationFieldDefinition[],
  answers: RegistrationAnswerPayload[]
): RegistrationValidationResult {
  const fieldErrors: Record<string, string> = {};
  const fieldsById = new Map(fields.map((field) => [field.id, field]));
  const answersByField = new Map<string, RegistrationAnswerPayload>();

  for (const answer of answers) {
    if (
      !answer.field_id ||
      !fieldsById.has(answer.field_id) ||
      answersByField.has(answer.field_id)
    ) {
      fieldErrors._form = "The submitted form contains an invalid field.";
      continue;
    }
    answersByField.set(answer.field_id, answer);
  }

  for (const field of fields) {
    const answer = answersByField.get(field.id);
    const text = answer?.value_text?.trim() ?? "";
    const selections = answer?.value_json ?? [];
    const uploadToken = answer?.upload_token ?? "";
    const hasValue =
      Boolean(text) || selections.length > 0 || Boolean(uploadToken);

    if (field.is_required && !hasValue) {
      fieldErrors[field.id] = `${field.label} is required.`;
      continue;
    }
    if (!hasValue) continue;

    if (field.field_type === "file") {
      if (
        !UUID_PATTERN.test(uploadToken) ||
        answer?.value_text !== undefined ||
        answer?.value_json !== undefined
      ) {
        fieldErrors[field.id] = `Upload a valid file for ${field.label}.`;
      }
      continue;
    }

    if (field.field_type === "checkboxes") {
      const options = field.selection_options ?? [];
      if (
        selections.length === 0 ||
        new Set(selections).size !== selections.length ||
        selections.some((selection) => !options.includes(selection)) ||
        answer?.value_text !== undefined ||
        answer?.upload_token !== undefined
      ) {
        fieldErrors[field.id] = `Select valid choices for ${field.label}.`;
      }
      continue;
    }

    if (answer?.value_json || answer?.upload_token) {
      fieldErrors[field.id] = `${field.label} has an invalid value.`;
      continue;
    }

    if (field.field_type === "short_text" && text.length > 1000) {
      fieldErrors[field.id] = `${field.label} must be 1,000 characters or fewer.`;
    } else if (field.field_type === "long_text" && text.length > 50000) {
      fieldErrors[field.id] = `${field.label} is too long.`;
    } else if (field.field_type === "email" && !EMAIL_PATTERN.test(text)) {
      fieldErrors[field.id] = `Enter a valid email address.`;
    } else if (field.field_type === "phone" && !PHONE_PATTERN.test(text)) {
      fieldErrors[field.id] = `Enter a valid phone number.`;
    } else if (
      field.field_type === "number" &&
      (!Number.isFinite(Number(text)) || text === "")
    ) {
      fieldErrors[field.id] = `Enter a valid number.`;
    } else if (
      field.field_type === "date" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {
      fieldErrors[field.id] = `Enter a valid date.`;
    } else if (
      (field.field_type === "dropdown" ||
        field.field_type === "radio") &&
      !(field.selection_options ?? []).includes(text)
    ) {
      fieldErrors[field.id] = `Select a valid option for ${field.label}.`;
    }
  }

  return Object.keys(fieldErrors).length === 0
    ? { valid: true }
    : { valid: false, fieldErrors };
}
