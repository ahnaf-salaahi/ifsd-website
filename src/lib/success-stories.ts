export type SuccessStoryRecord = {
  id: string;
  slug: string;
  person_name: string;
  story_title: string;
  profile_image_path: string | null;
  cover_image_path: string | null;
  short_summary: string | null;
  full_story: string;
  testimonial_quote: string | null;
  programme_id: string | null;
  scholarship_id: string | null;
  institution_or_employer: string | null;
  role_or_achievement: string | null;
  completion_year: number | null;
  location: string | null;
  before_after_description: string | null;
  video_url: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type RelatedContentOption = {
  id: string;
  title: string;
};

export type SuccessStoryFormValues = {
  personName: string;
  storyTitle: string;
  slug: string;
  shortSummary: string;
  fullStory: string;
  testimonialQuote: string;
  relatedType: "" | "programme" | "scholarship";
  relatedId: string;
  institutionOrEmployer: string;
  roleOrAchievement: string;
  completionYear: string;
  location: string;
  beforeAfterDescription: string;
  videoUrl: string;
  featured: boolean;
  published: boolean;
  displayOrder: string;
  seoTitle: string;
  seoDescription: string;
};

export function slugifySuccessStory(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function successStoryToFormValues(
  story?: SuccessStoryRecord
): SuccessStoryFormValues {
  return {
    personName: story?.person_name ?? "",
    storyTitle: story?.story_title ?? "",
    slug: story?.slug ?? "",
    shortSummary: story?.short_summary ?? "",
    fullStory: story?.full_story ?? "",
    testimonialQuote: story?.testimonial_quote ?? "",
    relatedType: story?.programme_id
      ? "programme"
      : story?.scholarship_id
        ? "scholarship"
        : "",
    relatedId: story?.programme_id ?? story?.scholarship_id ?? "",
    institutionOrEmployer: story?.institution_or_employer ?? "",
    roleOrAchievement: story?.role_or_achievement ?? "",
    completionYear: story?.completion_year
      ? String(story.completion_year)
      : "",
    location: story?.location ?? "",
    beforeAfterDescription: story?.before_after_description ?? "",
    videoUrl: story?.video_url ?? "",
    featured: story?.featured ?? false,
    published: story?.published ?? false,
    displayOrder: String(story?.display_order ?? 0),
    seoTitle: story?.seo_title ?? "",
    seoDescription: story?.seo_description ?? "",
  };
}
