"use client";

import { useEffect } from "react";

export default function SuccessStoriesError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">
        We could not load this Success Story
      </h1>
      <p className="mt-4 text-gray-600">
        Please try again. If the problem continues, contact our team.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-8 rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white hover:bg-rose-700"
      >
        Try again
      </button>
    </div>
  );
}
