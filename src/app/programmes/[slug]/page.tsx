import { cache, type ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MonitorSmartphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type {
  ProgrammeModuleRecord,
  ProgrammeOutcomeRecord,
  ProgrammeRecord,
} from "@/lib/programmes";

export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getPublishedProgramme = cache(async (slug: string) => {
  const supabase = await createClient();
  return supabase
    .from("programmes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
});

function metadataDescription(programme: ProgrammeRecord) {
  const description =
    programme.seo_description ||
    programme.short_summary ||
    programme.full_description ||
    programme.description ||
    `Learn more about ${programme.title}.`;

  return description.replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: programme } = await getPublishedProgramme(slug);

  if (!programme) {
    return {
      title: "Programme Not Found | Institute for Skills Development",
      robots: { index: false, follow: false },
    };
  }

  const typedProgramme = programme as ProgrammeRecord;
  return {
    title:
      typedProgramme.seo_title ||
      `${typedProgramme.title} | Institute for Skills Development`,
    description: metadataDescription(typedProgramme),
  };
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await getPublishedProgramme(slug);

  if (error) {
    throw new Error(`Could not load Programme: ${error.message}`);
  }
  if (!data) notFound();

  const programme = data as ProgrammeRecord;
  const supabase = await createClient();
  const [
    { data: modules, error: modulesError },
    { data: outcomes, error: outcomesError },
  ] = await Promise.all([
    supabase
      .from("programme_modules")
      .select("id, programme_id, title, description, display_order")
      .eq("programme_id", programme.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("programme_learning_outcomes")
      .select("id, programme_id, outcome, display_order")
      .eq("programme_id", programme.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (modulesError || outcomesError) {
    throw new Error(
      `Could not load Programme details: ${
        modulesError?.message ?? outcomesError?.message
      }`
    );
  }

  let displayImageUrl = programme.image_url;
  if (programme.featured_image_path) {
    const { data: signedImage } = await supabase.storage
      .from("content-images")
      .createSignedUrl(programme.featured_image_path, 3600);
    displayImageUrl = signedImage?.signedUrl ?? displayImageUrl;
  }

  const facts = [
    programme.duration && {
      icon: Clock,
      label: "Duration",
      value: programme.duration,
    },
    programme.delivery_mode && {
      icon: MonitorSmartphone,
      label: "Delivery mode",
      value: programme.delivery_mode,
    },
    programme.location && {
      icon: MapPin,
      label: "Location",
      value: programme.location,
    },
    programme.fees && {
      icon: GraduationCap,
      label: "Fees",
      value: programme.fees,
    },
    programme.start_date && {
      icon: CalendarDays,
      label: "Start date",
      value: formatDate(programme.start_date),
    },
    programme.application_deadline && {
      icon: CalendarDays,
      label: "Application deadline",
      value: formatDate(programme.application_deadline),
    },
  ].filter(Boolean) as Array<{
    icon: typeof Clock;
    label: string;
    value: string;
  }>;

  return (
    <article className="pb-24">
      <header className="relative overflow-hidden bg-[#0B0E14]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[22rem] w-[22rem] rounded-full bg-amber-400/10 blur-[100px]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <Link
              href="/programmes"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} /> All Programmes
            </Link>

            <div className="mt-8 flex flex-wrap gap-2">
              {programme.featured && (
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-300">
                  Featured Programme
                </span>
              )}
              {programme.category && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize text-slate-300">
                  {programme.category}
                </span>
              )}
            </div>

            <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {programme.title}
            </h1>
            {(programme.short_summary || programme.description) && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {programme.short_summary || programme.description}
              </p>
            )}
          </div>

          {displayImageUrl && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
              <Image
                src={displayImageUrl}
                alt={programme.title}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-12">
        {facts.length > 0 && (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <fact.icon size={16} className="text-rose-600" />
                  {fact.label}
                </dt>
                <dd className="mt-2 text-sm font-medium text-gray-900">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="min-w-0 space-y-10">
            <DetailSection title="About this Programme">
              <div className="whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">
                {programme.full_description || programme.description}
              </div>
            </DetailSection>

            {(modules ?? []).length > 0 && (
              <DetailSection title="Course modules">
                <div className="space-y-3">
                  {(modules as ProgrammeModuleRecord[]).map((module, index) => (
                    <div
                      key={module.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

            {(outcomes ?? []).length > 0 && (
              <DetailSection title="Learning outcomes">
                <ul className="space-y-3">
                  {(outcomes as ProgrammeOutcomeRecord[]).map((outcome) => (
                    <li
                      key={outcome.id}
                      className="flex items-start gap-3 text-sm leading-6 text-gray-700 sm:text-base"
                    >
                      <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-rose-600"
                      />
                      <span>{outcome.outcome}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {programme.eligibility && (
              <DetailSection title="Eligibility">
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">
                  {programme.eligibility}
                </p>
              </DetailSection>
            )}

            {programme.entry_requirements && (
              <DetailSection title="Entry requirements">
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">
                  {programme.entry_requirements}
                </p>
              </DetailSection>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {programme.certification && (
              <InfoCard
                icon={<Award size={20} />}
                title="Certification"
                content={programme.certification}
              />
            )}
            {programme.contact_details && (
              <InfoCard
                icon={<Mail size={20} />}
                title="Contact details"
                content={programme.contact_details}
              />
            )}
            {programme.application_link && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6">
                <h2 className="font-semibold text-gray-900">
                  Interested in this Programme?
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Use the link below to apply or contact the Programme team.
                </p>
                <a
                  href={programme.application_link}
                  target={
                    /^https?:\/\//i.test(programme.application_link)
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    /^https?:\/\//i.test(programme.application_link)
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                >
                  Apply or enquire <ExternalLink size={16} />
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-gray-900">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  content,
}: {
  icon: ReactNode;
  title: string;
  content: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-rose-600">
        {icon}
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
        {content}
      </p>
    </section>
  );
}
