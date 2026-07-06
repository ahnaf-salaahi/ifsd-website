"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncEmbedding, deleteEmbedding } from "@/lib/syncEmbedding";

type Scholarship = {
  id: string;
  title: string;
  slug: string;
  description: string;
  country: string;
  funding_type: string;
  study_level: string;
  deadline: string | null;
  eligibility: string | null;
  required_documents: string | null;
  apply_link: string | null;
  published: boolean;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function ScholarshipForm({ scholarship }: { scholarship?: Scholarship }) {
  const router = useRouter();
  const [title, setTitle] = useState(scholarship?.title ?? "");
  const [description, setDescription] = useState(scholarship?.description ?? "");
  const [country, setCountry] = useState(scholarship?.country ?? "");
  const [fundingType, setFundingType] = useState(scholarship?.funding_type ?? "Fully Funded");
  const [studyLevel, setStudyLevel] = useState(scholarship?.study_level ?? "Undergraduate");
  const [deadline, setDeadline] = useState(scholarship?.deadline ?? "");
  const [eligibility, setEligibility] = useState(scholarship?.eligibility ?? "");
  const [requiredDocuments, setRequiredDocuments] = useState(scholarship?.required_documents ?? "");
  const [applyLink, setApplyLink] = useState(scholarship?.apply_link ?? "");
  const [published, setPublished] = useState(scholarship?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      title,
      description,
      country,
      funding_type: fundingType,
      study_level: studyLevel,
      deadline: deadline || null,
      eligibility,
      required_documents: requiredDocuments,
      apply_link: applyLink,
      published,
    };

    if (scholarship) {
  const { error } = await supabase
    .from("scholarships")
    .update(payload)
    .eq("id", scholarship.id);

  if (error) {
    setError(error.message);
    setSaving(false);
    return;
  }

  if (published) {
    const text = `Scholarship: ${title}\n${description}\nCountry: ${country}\nFunding: ${fundingType}\nStudy Level: ${studyLevel}\nDeadline: ${deadline || "Not specified"}\nEligibility: ${eligibility || "N/A"}\nRequired Documents: ${requiredDocuments || "N/A"}`;
    syncEmbedding("scholarship", scholarship.id, text);
  } else {
    deleteEmbedding("scholarship", scholarship.id);
  }
    } else {
  const slug = slugify(title);
  const { data, error } = await supabase
    .from("scholarships")
    .insert({ ...payload, slug })
    .select()
    .single();

  if (error) {
    setError(error.message);
    setSaving(false);
    return;
  }

  if (published && data) {
    const text = `Scholarship: ${title}\n${description}\nCountry: ${country}\nFunding: ${fundingType}\nStudy Level: ${studyLevel}\nDeadline: ${deadline || "Not specified"}\nEligibility: ${eligibility || "N/A"}\nRequired Documents: ${requiredDocuments || "N/A"}`;
    syncEmbedding("scholarship", data.id, text);
  }
}

    router.push("/admin/scholarships");
    router.refresh();
  }

  async function handleDelete() {
  if (!scholarship) return;
  if (!confirm("Delete this scholarship? This cannot be undone.")) return;

  const supabase = createClient();
  const { error } = await supabase.from("scholarships").delete().eq("id", scholarship.id);

  if (error) {
    setError(error.message);
    return;
  }

  deleteEmbedding("scholarship", scholarship.id);

  router.push("/admin/scholarships");
  router.refresh();
}

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-2xl p-8 max-w-2xl space-y-5"
    >
      <div>
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Country</label>
          <input
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Turkey"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Funding Type</label>
          <select
            value={fundingType}
            onChange={(e) => setFundingType(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option>Fully Funded</option>
            <option>Partial</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Study Level</label>
          <select
            value={studyLevel}
            onChange={(e) => setStudyLevel(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option>Undergraduate</option>
            <option>Postgraduate</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Deadline</label>
        <input
          type="date"
          value={deadline ?? ""}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Eligibility</label>
        <textarea
          rows={2}
          value={eligibility}
          onChange={(e) => setEligibility(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Required Documents</label>
        <textarea
          rows={2}
          value={requiredDocuments}
          onChange={(e) => setRequiredDocuments(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Apply Link</label>
        <input
          value={applyLink}
          onChange={(e) => setApplyLink(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded border-gray-300"
        />
        Published (visible to the public)
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-rose-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : scholarship ? "Save Changes" : "Create Scholarship"}
        </button>

        {scholarship && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 text-sm font-medium hover:underline"
          >
            Delete Scholarship
          </button>
        )}
      </div>
    </form>
  );
}