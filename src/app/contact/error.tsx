"use client";

import { useEffect } from "react";

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Contact page rendering failed", { digest: error.digest });
  }, [error.digest]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Contact details are temporarily unavailable</h1>
      <p className="mt-4 text-gray-600">Please try loading this page again.</p>
      <button type="button" onClick={reset} className="mt-7 rounded-full bg-rose-600 px-6 py-3 font-medium text-white">Try again</button>
    </main>
  );
}
