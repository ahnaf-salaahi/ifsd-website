export type ProgrammeRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  published: boolean;
  short_summary: string | null;
  full_description: string;
  featured_image_path: string | null;
  delivery_mode: string | null;
  duration: string | null;
  location: string | null;
  eligibility: string | null;
  entry_requirements: string | null;
  certification: string | null;
  fees: string | null;
  application_deadline: string | null;
  start_date: string | null;
  contact_details: string | null;
  application_link: string | null;
  featured: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgrammeModuleRecord = {
  id: string;
  programme_id: string;
  title: string;
  description: string | null;
  display_order: number;
};

export type ProgrammeOutcomeRecord = {
  id: string;
  programme_id: string;
  outcome: string;
  display_order: number;
};

export type ProgrammeFormValues = {
  title: string;
  slug: string;
  shortSummary: string;
  fullDescription: string;
  category: string;
  deliveryMode: string;
  duration: string;
  location: string;
  eligibility: string;
  entryRequirements: string;
  certification: string;
  fees: string;
  applicationDeadline: string;
  startDate: string;
  contactDetails: string;
  applicationLink: string;
  featured: boolean;
  published: boolean;
  displayOrder: string;
  seoTitle: string;
  seoDescription: string;
};

export function slugifyProgramme(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function programmeToFormValues(
  programme?: ProgrammeRecord
): ProgrammeFormValues {
  return {
    title: programme?.title ?? "",
    slug: programme?.slug ?? "",
    shortSummary: programme?.short_summary ?? "",
    fullDescription:
      programme?.full_description || programme?.description || "",
    category: programme?.category ?? "",
    deliveryMode: programme?.delivery_mode ?? "",
    duration: programme?.duration ?? "",
    location: programme?.location ?? "",
    eligibility: programme?.eligibility ?? "",
    entryRequirements: programme?.entry_requirements ?? "",
    certification: programme?.certification ?? "",
    fees: programme?.fees ?? "",
    applicationDeadline: programme?.application_deadline ?? "",
    startDate: programme?.start_date ?? "",
    contactDetails: programme?.contact_details ?? "",
    applicationLink: programme?.application_link ?? "",
    featured: programme?.featured ?? false,
    published: programme?.published ?? false,
    displayOrder: String(programme?.display_order ?? 0),
    seoTitle: programme?.seo_title ?? "",
    seoDescription: programme?.seo_description ?? "",
  };
}
