import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

export type CmsErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "validation"
  | "conflict"
  | "storage"
  | "database";

const PUBLIC_MESSAGES: Record<CmsErrorCode, string> = {
  unauthenticated: "Authentication is required.",
  forbidden: "Administrator access is required.",
  not_found: "The requested content was not found.",
  validation: "The supplied data is invalid.",
  conflict: "The requested change conflicts with existing content.",
  storage: "The media operation could not be completed.",
  database: "The content operation could not be completed.",
};

export class CmsError extends Error {
  readonly code: CmsErrorCode;
  readonly operation?: string;
  readonly safeDetails?: Record<string, string>;
  readonly cause?: unknown;

  constructor(
    code: CmsErrorCode,
    options: {
      message?: string;
      operation?: string;
      safeDetails?: Record<string, string>;
      cause?: unknown;
    } = {},
  ) {
    super(options.message ?? PUBLIC_MESSAGES[code]);
    this.name = "CmsError";
    this.code = code;
    this.operation = options.operation;
    this.safeDetails = options.safeDetails;
    this.cause = options.cause;
  }
}

export function databaseError(
  operation: string,
  error: PostgrestError,
): CmsError {
  const code =
    error.code === "23505"
      ? "conflict"
      : error.code === "PGRST116"
        ? "not_found"
        : "database";

  return new CmsError(code, {
    operation,
    safeDetails: { databaseCode: error.code },
    cause: error,
  });
}

export function storageError(operation: string, cause: unknown): CmsError {
  return new CmsError("storage", { operation, cause });
}

export function logCmsError(
  error: unknown,
  context: {
    operation: string;
    administratorId?: string;
    entityId?: string;
  },
) {
  const cmsError = error instanceof CmsError ? error : null;
  console.error("CMS operation failed", {
    operation: context.operation,
    administratorId: context.administratorId,
    entityId: context.entityId,
    code: cmsError?.code ?? "unknown",
    databaseCode: cmsError?.safeDetails?.databaseCode,
  });
}
