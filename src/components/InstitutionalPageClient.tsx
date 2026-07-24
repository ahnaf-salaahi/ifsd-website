"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Heart,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import type { InstitutionalPageData } from "@/lib/institutional-public";

const fallbackValues = [
  { title: "Education First", description: "We believe education is the foundation for personal and social development.", icon: BookOpen },
  { title: "Empowerment", description: "We support youth to identify their strengths and build their future.", icon: Sparkles },
  { title: "Integrity", description: "We provide honest, transparent, and reliable guidance.", icon: ShieldCheck },
  { title: "Inclusiveness", description: "We support students from different communities and backgrounds.", icon: Users },
  { title: "Social Responsibility", description: "We encourage youth to contribute positively to society.", icon: Heart },
  { title: "Excellence", description: "We aim to provide professional and result-oriented support.", icon: Target },
];

const FALLBACK_SECTIONS = [
  { id: "hero", section_type: "hero", heading: "About Us", subheading: "Who We Are", body: "A skills-focused educational and youth development organization, established in 2026.", button_label: null, button_url: null, content_config: {}, imageUrl: null },
  { id: "intro", section_type: "introduction", heading: null, subheading: null, body: "Institute for Skills Development (Pvt) Ltd aims to create skilled, responsible, socially aware, and future-ready youth through structured training, mentorship, educational guidance, leadership development, and community engagement programmes.\n\nWe work with students, youth groups, community-based organizations, education institutions, mentors, professionals, and parents to provide practical knowledge, career direction, higher education support, and personal development opportunities.", button_label: null, button_url: null, content_config: {}, imageUrl: null },
  { id: "vision", section_type: "vision", heading: "Vision", subheading: null, body: "To empower students and youth with knowledge, skills, values, and guidance to achieve educational success, career development, and positive social contribution.", button_label: null, button_url: null, content_config: {}, imageUrl: null },
  { id: "mission", section_type: "mission", heading: "Mission", subheading: null, body: "To provide quality skills development, scholarship guidance, leadership training, mentoring, and community-based educational support that help young people become confident, capable, and socially responsible individuals.", button_label: null, button_url: null, content_config: {}, imageUrl: null },
  { id: "education-first", section_type: "custom_content", heading: "Education First", subheading: null, body: "We place education at the centre of personal development, opportunity, and positive social change.", button_label: null, button_url: null, content_config: {}, imageUrl: null },
  { id: "services", section_type: "custom_content", heading: "What We Do", subheading: null, body: "Skills development and training\nScholarship and higher-education guidance\nCareer guidance and mentoring\nLeadership and personality development\nCommunity education and youth engagement", button_label: null, button_url: null, content_config: {}, imageUrl: null },
  { id: "values", section_type: "values", heading: "Our Core Values", subheading: null, body: null, button_label: null, button_url: null, content_config: {}, imageUrl: null },
];

type Section = InstitutionalPageData["sections"][number] | (typeof FALLBACK_SECTIONS)[number];

export default function InstitutionalPageClient({
  data,
}: {
  data: InstitutionalPageData;
}) {
  const sections: Section[] = data.sections.length
    ? data.sections
    : FALLBACK_SECTIONS;
  return <div>{sections.map((section) => renderSection(section, data))}</div>;
}

