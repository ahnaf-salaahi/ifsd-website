"use client";

import { useEffect } from "react";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Events route rendering failed", { digest: error.digest });
  }, [error.digest]);
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">
        Events are temporarily unavailable
      </h1>
      <button type="button" onClick={reset} className="mt-7 rounded-full bg-rose-600 px-6 py-3 font-medium text-white">
        Try again
      </button>
    </main>
  );
}
