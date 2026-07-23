"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/cms/action-types";
import { INITIAL_ACTION_RESULT } from "@/lib/cms/action-types";

export default function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  pendingLabel = "Saving…",
  className,
  sticky = false,
}: {
  action: (
    previousState: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  className?: string;
  sticky?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ACTION_RESULT,
  );

  return (
    <form action={formAction} className={className}>
      {!state.ok && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      )}
      {state.ok && state.data !== undefined && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Changes saved.
        </div>
      )}
      {children}
      <div
        className={
          sticky
            ? "sticky bottom-3 z-20 mt-6 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur"
            : "mt-6"
        }
      >
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
