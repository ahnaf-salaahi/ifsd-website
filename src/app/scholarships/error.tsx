"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ScholarshipsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Public Scholarship route failed", { digest: error.digest });
  }, [error.digest]);
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">
        We could not load Scholarships
      </h1>
      <p className="mt-4 text-gray-600">Please try again in a moment.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button onClick={() => unstable_retry()} className="rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white">
          Try again
        </button>
        <Link href="/" className="rounded-full border px-6 py-3 text-sm font-medium">
          Return home
        </Link>
      </div>
    </main>
  );
}
