"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/cms/action-types";
import { INITIAL_ACTION_RESULT } from "@/lib/cms/action-types";

export default function ActionButton({
  action,
  fields,
  label,
  pendingLabel = "Working…",
  confirmMessage,
  destructive = false,
}: {
  action: (
    previousState: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  confirmMessage?: string;
  destructive?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ACTION_RESULT,
  );
  return (
    <form
      action={formAction}
      className="inline-flex flex-col items-start gap-1"
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={
          destructive
            ? "text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            : "text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
        }
      >
        {pending ? pendingLabel : label}
      </button>
      {!state.ok && (
        <span role="alert" className="max-w-48 text-xs text-red-600">
          {state.message}
        </span>
      )}
    </form>
  );
}
