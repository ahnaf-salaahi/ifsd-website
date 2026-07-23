"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, GraduationCap } from "lucide-react";
import PageHero from "@/components/PageHero";

type Scholarship = {
  id: string;
  title: string;
  slug: string;
  description: string;
  country: string;
  funding_type: string;
  study_level: string;
  deadline: string | null;
  apply_link: string | null;
  has_active_application_form: boolean;
};

export default function ScholarshipsClient({
  scholarships,
}: {
  scholarships: Scholarship[];
}) {
  const [countryFilter, setCountryFilter] = useState("All");
  const [fundingFilter, setFundingFilter] = useState("All");

  const countries = ["All", ...Array.from(new Set(scholarships.map((s) => s.country)))];
  const fundingTypes = ["All", ...Array.from(new Set(scholarships.map((s) => s.funding_type)))];

  const filtered = scholarships.filter((s) => {
    const countryMatch = countryFilter === "All" || s.country === countryFilter;
    const fundingMatch = fundingFilter === "All" || s.funding_type === fundingFilter;
    return countryMatch && fundingMatch;
  });

  function daysLeft(deadline: string | null) {
    if (!deadline) return null;
    const diff = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  }

  return (
    <div>
      <PageHero
        eyebrow="Edu First"
        title="Scholarship Updates"
        subtitle="Stay updated with the latest scholarship announcements, deadlines, and eligibility requirements."
      />

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 flex flex-wrap gap-3 justify-center mt-14 mb-10">
        {countries.map((c) => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              countryFilter === c
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </section>
      <section className="max-w-6xl mx-auto px-6 flex flex-wrap gap-3 justify-center mb-14">
        {fundingTypes.map((f) => (
          <button
            key={f}
            onClick={() => setFundingFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              fundingFilter === f
                ? "border-rose-600 text-rose-700 bg-rose-50"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">No scholarships match this filter yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, i) => {
              const left = daysLeft(s.deadline);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 w-fit px-3 py-1 rounded-full">
                    <GraduationCap size={14} /> {s.funding_type}
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900 text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} /> {s.country} - {s.study_level}
                  </div>
                  {s.deadline && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <CalendarDays size={16} className="text-gray-500" />
                      <span
                        className={
                          left !== null && left <= 14
                            ? "text-red-600 font-medium"
                            : "text-gray-500"
                        }
                      >
                        Deadline: {(() => {
                          const d = new Date(s.deadline!);
                          const day = String(d.getUTCDate()).padStart(2, "0");
                          const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                          const year = d.getUTCFullYear();
                          return `${day}/${month}/${year}`;
                        })()}
                        {left !== null && left >= 0 ? ` (${left} days left)` : ""}
                      </span>
                    </div>
                  )}
                  {s.has_active_application_form ? (
                    <Link
                      href={`/scholarships/${s.slug}/apply`}
                      className="mt-5 inline-block text-center bg-rose-600 text-white py-2.5 rounded-full text-sm font-medium hover:bg-rose-700 transition-colors"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <p className="mt-5 rounded-full bg-gray-100 px-4 py-2.5 text-center text-sm text-gray-500">
                      Internal applications are not currently open.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
