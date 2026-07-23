"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteEmbedding, syncEmbedding } from "@/lib/syncEmbedding";
import {
  programmeToFormValues,
  slugifyProgramme,
  type ProgrammeFormValues,
  type ProgrammeModuleRecord,
  type ProgrammeOutcomeRecord,
  type ProgrammeRecord,
} from "@/lib/programmes";

type ModuleItem = {
  clientId: string;
  id?: string;
  title: string;
  description: string;
};

type OutcomeItem = {
  clientId: string;
  id?: string;
  outcome: string;
};

type DraftState = {
  values: ProgrammeFormValues;
  modules: ModuleItem[];
  outcomes: OutcomeItem[];
};

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100";

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function makeClientId() {
  return crypto.randomUUID();
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

export default function ProgrammeForm({
  programme,
  modules: initialModules = [],
  outcomes: initialOutcomes = [],
  imagePreviewUrl = "",
}: {
  programme?: ProgrammeRecord;
  modules?: ProgrammeModuleRecord[];
  outcomes?: ProgrammeOutcomeRecord[];
  imagePreviewUrl?: string;
}) {
  const router = useRouter();
  const draftKey = `admin-programme-draft:${programme?.id ?? "new"}`;
  const initialValues = useMemo(
    () => programmeToFormValues(programme),
    [programme]
  );
  const initialModuleItems = useMemo<ModuleItem[]>(
    () =>
      initialModules.map((module) => ({
        clientId: module.id,
        id: module.id,
        title: module.title,
        description: module.description ?? "",
      })),
    [initialModules]
  );
  const initialOutcomeItems = useMemo<OutcomeItem[]>(
    () =>
      initialOutcomes.map((outcome) => ({
        clientId: outcome.id,
        id: outcome.id,
        outcome: outcome.outcome,
      })),
    [initialOutcomes]
  );

  const [values, setValues] = useState(initialValues);
  const [modules, setModules] = useState(initialModuleItems);
  const [outcomes, setOutcomes] = useState(initialOutcomeItems);
  const [persistedId, setPersistedId] = useState(programme?.id ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(programme)
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [error, setError] = useState("");
  const firstErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const stored = sessionStorage.getItem(draftKey);
        if (stored) {
          const draft = JSON.parse(stored) as Partial<DraftState>;
          if (draft.values?.title !== undefined) {
            setValues({ ...initialValues, ...draft.values });
            setModules(Array.isArray(draft.modules) ? draft.modules : []);
            setOutcomes(Array.isArray(draft.outcomes) ? draft.outcomes : []);
            setDirty(true);
            setRestoredDraft(true);
          }
        }
      } catch {
        sessionStorage.removeItem(draftKey);
      } finally {
        setDraftReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [draftKey, initialValues]);

  useEffect(() => {
    if (!draftReady || !dirty) return;
    const timeout = window.setTimeout(() => {
      const draft: DraftState = { values, modules, outcomes };
      sessionStorage.setItem(draftKey, JSON.stringify(draft));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [draftKey, draftReady, dirty, modules, outcomes, values]);

  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (!dirty || saving) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty, saving]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function updateValue<K extends keyof ProgrammeFormValues>(
    field: K,
    value: ProgrammeFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setSaved(false);
  }

  function handleTitleChange(title: string) {
    setValues((current) => ({
      ...current,
      title,
      slug: slugManuallyEdited ? current.slug : slugifyProgramme(title),
    }));
    setDirty(true);
    setSaved(false);
  }

  function handleSlugChange(slug: string) {
    setSlugManuallyEdited(true);
    updateValue("slug", slugifyProgramme(slug));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = imageExtension(file);
    if (!extension) {
      setError("Featured images must be JPEG, PNG, WebP, or AVIF.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Featured images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (localPreview) URL.revokeObjectURL(localPreview);
    setImageFile(file);
    setLocalPreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setDirty(true);
    setSaved(false);
    setError("");
  }

  function clearImage() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview("");
    setImageFile(null);
    setRemoveImage(true);
    setDirty(true);
    setSaved(false);
  }

  function addModule() {
    setModules((current) => [
      ...current,
      { clientId: makeClientId(), title: "", description: "" },
    ]);
    setDirty(true);
  }

  function addOutcome() {
    setOutcomes((current) => [
      ...current,
      { clientId: makeClientId(), outcome: "" },
    ]);
    setDirty(true);
  }

  function moveItem<T>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    direction: -1 | 1
  ) {
    setter((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
    setDirty(true);
  }

  function validate() {
    const problems: string[] = [];
    const slug = values.slug.trim();
    const displayOrder = Number(values.displayOrder);

    if (!values.title.trim()) problems.push("Title is required.");
    else if (values.title.trim().length > 200)
      problems.push("Title must be 200 characters or fewer.");

    if (!slug) problems.push("Slug is required.");
    else if (slug !== slugifyProgramme(slug) || slug.length > 200)
      problems.push(
        "Slug must use lowercase letters, numbers, and single hyphens only."
      );

    if (!values.fullDescription.trim())
      problems.push("Full description is required.");
    if (values.shortSummary.length > 1000)
      problems.push("Short summary must be 1,000 characters or fewer.");
    if (values.fullDescription.length > 100000)
      problems.push("Full description is too long.");

    if (!Number.isInteger(displayOrder) || displayOrder < 0)
      problems.push("Display order must be a non-negative whole number.");

    if (
      values.applicationDeadline &&
      values.startDate &&
      values.applicationDeadline > values.startDate
    ) {
      problems.push("Application deadline cannot be after the start date.");
    }

    if (
      values.applicationLink &&
      !/^(https?:\/\/|mailto:|tel:)/i.test(values.applicationLink.trim())
    ) {
      problems.push(
        "Application or enquiry link must start with http://, https://, mailto:, or tel:."
      );
    }

    if (values.seoTitle.length > 200)
      problems.push("SEO title must be 200 characters or fewer.");
    if (values.seoDescription.length > 500)
      problems.push("SEO description must be 500 characters or fewer.");

    modules.forEach((module, index) => {
      if (!module.title.trim())
        problems.push(`Module ${index + 1} needs a title.`);
      if (module.title.trim().length > 300)
        problems.push(`Module ${index + 1} title is too long.`);
      if (module.description.length > 10000)
        problems.push(`Module ${index + 1} description is too long.`);
    });

    outcomes.forEach((outcome, index) => {
      if (!outcome.outcome.trim())
        problems.push(`Learning outcome ${index + 1} cannot be empty.`);
      if (outcome.outcome.trim().length > 2000)
        problems.push(`Learning outcome ${index + 1} is too long.`);
    });

    return problems;
  }

  async function validateUniqueSlug(id?: string) {
    const supabase = createClient();
    let query = supabase
      .from("programmes")
      .select("id")
      .eq("slug", values.slug.trim())
      .limit(1);
    if (id) query = query.neq("id", id);

    const { data, error: slugError } = await query.maybeSingle();
    if (slugError) throw new Error(`Could not validate slug: ${slugError.message}`);
    if (data) throw new Error("That slug is already used by another programme.");
  }

  async function saveChildren(programmeId: string) {
    const supabase = createClient();
    const retainedModuleIds = new Set(
      modules.flatMap((module) => (module.id ? [module.id] : []))
    );
    const retainedOutcomeIds = new Set(
      outcomes.flatMap((outcome) => (outcome.id ? [outcome.id] : []))
    );

    for (const [index, module] of modules.entries()) {
      const payload = {
        programme_id: programmeId,
        title: module.title.trim(),
        description: nullable(module.description),
        display_order: index,
      };
      if (module.id) {
        const { error: moduleError } = await supabase
          .from("programme_modules")
          .update(payload)
          .eq("id", module.id)
          .eq("programme_id", programmeId);
        if (moduleError) throw new Error(`Module ${index + 1}: ${moduleError.message}`);
      } else {
        const { data, error: moduleError } = await supabase
          .from("programme_modules")
          .insert(payload)
          .select("id")
          .single();
        if (moduleError) throw new Error(`Module ${index + 1}: ${moduleError.message}`);
        module.id = data.id;
        retainedModuleIds.add(data.id);
      }
    }

    for (const [index, outcome] of outcomes.entries()) {
      const payload = {
        programme_id: programmeId,
        outcome: outcome.outcome.trim(),
        display_order: index,
      };
      if (outcome.id) {
        const { error: outcomeError } = await supabase
          .from("programme_learning_outcomes")
          .update(payload)
          .eq("id", outcome.id)
          .eq("programme_id", programmeId);
        if (outcomeError)
          throw new Error(`Learning outcome ${index + 1}: ${outcomeError.message}`);
      } else {
        const { data, error: outcomeError } = await supabase
          .from("programme_learning_outcomes")
          .insert(payload)
          .select("id")
          .single();
        if (outcomeError)
          throw new Error(`Learning outcome ${index + 1}: ${outcomeError.message}`);
        outcome.id = data.id;
        retainedOutcomeIds.add(data.id);
      }
    }

    const removedModuleIds = initialModules
      .map((module) => module.id)
      .filter((id) => !retainedModuleIds.has(id));
    if (removedModuleIds.length) {
      const { error: deleteError } = await supabase
        .from("programme_modules")
        .delete()
        .eq("programme_id", programmeId)
        .in("id", removedModuleIds);
      if (deleteError)
        throw new Error(`Could not remove old modules: ${deleteError.message}`);
    }

    const removedOutcomeIds = initialOutcomes
      .map((outcome) => outcome.id)
      .filter((id) => !retainedOutcomeIds.has(id));
    if (removedOutcomeIds.length) {
      const { error: deleteError } = await supabase
        .from("programme_learning_outcomes")
        .delete()
        .eq("programme_id", programmeId)
        .in("id", removedOutcomeIds);
      if (deleteError)
        throw new Error(
          `Could not remove old learning outcomes: ${deleteError.message}`
        );
    }

    setModules([...modules]);
    setOutcomes([...outcomes]);
  }

  async function saveImage(programmeId: string) {
    const supabase = createClient();
    const oldPath = programme?.featured_image_path ?? null;

    if (imageFile) {
      const extension = imageExtension(imageFile);
      const newPath = `programmes/${programmeId}/featured/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(newPath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

      const { error: imageUpdateError } = await supabase
        .from("programmes")
        .update({ featured_image_path: newPath })
        .eq("id", programmeId);
      if (imageUpdateError) {
        await supabase.storage.from("content-images").remove([newPath]);
        throw new Error(
          `The image uploaded but could not be linked: ${imageUpdateError.message}`
        );
      }

      if (oldPath && oldPath !== newPath) {
        const { error: cleanupError } = await supabase.storage
          .from("content-images")
          .remove([oldPath]);
        if (cleanupError) {
          sessionStorage.setItem(
            "programme-admin-warning",
            `Programme saved, but the previous image could not be removed: ${cleanupError.message}`
          );
        }
      }
      return newPath;
    }

    if (removeImage && oldPath) {
      const { error: imageUpdateError } = await supabase
        .from("programmes")
        .update({ featured_image_path: null })
        .eq("id", programmeId);
      if (imageUpdateError)
        throw new Error(`Could not unlink the image: ${imageUpdateError.message}`);

      const { error: removeError } = await supabase.storage
        .from("content-images")
        .remove([oldPath]);
      if (removeError) {
        sessionStorage.setItem(
          "programme-admin-warning",
          `Programme saved, but the old image could not be removed: ${removeError.message}`
        );
      }
      return null;
    }

    return oldPath;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || deleting) return;

    const problems = validate();
    if (problems.length) {
      setError(problems.join(" "));
      requestAnimationFrame(() =>
        firstErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      );
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await validateUniqueSlug(persistedId || undefined);
      const supabase = createClient();
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: values.fullDescription.trim(),
        short_summary: nullable(values.shortSummary),
        full_description: values.fullDescription.trim(),
        category: values.category.trim() || "Uncategorized",
        delivery_mode: nullable(values.deliveryMode),
        duration: nullable(values.duration),
        location: nullable(values.location),
        eligibility: nullable(values.eligibility),
        entry_requirements: nullable(values.entryRequirements),
        certification: nullable(values.certification),
        fees: nullable(values.fees),
        application_deadline: nullable(values.applicationDeadline),
        start_date: nullable(values.startDate),
        contact_details: nullable(values.contactDetails),
        application_link: nullable(values.applicationLink),
        featured: values.featured,
        published: values.published,
        display_order: Number(values.displayOrder),
        seo_title: nullable(values.seoTitle),
        seo_description: nullable(values.seoDescription),
      };

      let programmeId = persistedId;
      if (programmeId) {
        const { error: updateError } = await supabase
          .from("programmes")
          .update(payload)
          .eq("id", programmeId);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { data, error: insertError } = await supabase
          .from("programmes")
          .insert(payload)
          .select("id")
          .single();
        if (insertError) throw new Error(insertError.message);
        programmeId = data.id;
        setPersistedId(programmeId);
      }

      await saveChildren(programmeId);
      const savedImagePath = await saveImage(programmeId);

      const searchableText = [
        `Programme: ${values.title.trim()}`,
        values.shortSummary.trim(),
        values.fullDescription.trim(),
        values.category && `Category: ${values.category.trim()}`,
        values.deliveryMode && `Delivery mode: ${values.deliveryMode.trim()}`,
        values.eligibility && `Eligibility: ${values.eligibility.trim()}`,
        modules.map((module) => module.title.trim()).filter(Boolean).join(", "),
        outcomes
          .map((outcome) => outcome.outcome.trim())
          .filter(Boolean)
          .join(", "),
      ]
        .filter(Boolean)
        .join("\n");

      if (values.published) {
        syncEmbedding("programme", programmeId, searchableText);
      } else {
        deleteEmbedding("programme", programmeId);
      }

      sessionStorage.removeItem(draftKey);
      setDirty(false);
      setSaved(true);
      setRemoveImage(false);
      setImageFile(null);
      if (savedImagePath && localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview("");
      }

      window.setTimeout(() => {
        router.push("/admin/programmes");
        router.refresh();
      }, 500);
    } catch (saveError) {
      const prefix =
        persistedId || programme
          ? "Programme could not be fully saved."
          : "The Programme row may have been created, but the remaining content was not fully saved. You can safely save again.";
      setError(
        `${prefix} ${
          saveError instanceof Error ? saveError.message : "Unknown error"
        }`
      );
      requestAnimationFrame(() =>
        firstErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const programmeId = persistedId || programme?.id;
    if (!programmeId || saving || deleting) return;
    if (
      !confirm(
        `Delete "${values.title}"? Its modules and learning outcomes will also be deleted. This cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    const supabase = createClient();
    const imagePath = programme?.featured_image_path;
    const { error: deleteError } = await supabase
      .from("programmes")
      .delete()
      .eq("id", programmeId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    let cleanupWarning = "";
    if (imagePath) {
      const { error: imageError } = await supabase.storage
        .from("content-images")
        .remove([imagePath]);
      if (imageError) {
        cleanupWarning =
          "Programme deleted, but its featured image could not be removed from Storage.";
      }
    }

    deleteEmbedding("programme", programmeId);
    sessionStorage.removeItem(draftKey);
    setDirty(false);
    if (cleanupWarning)
      sessionStorage.setItem("programme-admin-warning", cleanupWarning);
    router.push("/admin/programmes");
    router.refresh();
  }

  const visiblePreview =
    localPreview || (!removeImage ? imagePreviewUrl || programme?.image_url || "" : "");

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {restoredDraft && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Restored unsaved changes from this browser session. Images must be
          selected again after a reload.
        </div>
      )}

      <div ref={firstErrorRef}>
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </div>

      <FormSection
        title="Programme details"
        description="Core information shown in Programme listings and details."
      >
        <Field label="Title" required>
          <input
            required
            maxLength={200}
            value={values.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          required
          hint="Lowercase letters, numbers, and hyphens. Changing this later can break existing links."
        >
          <div className="mt-1 flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-rose-500">
            <span className="flex items-center border-r border-gray-200 px-3 text-sm text-gray-500">
              /programmes/
            </span>
            <input
              required
              maxLength={200}
              value={values.slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              className="min-w-0 flex-1 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
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

        <Field label="Full description" required>
          <textarea
            required
            rows={10}
            value={values.fullDescription}
            onChange={(event) =>
              updateValue("fullDescription", event.target.value)
            }
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Category"
            hint="Existing public categories include past and upcoming."
          >
            <input
              list="programme-categories"
              value={values.category}
              onChange={(event) => updateValue("category", event.target.value)}
              className={inputClass}
            />
            <datalist id="programme-categories">
              <option value="upcoming" />
              <option value="past" />
            </datalist>
          </Field>
          <Field label="Delivery mode">
            <input
              placeholder="Online, in person, or hybrid"
              value={values.deliveryMode}
              onChange={(event) =>
                updateValue("deliveryMode", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Duration">
            <input
              placeholder="e.g. 12 weeks"
              value={values.duration}
              onChange={(event) => updateValue("duration", event.target.value)}
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
      </FormSection>

      <FormSection
        title="Featured image"
        description="JPEG, PNG, WebP, or AVIF. Maximum size 5 MB."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {visiblePreview ? (
            <Image
              src={visiblePreview}
              alt="Featured image preview"
              width={256}
              height={160}
              unoptimized
              className="h-40 w-full rounded-xl border border-gray-100 object-cover sm:w-64"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 sm:w-64">
              No featured image
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ImagePlus size={17} />
              {visiblePreview ? "Replace image" : "Choose image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImageChange}
                disabled={saving || deleting}
                className="hidden"
              />
            </label>
            {visiblePreview && (
              <button
                type="button"
                onClick={clearImage}
                disabled={saving || deleting}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={16} /> Remove
              </button>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Eligibility and course information">
        <Field label="Eligibility">
          <textarea
            rows={4}
            value={values.eligibility}
            onChange={(event) => updateValue("eligibility", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Entry requirements">
          <textarea
            rows={4}
            value={values.entryRequirements}
            onChange={(event) =>
              updateValue("entryRequirements", event.target.value)
            }
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Certification">
            <input
              value={values.certification}
              onChange={(event) =>
                updateValue("certification", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Fees">
            <input
              value={values.fees}
              onChange={(event) => updateValue("fees", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Application deadline">
            <input
              type="date"
              value={values.applicationDeadline}
              onChange={(event) =>
                updateValue("applicationDeadline", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Start date">
            <input
              type="date"
              value={values.startDate}
              onChange={(event) => updateValue("startDate", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Contact details">
          <textarea
            rows={3}
            value={values.contactDetails}
            onChange={(event) =>
              updateValue("contactDetails", event.target.value)
            }
            className={inputClass}
          />
        </Field>
        <Field
          label="Application or enquiry link"
          hint="Use an HTTP(S), mailto:, or tel: link."
        >
          <input
            value={values.applicationLink}
            onChange={(event) =>
              updateValue("applicationLink", event.target.value)
            }
            placeholder="https://…"
            className={inputClass}
          />
        </Field>
      </FormSection>

      <RepeatableSection
        title="Course modules"
        description="Use the arrow buttons to control the public display order."
        onAdd={addModule}
        addLabel="Add module"
      >
        {modules.length === 0 ? (
          <EmptyRepeatable text="No modules added." />
        ) : (
          modules.map((module, index) => (
            <div
              key={module.clientId}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-800">
                  Module {index + 1}
                </p>
                <OrderControls
                  index={index}
                  count={modules.length}
                  onMove={(direction) => moveItem(setModules, index, direction)}
                  onRemove={() => {
                    setModules((current) =>
                      current.filter((item) => item.clientId !== module.clientId)
                    );
                    setDirty(true);
                  }}
                />
              </div>
              <input
                required
                maxLength={300}
                value={module.title}
                onChange={(event) => {
                  setModules((current) =>
                    current.map((item) =>
                      item.clientId === module.clientId
                        ? { ...item, title: event.target.value }
                        : item
                    )
                  );
                  setDirty(true);
                }}
                placeholder="Module title"
                aria-label={`Module ${index + 1} title`}
                className={inputClass}
              />
              <textarea
                rows={3}
                value={module.description}
                onChange={(event) => {
                  setModules((current) =>
                    current.map((item) =>
                      item.clientId === module.clientId
                        ? { ...item, description: event.target.value }
                        : item
                    )
                  );
                  setDirty(true);
                }}
                placeholder="Optional module description"
                aria-label={`Module ${index + 1} description`}
                className={inputClass}
              />
            </div>
          ))
        )}
      </RepeatableSection>

      <RepeatableSection
        title="Learning outcomes"
        description="Add each outcome separately and arrange it in display order."
        onAdd={addOutcome}
        addLabel="Add outcome"
      >
        {outcomes.length === 0 ? (
          <EmptyRepeatable text="No learning outcomes added." />
        ) : (
          outcomes.map((outcome, index) => (
            <div
              key={outcome.clientId}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-800">
                  Outcome {index + 1}
                </p>
                <OrderControls
                  index={index}
                  count={outcomes.length}
                  onMove={(direction) => moveItem(setOutcomes, index, direction)}
                  onRemove={() => {
                    setOutcomes((current) =>
                      current.filter((item) => item.clientId !== outcome.clientId)
                    );
                    setDirty(true);
                  }}
                />
              </div>
              <textarea
                required
                rows={3}
                maxLength={2000}
                value={outcome.outcome}
                onChange={(event) => {
                  setOutcomes((current) =>
                    current.map((item) =>
                      item.clientId === outcome.clientId
                        ? { ...item, outcome: event.target.value }
                        : item
                    )
                  );
                  setDirty(true);
                }}
                aria-label={`Learning outcome ${index + 1}`}
                className={inputClass}
              />
            </div>
          ))
        )}
      </RepeatableSection>

      <FormSection title="Publishing and SEO">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="flex flex-col justify-end gap-3 pb-1">
            <Checkbox
              checked={values.published}
              onChange={(checked) => updateValue("published", checked)}
              label="Published"
              description="Visible to public visitors."
            />
            <Checkbox
              checked={values.featured}
              onChange={(checked) => updateValue("featured", checked)}
              label="Featured"
              description="Prioritised in Programme listings."
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
      </FormSection>

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button
          type="submit"
          disabled={saving || deleting || saved}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-70 ${
            saved ? "bg-green-600" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {saving && <LoaderCircle size={17} className="animate-spin" />}
          {saved
            ? "Saved ✓"
            : saving
              ? "Saving…"
              : programme || persistedId
                ? "Save changes"
                : "Create Programme"}
        </button>
        <button
          type="button"
          disabled={saving || deleting}
          onClick={() => router.push("/admin/programmes")}
          className="rounded-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        {(programme || persistedId) && (
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

function FormSection({
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

function RepeatableSection({
  title,
  description,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  addLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={16} /> {addLabel}
        </button>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function EmptyRepeatable({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
      {text}
    </p>
  );
}

function OrderControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label="Move item up"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >
        <ArrowUp size={16} />
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label="Move item down"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      >
        <ArrowDown size={16} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
      >
        <Trash2 size={16} />
      </button>
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
