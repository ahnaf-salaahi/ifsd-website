"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  slugifySuccessStory,
  successStoryToFormValues,
  type RelatedContentOption,
  type SuccessStoryFormValues,
  type SuccessStoryRecord,
} from "@/lib/success-stories";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100";

function nullable(value: string) {
  return value.trim() || null;
}

function imageExtension(file: File) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return extensions[file.type] ?? "";
}

export default function SuccessStoryForm({
  story,
  programmes,
  scholarships,
  profilePreviewUrl = "",
  coverPreviewUrl = "",
}: {
  story?: SuccessStoryRecord;
  programmes: RelatedContentOption[];
  scholarships: RelatedContentOption[];
  profilePreviewUrl?: string;
  coverPreviewUrl?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(() => successStoryToFormValues(story));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(story));
  const [persistedId, setPersistedId] = useState(story?.id ?? "");
  const [profilePath, setProfilePath] = useState(
    story?.profile_image_path ?? null
  );
  const [coverPath, setCoverPath] = useState(story?.cover_image_path ?? null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState(profilePreviewUrl);
  const [coverPreview, setCoverPreview] = useState(coverPreviewUrl);
  const [removeProfile, setRemoveProfile] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function updateValue<K extends keyof SuccessStoryFormValues>(
    key: K,
    value: SuccessStoryFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleTitleChange(storyTitle: string) {
    setValues((current) => ({
      ...current,
      storyTitle,
      slug: slugManuallyEdited
        ? current.slug
        : slugifySuccessStory(storyTitle),
    }));
    setSaved(false);
  }

  function handleImage(
    event: ChangeEvent<HTMLInputElement>,
    kind: "profile" | "cover"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!imageExtension(file)) {
      setError("Images must be JPEG, PNG, WebP, or AVIF.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    if (kind === "profile") {
      if (profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview);
      setProfileFile(file);
      setProfilePreview(preview);
      setRemoveProfile(false);
    } else {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      setCoverFile(file);
      setCoverPreview(preview);
      setRemoveCover(false);
    }
    setError("");
    setSaved(false);
  }

  function clearImage(kind: "profile" | "cover") {
    if (kind === "profile") {
      if (profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview);
      setProfileFile(null);
      setProfilePreview("");
      setRemoveProfile(true);
    } else {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      setCoverFile(null);
      setCoverPreview("");
      setRemoveCover(true);
    }
    setSaved(false);
  }

  function validate() {
    const problems: string[] = [];
    const slug = values.slug.trim();
    const year = values.completionYear
      ? Number(values.completionYear)
      : null;
    const displayOrder = Number(values.displayOrder);

    if (!values.personName.trim()) problems.push("Person name is required.");
    else if (values.personName.trim().length > 200)
      problems.push("Person name must be 200 characters or fewer.");
    if (!values.storyTitle.trim()) problems.push("Story title is required.");
    else if (values.storyTitle.trim().length > 300)
      problems.push("Story title must be 300 characters or fewer.");
    if (!slug) problems.push("Slug is required.");
    else if (slug !== slugifySuccessStory(slug) || slug.length > 200)
      problems.push(
        "Slug must use lowercase letters, numbers, and single hyphens only."
      );
    if (!values.fullStory.trim()) problems.push("Full story is required.");
    if (values.fullStory.length > 100000)
      problems.push("Full story is too long.");
    if (values.shortSummary.length > 1000)
      problems.push("Short summary must be 1,000 characters or fewer.");
    if (values.testimonialQuote.length > 5000)
      problems.push("Testimonial quote must be 5,000 characters or fewer.");
    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2200)
    ) {
      problems.push("Completion year must be between 1900 and 2200.");
    }
    if (
      values.videoUrl &&
      !/^https?:\/\//i.test(values.videoUrl.trim())
    ) {
      problems.push("Video URL must begin with http:// or https://.");
    } else if (values.videoUrl) {
      try {
        new URL(values.videoUrl.trim());
      } catch {
        problems.push("Video URL is not valid.");
      }
    }
    if (!Number.isInteger(displayOrder) || displayOrder < 0)
      problems.push("Display order must be a non-negative whole number.");
    if (values.relatedType && !values.relatedId)
      problems.push("Choose the related Programme or Scholarship.");
    if (values.seoTitle.length > 200)
      problems.push("SEO title must be 200 characters or fewer.");
    if (values.seoDescription.length > 500)
      problems.push("SEO description must be 500 characters or fewer.");
    return problems;
  }

  async function validateUniqueSlug(id?: string) {
    const supabase = createClient();
    let query = supabase
      .from("success_stories")
      .select("id")
      .eq("slug", values.slug.trim())
      .limit(1);
    if (id) query = query.neq("id", id);
    const { data, error: slugError } = await query.maybeSingle();
    if (slugError) throw new Error(`Could not validate slug: ${slugError.message}`);
    if (data) throw new Error("That slug is already used by another story.");
  }

  async function saveImage(
    storyId: string,
    kind: "profile" | "cover",
    file: File | null,
    oldPath: string | null,
    remove: boolean
  ) {
    const supabase = createClient();

    if (file) {
      const path = `success-stories/${storyId}/${kind}/${crypto.randomUUID()}.${imageExtension(file)}`;
      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError)
        throw new Error(`${kind} image upload failed: ${uploadError.message}`);

      const { error: updateError } = await supabase
        .from("success_stories")
        .update(
          kind === "profile"
            ? { profile_image_path: path }
            : { cover_image_path: path },
        )
        .eq("id", storyId);
      if (updateError) {
        await supabase.storage.from("content-images").remove([path]);
        throw new Error(
          `${kind} image uploaded but could not be linked: ${updateError.message}`
        );
      }

      if (kind === "profile") {
        setProfilePath(path);
        setProfileFile(null);
      } else {
        setCoverPath(path);
        setCoverFile(null);
      }

      if (oldPath && oldPath !== path) {
        const { error: cleanupError } = await supabase.storage
          .from("content-images")
          .remove([oldPath]);
        if (cleanupError) {
          sessionStorage.setItem(
            "success-story-admin-warning",
            `Story saved, but an old ${kind} image could not be removed: ${cleanupError.message}`
          );
        }
      }
      return;
    }

    if (remove && oldPath) {
      const { error: updateError } = await supabase
        .from("success_stories")
        .update(
          kind === "profile"
            ? { profile_image_path: null }
            : { cover_image_path: null },
        )
        .eq("id", storyId);
      if (updateError)
        throw new Error(`Could not unlink ${kind} image: ${updateError.message}`);

      if (kind === "profile") setProfilePath(null);
      else setCoverPath(null);

      const { error: removeError } = await supabase.storage
        .from("content-images")
        .remove([oldPath]);
      if (removeError) {
        sessionStorage.setItem(
          "success-story-admin-warning",
          `Story saved, but the old ${kind} image could not be removed: ${removeError.message}`
        );
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || deleting) return;

    const problems = validate();
    if (problems.length) {
      setError(problems.join(" "));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await validateUniqueSlug(persistedId || undefined);
      const supabase = createClient();
      const payload = {
        person_name: values.personName.trim(),
        story_title: values.storyTitle.trim(),
        slug: values.slug.trim(),
        short_summary: nullable(values.shortSummary),
        full_story: values.fullStory.trim(),
        testimonial_quote: nullable(values.testimonialQuote),
        programme_id:
          values.relatedType === "programme" ? values.relatedId : null,
        scholarship_id:
          values.relatedType === "scholarship" ? values.relatedId : null,
        institution_or_employer: nullable(values.institutionOrEmployer),
        role_or_achievement: nullable(values.roleOrAchievement),
        completion_year: values.completionYear
          ? Number(values.completionYear)
          : null,
        location: nullable(values.location),
        before_after_description: nullable(values.beforeAfterDescription),
        video_url: nullable(values.videoUrl),
        featured: values.featured,
        published: values.published,
        display_order: Number(values.displayOrder),
        seo_title: nullable(values.seoTitle),
        seo_description: nullable(values.seoDescription),
      };

      let storyId = persistedId;
      if (storyId) {
        const { error: updateError } = await supabase
          .from("success_stories")
          .update(payload)
          .eq("id", storyId);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { data, error: insertError } = await supabase
          .from("success_stories")
          .insert(payload)
          .select("id")
          .single();
        if (insertError) throw new Error(insertError.message);
        storyId = data.id;
        setPersistedId(storyId);
      }

      await saveImage(
        storyId,
        "profile",
        profileFile,
        profilePath,
        removeProfile
      );
      await saveImage(storyId, "cover", coverFile, coverPath, removeCover);

      setRemoveProfile(false);
      setRemoveCover(false);
      setSaved(true);
      window.setTimeout(() => {
        router.push("/admin/success-stories");
        router.refresh();
      }, 500);
    } catch (saveError) {
      setError(
        `Success Story could not be fully saved. ${
          saveError instanceof Error ? saveError.message : "Unknown error"
        } You can safely save again.`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const storyId = persistedId || story?.id;
    if (!storyId || saving || deleting) return;
    if (
      !confirm(
        `Delete "${values.storyTitle}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("success_stories")
      .delete()
      .eq("id", storyId);
    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    const paths = [profilePath, coverPath].filter(
      (path): path is string => Boolean(path)
    );
    if (paths.length) {
      const { error: imageError } = await supabase.storage
        .from("content-images")
        .remove(paths);
      if (imageError) {
        sessionStorage.setItem(
          "success-story-admin-warning",
          `Story deleted, but one or more images could not be removed: ${imageError.message}`
        );
      }
    }
    router.push("/admin/success-stories");
    router.refresh();
  }

  const relatedOptions =
    values.relatedType === "programme" ? programmes : scholarships;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Section title="Story details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Person name" required>
            <input
              required
              maxLength={200}
              value={values.personName}
              onChange={(event) => updateValue("personName", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Story title" required>
            <input
              required
              maxLength={300}
              value={values.storyTitle}
              onChange={(event) => handleTitleChange(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field
          label="Slug"
          required
          hint="Lowercase letters, numbers, and hyphens."
        >
          <input
            required
            maxLength={200}
            value={values.slug}
            onChange={(event) => {
              setSlugManuallyEdited(true);
              updateValue("slug", slugifySuccessStory(event.target.value));
            }}
            className={inputClass}
          />
        </Field>
        <Field label="Short summary" hint={`${values.shortSummary.length}/1000`}>
          <textarea
            rows={3}
            maxLength={1000}
            value={values.shortSummary}
            onChange={(event) => updateValue("shortSummary", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Full story" required>
          <textarea
            required
            rows={12}
            value={values.fullStory}
            onChange={(event) => updateValue("fullStory", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Testimonial quote"
          hint={`${values.testimonialQuote.length}/5000`}
        >
          <textarea
            rows={4}
            maxLength={5000}
            value={values.testimonialQuote}
            onChange={(event) =>
              updateValue("testimonialQuote", event.target.value)
            }
            className={inputClass}
          />
        </Field>
      </Section>

      <Section
        title="Images"
        description="JPEG, PNG, WebP, or AVIF. Maximum 5 MB per image."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ImageField
            label="Profile image"
            preview={profilePreview}
            kind="profile"
            disabled={saving || deleting}
            onChange={(event) => handleImage(event, "profile")}
            onRemove={() => clearImage("profile")}
          />
          <ImageField
            label="Cover image"
            preview={coverPreview}
            kind="cover"
            disabled={saving || deleting}
            onChange={(event) => handleImage(event, "cover")}
            onRemove={() => clearImage("cover")}
          />
        </div>
      </Section>

      <Section
        title="Related content"
        description="A story can optionally link to one Programme or one Scholarship."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Related content type">
            <select
              value={values.relatedType}
              onChange={(event) => {
                updateValue(
                  "relatedType",
                  event.target.value as SuccessStoryFormValues["relatedType"]
                );
                updateValue("relatedId", "");
              }}
              className={inputClass}
            >
              <option value="">No related content</option>
              <option value="programme">Programme</option>
              <option value="scholarship">Scholarship</option>
            </select>
          </Field>
          <Field label="Related item">
            <select
              value={values.relatedId}
              disabled={!values.relatedType}
              onChange={(event) => updateValue("relatedId", event.target.value)}
              className={inputClass}
            >
              <option value="">
                {values.relatedType ? "Select an item" : "Choose a type first"}
              </option>
              {relatedOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Background and achievement">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Institution or employer">
            <input
              value={values.institutionOrEmployer}
              onChange={(event) =>
                updateValue("institutionOrEmployer", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Role or achievement">
            <input
              value={values.roleOrAchievement}
              onChange={(event) =>
                updateValue("roleOrAchievement", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Completion year">
            <input
              type="number"
              min={1900}
              max={2200}
              step={1}
              value={values.completionYear}
              onChange={(event) =>
                updateValue("completionYear", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Location">
            <input
              value={values.location}
              onChange={(event) => updateValue("location", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Before-and-after description">
          <textarea
            rows={5}
            value={values.beforeAfterDescription}
            onChange={(event) =>
              updateValue("beforeAfterDescription", event.target.value)
            }
            className={inputClass}
          />
        </Field>
        <Field
          label="YouTube or video URL"
          hint="Use a complete http:// or https:// URL."
        >
          <input
            type="url"
            value={values.videoUrl}
            onChange={(event) => updateValue("videoUrl", event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Publishing and SEO">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Display order">
            <input
              required
              type="number"
              min={0}
              step={1}
              value={values.displayOrder}
              onChange={(event) =>
                updateValue("displayOrder", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <div className="flex flex-col justify-end gap-3">
            <Checkbox
              label="Published"
              description="Visible to public visitors."
              checked={values.published}
              onChange={(checked) => updateValue("published", checked)}
            />
            <Checkbox
              label="Featured"
              description="Prioritised in Success Story listings."
              checked={values.featured}
              onChange={(checked) => updateValue("featured", checked)}
            />
          </div>
        </div>
        <Field label="SEO title" hint={`${values.seoTitle.length}/200`}>
          <input
            maxLength={200}
            value={values.seoTitle}
            onChange={(event) => updateValue("seoTitle", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="SEO description"
          hint={`${values.seoDescription.length}/500`}
        >
          <textarea
            rows={3}
            maxLength={500}
            value={values.seoDescription}
            onChange={(event) =>
              updateValue("seoDescription", event.target.value)
            }
            className={inputClass}
          />
        </Field>
      </Section>

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button
          type="submit"
          disabled={saving || deleting || saved}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-70 ${
            saved ? "bg-green-600" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {saving && <LoaderCircle size={17} className="animate-spin" />}
          {saved
            ? "Saved ✓"
            : saving
              ? "Saving…"
              : story || persistedId
                ? "Save changes"
                : "Create Success Story"}
        </button>
        <button
          type="button"
          disabled={saving || deleting}
          onClick={() => router.push("/admin/success-stories")}
          className="rounded-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        {(story || persistedId) && (
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleDelete}
            className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-gray-700">
        <span>
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-gray-500">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function ImageField({
  label,
  preview,
  kind,
  disabled,
  onChange,
  onRemove,
}: {
  label: string;
  preview: string;
  kind: "profile" | "cover";
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div
        className={`relative mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${
          kind === "profile" ? "mx-auto aspect-square max-w-56" : "aspect-[16/9]"
        }`}
      >
        {preview ? (
          <Image
            src={preview}
            alt={`${label} preview`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <ImagePlus size={16} /> {preview ? "Replace" : "Choose image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={disabled}
            onChange={onChange}
            className="hidden"
          />
        </label>
        {preview && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 rounded border-gray-300"
      />
      <span>
        <span className="block text-sm font-medium text-gray-700">{label}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </span>
    </label>
  );
}
