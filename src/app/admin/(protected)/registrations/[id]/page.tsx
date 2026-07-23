import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FormSubmissionDetailClient, {
  SubmissionAnswer,
} from "@/components/admin/FormSubmissionDetailClient";

export const revalidate = 0;

type SubmissionStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "approved"
  | "rejected";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: submission } = await supabase
    .from("form_submissions")
    .select("id, form_id, status, admin_notes, submitted_at")
    .eq("id", id)
    .maybeSingle();

  if (!submission) notFound();

  const [{ data: form }, { data: answerRows }] = await Promise.all([
    supabase
      .from("forms")
      .select("event_id, scholarship_id")
      .eq("id", submission.form_id)
      .maybeSingle(),
    supabase
      .from("form_answers")
      .select(
        "id, field_key_snapshot, field_label_snapshot, field_type_snapshot, value_text, value_json, file_path, file_name, display_order_snapshot"
      )
      .eq("submission_id", submission.id)
      .order("display_order_snapshot", { ascending: true }),
  ]);

  if (!form) notFound();

  const isEvent = Boolean(form.event_id);
  const ownerId = form.event_id ?? form.scholarship_id;
  let relatedTitle = isEvent ? "Unavailable event" : "Unavailable scholarship";

  if (ownerId) {
    const { data: owner } = isEvent
      ? await supabase
          .from("events")
          .select("title")
          .eq("id", ownerId)
          .maybeSingle()
      : await supabase
          .from("scholarships")
          .select("title")
          .eq("id", ownerId)
          .maybeSingle();
    if (owner?.title) relatedTitle = owner.title;
  }

  const answers: SubmissionAnswer[] = (answerRows ?? []).map((answer) => ({
    id: answer.id,
    label: answer.field_label_snapshot ?? "",
    fieldKey: answer.field_key_snapshot ?? "",
    fieldType: answer.field_type_snapshot ?? "unknown",
    valueText: answer.value_text,
    valueJson: Array.isArray(answer.value_json)
      ? (answer.value_json as string[])
      : null,
    filePath: answer.file_path,
    fileName: answer.file_name,
  }));

  return (
    <div>
      <Link
        href="/admin/registrations"
        className="inline-flex items-center gap-2 text-sm font-medium text-rose-700 hover:underline"
      >
        <ArrowLeft size={15} /> Back to submissions
      </Link>
      <div className="mb-6 mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
          {isEvent ? "Event registration" : "Scholarship application"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">
          {relatedTitle}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Submitted {formatDateTime(submission.submitted_at)}
        </p>
      </div>

      <FormSubmissionDetailClient
        submissionId={submission.id}
        initialStatus={submission.status as SubmissionStatus}
        initialNotes={submission.admin_notes ?? ""}
        answers={answers}
      />
    </div>
  );
}

