"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/programmes", label: "Programmes" },
  { href: "/events", label: "Events" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Institute for Skills Development
          </Link>

          <ul className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors group"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/events"
            className="hidden lg:inline-block bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            Book a Consultation
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 text-gray-700"
            aria-label="Open menu"
          >
            <Menu size={26} />
          </button>
        </nav>
      </header>

      {/* Mobile menu now lives OUTSIDE the blurred header, as a direct sibling */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
            />
            <motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "tween", duration: 0.3 }}
  className="fixed top-0 right-0 w-72 max-h-[85vh] z-[101] shadow-xl lg:hidden flex flex-col p-6 overflow-y-auto rounded-bl-2xl"
  style={{ backgroundColor: "#ffffff" }}
>
              <button
                onClick={() => setIsOpen(false)}
                className="self-end p-2 text-gray-700"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
              <ul className="flex flex-col gap-5 mt-6">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-medium text-gray-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}