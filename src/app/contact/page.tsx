"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import PageHero from "@/components/PageHero";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <PageHero
        eyebrow="Get In Touch"
        title="Contact Us"
        subtitle="Have a question? Reach out — we're happy to help."
      />

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-10">
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-start gap-4">
            <MapPin className="text-rose-600 shrink-0" size={22} />
            <div>
              <p className="font-medium text-gray-900">Address</p>
              <p className="text-gray-600 text-sm">Your organization address here</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="text-rose-600 shrink-0" size={22} />
            <div>
              <p className="font-medium text-gray-900">Phone / WhatsApp</p>
              <p className="text-gray-600 text-sm">+94 XX XXX XXXX</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Mail className="text-rose-600 shrink-0" size={22} />
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-gray-600 text-sm">info@yourdomain.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="text-rose-600 shrink-0" size={22} />
            <div>
              <p className="font-medium text-gray-900">Office Hours</p>
              <p className="text-gray-600 text-sm">Mon–Fri, 9:00 AM – 5:00 PM</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800"
            >
              Thank you! Your message has been noted. (Note: this form isn't connected to email delivery yet — we'll wire that up in a later step.)
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                placeholder="Phone Number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <textarea
                required
                placeholder="Your Message"
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="w-full bg-rose-600 text-white py-3 rounded-full font-medium hover:bg-rose-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </div>
  );
}
