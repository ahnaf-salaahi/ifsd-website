import { createClient } from "@/lib/supabase/server";
import ScholarshipsClient from "@/components/ScholarshipsClient";

export const revalidate = 0;

export default async function ScholarshipsPage() {
  const supabase = await createClient();
  const { data: scholarships } = await supabase
    .from("scholarships")
    .select("*")
    .eq("published", true)
    .order("deadline", { ascending: true });

  return <ScholarshipsClient scholarships={scholarships ?? []} />;
}