"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, GraduationCap, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";
import type {
  ScholarshipFilters,
  getScholarshipFilterOptions,
  listPublicScholarships,
} from "@/lib/scholarships-public";

type Result = Awaited<ReturnType<typeof listPublicScholarships>>;
type Options = Awaited<ReturnType<typeof getScholarshipFilterOptions>>;

export default function ScholarshipsClient({
  result,
  options,
  filters,
}: {
  result: Result;
  options: Options;
  filters: ScholarshipFilters;
}) {
  const filtered = Boolean(
    filters.search || filters.country || filters.funding || filters.level,
  );
  const baseParams = new URLSearchParams();
  if (filters.search) baseParams.set("search", filters.search);
  if (filters.country) baseParams.set("country", filters.country);
  if (filters.funding) baseParams.set("funding", filters.funding);
  if (filters.level) baseParams.set("level", filters.level);
  const pageHref = (page: number) => {
    const params = new URLSearchParams(baseParams);
    if (page > 1) params.set("page", String(page));
    return `/scholarships${params.size ? `?${params}` : ""}`;
  };
  return (
    <div>
      <PageHero eyebrow="Edu First" title="Scholarship Updates" subtitle="Stay updated with the latest scholarship announcements, deadlines, and eligibility requirements." />
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <form action="/scholarships" className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          <label className="sr-only" htmlFor="scholarship-search">Search Scholarships</label>
          <input id="scholarship-search" name="search" defaultValue={filters.search} maxLength={100} placeholder="Search Scholarships" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"/>
          <FilterSelect id="country" name="country" label="Country" value={filters.country} options={options.countries} />
          <FilterSelect id="funding" name="funding" label="Funding type" value={filters.funding} options={options.fundingTypes} />
          <FilterSelect id="level" name="level" label="Study level" value={filters.level} options={options.studyLevels} />
          <button className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">Apply filters</button>
        </form>
        {filtered && <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-500"><p>{result.total} matching Scholarship{result.total === 1 ? "" : "s"}</p><Link href="/scholarships" className="font-medium text-rose-700">Clear filters</Link></div>}

        {result.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{filtered ? "No Scholarships match these filters" : "No Scholarships published yet"}</h2>
            <p className="mt-2 text-sm text-gray-500">{filtered ? "Try changing or clearing the current filters." : "Please check back soon for new opportunities."}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((scholarship, index) => (
              <motion.article key={scholarship.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (index % 6) * 0.08 }} whileHover={{ y: -6 }} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                {scholarship.displayImageUrl ? <div className="relative aspect-[16/9] bg-gray-100"><Image src={scholarship.displayImageUrl} alt={scholarship.title} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover"/></div> : null}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex w-fit items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"><GraduationCap size={14}/>{scholarship.funding_type}</div>
                  <h2 className="mt-4 text-lg font-semibold text-gray-900">{scholarship.title}</h2>
                  <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-gray-600">{scholarship.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><MapPin size={16}/>{scholarship.country} · {scholarship.study_level}</div>
                  <Deadline deadline={scholarship.deadline} status={scholarship.applicationStatus} />
                  {scholarship.applicationStatus === "open" || scholarship.applicationStatus === "closing_soon" ? (
                    <Link href={`/scholarships/${scholarship.slug}/apply`} className="mt-5 rounded-full bg-rose-600 py-2.5 text-center text-sm font-medium text-white hover:bg-rose-700">Apply Now</Link>
                  ) : (
                    <p className="mt-5 rounded-full bg-gray-100 px-4 py-2.5 text-center text-sm text-gray-600">Applications are currently unavailable.</p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
        {result.totalPages > 1 && <nav aria-label="Scholarship pages" className="mt-10 flex items-center justify-center gap-4"><Link aria-disabled={result.page <= 1} tabIndex={result.page <= 1 ? -1 : undefined} href={result.page > 1 ? pageHref(result.page - 1) : pageHref(1)} className={`rounded-full border px-4 py-2 text-sm ${result.page <= 1 ? "pointer-events-none opacity-40" : "hover:border-rose-300"}`}>Previous</Link><span className="text-sm text-gray-500">Page {result.page} of {result.totalPages}</span><Link aria-disabled={result.page >= result.totalPages} tabIndex={result.page >= result.totalPages ? -1 : undefined} href={result.page < result.totalPages ? pageHref(result.page + 1) : pageHref(result.totalPages)} className={`rounded-full border px-4 py-2 text-sm ${result.page >= result.totalPages ? "pointer-events-none opacity-40" : "hover:border-rose-300"}`}>Next</Link></nav>}
      </section>
    </div>
  );
}

function FilterSelect({ id, name, label, value, options }: { id: string; name: string; label: string; value: string; options: string[] }) {
  return <><label className="sr-only" htmlFor={id}>{label}</label><select id={id} name={name} defaultValue={value} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"><option value="">All {label.toLowerCase()}s</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></>;
}

function Deadline({ deadline, status }: { deadline: string | null; status: string }) {
  const label = !deadline && status === "open"
    ? "Applications open · Deadline unavailable"
    : status === "closing_soon"
      ? "Closing soon"
      : status === "open"
        ? "Applications open"
        : deadline
          ? "Applications closed"
          : "Deadline unavailable";
  return <div className="mt-3 flex items-start gap-2 text-sm text-gray-600"><CalendarDays size={16} className="mt-0.5 shrink-0"/><div><span className="font-medium">{label}</span>{deadline && <div><time dateTime={deadline}>Deadline: {formatDate(deadline)}</time></div>}</div></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Colombo" }).format(new Date(`${value}T12:00:00+05:30`));
}
