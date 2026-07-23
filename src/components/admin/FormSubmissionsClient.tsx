"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export type SubmissionListItem = {
  id: string;
  type: "event" | "scholarship";
  related_id: string | null;
  related_title: string;
  applicant_name: string;
  email: string;
  phone: string;
  submitted_at: string;
  status: "pending" | "reviewing" | "shortlisted" | "approved" | "rejected";
};

const STATUS_LABELS: Record<SubmissionListItem["status"], string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function localDate(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function statusClass(status: SubmissionListItem["status"]) {
  if (status === "approved") return "bg-green-50 text-green-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "shortlisted") return "bg-violet-50 text-violet-700";
  if (status === "reviewing") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

export default function FormSubmissionsClient({
  submissions,
}: {
  submissions: SubmissionListItem[];
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const owners = useMemo(() => {
    const available = submissions.filter(
      (submission) =>
        typeFilter === "all" || submission.type === typeFilter
    );
    return Array.from(
      new Map(
        available.map((submission) => [
          `${submission.type}:${submission.related_id ?? submission.related_title}`,
          {
            value: `${submission.type}:${submission.related_id ?? submission.related_title}`,
            label: submission.related_title,
            type: submission.type,
          },
        ])
      ).values()
    ).sort((a, b) => a.label.localeCompare(b.label));
  }, [submissions, typeFilter]);

  const filtered = submissions.filter((submission) => {
    const ownerValue = `${submission.type}:${
      submission.related_id ?? submission.related_title
    }`;
    return (
      (typeFilter === "all" || submission.type === typeFilter) &&
      (ownerFilter === "all" || ownerValue === ownerFilter) &&
      (statusFilter === "all" || submission.status === statusFilter) &&
      (!dateFilter || localDate(submission.submitted_at) === dateFilter)
    );
  });

  function changeType(value: string) {
    setTypeFilter(value);
    setOwnerFilter("all");
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Event registrations and scholarship applications.
        </p>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="submission-type" className="text-xs font-medium text-gray-600">
            Type
          </label>
          <select
            id="submission-type"
            value={typeFilter}
            onChange={(event) => changeType(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="all">All types</option>
            <option value="event">Events</option>
            <option value="scholarship">Scholarships</option>
          </select>
        </div>
        <div>
          <label htmlFor="submission-owner" className="text-xs font-medium text-gray-600">
            Event or scholarship
          </label>
          <select
            id="submission-owner"
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="all">All</option>
            {owners.map((owner) => (
              <option key={owner.value} value={owner.value}>
                {owner.type === "event" ? "Event: " : "Scholarship: "}
                {owner.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="submission-status" className="text-xs font-medium text-gray-600">
            Status
          </label>
          <select
            id="submission-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="submission-date" className="text-xs font-medium text-gray-600">
            Submission date
          </label>
          <input
            id="submission-date"
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Showing {filtered.length} of {submissions.length} submissions
      </p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Applicant</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Event / Scholarship</th>
              <th className="px-5 py-3 font-medium">Submitted</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((submission) => (
              <tr key={submission.id} className="border-t border-gray-100">
                <td className="px-5 py-4 font-medium text-gray-900">
                  {submission.applicant_name || "Not provided"}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {submission.email || "—"}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {submission.phone || "—"}
                </td>
                <td className="px-5 py-4">
                  <span className="block text-xs font-medium uppercase tracking-wide text-rose-700">
                    {submission.type}
                  </span>
                  <span className="text-gray-700">{submission.related_title}</span>
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {formatDateTime(submission.submitted_at)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                      submission.status
                    )}`}
                  >
                    {STATUS_LABELS[submission.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/registrations/${submission.id}`}
                    className="inline-flex items-center gap-1.5 font-medium text-rose-700 hover:underline"
                  >
                    <Search size={14} /> View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No submissions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

