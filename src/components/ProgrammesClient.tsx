"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";

type Programme = {
  id: string;
  title: string;
  description: string;
  category: "past" | "upcoming";
  image_url: string | null;
};

export default function ProgrammesClient({ programmes }: { programmes: Programme[] }) {
  const past = programmes.filter((p) => p.category === "past");
  const upcoming = programmes.filter((p) => p.category === "upcoming");

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

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-10">
        {/* Past Programmes */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="text-rose-600" size={22} />
            <h2 className="text-xl font-semibold text-gray-900">Past Programmes</h2>
          </div>
          <div className="space-y-4">
            {past.length === 0 ? (
              <p className="text-gray-500 text-sm">No past programmes listed yet.</p>
            ) : (
              past.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
                >
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="rounded-lg w-full h-40 object-cover mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {p.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming / Planned Programmes */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-rose-600" size={22} />
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Programmes</h2>
          </div>
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming programmes listed yet.</p>
            ) : (
              upcoming.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-rose-50 border border-rose-100 rounded-xl p-5"
                >
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="rounded-lg w-full h-40 object-cover mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {p.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}