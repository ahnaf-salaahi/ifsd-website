import type { Metadata } from "next";
import ProgrammesClient from "@/components/ProgrammesClient";
import {
  getProgrammeMetadataDefaults,
  listPublicProgrammeCategories,
  listPublicProgrammes,
  parseProgrammeFilters,
} from "@/lib/programmes-public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getProgrammeMetadataDefaults().catch(() => null);
  return {
    title: `Programmes | ${settings?.institute_name || "Institute for Skills Development"}`,
    description:
      "Explore published skills, education, leadership, and community development programmes.",
    openGraph: {
      title: "Programmes | Institute for Skills Development",
      description:
        "Explore published skills, education, leadership, and community development programmes.",
      images: ["/logo-v2.png"],
    },
  };
}

export default async function ProgrammesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseProgrammeFilters(await searchParams);
  let loaded:
    | {
        result: Awaited<ReturnType<typeof listPublicProgrammes>>;
        categories: Awaited<ReturnType<typeof listPublicProgrammeCategories>>;
      }
    | null = null;
  try {
    const [result, categories] = await Promise.all([
      listPublicProgrammes(filters),
      listPublicProgrammeCategories(),
    ]);
    loaded = { result, categories };
  } catch {
    loaded = null;
  }
  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Programmes are temporarily unavailable
        </h1>
        <p className="mt-4 text-gray-600">
          We could not load the Programme catalogue. Please try again later.
        </p>
      </div>
    );
  }
  return (
    <ProgrammesClient
      result={loaded.result}
      categories={loaded.categories}
      filters={filters}
    />
  );
}
