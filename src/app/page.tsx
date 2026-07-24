import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import {
  getPublicHomepageData,
  getPublicShellData,
} from "@/lib/cms/public-site";
import { SITE_NAME } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

const FALLBACK_DESCRIPTION =
  "Empowering students and youth through skills, education, and guidance. Scholarship guidance, leadership training, and community-based development.";

export async function generateMetadata(): Promise<Metadata> {
  const [home, shell] = await Promise.all([
    getPublicHomepageData(),
    getPublicShellData(),
  ]);
  const page = home.page;
  const settings = shell.settings;
  return {
    title: SITE_NAME,
    description:
      page?.seo_description ||
      settings?.default_seo_description ||
      FALLBACK_DESCRIPTION,
    alternates: { canonical: page?.canonical_url || "/" },
    robots: {
      index: page?.robots_index ?? settings?.default_robots_index ?? true,
      follow: page?.robots_follow ?? settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: SITE_NAME,
      description:
        page?.og_description ||
        page?.seo_description ||
        settings?.default_seo_description ||
        FALLBACK_DESCRIPTION,
      // Private cms-media URLs expire too quickly for reliable crawler use.
      images: ["/logo-v2.png"],
    },
  };
}

const RECOGNIZED_SECTIONS = new Set([
  "hero",
  "statistics",
  "featured_programmes",
  "featured_scholarships",
  "featured_stories",
  "testimonials",
  "team",
  "partners",
  "faq",
  "office_locations",
  "contact_details",
  "call_to_action",
  "introduction",
  "custom_content",
]);

export default async function Home() {
  const data = await getPublicHomepageData();
  const sections = data.sections.filter((section) => {
    if (RECOGNIZED_SECTIONS.has(section.section_type)) return true;
    console.warn("Skipping unknown public homepage section", {
      sectionType: section.section_type,
    });
    return false;
  });
  return <HomePageClient data={{ ...data, sections }} />;
}
