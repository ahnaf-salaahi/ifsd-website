"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Quote, Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import type {
  SuccessStoryFilters,
  getSuccessStoryFilterOptions,
  listPublicSuccessStories,
} from "@/lib/success-stories-public";

type Result = Awaited<ReturnType<typeof listPublicSuccessStories>>;
type Options = Awaited<ReturnType<typeof getSuccessStoryFilterOptions>>;

export default function SuccessStoriesClient({
  result,
  options,
  filters,
}: {
  result: Result;
  options: Options;
  filters: SuccessStoryFilters;
}) {
  const filtered = Boolean(filters.search || filters.location || filters.year || filters.programme);
  const base = new URLSearchParams();
  if (filters.search) base.set("search", filters.search);
  if (filters.location) base.set("location", filters.location);
  if (filters.year) base.set("year", filters.year);
  if (filters.programme) base.set("programme", filters.programme);
  const pageHref = (page: number) => {
    const params = new URLSearchParams(base);
    if (page > 1) params.set("page", String(page));
    return `/success-stories${params.size ? `?${params}` : ""}`;
  };
  return (
    <div>
      <PageHero eyebrow="Success Stories" title="Success Stories" subtitle="Real stories from students, parents, and mentors we have worked with." />
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <form action="/success-stories" className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          <label className="sr-only" htmlFor="story-search">Search stories</label>
          <input id="story-search" name="search" defaultValue={filters.search} maxLength={100} placeholder="Search stories" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"/>
          <Filter id="location" name="location" label="Location" value={filters.location} options={options.locations.map((value) => ({ value, label: value }))}/>
          <Filter id="year" name="year" label="Year" value={filters.year} options={options.years.map((value) => ({ value, label: value }))}/>
          <Filter id="programme" name="programme" label="Programme" value={filters.programme} options={options.programmes.map((item) => ({ value: item.slug, label: item.title }))}/>
          <button className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">Apply filters</button>
        </form>
        {filtered && <div className="mt-4 flex justify-between gap-4 text-sm text-gray-500"><p>{result.total} matching stor{result.total === 1 ? "y" : "ies"}</p><Link href="/success-stories" className="font-medium text-rose-700">Clear filters</Link></div>}
        {result.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm"><h2 className="text-lg font-semibold text-gray-900">{filtered ? "No stories match these filters" : "No stories published yet"}</h2><p className="mt-2 text-sm text-gray-500">{filtered ? "Try changing or clearing the current filters." : "Please check back as we add stories from our community."}</p></div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((story, index) => (
              <motion.article key={story.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: (index % 6) * 0.07 }} whileHover={{ y: -5 }} className={`overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${story.featured ? "border-rose-100 bg-rose-50" : "border-gray-100 bg-white"}`}>
                <Link href={`/success-stories/${story.slug}`} className="flex h-full flex-col">
                  {story.coverImageUrl ? <div className="relative aspect-[16/9] overflow-hidden bg-gray-100"><Image src={story.coverImageUrl} alt={story.story_title} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover"/></div> : <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-sm text-gray-400">Story image unavailable</div>}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-3"><Quote className="text-rose-600" size={25}/>{story.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"><Star size={12} fill="currentColor"/> Featured</span>}</div>
                    <h2 className="mt-4 text-lg font-semibold text-gray-900">{story.story_title}</h2>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-600">{story.testimonial_quote || story.short_summary}</p>
                    <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                      {story.profileImageUrl ? <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100"><Image src={story.profileImageUrl} alt={story.person_name} fill unoptimized sizes="44px" className="object-cover"/></div> : null}
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-900">{story.person_name}</p><p className="truncate text-xs text-gray-500">{story.role_or_achievement || story.institution_or_employer}</p></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">{story.location && <span className="inline-flex items-center gap-1"><MapPin size={13}/>{story.location}</span>}{story.completion_year && <span className="inline-flex items-center gap-1"><CalendarDays size={13}/>{story.completion_year}</span>}{story.programmes?.title && <span>{story.programmes.title}</span>}</div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rose-700">Read story <ArrowRight size={16}/></span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
        {result.totalPages > 1 && <nav aria-label="Success Story pages" className="mt-10 flex items-center justify-center gap-4"><Link aria-disabled={result.page <= 1} tabIndex={result.page <= 1 ? -1 : undefined} href={result.page > 1 ? pageHref(result.page - 1) : pageHref(1)} className={`rounded-full border px-4 py-2 text-sm ${result.page <= 1 ? "pointer-events-none opacity-40" : "hover:border-rose-300"}`}>Previous</Link><span className="text-sm text-gray-500">Page {result.page} of {result.totalPages}</span><Link aria-disabled={result.page >= result.totalPages} tabIndex={result.page >= result.totalPages ? -1 : undefined} href={result.page < result.totalPages ? pageHref(result.page + 1) : pageHref(result.totalPages)} className={`rounded-full border px-4 py-2 text-sm ${result.page >= result.totalPages ? "pointer-events-none opacity-40" : "hover:border-rose-300"}`}>Next</Link></nav>}
      </section>
    </div>
  );
}

function Filter({ id, name, label, value, options }: { id: string; name: string; label: string; value: string; options: Array<{ value: string; label: string }> }) {
  return <><label className="sr-only" htmlFor={id}>{label}</label><select id={id} name={name} defaultValue={value} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"><option value="">All {label.toLowerCase()}s</option>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></>;
}
