"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-gray-600"
        >
          Have a question? Reach out — we're happy to help.
        </motion.p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-10">
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
                className="w-full bg-rose-600 text-white py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors"
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