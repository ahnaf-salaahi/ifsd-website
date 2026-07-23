import type {
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";

export type { Database, Enums, Json, Tables, TablesInsert, TablesUpdate };

export type SitePageRow = Tables<"site_pages">;
export type SiteSectionRow = Tables<"site_sections">;
export type SitePageWithSections = SitePageRow & {
  sections: SiteSectionRow[];
};

export type NavigationRow = Tables<"site_navigation_items">;
export type NavigationItem = Pick<
  NavigationRow,
  | "id"
  | "parent_id"
  | "label"
  | "url"
  | "target"
  | "location"
  | "display_order"
  | "is_visible"
>;
export type NavigationNode = NavigationItem & {
  children: NavigationNode[];
};

export type MediaRow = Tables<"cms_media">;
export type MediaWithSignedUrl = MediaRow & {
  signedUrl: string | null;
};

export type FeaturedProgramme = {
  id: string;
  displayOrder: number;
  heading: string;
  summary: string | null;
  imagePath: string | null;
  ctaLabel: string;
  ctaUrl: string;
  programme: Pick<
    Tables<"programmes">,
    "id" | "title" | "slug" | "short_summary" | "featured_image_path"
  >;
};

export type FeaturedScholarship = {
  id: string;
  displayOrder: number;
  heading: string;
  summary: string | null;
  imagePath: string | null;
  ctaLabel: string;
  ctaUrl: string;
  scholarship: Pick<
    Tables<"scholarships">,
    "id" | "title" | "slug" | "description" | "cover_image_url"
  >;
};

export type FeaturedStory = {
  id: string;
  displayOrder: number;
  heading: string;
  summary: string | null;
  imagePath: string | null;
  ctaLabel: string;
  ctaUrl: string;
  story: Pick<
    Tables<"success_stories">,
    "id" | "story_title" | "slug" | "short_summary" | "cover_image_path"
  >;
};
