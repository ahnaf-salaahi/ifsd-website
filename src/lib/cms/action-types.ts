export type ActionErrorCode =
  | "validation"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "storage"
  | "database";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | {
      ok: false;
      code: ActionErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const INITIAL_ACTION_RESULT: ActionResult = { ok: true };
