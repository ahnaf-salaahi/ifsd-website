"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Users,
} from "lucide-react";
import HeroJourney from "@/components/HeroJourney";
import type { PublicHomepageData } from "@/lib/cms/public-site";

const fallbackStats = [
  { id: "students", display_value: "500+", prefix: null, suffix: null, label: "Students Guided", supporting_text: null },
  { id: "scholarships", display_value: "100+", prefix: null, suffix: null, label: "Scholarships Shared", supporting_text: null },
  { id: "programmes", display_value: "20+", prefix: null, suffix: null, label: "Programmes Run", supporting_text: null },
  { id: "experience", display_value: "10+", prefix: null, suffix: null, label: "Years of Team Experience", supporting_text: null },
];

const fallbackSections = [
  { id: "fallback-hero", section_type: "hero", heading: null, subheading: null, body: null, button_label: null, button_url: null, imageUrl: null },
  { id: "fallback-statistics", section_type: "statistics", heading: null, subheading: null, body: null, button_label: null, button_url: null, imageUrl: null },
  { id: "fallback-introduction", section_type: "introduction", heading: null, subheading: null, body: null, button_label: null, button_url: null, imageUrl: null },
  { id: "fallback-cta", section_type: "call_to_action", heading: null, subheading: null, body: null, button_label: null, button_url: null, imageUrl: null },
];

type HomeData = PublicHomepageData;
type Section = HomeData["sections"][number] | (typeof fallbackSections)[number];

const safeHref = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    return new URL(value).protocol === "https:" ? value : fallback;
  } catch {
    return fallback;
  }
};

export default function HomePageClient({ data }: { data: HomeData }) {
  const sections: Section[] = data.sections.length ? data.sections : fallbackSections;
  return <div>{sections.map((section) => renderSection(section, data))}</div>;
}

function renderSection(section: Section, data: HomeData) {
  switch (section.section_type) {
    case "hero":
      return <Hero key={section.id} section={section} />;
    case "statistics":
      return <Statistics key={section.id} items={data.statistics.length ? data.statistics : fallbackStats} />;
    case "introduction":
    case "custom_content":
      return <SupportSection key={section.id} section={section} />;
    case "featured_programmes":
      return <Cards key={section.id} title={section.heading || "Featured Programmes"} items={data.programmes} />;
    case "featured_scholarships":
      return <Cards key={section.id} title={section.heading || "Featured Scholarships"} items={data.scholarships} />;
    case "featured_stories":
      return <Cards key={section.id} title={section.heading || "Success Stories"} items={data.stories} />;
    case "testimonials":
      return <Testimonials key={section.id} title={section.heading} items={data.testimonials} />;
    case "team":
      return <People key={section.id} title={section.heading || "Our Team"} items={data.team} />;
    case "partners":
      return <Partners key={section.id} title={section.heading || "Our Partners"} items={data.partners} />;
    case "faq":
      return <Faqs key={section.id} title={section.heading || "Frequently Asked Questions"} items={data.faqs} />;
    case "office_locations":
    case "contact_details":
      return data.office ? <Office key={section.id} title={section.heading} office={data.office} /> : null;
    case "call_to_action":
      return <CallToAction key={section.id} section={section} />;
    default:
      return null;
  }
}

function Hero({ section }: { section: Section }) {
  return (
    <section className="relative overflow-hidden bg-[#0B0E14]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="absolute -left-40 top-1/2 h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-[110px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-amber-400">
          {section.subheading || "Institute for Skills Development · Est. 2026"}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-white sm:text-5xl md:text-6xl">
          {section.heading || "Skills, guidance, and scholarships for Sri Lanka’s next generation."}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-slate-400">
          {section.body || "We train, mentor, and fund students and youth from classroom to career — through structured programmes, one-to-one guidance, and real scholarship access at home and abroad."}
        </motion.p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href={safeHref(section.button_url, "/scholarships")} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 font-medium text-white hover:bg-rose-500">
            {section.button_label || "Apply for Scholarship Guidance"} <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className="rounded-full border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5">Book a Consultation</Link>
        </div>
        <div className="mt-24">
          <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-slate-500">How students move through the programme</span>
          <div className="mt-10"><HeroJourney /></div>
        </div>
      </div>
    </section>
  );
}

function Statistics({ items }: { items: Array<{ id: string; display_value: string; prefix: string | null; suffix: string | null; label: string; supporting_text: string | null }> }) {
  return (
    <section className="bg-[#0B0E14]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 border-t border-white/10 px-6 py-12 md:grid-cols-4">
        {items.map((item) => <div key={item.id}><div className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-white">{item.prefix}{item.display_value}{item.suffix}</div><div className="mt-1.5 text-xs uppercase tracking-wide text-slate-500">{item.label}</div>{item.supporting_text && <p className="mt-1 text-xs text-slate-600">{item.supporting_text}</p>}</div>)}
      </div>
    </section>
  );
}

function SupportSection({ section }: { section: Section }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 max-w-xl"><h2 className="text-3xl font-semibold text-gray-900">{section.heading || "How We Support You"}</h2><p className="mt-3 whitespace-pre-line text-gray-600">{section.body || "From scholarship guidance to leadership training, structured support at every stage of a student’s journey."}</p></div>
      <div className="grid gap-5 md:grid-cols-4">
        {[[GraduationCap,"Scholarship Guidance"],[Users,"Leadership & Skills Training"],[HeartHandshake,"Mentoring"],[Megaphone,"Media & Digital Training"],[Compass,"Community Programmes"]].map(([Icon,label], index) => <article key={String(label)} className={`${index === 0 ? "bg-gray-900 text-white md:col-span-2" : "border border-gray-100 bg-white text-gray-900"} rounded-3xl p-7 shadow-sm`}><Icon className="text-rose-500" size={28}/><h3 className="mt-4 text-lg font-semibold">{String(label)}</h3></article>)}
      </div>
    </section>
  );
}

type CardItem = { id: string; heading: string; summary: string | null; imageUrl?: string | null; ctaLabel: string; ctaUrl: string };
function Cards({ title, items }: { title: string; items: CardItem[] }) {
  if (!items.length) return null;
  return <section className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-semibold text-gray-900">{title}</h2><div className="mt-10 grid gap-6 md:grid-cols-3">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">{item.imageUrl && <div className="relative aspect-[16/9]"><Image src={item.imageUrl} alt="" fill unoptimized className="object-cover"/></div>}<div className="p-6"><h3 className="text-xl font-semibold">{item.heading}</h3>{item.summary && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{item.summary}</p>}<Link href={safeHref(item.ctaUrl, "/")} className="mt-5 inline-flex items-center gap-2 font-medium text-rose-600">{item.ctaLabel}<ArrowRight size={16}/></Link></div></article>)}</div></section>;
}

