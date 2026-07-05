import { createClient } from "@/lib/supabase/server";
import EventsClient from "@/components/EventsClient";

export const revalidate = 0;

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  return <EventsClient events={events ?? []} />;
}