import "server-only";

import { cache } from "react";
import { getPublishedPage, getOrderedPublishedSections } from "./pages";
import { getPublicSettings } from "./settings";
import {
  getPublicFooterNavigation,
  getPublicHeaderNavigation,
} from "./navigation";
import {
  listFeaturedProgrammes,
  listFeaturedScholarships,
  listFeaturedStories,
} from "./featured";
import { listHomepageStatistics } from "./statistics";
import { listFeaturedTestimonials } from "./testimonials";
import { listFeaturedTeam } from "./team";
import { listFeaturedPartners } from "./partners";
import { listGlobalFaqs, listPageFaqs } from "./faqs";
import { getPrimaryOffice } from "./offices";
import {
  createPublishedMediaSignedUrl,
  type PublishedMediaReference,
} from "./media";
import type { NavigationNode, Tables } from "./types";

export type PublicShellData = {
  settings: Awaited<ReturnType<typeof getPublicSettings>>;
  headerNavigation: NavigationNode[];
  footerNavigation: NavigationNode[];
  logoUrl: string | null;
  socialLinks: Array<{ label: string; url: string }>;
};

const safeModule = async <T>(
  operation: string,
  loader: () => Promise<T>,
  fallback: T,
) => {
  try {
    return await loader();
  } catch (error) {
    console.error("Public CMS module unavailable", {
      operation,
      code: error instanceof Error ? error.name : "unknown",
    });
    return fallback;
  }
};

const getCachedHomepage = cache(() => getPublishedPage("home"));
const getCachedHomepageSections = cache((pageId: string) =>
  getOrderedPublishedSections(pageId),
);

async function sign(reference: PublishedMediaReference | null) {
  if (!reference) return null;
  return safeModule(
    "public.media.sign",
    () => createPublishedMediaSignedUrl(reference),
    null,
  );
}

export const getPublicShellData = cache(
  async (): Promise<PublicShellData> => {
    const [settings, headerNavigation, footerNavigation, homepage] = await Promise.all([
      safeModule("public.settings", getPublicSettings, null),
      safeModule("public.navigation.header", getPublicHeaderNavigation, []),
      safeModule("public.navigation.footer", getPublicFooterNavigation, []),
      safeModule("public.shell.home", getCachedHomepage, null),
    ]);
    const shellSections = homepage
      ? await safeModule(
          "public.shell.sections",
          () => getCachedHomepageSections(homepage.id),
          [],
        )
      : [];
    const socialConfig = shellSections.find(
      (section) => section.section_type === "social_links",
    )?.content_config;
    const socialLinks =
      socialConfig &&
      typeof socialConfig === "object" &&
      !Array.isArray(socialConfig) &&
      Array.isArray(socialConfig.links)
        ? socialConfig.links.flatMap((entry) => {
            if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
            const label = typeof entry.label === "string" ? entry.label.trim() : "";
            const url = typeof entry.url === "string" ? safePublicUrl(entry.url) : null;
            return label && url ? [{ label, url }] : [];
          }).slice(0, 12)
        : [];
    const logoUrl =
      settings?.primary_logo_path
        ? await sign({
            kind: "branding",
            objectPath: settings.primary_logo_path,
          })
        : null;
    return { settings, headerNavigation, footerNavigation, logoUrl, socialLinks };
  },
);

type ImageItem = { id: string; imagePath: string | null; imageUrl?: string | null };

async function addSignedImages<T extends ImageItem>(
  items: T[],
  reference: (item: T) => PublishedMediaReference | null,
) {
  const urls = await Promise.all(items.map((item) => sign(reference(item))));
  return items.map((item, index) => ({ ...item, imageUrl: urls[index] }));
}

