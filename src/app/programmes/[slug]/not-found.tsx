import Link from "next/link";

export default function ProgrammeNotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-rose-600">
        Programme unavailable
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-gray-900">
        This Programme could not be found
      </h1>
      <p className="mt-4 leading-relaxed text-gray-600">
        It may have been removed, unpublished, or the address may be incorrect.
      </p>
      <Link
        href="/programmes"
        className="mt-8 inline-flex rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white hover:bg-rose-700"
      >
        View published Programmes
      </Link>
    </div>
  );
}
