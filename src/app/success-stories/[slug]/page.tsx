import { cache, type ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  MapPin,
  Quote,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { SuccessStoryRecord } from "@/lib/success-stories";

export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

type RelatedContent = {
  type: "programme" | "scholarship";
  title: string;
  href?: string;
};

const getPublishedStory = cache(async (slug: string) => {
  const supabase = await createClient();
  return supabase
    .from("success_stories")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
});

function metadataDescription(story: SuccessStoryRecord) {
  return (
    story.seo_description ||
    story.short_summary ||
    story.testimonial_quote ||
    story.full_story ||
    `Read ${story.person_name}'s success story.`
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getPublishedStory(slug);

  if (!data) {
    return {
      title: "Success Story Not Found | Institute for Skills Development",
      robots: { index: false, follow: false },
    };
  }

  const story = data as SuccessStoryRecord;
  return {
    title:
      story.seo_title ||
      `${story.story_title} | Institute for Skills Development`,
    description: metadataDescription(story),
  };
}

export default async function SuccessStoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await getPublishedStory(slug);

  if (error) throw new Error(`Could not load Success Story: ${error.message}`);
  if (!data) notFound();

  const story = data as SuccessStoryRecord;
  const supabase = await createClient();

  let relatedContent: RelatedContent | null = null;
  if (story.programme_id) {
    const { data: programme } = await supabase
      .from("programmes")
      .select("title, slug")
      .eq("id", story.programme_id)
      .eq("published", true)
      .maybeSingle();
    if (programme) {
      relatedContent = {
        type: "programme",
        title: programme.title,
        href: `/programmes/${programme.slug}`,
      };
    }
  } else if (story.scholarship_id) {
    const { data: scholarship } = await supabase
      .from("scholarships")
      .select("title")
      .eq("id", story.scholarship_id)
      .eq("published", true)
      .maybeSingle();
    if (scholarship) {
      relatedContent = {
        type: "scholarship",
        title: scholarship.title,
      };
    }
  }

  const [profileResult, coverResult] = await Promise.all([
    story.profile_image_path
      ? supabase.storage
          .from("content-images")
          .createSignedUrl(story.profile_image_path, 3600)
      : Promise.resolve({ data: null }),
    story.cover_image_path
      ? supabase.storage
          .from("content-images")
          .createSignedUrl(story.cover_image_path, 3600)
      : Promise.resolve({ data: null }),
  ]);
  const profileImageUrl = profileResult.data?.signedUrl ?? null;
  const coverImageUrl = coverResult.data?.signedUrl ?? null;
  const youtubeEmbedUrl = story.video_url
    ? getYouTubeEmbedUrl(story.video_url)
    : null;

  const facts = [
    story.institution_or_employer && {
      icon: Building2,
      label: "Institution or employer",
      value: story.institution_or_employer,
    },
    story.role_or_achievement && {
      icon: Award,
      label: "Role or achievement",
      value: story.role_or_achievement,
    },
    story.completion_year && {
      icon: CalendarDays,
      label: "Completion year",
      value: String(story.completion_year),
    },
    story.location && {
      icon: MapPin,
      label: "Location",
      value: story.location,
    },
  ].filter(Boolean) as Array<{
    icon: typeof Award;
    label: string;
    value: string;
  }>;

  return (
    <article className="pb-24">
      <header className="relative overflow-hidden bg-[#0B0E14]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[22rem] w-[22rem] rounded-full bg-amber-400/10 blur-[100px]" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <Link
            href="/success-stories"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> All Success Stories
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              {story.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-300">
                  <Star size={13} fill="currentColor" /> Featured Story
                </span>
              )}
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                {story.story_title}
              </h1>
              {story.short_summary && (
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  {story.short_summary}
                </p>
              )}

              <div className="mt-8 flex items-center gap-4">
                {profileImageUrl && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-slate-800">
                    <Image
                      src={profileImageUrl}
                      alt={story.person_name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{story.person_name}</p>
                  {story.role_or_achievement && (
                    <p className="mt-1 text-sm text-slate-400">
                      {story.role_or_achievement}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {coverImageUrl && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                <Image
                  src={coverImageUrl}
                  alt={story.story_title}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-12">
        {facts.length > 0 && (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            {story.testimonial_quote && (
              <blockquote className="rounded-2xl border border-rose-100 bg-rose-50 p-6 sm:p-8">
                <Quote size={30} className="text-rose-600" />
                <p className="mt-4 whitespace-pre-line text-lg font-medium leading-8 text-gray-800 sm:text-xl">
                  “{story.testimonial_quote}”
                </p>
                <footer className="mt-4 text-sm font-semibold text-gray-600">
                  — {story.person_name}
                </footer>
              </blockquote>
            )}

            <DetailSection title="The full story">
              <div className="whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">
                {story.full_story}
              </div>
            </DetailSection>

            {story.before_after_description && (
              <DetailSection title="The journey: before and after">
                <div className="whitespace-pre-line rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm leading-7 text-gray-700 sm:text-base">
                  {story.before_after_description}
                </div>
              </DetailSection>
            )}

            {story.video_url && (
              <DetailSection title="Watch the story">
                {youtubeEmbedUrl ? (
                  <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-sm">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={`${story.story_title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <a
                    href={story.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    Watch video <ExternalLink size={16} />
                  </a>
                )}
              </DetailSection>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-rose-600">
                <BriefcaseBusiness size={20} />
                <h2 className="font-semibold text-gray-900">About</h2>
              </div>
              <p className="mt-4 font-semibold text-gray-900">
                {story.person_name}
              </p>
              {story.institution_or_employer && (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {story.institution_or_employer}
                </p>
              )}
              {story.role_or_achievement && (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {story.role_or_achievement}
                </p>
              )}
            </section>

            {relatedContent && (
              <section className="rounded-2xl border border-rose-100 bg-rose-50 p-6">
                <div className="flex items-center gap-2 text-rose-600">
                  <GraduationCap size={20} />
                  <h2 className="font-semibold capitalize text-gray-900">
                    Related {relatedContent.type}
                  </h2>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-gray-800">
                  {relatedContent.title}
                </p>
                {relatedContent.href && (
                  <Link
                    href={relatedContent.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-700 hover:underline"
                  >
                    View Programme <ExternalLink size={15} />
                  </Link>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    let videoId = "";
    if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1).split("/")[0];
    } else if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      else if (url.pathname.startsWith("/embed/"))
        videoId = url.pathname.split("/")[2] ?? "";
      else if (url.pathname.startsWith("/shorts/"))
        videoId = url.pathname.split("/")[2] ?? "";
    }
    return /^[A-Za-z0-9_-]{6,20}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
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
