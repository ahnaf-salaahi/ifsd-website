import Link from "next/link";

export default function ScholarshipApplicationNotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-rose-600">
        Scholarship unavailable
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-gray-900">
        This Scholarship could not be found
      </h1>
      <p className="mt-4 text-gray-600">
        It may have been removed, unpublished, or the address may be incorrect.
      </p>
      <Link href="/scholarships" className="mt-8 inline-flex rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white">
        View Scholarships
      </Link>
    </main>
  );
}
