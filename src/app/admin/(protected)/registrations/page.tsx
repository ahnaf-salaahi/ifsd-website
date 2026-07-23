import { createClient } from "@/lib/supabase/server";
import FormSubmissionsClient, {
  SubmissionListItem,
} from "@/components/admin/FormSubmissionsClient";
import RegistrationsClient from "@/components/admin/RegistrationsClient";

export const revalidate = 0;

type FormRow = {
  id: string;
  event_id: string | null;
  scholarship_id: string | null;
};

export default async function AdminRegistrationsPage() {
  const supabase = await createClient();
  const [{ data: submissionRows }, { data: legacyRegistrations }] =
    await Promise.all([
      supabase
        .from("form_submissions")
        .select("id, form_id, status, submitted_at")
        .order("submitted_at", { ascending: false }),
      supabase
        .from("event_registrations")
        .select("*, events(title)")
        .order("created_at", { ascending: false }),
    ]);

  if (!submissionRows?.length) {
    return (
      <div>
        <FormSubmissionsClient submissions={[]} />
        {legacyRegistrations?.length ? (
          <div className="mt-12 border-t border-gray-200 pt-10">
            <RegistrationsClient
              registrations={legacyRegistrations}
              title="Legacy Event Registrations"
            />
          </div>
        ) : null}
      </div>
    );
  }

  const submissionIds = submissionRows.map((submission) => submission.id);
  const formIds = Array.from(
    new Set(submissionRows.map((submission) => submission.form_id))
  );

  const [{ data: formRows }, { data: answerRows }] = await Promise.all([
    supabase
      .from("forms")
      .select("id, event_id, scholarship_id")
      .in("id", formIds),
    supabase
      .from("form_answers")
      .select("submission_id, field_key_snapshot, value_text")
      .in("submission_id", submissionIds)
      .in("field_key_snapshot", ["full_name", "email", "phone"]),
  ]);

  const forms = (formRows ?? []) as FormRow[];
  const eventIds = forms
    .map((form) => form.event_id)
    .filter((id): id is string => Boolean(id));
  const scholarshipIds = forms
    .map((form) => form.scholarship_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: events }, { data: scholarships }] = await Promise.all([
    eventIds.length
      ? supabase.from("events").select("id, title").in("id", eventIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    scholarshipIds.length
      ? supabase
          .from("scholarships")
          .select("id, title")
          .in("id", scholarshipIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const formsById = new Map(forms.map((form) => [form.id, form]));
  const eventTitles = new Map(
    (events ?? []).map((event) => [event.id, event.title])
  );
  const scholarshipTitles = new Map(
    (scholarships ?? []).map((scholarship) => [
      scholarship.id,
      scholarship.title,
    ])
  );
  const answersBySubmission = new Map<string, Map<string, string>>();

  for (const answer of answerRows ?? []) {
    const values =
      answersBySubmission.get(answer.submission_id) ?? new Map<string, string>();
    values.set(answer.field_key_snapshot, answer.value_text ?? "");
    answersBySubmission.set(answer.submission_id, values);
  }

  const submissions: SubmissionListItem[] = submissionRows.map((submission) => {
    const form = formsById.get(submission.form_id);
    const isEvent = Boolean(form?.event_id);
    const relatedId = form?.event_id ?? form?.scholarship_id ?? null;
    const relatedTitle = isEvent
      ? eventTitles.get(form?.event_id ?? "") ?? "Deleted or unavailable event"
      : scholarshipTitles.get(form?.scholarship_id ?? "") ??
        "Deleted or unavailable scholarship";
    const applicant = answersBySubmission.get(submission.id);

    return {
      id: submission.id,
      type: isEvent ? "event" : "scholarship",
      related_id: relatedId,
      related_title: relatedTitle,
      applicant_name: applicant?.get("full_name") ?? "",
      email: applicant?.get("email") ?? "",
      phone: applicant?.get("phone") ?? "",
      submitted_at: submission.submitted_at,
      status: submission.status as SubmissionListItem["status"],
    };
  });

  return (
    <div>
      <FormSubmissionsClient submissions={submissions} />
      {legacyRegistrations?.length ? (
        <div className="mt-12 border-t border-gray-200 pt-10">
          <RegistrationsClient
            registrations={legacyRegistrations}
            title="Legacy Event Registrations"
          />
        </div>
      ) : null}
    </div>
  );
}
