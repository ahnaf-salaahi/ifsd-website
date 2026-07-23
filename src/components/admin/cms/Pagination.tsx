import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  pathname,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  pathname: string;
  searchParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;
  const href = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return `${pathname}?${params.toString()}`;
  };
  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between text-sm"
    >
      <Link
        aria-disabled={page <= 1}
        className={`rounded-lg border px-4 py-2 ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
        }`}
        href={href(Math.max(1, page - 1))}
      >
        Previous
      </Link>
      <span className="text-gray-500">
        Page {page} of {totalPages}
      </span>
      <Link
        aria-disabled={page >= totalPages}
        className={`rounded-lg border px-4 py-2 ${
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-gray-50"
        }`}
        href={href(Math.min(totalPages, page + 1))}
      >
        Next
      </Link>
    </nav>
  );
}
