import { notFound } from "next/navigation";
import DynamicRegistrationForm from "@/components/DynamicRegistrationForm";
import { getActiveRegistrationForm } from "@/lib/registration/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function ScholarshipApplicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: scholarship } = await supabase
    .from("scholarships")
    .select("id, title")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!scholarship) notFound();

  const form = await getActiveRegistrationForm(
    "scholarship",
    scholarship.id
  );
  if (!form) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <p className="text-sm font-medium text-rose-700">
        Scholarship application
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">
        {scholarship.title}
      </h1>
      <div className="mt-8">
        <DynamicRegistrationForm
          form={form}
          ownerTitle={scholarship.title}
          submitLabel="Submit Application"
        />
      </div>
    </main>
  );
}

