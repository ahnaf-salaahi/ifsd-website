import type { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";
import { getPublicInstitutionalPage } from "@/lib/institutional-public";
import { withSiteName } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Contact the Institute for Skills Development for programme, scholarship, and educational guidance enquiries.";

export async function generateMetadata(): Promise<Metadata> {
  const { page, settings } = await getPublicInstitutionalPage("contact");
  return {
    title: withSiteName(page?.seo_title || page?.title || "Contact Us"),
    description:
      page?.seo_description ||
      settings?.default_seo_description ||
      DESCRIPTION,
    alternates: { canonical: page?.canonical_url || "/contact" },
    robots: {
      index: page?.robots_index ?? settings?.default_robots_index ?? true,
      follow: page?.robots_follow ?? settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: withSiteName(page?.og_title || page?.seo_title || page?.title || "Contact Us"),
      description:
        page?.og_description || page?.seo_description || DESCRIPTION,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function ContactPage() {
  const data = await getPublicInstitutionalPage("contact");
  return <ContactPageClient data={data} />;
}
