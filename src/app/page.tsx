"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Users, Award, BookOpen } from "lucide-react";

const stats = [
  { label: "Students Guided", value: "500+" },
  { label: "Scholarship Opportunities Shared", value: "100+" },
  { label: "Programmes Conducted", value: "20+" },
  { label: "Years of Team Experience", value: "10+" },
];

const highlights = [
  {
    icon: GraduationCap,
    title: "Scholarship Guidance",
    desc: "Regular updates on local and international scholarship opportunities for undergraduate and postgraduate studies.",
  },
  {
    icon: BookOpen,
    title: "University Admission Support",
    desc: "We guide students in selecting suitable universities, study programmes, and countries based on their goals.",
  },
  {
    icon: Users,
    title: "Leadership & Skills Training",
    desc: "Communication, leadership, media, and personal development programmes for students and youth.",
  },
  {
    icon: Award,
    title: "Mentoring & Community Support",
    desc: "One-to-one mentoring and community-based programmes that guide youth toward a confident future.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-semibold text-gray-900 leading-tight max-w-4xl mx-auto"
        >
          Empowering Students and Youth Through Skills, Education, and Guidance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Institute for Skills Development (Pvt) Ltd supports students and
          youth through skills training, scholarship guidance, leadership
          development, mentoring, and educational support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/scholarships"
            className="bg-rose-600 text-white px-6 py-3 rounded-full font-medium hover:bg-rose-700 transition-colors"
          >
            Apply for Scholarship Guidance
          </Link>
          <Link
            href="/contact"
            className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-full font-medium hover:border-gray-400 transition-colors"
          >
            Book a Consultation
          </Link>
          <Link
            href="/scholarships"
            className="text-gray-700 px-6 py-3 font-medium hover:text-rose-700 transition-colors"
          >
            View Latest Scholarships →
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-semibold text-rose-700">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            How We Support You
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            From scholarship guidance to leadership training, we walk with
            students and youth at every stage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <item.icon className="text-rose-600" size={32} />
              <h3 className="mt-4 font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-rose-700 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-white"
          >
            Ready to take the next step in your education journey?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8"
          >
            <Link
              href="/contact"
              className="inline-block bg-white text-rose-700 px-7 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Join Our Programmes
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}