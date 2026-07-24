"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PlaySquare,
  Send,
  Users,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { SITE_NAME } from "@/lib/site-brand";
import type { InstitutionalPageData } from "@/lib/institutional-public";

const PHONE_DISPLAY = "+94 144 2448";
const PHONE_HREF = "+941442448";
const ADDRESS =
  "152/4 ARM Junaid Mawatha, Kalagedihena 11875, Sri Lanka";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/Fathih+Institute+for+Higher+Education,+152%2F4+ARM+Junaid+Mawatha,+Kalagedihena+11875/Fathih+Institute+for+Higher+Education,+152%2F4+ARM+Junaid+Mawatha,+Kalagedihena+11875/@6.7947001,79.9061961,9784m/data=!3m1!1e3!4m13!4m12!1m5!1m1!1s0x3ae2fd7c3f7938e9:0x1814e1b0c9728f8c!2m2!1d80.0754625!2d7.127619!1m5!1m1!1s0x3ae2fd7c3f7938e9:0x1814e1b0c9728f8c!2m2!1d80.0754625!2d7.127619?entry=ttu&g_ep=EgoyMDI2MDcyMS4wIKXMDSoASAFQAw%3D%3D";
const MAP_EMBED_URL =
  "https://www.google.com/maps?q=7.127619,80.0754625&z=15&output=embed";

const INPUT_CLASS =
  "w-full rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100";

const SOCIALS = [
  { label: "Facebook", icon: Users },
  { label: "Instagram", icon: Camera },
  { label: "LinkedIn", icon: BriefcaseBusiness },
  { label: "YouTube", icon: PlaySquare },
];

export default function ContactPageClient({
  data,
}: {
  data: InstitutionalPageData;
}) {
  const [submitted, setSubmitted] = useState(false);
  const hero = data.sections.find((section) => section.section_type === "hero");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="overflow-hidden">
      <PageHero
        eyebrow={hero?.subheading || "Let’s Connect"}
        title={hero?.heading || "Start a Conversation"}
        subtitle={
          hero?.body ||
          "Questions, ideas, or opportunities—we would love to hear from you."
        }
      />

      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-16">
        <div
          aria-hidden
          className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-rose-100/60 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl"
        />

        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-gray-950 p-8 text-white shadow-xl shadow-gray-200 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-300">
                Talk to our team
              </p>
              <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight">
                Your next opportunity could begin with one conversation.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-gray-300">
                Reach out for skills programmes, education guidance,
                partnerships, or general enquiries.
              </p>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                <InfoCard icon={MessageCircle} label="Name">
                  {SITE_NAME}
                </InfoCard>
                <InfoCard icon={Phone} label="Call us">
                  <a
                    href={`tel:${PHONE_HREF}`}
                    className="transition hover:text-rose-300"
                  >
                    {PHONE_DISPLAY}
                  </a>
                </InfoCard>
                <InfoCard icon={MapPin} label="Visit us" wide>
                  {ADDRESS}
                </InfoCard>
                <InfoCard icon={Clock3} label="Availability" wide>
                  Contact us to arrange a visit or consultation.
                </InfoCard>
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                    Follow our journey
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">
                    Find us on social media
                  </h2>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Links coming soon
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {SOCIALS.map((social) => (
                  <div
                    key={social.label}
                    aria-disabled="true"
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600"
                  >
                    <span className="flex items-center gap-2.5">
                      <social.icon size={17} className="text-rose-600" />
                      {social.label}
                    </span>
                    <ArrowUpRight size={15} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-lg shadow-gray-100">
              <div className="relative h-72 bg-gray-100 sm:h-80">
                <iframe
                  title="Our location in Kalagedihena"
                  src={MAP_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                    <MapPin size={21} />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Our location</p>
                    <address className="mt-1 max-w-md text-sm leading-6 text-gray-500 not-italic">
                      {ADDRESS}
                    </address>
                  </div>
                </div>
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
                >
                  <Navigation size={16} />
                  Get directions
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm sm:p-9">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                    Send an enquiry
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                    Tell us how we can help
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    This is a preview interface. Message delivery will be
                    connected later.
                  </p>
                </div>
                <span className="hidden rounded-2xl bg-rose-50 p-3 text-rose-600 sm:block">
                  <Send size={21} />
                </span>
              </div>

              {submitted ? (
                <div
                  role="status"
                  className="mt-7 rounded-2xl border border-green-100 bg-green-50 p-6 text-sm leading-6 text-green-800"
                >
                  Thank you. The enquiry interface is working; delivery will be
                  connected when the final contact details are ready.
                </div>
              ) : (
                <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" name="contact-name">
                    <input
                      id="contact-name"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Full name"
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field label="Phone number" name="contact-phone">
                    <input
                      id="contact-phone"
                      name="phone"
                      autoComplete="tel"
                      placeholder="+94"
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Email address" name="contact-email">
                      <input
                        id="contact-email"
                        name="email"
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="How can we help?" name="contact-message">
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={4}
                        placeholder="Tell us a little about your enquiry..."
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-rose-700 sm:col-span-2"
                  >
                    Preview message
                    <ArrowUpRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  wide = false,
  children,
}: {
  icon: typeof Phone;
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0 text-rose-300" />
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
          <div className="mt-1 text-sm leading-6 text-white">{children}</div>
        </div>
      </div>
    </div>
  );
}

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
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
