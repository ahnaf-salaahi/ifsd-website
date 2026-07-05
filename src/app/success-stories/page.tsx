"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const stories = [
  { name: "Student Testimonial", role: "Scholarship Recipient", text: "Placeholder testimonial — replace with a real student's story once collected." },
  { name: "Parent Feedback", role: "Parent", text: "Placeholder feedback — replace with real parent testimonial once collected." },
  { name: "Mentor Feedback", role: "Mentor", text: "Placeholder feedback — replace with a real mentor's story once collected." },
];

export default function SuccessStoriesPage() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900"
        >
          Success Stories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600"
        >
          Real stories from students, parents, and mentors we've worked with.
        </motion.p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {stories.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
          >
            <Quote className="text-rose-600" size={26} />
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">{s.text}</p>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
              <p className="text-gray-500 text-xs">{s.role}</p>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}