function renderSection(section: Section, data: InstitutionalPageData) {
  switch (section.section_type) {
    case "hero":
      return <PageHero key={section.id} eyebrow={section.subheading || "Who We Are"} title={section.heading || "About Us"} subtitle={section.body || ""} />;
    case "introduction":
    case "custom_content":
    case "history":
    case "leadership_message":
      return <TextSection key={section.id} section={section} />;
    case "vision":
    case "mission":
      return <Statement key={section.id} section={section} />;
    case "values":
      return <Values key={section.id} section={section} />;
    case "statistics":
    case "timeline":
    case "achievements":
      return <StructuredItems key={section.id} section={section} />;
    case "team":
      return <Team key={section.id} title={section.heading || "Our Team"} items={data.team} />;
    case "partners":
      return <Partners key={section.id} title={section.heading || "Our Partners"} items={data.partners} />;
    case "office_locations":
      return <Offices key={section.id} title={section.heading || "Our Offices"} items={data.offices} />;
    case "faq":
      return <Faqs key={section.id} title={section.heading || "Frequently Asked Questions"} items={data.faqs} />;
    case "call_to_action":
      return <CallToAction key={section.id} section={section} />;
    default:
      console.warn("Skipping unknown institutional section", {
        sectionType: section.section_type,
      });
      return null;
  }
}

function TextSection({ section }: { section: Section }) {
  if (!section.heading && !section.body) return null;
  return <section className="mx-auto max-w-4xl px-6 py-16 text-center">{section.imageUrl && <Image src={section.imageUrl} alt="" width={960} height={540} unoptimized className="mb-8 aspect-video w-full rounded-3xl object-cover"/>}{section.heading && <h2 className="text-3xl font-semibold text-gray-900">{section.heading}</h2>}{section.body && <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-gray-600">{section.body}</p>}</section>;
}

function Statement({ section }: { section: Section }) {
  if (!section.body) return null;
  return <section className="mx-auto max-w-5xl px-6 py-6"><div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"><h2 className="text-xl font-semibold text-rose-700">{section.heading || section.section_type}</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">{section.body}</p></div></section>;
}

function Values({ section }: { section: Section }) {
  const configured = parseValues(section.content_config);
  const items = configured.length ? configured : fallbackValues;
  return <section className="mx-auto max-w-6xl px-6 py-20"><h2 className="text-center text-3xl font-semibold text-gray-900">{section.heading || "Our Core Values"}</h2><div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <motion.article key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><item.icon className="text-rose-600" size={28}/><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p></motion.article>)}</div></section>;
}

function parseValues(value: unknown): typeof fallbackValues {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const items = (value as Record<string, unknown>).items;
  if (!Array.isArray(items)) return [];
  return items
    .flatMap((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const record = item as Record<string, unknown>;
      const title =
        typeof record.title === "string" ? record.title.trim() : "";
      const description =
        typeof record.description === "string"
          ? record.description.trim()
          : "";
      return title && description
        ? [{ title, description, icon: Target }]
        : [];
    })
    .slice(0, 24);
}

function StructuredItems({ section }: { section: Section }) {
  const items = parseStructuredItems(section.content_config);
  if (!section.heading && !section.body && !items.length) return null;
  return <section className="mx-auto max-w-6xl px-6 py-16"><div className="text-center">{section.heading && <h2 className="text-3xl font-semibold text-gray-900">{section.heading}</h2>}{section.body && <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line text-gray-600">{section.body}</p>}</div>{items.length > 0 && <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="font-semibold text-gray-900">{item.title}</h3>{item.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.description}</p>}</article>)}</div>}</section>;
}

function parseStructuredItems(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const items = (value as Record<string, unknown>).items;
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const titleSource = record.title ?? record.label ?? record.value ?? record.year;
    const descriptionSource = record.description ?? record.body ?? record.text;
    const title = typeof titleSource === "string" || typeof titleSource === "number" ? String(titleSource).trim() : "";
    const description = typeof descriptionSource === "string" ? descriptionSource.trim() : "";
    return title ? [{ title, description }] : [];
  }).slice(0, 48);
}

