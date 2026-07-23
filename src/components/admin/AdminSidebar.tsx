"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, CalendarDays, Users, GraduationCap, ListChecks, Menu, X,
  MessageSquareQuote,
  PanelsTopLeft,
  Navigation,
  Settings,
  MapPin,
  Handshake,
  CircleHelp,
  ChartNoAxesColumnIncreasing,
  Images,
  Sparkles,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const contentItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/admin/programmes", label: "Programmes", icon: ListChecks },
  {
    href: "/admin/success-stories",
    label: "Success Stories",
    icon: MessageSquareQuote,
  },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
];

const cmsItems = [
  { href: "/admin/cms", label: "CMS Dashboard", icon: PanelsTopLeft },
  { href: "/admin/cms/pages", label: "Pages", icon: FileText },
  { href: "/admin/cms/navigation", label: "Navigation", icon: Navigation },
  { href: "/admin/cms/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/cms/offices", label: "Offices", icon: MapPin },
  { href: "/admin/cms/team", label: "Team", icon: Users },
  { href: "/admin/cms/partners", label: "Partners", icon: Handshake },
  {
    href: "/admin/cms/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/admin/cms/faqs", label: "FAQs", icon: CircleHelp },
  {
    href: "/admin/cms/statistics",
    label: "Statistics",
    icon: ChartNoAxesColumnIncreasing,
  },
  { href: "/admin/cms/featured", label: "Featured", icon: Sparkles },
  { href: "/admin/cms/media", label: "Media Library", icon: Images },
];

export default function AdminSidebar({ fullName }: { fullName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = (
    <>
      <div className="p-6 border-b border-gray-100">
        <p className="font-semibold text-gray-900">Admin Panel</p>
        <p className="text-xs text-gray-500 mt-1">{fullName}</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
        {contentItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
                ? "bg-rose-50 text-rose-700"
                : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            {item.label}
          </Link>
        ))}
        </div>
        <p className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Website CMS
        </p>
        <div className="space-y-1">
          {cmsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href ||
                (item.href !== "/admin/cms" &&
                  pathname.startsWith(`${item.href}/`))
                  ? "bg-rose-50 text-rose-700"
                  : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <p className="font-semibold text-gray-900">Admin Panel</p>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-700"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile slide-in sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl lg:hidden flex flex-col"
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-700"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
