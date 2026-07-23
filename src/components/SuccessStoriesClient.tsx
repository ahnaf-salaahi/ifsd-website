"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Quote, Star } from "lucide-react";
import PageHero from "@/components/PageHero";

export type PublicSuccessStory = {
  id: string;
  slug: string;
  person_name: string;
  story_title: string;
  short_summary: string | null;
  testimonial_quote: string | null;
  role_or_achievement: string | null;
  location: string | null;
  featured: boolean;
  profile_image_url: string | null;
  cover_image_url: string | null;
};

export default function SuccessStoriesClient({
  stories,
}: {
  stories: PublicSuccessStory[];
}) {
  return (
    <div>
      <PageHero
        eyebrow="Success Stories"
        title="Success Stories"
        subtitle="Real stories from students, parents, and mentors we have worked with."
      />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        {stories.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              No stories published yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please check back as we add stories from our community.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, index) => (
              <motion.article
                key={story.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 6) * 0.07 }}
                whileHover={{ y: -5 }}
                className={`overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${
                  story.featured
                    ? "border-rose-100 bg-rose-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <Link
                  href={`/success-stories/${story.slug}`}
                  className="flex h-full flex-col"
                >
                  {story.cover_image_url && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <Image
                        src={story.cover_image_url}
                        alt={story.story_title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      <Quote className="text-rose-600" size={25} />
                      {story.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          <Star size={12} fill="currentColor" /> Featured
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                      {story.story_title}
                    </h2>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-600">
                      {story.testimonial_quote || story.short_summary}
                    </p>

                    <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                      {story.profile_image_url && (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={story.profile_image_url}
                            alt={story.person_name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {story.person_name}
                        </p>
                        {story.role_or_achievement && (
                          <p className="truncate text-xs text-gray-500">
                            {story.role_or_achievement}
                          </p>
                        )}
                      </div>
                    </div>

                    {story.location && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={13} /> {story.location}
                      </span>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rose-700">
                      Read the story <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
