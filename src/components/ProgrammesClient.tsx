"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  MonitorSmartphone,
  Star,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import type {
  ProgrammeFilters,
  listPublicProgrammeCategories,
  listPublicProgrammes,
} from "@/lib/programmes-public";

type Result = Awaited<ReturnType<typeof listPublicProgrammes>>;
type Categories = Awaited<ReturnType<typeof listPublicProgrammeCategories>>;

export default function ProgrammesClient({
  result,
  categories,
  filters,
}: {
  result: Result;
  categories: Categories;
  filters: ProgrammeFilters;
}) {
  const filtered = Boolean(filters.search || filters.category || filters.mode);
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.mode) params.set("mode", filters.mode);
  const pageHref = (page: number) => {
    const next = new URLSearchParams(params);
    if (page > 1) next.set("page", String(page));
    return `/programmes${next.size ? `?${next}` : ""}`;
  };

  return (
    <div>
      <PageHero
        eyebrow="Programmes"
        title="Our Programmes"
        subtitle="Structured programmes designed for students, youth, and community groups."
      />
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <form
          className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_13rem_12rem_auto]"
          action="/programmes"
        >
          <label className="sr-only" htmlFor="programme-search">Search Programmes</label>
          <input id="programme-search" name="search" defaultValue={filters.search} maxLength={100} placeholder="Search Programmes" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
          <label className="sr-only" htmlFor="programme-category">Category</label>
          <select id="programme-category" name="category" defaultValue={filters.category} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="programme-mode">Delivery mode</label>
          <select id="programme-mode" name="mode" defaultValue={filters.mode} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
            <option value="">All delivery modes</option>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <button className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">Apply filters</button>
        </form>
        {filtered && <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-500"><p>{result.total} matching Programme{result.total === 1 ? "" : "s"}</p><Link href="/programmes" className="font-medium text-rose-700">Clear filters</Link></div>}

        {result.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {filtered ? "No Programmes match these filters" : "No Programmes published yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {filtered ? "Try changing or clearing the current filters." : "Please check back soon for upcoming learning opportunities."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {result.items.map((programme, index) => {
              const category = programme.programme_categories;
              return (
                <motion.article key={programme.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: (index % 6) * 0.06 }} whileHover={{ y: -5 }} className={`overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${programme.featured ? "border-rose-100 bg-rose-50" : "border-gray-100 bg-white"}`}>
                  <Link href={`/programmes/${programme.slug}`} className="flex h-full flex-col">
                    {programme.displayImageUrl ? <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100"><Image src={programme.displayImageUrl} alt={programme.title} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]"/></div> : <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-sm text-gray-400">Programme image unavailable</div>}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {programme.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"><Star size={13} fill="currentColor"/> Featured</span>}
                        {(category?.name || programme.category) && <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-600">{category?.name || programme.category}</span>}
                        <RegistrationBadge status={programme.registrationStatus} />
                      </div>
                      <h2 className="mt-4 text-xl font-semibold text-gray-900">{programme.title}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{programme.short_summary || programme.full_description || programme.description}</p>
                      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        {programme.duration && <span className="inline-flex items-center gap-1.5"><Clock size={14}/>{programme.duration}</span>}
                        {programme.delivery_mode && <span className="inline-flex items-center gap-1.5"><MonitorSmartphone size={14}/>{programme.delivery_mode.replaceAll("_", " ")}</span>}
                        {programme.location && <span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{programme.location}</span>}
                        {programme.starts_at && <span className="inline-flex items-center gap-1.5"><CalendarDays size={14}/>{formatDate(programme.starts_at)}</span>}
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rose-700">View Programme <ArrowRight size={16}/></span>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
        {result.totalPages > 1 && <nav aria-label="Programme pages" className="mt-10 flex items-center justify-center gap-4"><Link aria-disabled={result.page <= 1} tabIndex={result.page <= 1 ? -1 : undefined} href={result.page > 1 ? pageHref(result.page - 1) : pageHref(1)} className={`rounded-full border px-4 py-2 text-sm ${result.page <= 1 ? "pointer-events-none opacity-40" : "hover:border-rose-300"}`}>Previous</Link><span className="text-sm text-gray-500">Page {result.page} of {result.totalPages}</span><Link aria-disabled={result.page >= result.totalPages} tabIndex={result.page >= result.totalPages ? -1 : undefined} href={result.page < result.totalPages ? pageHref(result.page + 1) : pageHref(result.totalPages)} className={`rounded-full border px-4 py-2 text-sm ${result.page >= result.totalPages ? "pointer-events-none opacity-40" : "hover:border-rose-300"}`}>Next</Link></nav>}
      </section>
    </div>
  );
}

function RegistrationBadge({ status }: { status: string }) {
  const label = status === "open" ? "Registration open" : status === "not_yet_open" ? "Opens soon" : "Registration closed";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{label}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" }).format(new Date(value));
}
