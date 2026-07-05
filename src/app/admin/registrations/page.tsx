import { createClient } from "@/lib/supabase/server";
import RegistrationsClient from "@/components/admin/RegistrationsClient";

export const revalidate = 0;

export default async function AdminRegistrationsPage() {
  const supabase = await createClient();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*, events(title)")
    .order("created_at", { ascending: false });

  return <RegistrationsClient registrations={registrations ?? []} />;
}