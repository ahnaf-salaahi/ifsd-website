"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";
import PageHero from "@/components/PageHero";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string | null;
  created_at: string | null;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Date unavailable";
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function BlogListClient({ blogs }: { blogs: Blog[] }) {
  return (
    <div>
      <PageHero
        eyebrow="Blog & News"
        title="Blog & News"
        subtitle="Guidance, tips, and updates for students and youth."
      />

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24">
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
