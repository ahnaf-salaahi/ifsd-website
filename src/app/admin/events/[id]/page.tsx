import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import EventPhotoUpload from "@/components/admin/EventPhotoUpload";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  const { data: photos } = await supabase
    .from("event_photos")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Manage Event</h1>
      <EventForm event={event} />
      <EventPhotoUpload eventId={event.id} photos={photos ?? []} />
    </div>
  );
}