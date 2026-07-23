import type { Metadata } from "next";
import ScholarshipsClient from "@/components/ScholarshipsClient";
import {
  getScholarshipFilterOptions,
  getScholarshipMetadataDefaults,
  listPublicScholarships,
  parseScholarshipFilters,
} from "@/lib/scholarships-public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getScholarshipMetadataDefaults().catch(() => null);
  const description =
    "Stay updated with published scholarship opportunities, eligibility requirements, and application deadlines.";
  return {
    title: `Scholarships | ${settings?.institute_name || "Institute for Skills Development"}`,
    description,
    openGraph: {
      title: "Scholarships | Institute for Skills Development",
      description,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseScholarshipFilters(await searchParams);
  let loaded:
    | {
        result: Awaited<ReturnType<typeof listPublicScholarships>>;
        options: Awaited<ReturnType<typeof getScholarshipFilterOptions>>;
      }
    | null = null;
  try {
    const [result, options] = await Promise.all([
      listPublicScholarships(filters),
      getScholarshipFilterOptions(),
    ]);
    loaded = { result, options };
  } catch {
    loaded = null;
  }
  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Scholarships are temporarily unavailable
        </h1>
        <p className="mt-4 text-gray-600">
          We could not load the Scholarship catalogue. Please try again later.
        </p>
      </div>
    );
  }
  return (
    <ScholarshipsClient
      result={loaded.result}
      options={loaded.options}
      filters={filters}
    />
  );
}
