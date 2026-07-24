"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteFormSubmissionAction } from "@/app/admin/(protected)/registrations/actions";

export type SubmissionAnswer = {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  valueText: string | null;
  valueJson: string[] | null;
  filePath: string | null;
  fileName: string | null;
};

export default function FormSubmissionDetailClient({
  submissionId,
  answers,
}: {
  submissionId: string;
  answers: SubmissionAnswer[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function openDocument(answer: SubmissionAnswer) {
    if (!answer.filePath) return;
    setDownloadingId(answer.id);
    setError("");
    const supabase = createClient();
    const { data, error: signedUrlError } = await supabase.storage
      .from("form-uploads")
      .createSignedUrl(answer.filePath, 60);

    if (signedUrlError || !data?.signedUrl) {
      setError("Could not create a secure document link.");
      setDownloadingId(null);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    setDownloadingId(null);
  }

  async function deleteSubmission() {
    if (!window.confirm("Delete this registration permanently?")) return;
    setDeleting(true);
    setError("");
    const result = await deleteFormSubmissionAction(submissionId);
    if (!result.success) {
      setError(result.message);
      setDeleting(false);
      return;
    }
    router.push("/admin/registrations");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Submitted answers</h2>
        <button
          type="button"
          onClick={deleteSubmission}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={15} />
          {deleting ? "Deleting…" : "Delete registration"}
        </button>
      </div>
      <dl className="mt-5 divide-y divide-gray-100">
        {answers.map((answer) => (
          <div key={answer.id} className="py-4 first:pt-0">
            <dt className="text-sm font-medium text-gray-700">
              {answer.label || answer.fieldKey || "Removed field"}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-900">
              {answer.filePath ? (
                <button
                  type="button"
                  onClick={() => openDocument(answer)}
                  disabled={downloadingId === answer.id}
                  className="inline-flex items-center gap-2 font-medium text-rose-700 hover:underline disabled:opacity-60"
                >
                  <Download size={15} />
                  {downloadingId === answer.id
                    ? "Creating secure link…"
                    : answer.fileName || "Open uploaded document"}
                </button>
              ) : answer.valueJson?.length ? (
                answer.valueJson.join(", ")
              ) : (
                answer.valueText || "No answer"
              )}
            </dd>
          </div>
        ))}
        {answers.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No answers were stored for this submission.
          </div>
        )}
      </dl>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
