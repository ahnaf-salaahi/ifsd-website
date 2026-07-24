import type { Metadata } from "next";
import InstitutionalPageClient from "@/components/InstitutionalPageClient";
import { getPublicInstitutionalPage } from "@/lib/institutional-public";
import { withSiteName } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Learn about the Institute for Skills Development, our mission, vision, values, team, and partners.";

export async function generateMetadata(): Promise<Metadata> {
  const { page, settings } = await getPublicInstitutionalPage("about");
  return {
    title: withSiteName(page?.seo_title || page?.title || "About Us"),
    description:
      page?.seo_description ||
      settings?.default_seo_description ||
      DESCRIPTION,
    alternates: { canonical: page?.canonical_url || "/about" },
    robots: {
      index: page?.robots_index ?? settings?.default_robots_index ?? true,
      follow: page?.robots_follow ?? settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: withSiteName(page?.og_title || page?.seo_title || page?.title || "About Us"),
      description:
        page?.og_description || page?.seo_description || DESCRIPTION,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function AboutPage() {
  const data = await getPublicInstitutionalPage("about");
  return <InstitutionalPageClient data={data} />;
}
