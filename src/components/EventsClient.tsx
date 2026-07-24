"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";
import type { EventFilters, listPublicEvents } from "@/lib/events-public";

type Result = Awaited<ReturnType<typeof listPublicEvents>>;
type EventItem = Result["items"][number];

export default function EventsClient({
  result,
  filters,
}: {
  result: Result;
  filters: EventFilters;
}) {
  const filtered = Boolean(filters.search || filters.status);
  const registrationOpen = result.items.filter(
    (event) => event.lifecycle === "registration_open",
  );
  const upcoming = result.items.filter(
    (event) => event.lifecycle === "upcoming",
  );
  const completed = result.items.filter(
    (event) => event.lifecycle === "completed",
  );
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (page > 1) params.set("page", String(page));
    return `/events${params.size ? `?${params}` : ""}`;
  };

  return (
    <div>
      <PageHero
        eyebrow="Events"
        title="Events"
        subtitle="Webinars, training workshops, mentoring sessions, and leadership camps."
      />
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <form
          action="/events"
          className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_12rem_auto]"
        >
          <label className="sr-only" htmlFor="event-search">
            Search Events
          </label>
          <input
            id="event-search"
            name="search"
            defaultValue={filters.search}
            maxLength={100}
            placeholder="Search Events"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
          <label className="sr-only" htmlFor="event-status">
            Event timing
          </label>
          <select
            id="event-status"
            name="status"
            defaultValue={filters.status}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          >
            <option value="">All Events</option>
            <option value="registration-open">Registration Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <button className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
            Apply filters
          </button>
        </form>
        {filtered && (
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              {result.total} matching Event{result.total === 1 ? "" : "s"}
            </p>
            <Link href="/events" className="font-medium text-rose-700">
              Clear filters
            </Link>
          </div>
        )}

        {result.items.length === 0 ? (
          <div role="status" className="mt-8 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {filtered
                ? "No Events match these filters"
                : "No Events are currently available"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {filtered
                ? "Try changing or clearing the current filters."
                : "Please check back soon for new Events."}
            </p>
          </div>
        ) : (
          <>
            {registrationOpen.length > 0 && (
              <EventSection
                title="Registration Open"
                items={registrationOpen}
              />
            )}
            {upcoming.length > 0 && (
              <EventSection title="Upcoming Events" items={upcoming} />
            )}
            {completed.length > 0 && (
              <EventSection title="Past Events" items={completed} subdued />
            )}
          </>
        )}

        {result.totalPages > 1 && (
          <nav
            aria-label="Event pages"
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

function EventSection({
  title,
  items,
  subdued = false,
}: {
  title: string;
  items: EventItem[];
  subdued?: boolean;
}) {
  return (
    <section className="pt-14">
      <h2 className="mb-8 text-2xl font-semibold text-gray-900">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((event, index) => (
          <motion.article
            key={event.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (index % 6) * 0.08 }}
            whileHover={{ y: subdued ? 0 : -6 }}
            className={`flex flex-col overflow-hidden rounded-2xl border border-gray-100 shadow-sm ${
              subdued ? "bg-gray-50" : "bg-white hover:shadow-md"
            }`}
          >
            {event.coverImageUrl ? (
              <div className="relative aspect-[16/9] bg-gray-50">
                <Image
                  src={event.coverImageUrl}
                  alt={`Flyer for ${event.title}`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-sm text-gray-400">
                Event flyer unavailable
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={lifecycleLabel(event.lifecycle)} />
                {event.lifecycle !== "registration_open" && (
                  <StatusBadge label={registrationLabel(event.registrationStatus)} />
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {event.title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                {event.description}
              </p>
              {event.event_date ? (
                <time
                  dateTime={event.event_date}
                  className="mt-4 flex items-center gap-2 text-sm text-gray-500"
                >
                  <CalendarDays size={16} aria-hidden />
                  {formatDateTime(event.event_date)}
                </time>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={16} aria-hidden />
                  Date to be announced
                </div>
              )}
              {event.location && (
                <div className="mt-2 flex items-start gap-2 break-words text-sm text-gray-500">
                  <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
                  {event.location}
                </div>
              )}
              <Link
                href={`/events/${event.slug}`}
                className="mt-5 inline-block rounded-lg bg-rose-600 py-2.5 text-center text-sm font-medium text-white hover:bg-rose-700"
                aria-label={`View details for ${event.title}`}
              >
                View Details
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}

function lifecycleLabel(value: EventItem["lifecycle"]) {
  if (value === "registration_open") return "Registration open";
  return value === "upcoming" ? "Upcoming" : "Completed";
}

function registrationLabel(value: EventItem["registrationStatus"]) {
  if (value === "open_internal" || value === "open_legacy") {
    return "Registration open";
  }
  if (value === "disabled") return "Registration unavailable";
  return "Registration closed";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}
