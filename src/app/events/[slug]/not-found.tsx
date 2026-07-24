import Link from "next/link";

export default function EventNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Event not found</h1>
      <p className="mt-4 text-gray-600">
        This Event is unavailable or no longer public.
      </p>
      <Link href="/events" className="mt-7 inline-flex rounded-full bg-rose-600 px-6 py-3 font-medium text-white">
        Return to Events
      </Link>
    </main>
  );
}
