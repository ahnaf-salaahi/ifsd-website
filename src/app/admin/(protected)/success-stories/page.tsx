import { createClient } from "@/lib/supabase/server";
import SuccessStoriesAdminClient from "@/components/admin/SuccessStoriesAdminClient";
import type { SuccessStoryRecord } from "@/lib/success-stories";

export const revalidate = 0;

export default async function AdminSuccessStoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("success_stories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Success Stories
        </h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Could not load Success Stories: {error.message}
        </p>
      </div>
    );
  }

  return (
    <SuccessStoriesAdminClient
      initialStories={(data ?? []) as SuccessStoryRecord[]}
    />
  );
}
