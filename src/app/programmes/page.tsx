"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const programmes = [
  "Media Training Programmes",
  "Student Guidance Programmes",
  "Webinars",
  "Adventure and Leadership Programmes",
  "Ramadan Special Programmes",
  "After O/L Guidance Programme",
  "After A/L Guidance Programme",
  "Online Programmes for Children",
  "Training of Trainers (TOT) Programmes",
];

export default function ProgrammesPage() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900"
        >
          Our Programmes
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600"
        >
          Structured programmes designed for students, youth, and community groups.
        </motion.p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-4">
          {programmes.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <Calendar className="text-emerald-600 shrink-0" size={22} />
              <span className="text-gray-800 font-medium">{p}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}