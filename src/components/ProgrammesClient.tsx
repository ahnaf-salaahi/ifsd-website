"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  MonitorSmartphone,
  Star,
} from "lucide-react";
import PageHero from "@/components/PageHero";

export type PublicProgramme = {
  id: string;
  title: string;
  slug: string;
  short_summary: string | null;
  full_description: string;
  description: string | null;
  category: string | null;
  delivery_mode: string | null;
  duration: string | null;
  location: string | null;
  featured: boolean;
  display_image_url: string | null;
};

export default function ProgrammesClient({
  programmes,
}: {
  programmes: PublicProgramme[];
}) {
  return (
    <div>
      <PageHero
        eyebrow="Programmes"
        title="Our Programmes"
        subtitle="Structured programmes designed for students, youth, and community groups."
      />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        {programmes.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              No programmes published yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please check back soon for upcoming learning opportunities.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {programmes.map((programme, index) => (
              <motion.article
                key={programme.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
                whileHover={{ y: -5 }}
                className={`overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${
                  programme.featured
                    ? "border-rose-100 bg-rose-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <Link
                  href={`/programmes/${programme.slug}`}
                  className="flex h-full flex-col"
                >
                  {programme.display_image_url && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={programme.display_image_url}
                        alt={programme.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {programme.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          <Star size={13} fill="currentColor" /> Featured
                        </span>
                      )}
                      {programme.category && (
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                          {programme.category}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-gray-900">
                      {programme.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {programme.short_summary ||
                        programme.full_description ||
                        programme.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      {programme.duration && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} /> {programme.duration}
                        </span>
                      )}
                      {programme.delivery_mode && (
                        <span className="inline-flex items-center gap-1.5">
                          <MonitorSmartphone size={14} />
                          {programme.delivery_mode}
                        </span>
                      )}
                      {programme.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} /> {programme.location}
                        </span>
                      )}
                    </div>

                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rose-700">
                      View Programme <ArrowRight size={16} />
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
