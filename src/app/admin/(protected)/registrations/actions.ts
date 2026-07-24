"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type DeleteRegistrationResult =
  | { success: true }
  | { success: false; message: string };

export async function deleteFormSubmissionAction(
  submissionId: string,
): Promise<DeleteRegistrationResult> {
  if (!isUuid(submissionId)) {
    return { success: false, message: "Invalid registration." };
  }

  await requireAdmin();
  const supabase = createAdminClient();
  const [{ data: answers, error: answersError }, { data: intents, error: intentsError }] =
    await Promise.all([
      supabase
        .from("form_answers")
        .select("file_path")
        .eq("submission_id", submissionId),
      supabase
        .from("form_upload_intents")
        .select("object_path")
        .eq("submission_id", submissionId),
    ]);

  if (answersError || intentsError) {
    return { success: false, message: "Could not inspect registration files." };
  }

  const { error: intentsDeleteError } = await supabase
    .from("form_upload_intents")
    .delete()
    .eq("submission_id", submissionId);
  if (intentsDeleteError) {
    return {
      success: false,
      message: "Could not delete the registration upload records.",
    };
  }

  const { error: answersDeleteError } = await supabase
    .from("form_answers")
    .delete()
    .eq("submission_id", submissionId);
  if (answersDeleteError) {
    return {
      success: false,
      message: "Could not delete the registration answers.",
    };
  }

  const { error: submissionDeleteError, count } = await supabase
    .from("form_submissions")
    .delete({ count: "exact" })
    .eq("id", submissionId);
  if (submissionDeleteError) {
    return {
      success: false,
      message: "Could not delete this registration.",
    };
  }
  if (!count) {
    return { success: false, message: "Registration was not found." };
  }

  const paths = Array.from(
    new Set([
      ...(answers ?? []).flatMap((answer) =>
        answer.file_path ? [answer.file_path] : [],
      ),
      ...(intents ?? []).map((intent) => intent.object_path),
    ]),
  );
  if (paths.length) {
    const { error: storageError } = await supabase.storage
      .from("form-uploads")
      .remove(paths);
    if (storageError) {
      console.error("Registration deleted but attachment cleanup failed", {
        submissionId,
        code: storageError.name,
      });
    }
  }

  revalidatePath("/admin/registrations");
  return { success: true };
}

export async function deleteLegacyRegistrationAction(
  registrationId: string,
): Promise<DeleteRegistrationResult> {
  if (!isUuid(registrationId)) {
    return { success: false, message: "Invalid registration." };
  }

  await requireAdmin();
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("event_registrations")
    .delete({ count: "exact" })
    .eq("id", registrationId);

  if (error) {
    return { success: false, message: "Could not delete the registration." };
  }
  if (!count) {
    return { success: false, message: "Registration was not found." };
  }

  revalidatePath("/admin/registrations");
  return { success: true };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
