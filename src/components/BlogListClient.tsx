"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import PageHero from "@/components/PageHero";
import type { BlogFilters, listPublicBlogs } from "@/lib/blog-public";

type Result = Awaited<ReturnType<typeof listPublicBlogs>>;

export default function BlogListClient({
  result,
  filters,
}: {
  result: Result;
  filters: BlogFilters;
}) {
  const filtered = Boolean(filters.search);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (page > 1) params.set("page", String(page));
    return `/blog${params.size ? `?${params}` : ""}`;
  };

  return (
    <div>
      <PageHero
        eyebrow="Blog & News"
        title="Blog & News"
        subtitle="Guidance, tips, and updates for students and youth."
      />
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <form
          action="/blog"
          className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
        >
          <label className="sr-only" htmlFor="blog-search">
            Search Blog articles
          </label>
          <input
            id="blog-search"
            name="search"
            defaultValue={filters.search}
            maxLength={100}
            placeholder="Search articles"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <button className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
            Search
          </button>
        </form>
        {filtered && (
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              {result.total} matching article
              {result.total === 1 ? "" : "s"}
            </p>
            <Link href="/blog" className="font-medium text-rose-700">
              Clear search
            </Link>
          </div>
        )}

        {result.items.length === 0 ? (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {filtered
                ? "No articles match this search"
                : "No articles published yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {filtered
                ? "Try a different search or clear the current search."
                : "Please check back soon for new guidance and updates."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {result.items.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % 6) * 0.08 }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex h-full flex-col"
                  aria-label={`Read ${post.title}`}
                >
                  {post.coverImageUrl && (
                    <div className="relative aspect-[16/9] bg-gray-100">
                      <Image
                        src={post.coverImageUrl}
                        alt={`Cover for ${post.title}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                      {post.content}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User size={14} aria-hidden />
                          {post.author}
                        </span>
                      )}
                      {post.created_at && (
                        <time
                          dateTime={post.created_at}
                          className="flex items-center gap-1"
                        >
                          <Calendar size={14} aria-hidden />
                          {formatDate(post.created_at)}
                        </time>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {result.totalPages > 1 && (
          <nav
            aria-label="Blog pages"
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              aria-disabled={result.page <= 1}
              tabIndex={result.page <= 1 ? -1 : undefined}
              href={
                result.page > 1 ? pageHref(result.page - 1) : pageHref(1)
              }
              className={`rounded-full border px-4 py-2 text-sm ${
                result.page <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:border-rose-300"
              }`}
            >
              Previous
            </Link>
            <span className="text-sm text-gray-500">
              Page {result.page} of {result.totalPages}
            </span>
            <Link
              aria-disabled={result.page >= result.totalPages}
              tabIndex={result.page >= result.totalPages ? -1 : undefined}
              href={
                result.page < result.totalPages
                  ? pageHref(result.page + 1)
                  : pageHref(result.totalPages)
              }
              className={`rounded-full border px-4 py-2 text-sm ${
                result.page >= result.totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:border-rose-300"
              }`}
            >
              Next
            </Link>
          </nav>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}
