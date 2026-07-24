"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import type { NavigationNode } from "@/lib/cms/types";

export const FALLBACK_HEADER_NAVIGATION: NavigationNode[] = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/scholarships", "Scholarships"],
  ["/programmes", "Programmes"],
  ["/events", "Events"],
  ["/success-stories", "Success Stories"],
  ["/blog", "Blog"],
  ["/contact", "Contact"],
].map(([url, label], display_order) => ({
  id: `fallback-${display_order}`,
  parent_id: null,
  label,
  url,
  target: "self",
  location: "header",
  display_order,
  is_visible: true,
  children: [],
}));

type Props = {
  navigation?: NavigationNode[];
  instituteName?: string | null;
  logoUrl?: string | null;
};

const safeHref = (url: string) => {
  if (url.startsWith("/") && !url.startsWith("//")) {
    const normalized = url.length > 1 ? url.replace(/\/+$/, "") : url;
    return PUBLIC_NAVIGATION_ROUTES.has(normalized) ? normalized : null;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const PUBLIC_NAVIGATION_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/events",
  "/programmes",
  "/scholarships",
  "/success-stories",
]);

export default function Navbar({
  navigation = [],
  instituteName,
  logoUrl,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const links = dedupeNavigation(
    navigation.length ? navigation : FALLBACK_HEADER_NAVIGATION,
  );

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : href.startsWith("/") &&
        (pathname === href || pathname.startsWith(`${href}/`));

  const renderLink = (item: NavigationNode, mobile = false) => {
    const href = safeHref(item.url);
    if (!href) return null;
    const external = href.startsWith("https://");
    return (
      <Link
        href={href}
        target={item.target === "blank" ? "_blank" : undefined}
        rel={item.target === "blank" || external ? "noopener noreferrer" : undefined}
        onClick={mobile ? () => setIsOpen(false) : undefined}
        className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-base font-medium transition-colors ${
          isActive(href)
            ? "bg-rose-50 text-rose-700"
            : mobile
              ? "text-gray-800"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        {isActive(href) && (
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shadow-[0_0_8px_2px_rgba(225,29,72,0.5)]" />
        )}
        {item.label}
        {item.children.length > 0 && !mobile && <ChevronDown size={14} />}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3"
        >
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden">
              <Image
                src={logoUrl || "/logo-v2.png"}
                alt={instituteName || "Institute for Skills Development"}
                fill
                className="object-contain scale-[1.7]"
                priority
                unoptimized={Boolean(logoUrl)}
              />
            </div>
            <span
              className="hidden h-[72px] flex-col text-sm font-bold uppercase tracking-wide text-gray-900 sm:flex"
              aria-label={instituteName || "Institute for Skills Development"}
            >
              <span className="flex h-1/3 items-center">Institute</span>
              <span className="flex h-1/3 items-center">For Skills</span>
              <span className="flex h-1/3 items-center">Development</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((item) => (
              <li key={item.id} className="group relative">
                {renderLink(item)}
                {item.children.length > 0 && (
                  <ul className="invisible absolute left-0 top-full min-w-56 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.id}>{renderLink(child)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className="hidden whitespace-nowrap rounded-full bg-rose-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-rose-700 lg:inline-block"
          >
            Book a Consultation
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-700 lg:hidden"
            aria-label="Open menu"
            aria-expanded={isOpen}
          >
            <Menu size={26} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/50 lg:hidden"
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 z-[101] flex max-h-[85vh] w-72 flex-col overflow-y-auto rounded-bl-2xl bg-white p-6 shadow-xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="self-end p-2 text-gray-700"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
              <ul className="mt-6 flex flex-col gap-2">
                {links.map((item) => (
                  <li key={item.id}>
                    {renderLink(item, true)}
                    {item.children.length > 0 && (
                      <ul className="ml-5 border-l border-gray-200 pl-2">
                        {item.children.map((child) => (
                          <li key={child.id}>{renderLink(child, true)}</li>
                        ))}
                      </ul>
                    )}
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

function dedupeNavigation(items: NavigationNode[]) {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const href = safeHref(item.url);
    if (!href || seen.has(href)) return [];
    seen.add(href);
    const childSeen = new Set<string>();
    const children = item.children.filter((child) => {
      const childHref = safeHref(child.url);
      if (!childHref || childSeen.has(childHref) || seen.has(childHref)) {
        return false;
      }
      childSeen.add(childHref);
      seen.add(childHref);
      return true;
    });
    return [{ ...item, children }];
  });
}
