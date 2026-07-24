import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetailClient from "@/components/EventDetailClient";
import {
  getEventMetadataDefaults,
  getPublicEvent,
  isValidEventSlug,
} from "@/lib/events-public";
import { SITE_NAME } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidEventSlug(slug)) {
    return { robots: { index: false, follow: false } };
  }
  const [detail, settings] = await Promise.all([
    getPublicEvent(slug).catch(() => null),
    getEventMetadataDefaults().catch(() => null),
  ]);
  if (!detail) return { robots: { index: false, follow: false } };
  const description = excerpt(detail.event.description);
  const institute = SITE_NAME;
  return {
    title: `${detail.event.title} | ${institute}`,
    description,
    alternates: { canonical: `/events/${detail.event.slug}` },
    robots: {
      index: settings?.default_robots_index ?? true,
      follow: settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: detail.event.title,
      description,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidEventSlug(slug)) notFound();
  const detail = await getPublicEvent(slug);
  if (!detail) notFound();
  return <EventDetailClient detail={detail} />;
}

function excerpt(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}
