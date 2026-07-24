"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { getPublicEvent } from "@/lib/events-public";

type PublicEventDetail = NonNullable<
  Awaited<ReturnType<typeof getPublicEvent>>
>;

export default function EventDetailClient({
  detail,
}: {
  detail: PublicEventDetail;
}) {
  const { event, photos, lifecycle, registrationStatus, coverImageUrl } =
    detail;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(eventObject: React.FormEvent) {
    eventObject.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        "Your registration could not be submitted. Please review the form and try again.",
      );
      return;
    }
    setStatus("success");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-16">
      <Link href="/events" className="text-sm font-medium text-rose-700">
        ← Back to Events
      </Link>
      {coverImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-gray-50"
        >
          <Image
            src={coverImageUrl}
            alt={`Flyer for ${event.title}`}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-contain"
          />
        </motion.div>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8 text-3xl font-semibold text-gray-900 md:text-4xl"
      >
        {event.title}
      </motion.h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge
          label={
            lifecycle === "registration_open"
              ? "Registration open"
              : lifecycle === "upcoming"
                ? "Upcoming"
                : "Completed"
          }
        />
        {lifecycle !== "registration_open" && (
          <StatusBadge label={registrationLabel(registrationStatus)} />
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-6 text-gray-600">
        {event.event_date ? (
          <time
            dateTime={event.event_date}
            className="flex items-center gap-2"
          >
            <CalendarDays size={18} aria-hidden />
            {formatDateTime(event.event_date)}
          </time>
        ) : (
          <div className="flex items-center gap-2">
            <CalendarDays size={18} aria-hidden />
            Date to be announced
          </div>
        )}
        {event.location && (
          <div className="flex min-w-0 items-start gap-2 break-words">
            <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden />
            {event.location}
          </div>
        )}
      </div>
      <p className="mt-6 whitespace-pre-line break-words leading-relaxed text-gray-700">
        {event.description}
      </p>

      {photos.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Event Photos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
              >
                <Image
                  src={photo.photoUrl}
                  alt={photo.caption || `Photo from ${event.title}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {registrationStatus === "open_internal" && (
        <section className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Register for this Event
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete the Event registration form to reserve your place.
          </p>
          <Link
            href={`/events/${event.slug}/register`}
            className="mt-6 inline-block w-full rounded-lg bg-rose-600 py-3 text-center font-medium text-white hover:bg-rose-700"
          >
            Register Now
          </Link>
        </section>
      )}

      {registrationStatus === "open_legacy" && (
        <section className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Register for this Event
          </h2>
          {status === "success" ? (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
            >
              <CheckCircle2 size={22} aria-hidden />
              You&apos;re registered. We&apos;ll be in touch with more details.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full name" name="legacy-event-full-name">
                <input
                  id="legacy-event-full-name"
                  name="full_name"
                  required
                  maxLength={200}
                  autoComplete="name"
                  value={fullName}
                  onChange={(change) => setFullName(change.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Email address" name="legacy-event-email">
                <input
                  id="legacy-event-email"
                  name="email"
                  required
                  type="email"
                  maxLength={320}
                  autoComplete="email"
                  value={email}
                  onChange={(change) => setEmail(change.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Phone number" name="legacy-event-phone">
                <input
                  id="legacy-event-phone"
                  name="phone"
                  maxLength={50}
                  autoComplete="tel"
                  value={phone}
                  onChange={(change) => setPhone(change.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field
                label="Questions or notes (optional)"
                name="legacy-event-notes"
              >
                <textarea
                  id="legacy-event-notes"
                  name="notes"
                  maxLength={2000}
                  rows={3}
                  value={notes}
                  onChange={(change) => setNotes(change.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              {status === "error" && (
                <p role="alert" className="text-sm text-red-600">
                  {errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "submitting"}
                aria-disabled={status === "submitting"}
                className="w-full rounded-lg bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {status === "submitting" ? "Submitting…" : "Register Now"}
              </button>
            </form>
          )}
        </section>
      )}

      {(registrationStatus === "closed" ||
        registrationStatus === "disabled") && (
        <div
          role="status"
          className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center text-gray-600"
        >
          {lifecycle === "completed"
            ? "This Event has already taken place."
            : registrationStatus === "disabled"
              ? "Registration is not available for this Event."
              : "Registration for this Event is closed."}
        </div>
      )}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500";

function Field({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}

function registrationLabel(
  value: PublicEventDetail["registrationStatus"],
) {
  if (value === "open_internal" || value === "open_legacy") {
    return "Registration open";
  }
  if (value === "disabled") return "Registration unavailable";
  return "Registration closed";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}
