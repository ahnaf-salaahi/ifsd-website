import type { Metadata } from "next";
import BlogListClient from "@/components/BlogListClient";
import {
  getBlogMetadataDefaults,
  listPublicBlogs,
  parseBlogFilters,
} from "@/lib/blog-public";
import { SITE_NAME } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Guidance, practical tips, news, and updates for students and youth.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogMetadataDefaults().catch(() => null);
  const institute = SITE_NAME;
  return {
    title: `Blog & News | ${institute}`,
    description: settings?.default_seo_description || DESCRIPTION,
    alternates: { canonical: "/blog" },
    robots: {
      index: settings?.default_robots_index ?? true,
      follow: settings?.default_robots_follow ?? true,
    },
    openGraph: {
      title: `Blog & News | ${institute}`,
      description: settings?.default_seo_description || DESCRIPTION,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseBlogFilters(await searchParams);
  let result: Awaited<ReturnType<typeof listPublicBlogs>> | null = null;
  try {
    result = await listPublicBlogs(filters);
  } catch {
    result = null;
  }
  if (result) return <BlogListClient result={result} filters={filters} />;
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">
        Blog articles are temporarily unavailable
      </h1>
      <p className="mt-4 text-gray-600">
        We could not load the Blog. Please try again later.
      </p>
    </main>
  );
}
