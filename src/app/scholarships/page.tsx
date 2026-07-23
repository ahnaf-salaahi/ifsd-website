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

  const scholarshipIds = (scholarships ?? []).map(
    (scholarship) => scholarship.id
  );
  const { data: activeForms } = scholarshipIds.length
    ? await supabase
        .from("forms")
        .select("scholarship_id")
        .in("scholarship_id", scholarshipIds)
        .eq("is_active", true)
        .eq("is_public", true)
    : { data: [] };
  const scholarshipsWithApplicationState = (scholarships ?? []).map(
    (scholarship) => ({
      ...scholarship,
      has_active_application_form: (activeForms ?? []).some(
        (form) => form.scholarship_id === scholarship.id
      ),
    })
  );

  return (
    <ScholarshipsClient scholarships={scholarshipsWithApplicationState} />
  );
}
