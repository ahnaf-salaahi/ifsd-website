"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncEmbedding, deleteEmbedding } from "@/lib/syncEmbedding";
import RegistrationFormBuilder, {
  RegistrationFormBuilderHandle,
} from "@/components/admin/RegistrationFormBuilder";

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
  published: boolean | null;
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
  const formBuilderRef = useRef<RegistrationFormBuilderHandle>(null);
  const [scholarshipId, setScholarshipId] = useState(scholarship?.id ?? "");
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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
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

    if (scholarshipId) {
      const { error } = await supabase
        .from("scholarships")
        .update(payload)
        .eq("id", scholarshipId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      try {
        await formBuilderRef.current?.save(scholarshipId);
      } catch (builderError) {
        setError(
          `Scholarship details were saved, but the registration form was not: ${
            builderError instanceof Error
              ? builderError.message
              : "Unknown error"
          }`
        );
        setSaving(false);
        return;
      }

      if (published) {
        const text = `Scholarship: ${title}\n${description}\nCountry: ${country}\nFunding: ${fundingType}\nStudy Level: ${studyLevel}\nDeadline: ${deadline || "Not specified"}\nEligibility: ${eligibility || "N/A"}\nRequired Documents: ${requiredDocuments || "N/A"}`;
        syncEmbedding("scholarship", scholarshipId, text);
      } else {
        deleteEmbedding("scholarship", scholarshipId);
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

      setScholarshipId(data.id);
      try {
        await formBuilderRef.current?.save(data.id);
      } catch (builderError) {
        setError(
          `The scholarship was created, but the registration form was not saved. You can safely save again. ${
            builderError instanceof Error
              ? builderError.message
              : "Unknown error"
          }`
        );
        setSaving(false);
        return;
      }

      if (published && data) {
        const text = `Scholarship: ${title}\n${description}\nCountry: ${country}\nFunding: ${fundingType}\nStudy Level: ${studyLevel}\nDeadline: ${deadline || "Not specified"}\nEligibility: ${eligibility || "N/A"}\nRequired Documents: ${requiredDocuments || "N/A"}`;
        syncEmbedding("scholarship", data.id, text);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      router.push("/admin/scholarships");
      router.refresh();
    }, 700);
  }

  async function handleDelete() {
    if (!scholarship) return;
    if (!confirm("Delete this scholarship? This cannot be undone.")) return;

    const supabase = createClient();
    const { data: registrationForm, error: formLookupError } = await supabase
      .from("forms")
      .select("id")
      .eq("scholarship_id", scholarship.id)
      .maybeSingle();

    if (formLookupError) {
      setError(`Could not check application data: ${formLookupError.message}`);
      return;
    }

    if (registrationForm) {
      const { error: disableFormError } = await supabase
        .from("forms")
        .update({ is_active: false })
        .eq("id", registrationForm.id);
      if (disableFormError) {
        setError(`Could not close applications: ${disableFormError.message}`);
        return;
      }

      const { count: submissionCount, error: submissionsError } = await supabase
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .eq("form_id", registrationForm.id);
      if (submissionsError) {
        setError(`Could not check scholarship applications: ${submissionsError.message}`);
        return;
      }
      if (submissionCount) {
        setError(
          "This scholarship has applications and cannot be deleted. It has been closed for new applications."
        );
        return;
      }

      const { data: uploadIntents, error: uploadsError } = await supabase
        .from("form_upload_intents")
        .select("object_path")
        .eq("form_id", registrationForm.id);

      if (uploadsError) {
        setError(`Could not check application uploads: ${uploadsError.message}`);
        return;
      }

      const uploadPaths = (uploadIntents ?? []).map(
        (upload) => upload.object_path
      );
      if (uploadPaths.length) {
        const { error: removeUploadsError } = await supabase.storage
          .from("form-uploads")
          .remove(uploadPaths);
        if (removeUploadsError) {
          setError(`Could not remove application uploads: ${removeUploadsError.message}`);
          return;
        }
      }

      const { error: formDeleteError } = await supabase
        .from("forms")
        .delete()
        .eq("id", registrationForm.id);
      if (formDeleteError) {
        setError(`Could not delete the application form: ${formDeleteError.message}`);
        return;
      }
    }

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <RegistrationFormBuilder
        ref={formBuilderRef}
        ownerType="scholarship"
        ownerId={scholarship?.id}
        initialEnabled={false}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || saved}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-90 whitespace-nowrap ${
            saved ? "bg-green-600 text-white" : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          {saved ? "Saved \u2713" : saving ? "Saving..." : scholarship ? "Save Changes" : "Create Scholarship"}
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
