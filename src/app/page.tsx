"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Megaphone,
  HeartHandshake,
  Compass,
  ArrowRight,
} from "lucide-react";
import HeroJourney from "@/components/HeroJourney";

const stats = [
  { value: "500+", label: "Students Guided" },
  { value: "100+", label: "Scholarships Shared" },
  { value: "20+", label: "Programmes Run" },
  { value: "10+", label: "Years of Team Experience" },
];

export default function Home() {
  return (
    <div>
      {/* ===== Dark signature zone: Hero + Journey ===== */}
      <section className="relative bg-[#0B0E14] overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-rose-600/20 blur-[120px]" />
          <div className="absolute top-1/2 -left-40 w-[26rem] h-[26rem] rounded-full bg-amber-400/10 blur-[110px]" />
        </div>

        {/* Faint grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-amber-400 uppercase"
          >
            Institute for Skills Development · Est. 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.08] mt-5 max-w-3xl"
          >
            Skills, guidance, and scholarships for Sri Lanka&apos;s next
            generation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg mt-6 max-w-xl leading-relaxed"
          >
            We train, mentor, and fund students and youth from classroom to
            career — through structured programmes, one-to-one guidance, and
            real scholarship access at home and abroad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mt-9"
          >
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-full font-medium hover:bg-rose-500 transition-colors"
            >
              Apply for Scholarship Guidance
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              Book a Consultation
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="font-[family-name:var(--font-mono)] text-xs text-slate-500 mt-6 tracking-wide"
          >
            Now guiding students for the 2026 scholarship intake
          </motion.p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="font-[family-name:var(--font-mono)] text-3xl md:text-4xl font-semibold text-white">
                  {s.value}
                </div>
                <div className="text-slate-500 text-xs uppercase tracking-wide mt-1.5">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Journey */}
          <div className="mt-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-slate-500 uppercase"
            >
              How students move through the programme
            </motion.span>
            <div className="mt-10">
              <HeroJourney />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Light zone: Services bento grid ===== */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-xl mb-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            How We Support You
          </h2>
          <p className="mt-3 text-gray-600">
            From scholarship guidance to leadership training, structured
            support at every stage of a student&apos;s journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5">
          {/* Large tile */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 md:row-span-2 bg-gray-900 rounded-3xl p-8 flex flex-col justify-between text-white"
          >
            <div>
              <GraduationCap size={30} className="text-rose-400" />
              <h3 className="mt-5 text-2xl font-semibold">
                Scholarship Guidance
              </h3>
              <p className="mt-3 text-slate-400 leading-relaxed max-w-sm">
                Regular updates on local and international scholarship
                opportunities for undergraduate and postgraduate studies —
                Malaysia, Turkey, Pakistan, Sri Lanka, and beyond.
              </p>
            </div>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 text-rose-400 font-medium mt-8 hover:text-rose-300 transition-colors"
            >
              Explore scholarships <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-7 shadow-sm"
          >
            <Users size={26} className="text-rose-600" />
            <h3 className="mt-4 font-semibold text-gray-900 text-lg">
              Leadership & Skills Training
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Communication, leadership, and personal development programmes
              for students and youth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm"
          >
            <HeartHandshake size={26} className="text-rose-600" />
            <h3 className="mt-4 font-semibold text-gray-900 text-lg">
              Mentoring
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              One-to-one guidance from experienced mentors and consultants.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm"
          >
            <Megaphone size={26} className="text-rose-600" />
            <h3 className="mt-4 font-semibold text-gray-900 text-lg">
              Media & Digital Training
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Responsible, effective use of media and digital platforms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm"
          >
            <Compass size={26} className="text-rose-600" />
            <h3 className="mt-4 font-semibold text-gray-900 text-lg">
              Community Programmes
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              CBO-level activities and community engagement initiatives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== Dark CTA band (bookends the hero) ===== */}
      <section className="relative bg-[#0B0E14] py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] bg-rose-600/15 blur-[120px] rounded-full" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-amber-400 uppercase">
            Applications open
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-semibold text-white mt-4"
          >
            Ready to take the next step in your education journey?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-9"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Join Our Programmes
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
