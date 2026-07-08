"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  location: string | null;
  registration_open: boolean;
  cover_image_url: string | null;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function EventsClient({ events }: { events: Event[] }) {
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.event_date) >= now);
  const past = events.filter((e) => new Date(e.event_date) < now);

  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900"
        >
          Events
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600"
        >
          Webinars, training workshops, mentoring sessions, and leadership camps.
        </motion.p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Upcoming Events</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming events right now — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {e.cover_image_url && (
                  <img
                    src={e.cover_image_url}
                    alt={e.title}
                    className="w-full h-44 object-contain bg-gray-50"
                  />
                )}
                <div className="p-6 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{e.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">
                  {e.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={16} /> {formatDate(e.event_date)}
                </div>
                {e.location && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} /> {e.location}
                  </div>
                )}
                <Link
                  href={`/events/${e.slug}`}
                  className="mt-5 inline-block text-center bg-rose-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
                >
                  {e.registration_open ? "View & Register" : "View Details"}
                </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Past Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.08 }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col opacity-80"
              >
                <h3 className="font-semibold text-gray-900">{e.title}</h3>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={16} /> {formatDate(e.event_date)}
                </div>
                <Link
                  href={`/events/${e.slug}`}
                  className="mt-4 text-rose-700 text-sm font-medium hover:underline"
                >
                  View Photos →
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}