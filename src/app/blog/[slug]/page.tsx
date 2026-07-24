import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, User } from "lucide-react";
import {
  getBlogMetadataDefaults,
  getPublicBlog,
  isValidBlogSlug,
} from "@/lib/blog-public";
import { SITE_NAME } from "@/lib/site-brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidBlogSlug(slug)) return { robots: { index: false, follow: false } };
  const [post, settings] = await Promise.all([
    getPublicBlog(slug).catch(() => null),
    getBlogMetadataDefaults().catch(() => null),
  ]);
  if (!post) return { robots: { index: false, follow: false } };
  const description = excerpt(post.content);
  const institute = SITE_NAME;
  return {
    title: `${post.title} | ${institute}`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: {
      index: settings?.default_robots_index ?? true,
      follow: settings?.default_robots_follow ?? true,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      images: ["/logo-v2.png"],
      publishedTime: post.created_at || undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidBlogSlug(slug)) notFound();
  const post = await getPublicBlog(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <Link href="/blog" className="text-sm font-medium text-rose-700">
        ← Back to Blog
      </Link>
      {post.coverImageUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={post.coverImageUrl}
            alt={`Cover for ${post.title}`}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}
      <h1 className="mt-8 text-3xl font-semibold text-gray-900 md:text-4xl">
        {post.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {post.author && (
          <span className="flex items-center gap-1">
            <User size={16} aria-hidden />
            {post.author}
          </span>
        )}
        {post.created_at && (
          <time
            dateTime={post.created_at}
            className="flex items-center gap-1"
          >
            <Calendar size={16} aria-hidden />
            {formatDate(post.created_at)}
          </time>
        )}
      </div>
      <div className="mt-8 whitespace-pre-line break-words text-gray-700 leading-relaxed">
        {post.content}
      </div>
    </article>
  );
}

function excerpt(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 160);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}