export const getPublicHomepageData = cache(async () => {
  const page = await safeModule(
    "public.home.page",
    getCachedHomepage,
    null,
  );
  const sections = page
    ? await safeModule(
        "public.home.sections",
        () => getCachedHomepageSections(page.id),
        [],
      )
    : [];

  const [
    programmes,
    scholarships,
    stories,
    statistics,
    testimonials,
    team,
    partners,
    globalFaqs,
    pageFaqs,
    office,
  ] = await Promise.all([
    safeModule("public.home.programmes", listFeaturedProgrammes, []),
    safeModule("public.home.scholarships", listFeaturedScholarships, []),
    safeModule("public.home.stories", listFeaturedStories, []),
    safeModule("public.home.statistics", listHomepageStatistics, []),
    safeModule("public.home.testimonials", listFeaturedTestimonials, []),
    safeModule("public.home.team", listFeaturedTeam, []),
    safeModule("public.home.partners", listFeaturedPartners, []),
    safeModule("public.home.faqs.global", listGlobalFaqs, []),
    page
      ? safeModule("public.home.faqs.page", () => listPageFaqs(page.id), [])
      : Promise.resolve([]),
    safeModule("public.home.office", getPrimaryOffice, null),
  ]);

  const [signedProgrammes, signedScholarships, signedStories] =
    await Promise.all([
      addSignedImages(programmes, (item) =>
        !item.imagePath
          ? null
          : item.imagePath === item.programme.featured_image_path
            ? {
                kind: "programme",
                ownerId: item.programme.id,
                objectPath: item.imagePath,
              }
            : {
                kind: "featured_programme",
                ownerId: item.id,
                objectPath: item.imagePath,
              },
      ),
      addSignedImages(scholarships, (item) =>
        !item.imagePath
          ? null
          : item.imagePath === item.scholarship.cover_image_url
            ? {
                kind: "scholarship",
                ownerId: item.scholarship.id,
                objectPath: item.imagePath,
              }
            : {
                kind: "featured_scholarship",
                ownerId: item.id,
                objectPath: item.imagePath,
              },
      ),
      addSignedImages(stories, (item) =>
        !item.imagePath
          ? null
          : item.imagePath === item.story.cover_image_path
            ? {
                kind: "success_story",
                ownerId: item.story.id,
                objectPath: item.imagePath,
              }
            : {
                kind: "featured_story",
                ownerId: item.id,
                objectPath: item.imagePath,
              },
      ),
    ]);

  const testimonialImages = await Promise.all(
    testimonials.map((item) =>
      item.photo_path
        ? sign({ kind: "testimonial", ownerId: item.id, objectPath: item.photo_path })
        : null,
    ),
  );
  const teamImages = await Promise.all(
    team.map((item) =>
      item.photo_path
        ? sign({ kind: "team", ownerId: item.id, objectPath: item.photo_path })
        : null,
    ),
  );
  const partnerImages = await Promise.all(
    partners.map((item) =>
      item.logo_path
        ? sign({ kind: "partner", ownerId: item.id, objectPath: item.logo_path })
        : null,
    ),
  );
  const sectionImages = await Promise.all(
    sections.map((section) =>
      section.media_path
        ? sign({
            kind: "section",
            ownerId: section.id,
            objectPath: section.media_path,
          })
        : null,
    ),
  );

  const faqMap = new Map<string, Tables<"site_faqs">>();
  [...globalFaqs, ...pageFaqs].forEach((faq) => {
    const key = faq.question.trim().toLocaleLowerCase();
    if (!faqMap.has(key)) faqMap.set(key, faq as Tables<"site_faqs">);
  });

  return {
    page,
    sections: sections.map((section, index) => ({
      ...section,
      imageUrl: sectionImages[index],
    })),
    programmes: signedProgrammes,
    scholarships: signedScholarships,
    stories: signedStories,
    statistics,
    testimonials: testimonials.map((item, index) => ({
      ...item,
      imageUrl: testimonialImages[index],
    })),
    team: team.map((item, index) => ({ ...item, imageUrl: teamImages[index] })),
    partners: partners.map((item, index) => ({
      ...item,
      imageUrl: partnerImages[index],
    })),
    faqs: [...faqMap.values()],
    office,
  };
});

export type PublicHomepageData = Awaited<
  ReturnType<typeof getPublicHomepageData>
>;

export function safePublicUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
