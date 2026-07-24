import type { Metadata } from "next";
import SuccessStoriesClient from "@/components/SuccessStoriesClient";
import {
  getSuccessStoryFilterOptions,
  getSuccessStoryMetadataDefaults,
  listPublicSuccessStories,
  parseSuccessStoryFilters,
} from "@/lib/success-stories-public";
import { SITE_NAME } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSuccessStoryMetadataDefaults().catch(() => null);
  const description =
    "Read stories from students, scholarship recipients, participants, parents, and mentors in our community.";
  return {
    title: `Success Stories | ${SITE_NAME}`,
    description,
    alternates: { canonical: "/success-stories" },
    robots: {
      index: settings?.default_robots_index ?? true,
      follow: settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: `Success Stories | ${SITE_NAME}`,
      description,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function SuccessStoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseSuccessStoryFilters(await searchParams);
  let loaded:
    | {
        result: Awaited<ReturnType<typeof listPublicSuccessStories>>;
        options: Awaited<ReturnType<typeof getSuccessStoryFilterOptions>>;
      }
    | null = null;
  try {
    const [result, options] = await Promise.all([
      listPublicSuccessStories(filters),
      getSuccessStoryFilterOptions(),
    ]);
    loaded = { result, options };
  } catch {
    loaded = null;
  }
  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          Success Stories are temporarily unavailable
        </h1>
        <p className="mt-4 text-gray-600">
          We could not load the stories. Please try again later.
        </p>
      </div>
    );
  }
  return (
    <SuccessStoriesClient
      result={loaded.result}
      options={loaded.options}
      filters={filters}
    />
  );
}
