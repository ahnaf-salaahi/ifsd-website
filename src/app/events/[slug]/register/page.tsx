import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DynamicRegistrationForm from "@/components/DynamicRegistrationForm";
import { getPublicEvent, isValidEventSlug } from "@/lib/events-public";
import { getActiveRegistrationForm } from "@/lib/registration/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = isValidEventSlug(slug)
    ? await getPublicEvent(slug).catch(() => null)
    : null;
  return {
    title: detail
      ? `Register for ${detail.event.title}`
      : "Event registration",
    description: "Complete the Event registration form.",
    alternates: detail
      ? { canonical: `/events/${detail.event.slug}/register` }
      : undefined,
    robots: { index: false, follow: false },
    openGraph: {
      title: detail
        ? `Register for ${detail.event.title}`
        : "Event registration",
      description: "Complete the Event registration form.",
      images: ["/logo-v2.png"],
    },
  };
}

export default async function EventRegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidEventSlug(slug)) notFound();
  const detail = await getPublicEvent(slug);
  if (!detail || detail.registrationStatus !== "open_internal") notFound();

  const form = await getActiveRegistrationForm("event", detail.event.id);
  if (!form) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <p className="text-sm font-medium text-rose-700">Event registration</p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">
        {detail.event.title}
      </h1>
      <div className="mt-8">
        <DynamicRegistrationForm
          form={form}
          ownerTitle={detail.event.title}
          submitLabel="Submit Registration"
        />
      </div>
    </main>
  );
}
