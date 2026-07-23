"use client";

import { useState } from "react";
import { Download, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SubmissionStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "approved"
  | "rejected";

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

const STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function FormSubmissionDetailClient({
  submissionId,
  initialStatus,
  initialNotes,
  answers,
}: {
  submissionId: string;
  initialStatus: SubmissionStatus;
  initialNotes: string;
  answers: SubmissionAnswer[];
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function saveWorkflow() {
    setSaving(true);
    setSaved(false);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("form_submissions")
      .update({ status, admin_notes: notes.trim() || null })
      .eq("id", submissionId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">Submitted answers</h2>
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
      </section>

      <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Review</h2>
        <div className="mt-5">
          <label htmlFor="submission-status" className="text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="submission-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as SubmissionStatus)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <label htmlFor="admin-notes" className="text-sm font-medium text-gray-700">
            Admin notes
          </label>
          <textarea
            id="admin-notes"
            rows={8}
            maxLength={10000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            placeholder="Private notes for administrators"
          />
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={saveWorkflow}
          disabled={saving}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
            saved ? "bg-green-600" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          <Save size={15} />
          {saved ? "Saved" : saving ? "Saving…" : "Save Review"}
        </button>
      </aside>
    </div>
  );
}

