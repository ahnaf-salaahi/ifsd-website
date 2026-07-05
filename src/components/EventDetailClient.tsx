"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EventType = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  registration_open: boolean;
};

type Photo = {
  id: string;
  photo_url: string;
  caption: string | null;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function EventDetailClient({
  event,
  photos,
}: {
  event: EventType;
  photos: Photo[];
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isPast = new Date(event.event_date) < new Date();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      full_name: fullName,
      email,
      phone,
      notes,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-semibold text-gray-900"
      >
        {event.title}
      </motion.h1>

      <div className="mt-4 flex flex-wrap gap-6 text-gray-600">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} /> {formatDate(event.event_date)}
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={18} /> {event.location}
          </div>
        )}
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">{event.description}</p>

      {/* Photo gallery for past events */}
      {photos.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Photos</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((p) => (
              <img
                key={p.id}
                src={p.photo_url}
                alt={p.caption ?? event.title}
                className="rounded-xl w-full h-48 object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Registration form */}
      {!isPast && event.registration_open && (
        <div className="mt-12 bg-gray-50 border border-gray-100 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Register for this Event</h2>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-800"
            >
              <CheckCircle2 size={22} />
              You're registered! We'll be in touch with more details.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any questions or notes? (optional)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {status === "error" && (
                <p className="text-red-600 text-sm">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {status === "submitting" ? "Submitting..." : "Register Now"}
              </button>
            </form>
          )}
        </div>
      )}

      {isPast && (
        <div className="mt-12 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-gray-600 text-center">
          This event has already taken place.
        </div>
      )}
    </div>
  );
}