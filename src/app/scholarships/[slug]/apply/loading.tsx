export default function ScholarshipApplicationLoading() {
  return (
    <main
      className="mx-auto max-w-3xl px-6 pb-24 pt-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-9 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="mt-8 h-96 animate-pulse rounded-2xl bg-gray-100" />
      <span className="sr-only">Loading application form</span>
    </main>
  );
}

