import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/cms/auth";
import { CmsError, logCmsError } from "@/lib/cms/errors";
import type { ActionResult } from "@/lib/cms/action-types";
import type { Database } from "@/types/database.types";

export class ActionValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string[]>) {
    super("Please correct the highlighted fields.");
  }
}

export async function executeAdminAction<T>(
  operation: string,
  callback: (context: {
    supabase: SupabaseClient<Database>;
    administratorId: string;
  }) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const { supabase, administrator } = await requireAdmin();
    const data = await callback({
      supabase,
      administratorId: administrator.id,
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ActionValidationError) {
      return {
        ok: false,
        code: "validation",
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
    const cmsError =
      error instanceof CmsError
        ? error
        : new CmsError("database", { operation, cause: error });
    logCmsError(cmsError, { operation });
    return {
      ok: false,
      code: cmsError.code,
      message: cmsError.message,
    };
  }
}

export async function formText(
  formData: FormData,
  name: string,
  options: { required?: boolean; max?: number } = {},
) {
  const value = String(formData.get(name) ?? "").trim();
  const errors: string[] = [];
  if (options.required && !value) errors.push("This field is required.");
  if (options.max && value.length > options.max) {
    errors.push(`Use ${options.max} characters or fewer.`);
  }
  if (errors.length) throw new ActionValidationError({ [name]: errors });
  return value;
}

export async function formInteger(
  formData: FormData,
  name: string,
  minimum = 0,
) {
  const raw = String(formData.get(name) ?? "");
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new ActionValidationError({
      [name]: [`Enter a whole number of at least ${minimum}.`],
    });
  }
  return value;
}

export async function formUuid(
  formData: FormData,
  name: string,
  optional?: false,
): Promise<string>;
export async function formUuid(
  formData: FormData,
  name: string,
  optional: true,
): Promise<string | null>;
export async function formUuid(
  formData: FormData,
  name: string,
  optional = false,
): Promise<string | null> {
  const value = String(formData.get(name) ?? "").trim();
  if (!value && optional) return null;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new ActionValidationError({ [name]: ["Select a valid record."] });
  }
  return value;
}

export async function formSafeUrl(
  formData: FormData,
  name: string,
  optional = true,
) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value && optional) return null;
  const internal = value.startsWith("/") && !value.startsWith("//");
  let https = false;
  try {
    https = new URL(value).protocol === "https:";
  } catch {
    https = false;
  }
  if (!internal && !https) {
    throw new ActionValidationError({
      [name]: ["Use a safe internal path or an HTTPS URL."],
    });
  }
  return value;
}

export async function formHttpsUrl(
  formData: FormData,
  name: string,
  optional = true,
) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value && optional) return null;
  try {
    if (new URL(value).protocol !== "https:") throw new Error();
  } catch {
    throw new ActionValidationError({
      [name]: ["Enter a valid HTTPS URL."],
    });
  }
  return value;
}

export async function formEmail(
  formData: FormData,
  name: string,
  optional = true,
) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value && optional) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 320) {
    throw new ActionValidationError({
      [name]: ["Enter a valid email address."],
    });
  }
  return value;
}

export async function formBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}
