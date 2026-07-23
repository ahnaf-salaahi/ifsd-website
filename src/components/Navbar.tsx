"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.png"
              alt="Institute for Skills Development"
              width={52}
              height={52}
              className="object-contain shrink-0 h-13 w-13"
            />
            <div className="hidden sm:flex flex-col justify-center leading-[1.2]">
              <span className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                Institute for
              </span>
              <span className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                Skills
              </span>
              <span className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                Development (PVT) LTD
              </span>
            </div>
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative flex items-center gap-1.5 text-base font-medium px-3.5 py-2 rounded-full transition-colors ${
                      isActive
                        ? "text-rose-700 bg-rose-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shadow-[0_0_8px_2px_rgba(225,29,72,0.5)]" />
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/events"
            className="hidden lg:inline-block bg-rose-600 text-white text-base font-medium px-5 py-2.5 rounded-full hover:bg-rose-700 transition-colors whitespace-nowrap"
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
              <ul className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname === link.href || pathname.startsWith(link.href + "/");

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 text-base font-medium px-3 py-2 rounded-full transition-colors ${
                          isActive
                            ? "text-rose-700 bg-rose-50"
                            : "text-gray-800"
                        }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shadow-[0_0_8px_2px_rgba(225,29,72,0.5)]" />
                        )}
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}