function Testimonials({ title, items }: { title: string | null; items: HomeData["testimonials"] }) {
  if (!items.length) return null;
  return <section className="bg-rose-50/50 py-20"><div className="mx-auto max-w-7xl px-6"><h2 className="text-3xl font-semibold">{title || "What Students Say"}</h2><div className="mt-10 grid gap-6 md:grid-cols-3">{items.map((item) => <blockquote key={item.id} className="rounded-3xl bg-white p-7 shadow-sm"><p className="text-gray-700">“{item.quote}”</p><footer className="mt-5 flex items-center gap-3">{item.imageUrl && <Image src={item.imageUrl} alt="" width={48} height={48} unoptimized className="h-12 w-12 rounded-full object-cover"/>}<div><cite className="not-italic font-semibold">{item.author_name}</cite><p className="text-xs text-gray-500">{item.author_role || item.organisation}</p></div></footer></blockquote>)}</div></div></section>;
}

function People({ title, items }: { title: string; items: HomeData["team"] }) {
  if (!items.length) return null;
  return <section className="mx-auto max-w-7xl px-6 py-20"><h2 className="text-3xl font-semibold">{title}</h2><div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">{items.map((item) => <article key={item.id} className="text-center">{item.imageUrl ? <Image src={item.imageUrl} alt={item.full_name} width={240} height={240} unoptimized className="mx-auto aspect-square rounded-3xl object-cover"/> : <div className="mx-auto aspect-square rounded-3xl bg-gray-100"/>}<h3 className="mt-4 font-semibold">{item.full_name}</h3><p className="text-sm text-gray-500">{item.designation}</p></article>)}</div></section>;
}

function Partners({ title, items }: { title: string; items: HomeData["partners"] }) {
  if (!items.length) return null;
  return <section className="mx-auto max-w-7xl px-6 py-16"><h2 className="text-center text-2xl font-semibold">{title}</h2><div className="mt-8 flex flex-wrap items-center justify-center gap-8">{items.map((item) => { const logo = item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={160} height={80} unoptimized className="h-16 w-36 object-contain"/> : <span className="font-medium text-gray-600">{item.name}</span>; return item.website_url ? <a key={item.id} href={safeHref(item.website_url, "#")} target="_blank" rel="noopener noreferrer">{logo}<span className="sr-only"> (opens in a new tab)</span></a> : <div key={item.id}>{logo}</div>; })}</div></section>;
}

function Faqs({ title, items }: { title: string; items: HomeData["faqs"] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!items.length) return null;
  return <section className="mx-auto max-w-3xl px-6 py-20"><h2 className="text-3xl font-semibold">{title}</h2><div className="mt-8 divide-y rounded-2xl border">{items.map((item) => <div key={item.id} className="p-5"><button className="flex w-full justify-between text-left font-medium" aria-expanded={open === item.id} aria-controls={`faq-${item.id}`} onClick={() => setOpen(open === item.id ? null : item.id)}>{item.question}<span aria-hidden>{open === item.id ? "−" : "+"}</span></button>{open === item.id && <p id={`faq-${item.id}`} className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.answer}</p>}</div>)}</div></section>;
}

function Office({ title, office }: { title: string | null; office: NonNullable<HomeData["office"]> }) {
  return <section className="mx-auto max-w-7xl px-6 py-20"><div className="rounded-3xl bg-gray-900 p-8 text-white md:p-12"><h2 className="text-3xl font-semibold">{title || "Visit or Contact Us"}</h2><div className="mt-6 grid gap-3 text-slate-300 md:grid-cols-2"><p>{[office.address_line_1,office.address_line_2,office.city,office.country].filter(Boolean).join(", ")}</p><div>{office.email && <p><a href={`mailto:${office.email}`}>{office.email}</a></p>}{office.phone && <p><a href={`tel:${office.phone.replace(/[^\d+]/g,"")}`}>{office.phone}</a></p>}{office.map_url && <a href={safeHref(office.map_url, "#")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-rose-300">View map</a>}</div></div></div></section>;
}

function CallToAction({ section }: { section: Section }) {
  return <section className="relative overflow-hidden bg-[#0B0E14] py-24"><div className="relative mx-auto max-w-2xl px-6 text-center"><span className="text-xs uppercase tracking-[0.2em] text-amber-400">{section.subheading || "Applications open"}</span><h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">{section.heading || "Ready to take the next step in your education journey?"}</h2>{section.body && <p className="mt-4 text-slate-400">{section.body}</p>}<Link href={safeHref(section.button_url, "/contact")} className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-medium text-gray-900">{section.button_label || "Join Our Programmes"}<ArrowRight size={16}/></Link></div></section>;
}
