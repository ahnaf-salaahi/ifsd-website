"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, ShieldCheck, Heart, Sparkles, Target } from "lucide-react";

const values = [
  { icon: BookOpen, title: "Education First", desc: "We believe education is the foundation for personal and social development." },
  { icon: Sparkles, title: "Empowerment", desc: "We support youth to identify their strengths and build their future." },
  { icon: ShieldCheck, title: "Integrity", desc: "We provide honest, transparent, and reliable guidance." },
  { icon: Users, title: "Inclusiveness", desc: "We support students from different communities and backgrounds." },
  { icon: Heart, title: "Social Responsibility", desc: "We encourage youth to contribute positively to society." },
  { icon: Target, title: "Excellence", desc: "We aim to provide professional and result-oriented support." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900"
        >
          About Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600 leading-relaxed"
        >
          Institute for Skills Development (Pvt) Ltd is a skills-focused
          educational and youth development organization established in 2026.
          We aim to create skilled, responsible, socially aware, and
          future-ready youth through structured training, mentorship,
          educational guidance, leadership development, and community
          engagement programmes.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-4 text-gray-600 leading-relaxed"
        >
          We work with students, youth groups, community-based organizations,
          education institutions, mentors, professionals, and parents to
          provide practical knowledge, career direction, higher education
          support, and personal development opportunities.
        </motion.p>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-emerald-700">Vision</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              To empower students and youth with knowledge, skills, values,
              and guidance to achieve educational success, career
              development, and positive social contribution.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-emerald-700">Mission</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              To provide quality skills development, scholarship guidance,
              leadership training, mentoring, and community-based educational
              support that help young people become confident, capable, and
              socially responsible individuals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Edu First */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900">
            Edu First – Scholarship and Higher Education Guidance
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Edu First is a subsidiary initiative of Institute for Skills
            Development (Pvt) Ltd, focusing mainly on scholarship awareness,
            higher education guidance, and application support for
            undergraduate and postgraduate studies in Sri Lanka and abroad.
            With over a decade of team experience in student guidance, Edu
            First has helped many students understand scholarship
            opportunities, prepare applications, and move closer to their
            higher education goals.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {["Malaysia", "Turkey", "Pakistan", "Sri Lanka", "Other International Destinations"].map((c) => (
            <span
              key={c}
              className="bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 font-medium shadow-sm whitespace-nowrap"
            >
              🌍 {c}
            </span>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16 bg-gray-50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900">Our Services</h2>
          <p className="mt-3 text-gray-600">
            Complete support for students and youth — from scholarship
            guidance to leadership development.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            "Scholarship Guidance",
            "University Admission Support",
            "Application Documentation",
            "Career and Education Counselling",
            "Skills Development Training",
            "Leadership Programmes",
            "Media and Digital Training",
            "Webinars and Awareness Sessions",
            "Mentoring Programmes",
            "Community-Based Student Programmes",
          ].map((s) => (
            <div
              key={s}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-gray-800 font-medium text-sm"
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-gray-900">Our Core Values</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <v.icon className="text-emerald-600" size={28} />
              <h3 className="mt-3 font-semibold text-gray-900">{v.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}