function Team({ title, items }: { title: string; items: InstitutionalPageData["team"] }) {
  if (!items.length) return null;
  return <section className="mx-auto max-w-6xl px-6 py-20"><h2 className="text-center text-3xl font-semibold">{title}</h2><div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">{items.map((item) => <article key={item.id} className="text-center">{item.imageUrl ? <Image src={item.imageUrl} alt={item.full_name} width={240} height={240} unoptimized className="mx-auto aspect-square rounded-3xl object-cover"/> : <div className="mx-auto aspect-square rounded-3xl bg-gray-100"/>}<h3 className="mt-4 font-semibold">{item.full_name}</h3><p className="text-sm text-gray-500">{item.designation}</p>{item.biography && <p className="mt-2 line-clamp-4 text-sm text-gray-600">{item.biography}</p>}{safeHttps(item.linkedin_url) && <a href={item.linkedin_url!} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-rose-700">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>}</article>)}</div></section>;
}

function Partners({ title, items }: { title: string; items: InstitutionalPageData["partners"] }) {
  if (!items.length) return null;
  return <section className="mx-auto max-w-6xl px-6 py-16"><h2 className="text-center text-3xl font-semibold">{title}</h2><div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5 text-center">{item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={180} height={90} unoptimized className="mx-auto h-20 object-contain"/> : <h3 className="font-semibold">{item.name}</h3>}{item.description && <p className="mt-3 text-sm text-gray-600">{item.description}</p>}{safeHttps(item.website_url) && <a href={item.website_url!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-rose-700">Visit website<span className="sr-only"> (opens in a new tab)</span></a>}</article>)}</div></section>;
}

function Offices({ title, items }: { title: string; items: InstitutionalPageData["offices"] }) {
  if (!items.length) return null;
  return <section className="mx-auto max-w-6xl px-6 py-20"><h2 className="text-3xl font-semibold">{title}</h2><div className="mt-8 grid gap-6 md:grid-cols-2">{items.map((office) => <address key={office.id} className="rounded-2xl border bg-white p-6 not-italic shadow-sm"><h3 className="font-semibold">{office.name}{office.is_primary ? " · Primary" : ""}</h3><p className="mt-3 text-sm text-gray-600">{[office.address_line_1, office.address_line_2, office.city, office.country].filter(Boolean).join(", ")}</p>{office.phone && <a className="mt-2 block text-sm text-rose-700" href={`tel:${office.phone.replace(/[^\d+]/g, "")}`}>{office.phone}</a>}{office.email && <a className="mt-1 block break-all text-sm text-rose-700" href={`mailto:${office.email}`}>{office.email}</a>}{office.office_hours && <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{office.office_hours}</p>}{safeHttps(office.map_url) && <a href={office.map_url!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-rose-700">View map<span className="sr-only"> (opens in a new tab)</span></a>}</address>)}</div></section>;
}

function Faqs({ title, items }: { title: string; items: InstitutionalPageData["faqs"] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!items.length) return null;
  return <section className="mx-auto max-w-3xl px-6 py-20"><h2 className="text-3xl font-semibold">{title}</h2><div className="mt-8 divide-y rounded-2xl border">{items.map((item) => <div key={item.id} className="p-5"><button className="flex w-full justify-between text-left font-medium" aria-expanded={open === item.id} aria-controls={`institutional-faq-${item.id}`} onClick={() => setOpen(open === item.id ? null : item.id)}>{item.question}<span aria-hidden>{open === item.id ? "−" : "+"}</span></button>{open === item.id && <p id={`institutional-faq-${item.id}`} className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.answer}</p>}</div>)}</div></section>;
}

function CallToAction({ section }: { section: Section }) {
  const href = safeLink(section.button_url);
  if (!section.heading && !section.body) return null;
  return <section className="bg-gray-900 py-20 text-center text-white"><div className="mx-auto max-w-2xl px-6"><h2 className="text-3xl font-semibold">{section.heading}</h2>{section.body && <p className="mt-4 text-slate-300">{section.body}</p>}{href && section.button_label && <Link href={href} className="mt-7 inline-flex rounded-full bg-rose-600 px-6 py-3 font-medium">{section.button_label}</Link>}</div></section>;
}

function safeHttps(value: string | null) {
  if (!value) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function safeLink(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return safeHttps(value) ? value : null;
}
