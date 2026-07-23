import { notFound } from "next/navigation";
import DynamicRegistrationForm from "@/components/DynamicRegistrationForm";
import { getActiveRegistrationForm } from "@/lib/registration/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function EventRegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("slug", slug)
    .eq("registration_open", true)
    .gt("event_date", new Date().toISOString())
    .maybeSingle();

  if (!event) notFound();

  const form = await getActiveRegistrationForm("event", event.id);
  if (!form) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <p className="text-sm font-medium text-rose-700">Event registration</p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">
        {event.title}
      </h1>
      <div className="mt-8">
        <DynamicRegistrationForm
          form={form}
          ownerTitle={event.title}
          submitLabel="Submit Registration"
        />
      </div>
    </main>
  );
}

