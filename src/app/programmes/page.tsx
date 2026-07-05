import { createClient } from "@/lib/supabase/server";
import ProgrammesClient from "@/components/ProgrammesClient";

export const revalidate = 0;

export default async function ProgrammesPage() {
  const supabase = await createClient();
  const { data: programmes } = await supabase
    .from("programmes")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return <ProgrammesClient programmes={programmes ?? []} />;
}