import type { Metadata } from "next";
import EventsClient from "@/components/EventsClient";
import {
  getEventMetadataDefaults,
  listPublicEvents,
  parseEventFilters,
} from "@/lib/events-public";
import { SITE_NAME } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Explore public webinars, workshops, mentoring sessions, and leadership Events.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getEventMetadataDefaults().catch(() => null);
  const institute = SITE_NAME;
  return {
    title: `Events | ${institute}`,
    description: settings?.default_seo_description || DESCRIPTION,
    alternates: { canonical: "/events" },
    robots: {
      index: settings?.default_robots_index ?? true,
      follow: settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: `Events | ${institute}`,
      description: settings?.default_seo_description || DESCRIPTION,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseEventFilters(await searchParams);
  let result: Awaited<ReturnType<typeof listPublicEvents>> | null = null;
  try {
    result = await listPublicEvents(filters);
  } catch {
    result = null;
  }
  if (result) return <EventsClient result={result} filters={filters} />;
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">
        Events are temporarily unavailable
      </h1>
      <p className="mt-4 text-gray-600">
        We could not load Events. Please try again later.
      </p>
    </main>
  );
}
