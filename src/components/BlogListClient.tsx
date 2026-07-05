"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string | null;
  created_at: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function BlogListClient({ blogs }: { blogs: Blog[] }) {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900"
        >
          Blog & News
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600"
        >
          Guidance, tips, and updates for students and youth.
        </motion.p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {blogs.length === 0 ? (
          <p className="text-center text-gray-500">No articles published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {blogs.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href={`/blog/${b.slug}`}
                  className="block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full"
                >
                  <h3 className="font-semibold text-gray-900 text-lg">{b.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {b.content}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    {b.author && (
                      <span className="flex items-center gap-1">
                        <User size={14} /> {b.author}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {formatDate(b.created_at)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}