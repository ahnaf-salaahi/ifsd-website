import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EventDetailClient from "@/components/EventDetailClient";

export const revalidate = 0;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  const { data: photos } = await supabase
    .from("event_photos")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  return <EventDetailClient event={event} photos={photos ?? []} />;
}