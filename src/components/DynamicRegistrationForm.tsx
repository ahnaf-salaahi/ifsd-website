"use client";

import { FormEvent, useRef, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  RegistrationAnswerPayload,
  RegistrationFieldDefinition,
  RegistrationFormDefinition,
} from "@/lib/registration/types";
import { validateRegistrationAnswers } from "@/lib/registration/validation";

type FieldValue = string | string[] | File | null;

const FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CLIENT_FILE_TOKEN = "00000000-0000-4000-8000-000000000000";

function inputClass(hasError: boolean) {
  return `mt-1 w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;
}

function stringValue(value: FieldValue) {
  return typeof value === "string" ? value : "";
}

function getFileError(field: RegistrationFieldDefinition, value: FieldValue) {
  if (!value) {
    return field.is_required ? `${field.label} is required.` : "";
  }
  if (!(value instanceof File)) return `Select a valid file.`;
  if (!FILE_TYPES.includes(value.type)) {
    return "Upload a PDF, JPG, or PNG file.";
  }
  if (value.size < 1 || value.size > MAX_FILE_SIZE) {
    return "The file must be smaller than 10 MB.";
  }
  return "";
}

export default function DynamicRegistrationForm({
  form,
  ownerTitle,
  submitLabel,
}: {
  form: RegistrationFormDefinition;
  ownerTitle: string;
  submitLabel: string;
}) {
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "uploading" | "submitting" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = useState("");
  const idempotencyKey = useRef<string | null>(null);
  const uploadedFiles = useRef(
    new Map<
      string,
      { file: File; uploadToken: string; refreshAfter: number }
    >()
  );

  function setValue(fieldId: string, value: FieldValue) {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setFieldErrors((current) => {
      if (!current[fieldId]) return current;
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function buildAnswers(useUploadedTokens: boolean) {
    const answers: RegistrationAnswerPayload[] = [];

    for (const field of form.fields) {
      const value = values[field.id];
      if (field.field_type === "file") {
        if (!(value instanceof File)) continue;
        const uploaded = uploadedFiles.current.get(field.id);
        answers.push({
          field_id: field.id,
          upload_token: useUploadedTokens
            ? uploaded?.uploadToken
            : CLIENT_FILE_TOKEN,
        });
      } else if (field.field_type === "checkboxes") {
        const selections = Array.isArray(value) ? value : [];
        if (selections.length) {
          answers.push({ field_id: field.id, value_json: selections });
        }
      } else if (typeof value === "string" && value.trim()) {
        answers.push({ field_id: field.id, value_text: value.trim() });
      }
    }

    return answers;
  }

  function validateClient() {
    const validation = validateRegistrationAnswers(
      form.fields,
      buildAnswers(false)
    );
    const errors = validation.valid ? {} : { ...validation.fieldErrors };

    for (const field of form.fields) {
      if (field.field_type !== "file") continue;
      const fileError = getFileError(field, values[field.id]);
      if (fileError) errors[field.id] = fileError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function uploadFiles() {
    const supabase = createClient();

    for (const field of form.fields) {
      if (field.field_type !== "file") continue;
      const file = values[field.id];
      if (!(file instanceof File)) continue;

      const existing = uploadedFiles.current.get(field.id);
      if (
        existing?.file === file &&
        existing.refreshAfter > Date.now()
      ) {
        continue;
      }

      const { data: intentData, error: intentError } = await supabase.rpc(
        "create_form_upload_intent",
        {
          p_form_id: form.id,
          p_field_id: field.id,
          p_file_name: file.name,
          p_mime_type: file.type,
          p_size_bytes: file.size,
        }
      );

      if (intentError) {
        throw new Error(`Could not prepare “${field.label}” for upload.`);
      }

      const intent = Array.isArray(intentData) ? intentData[0] : null;
      if (!intent?.upload_token || !intent?.object_path) {
        throw new Error(`Could not prepare “${field.label}” for upload.`);
      }

      const { error: uploadError } = await supabase.storage
        .from("form-uploads")
        .upload(intent.object_path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Could not upload “${field.label}”.`);
      }

      uploadedFiles.current.set(field.id, {
        file,
        uploadToken: intent.upload_token,
        refreshAfter: Date.now() + 25 * 60 * 1000,
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "uploading" || status === "submitting") return;

    setServerError("");
    if (!validateClient()) {
      setStatus("idle");
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>("[data-registration-error='true']")
          ?.focus();
      });
      return;
    }

    try {
      setStatus("uploading");
      await uploadFiles();
      setStatus("submitting");

      if (!idempotencyKey.current) {
        idempotencyKey.current = crypto.randomUUID();
      }

      const response = await fetch("/api/registration/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          idempotencyKey: idempotencyKey.current,
          answers: buildAnswers(true),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !result.success) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        throw new Error(
          result.error ?? "Your registration could not be submitted."
        );
      }

      setStatus("success");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Your registration could not be submitted."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto text-green-700" size={36} />
        <h2 className="mt-4 text-xl font-semibold text-green-900">
          Submission received
        </h2>
        <p className="mt-2 text-sm text-green-800">
          Your application for {ownerTitle} was submitted successfully.
        </p>
      </div>
    );
  }

  const busy = status === "uploading" || status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-semibold text-gray-900">{form.name}</h2>
      {form.description && (
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {form.description}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Fields marked with <span aria-hidden="true">*</span> are required.
      </p>

      <div className="mt-7 space-y-6">
        {form.fields.map((field) => {
          const error = fieldErrors[field.id];
          const descriptionId = `${field.id}-description`;
          const errorId = `${field.id}-error`;
          const describedBy = [
            field.description ? descriptionId : "",
            error ? errorId : "",
          ]
            .filter(Boolean)
            .join(" ");
          const label = (
            <>
              {field.label}
              {field.is_required && (
                <span className="ml-1 text-red-600" aria-hidden="true">
                  *
                </span>
              )}
            </>
          );

          return (
            <div key={field.id}>
              {field.field_type !== "radio" &&
                field.field_type !== "checkboxes" && (
                  <label
                    htmlFor={field.id}
                    className="text-sm font-medium text-gray-800"
                  >
                    {label}
                  </label>
                )}
              {field.description && (
                <p id={descriptionId} className="mt-1 text-xs text-gray-500">
                  {field.description}
                </p>
              )}

              {(field.field_type === "short_text" ||
                field.field_type === "email" ||
                field.field_type === "phone" ||
                field.field_type === "number" ||
                field.field_type === "date") && (
                <input
                  id={field.id}
                  type={
                    field.field_type === "short_text"
                      ? "text"
                      : field.field_type === "phone"
                        ? "tel"
                        : field.field_type
                  }
                  value={stringValue(values[field.id])}
                  onChange={(event) => setValue(field.id, event.target.value)}
                  required={field.is_required}
                  maxLength={field.field_type === "short_text" ? 1000 : undefined}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy || undefined}
                  className={inputClass(Boolean(error))}
                />
              )}

              {field.field_type === "long_text" && (
                <textarea
                  id={field.id}
                  rows={5}
                  value={stringValue(values[field.id])}
                  onChange={(event) => setValue(field.id, event.target.value)}
                  required={field.is_required}
                  maxLength={50000}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy || undefined}
                  className={inputClass(Boolean(error))}
                />
              )}

              {field.field_type === "dropdown" && (
                <select
                  id={field.id}
                  value={stringValue(values[field.id])}
                  onChange={(event) => setValue(field.id, event.target.value)}
                  required={field.is_required}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy || undefined}
                  className={inputClass(Boolean(error))}
                >
                  <option value="">Select an option</option>
                  {(field.selection_options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {(field.field_type === "radio" ||
                field.field_type === "checkboxes") && (
                <fieldset
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy || undefined}
                  className="space-y-2"
                >
                  <legend className="text-sm font-medium text-gray-800">
                    {label}
                  </legend>
                  <div className="mt-2 space-y-2">
                    {(field.selection_options ?? []).map((option) => {
                      const selections = Array.isArray(values[field.id])
                        ? (values[field.id] as string[])
                        : [];
                      const checked =
                        field.field_type === "radio"
                          ? values[field.id] === option
                          : selections.includes(option);
                      return (
                        <label
                          key={option}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <input
                            type={field.field_type === "radio" ? "radio" : "checkbox"}
                            name={field.id}
                            value={option}
                            checked={checked}
                            onChange={(event) => {
                              if (field.field_type === "radio") {
                                setValue(field.id, option);
                              } else {
                                setValue(
                                  field.id,
                                  event.target.checked
                                    ? [...selections, option]
                                    : selections.filter(
                                        (selection) => selection !== option
                                      )
                                );
                              }
                            }}
                            className="mt-0.5 border-gray-300"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {field.field_type === "file" && (
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600 hover:bg-gray-50">
                  <Upload size={18} />
                  <span className="min-w-0 truncate">
                    {values[field.id] instanceof File
                      ? (values[field.id] as File).name
                      : "Choose a PDF, JPG, or PNG file"}
                  </span>
                  <input
                    id={field.id}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => {
                      uploadedFiles.current.delete(field.id);
                      setValue(field.id, event.target.files?.[0] ?? null);
                    }}
                    required={field.is_required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy || undefined}
                    className="sr-only"
                  />
                </label>
              )}

              {error && (
                <p
                  id={errorId}
                  tabIndex={-1}
                  data-registration-error="true"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {serverError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-8 w-full rounded-full bg-rose-600 px-6 py-3 font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "uploading"
          ? "Uploading files…"
          : status === "submitting"
            ? "Submitting…"
            : submitLabel}
      </button>
    </form>
  );
}
