import Link from "next/link";
import {
  FileText,
  Handshake,
  Images,
  MapPin,
} from "lucide-react";
import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";

export const dynamic = "force-dynamic";

export default async function CmsDashboardPage() {
  const { supabase } = await requireAdmin();
  const queries = [
    ["Total pages", supabase.from("site_pages").select("id", { count: "exact", head: true })],
    ["Published pages", supabase.from("site_pages").select("id", { count: "exact", head: true }).eq("status", "published")],
    ["Draft pages", supabase.from("site_pages").select("id", { count: "exact", head: true }).eq("status", "draft")],
    ["Active offices", supabase.from("office_locations").select("id", { count: "exact", head: true }).eq("is_active", true)],
    ["Active team", supabase.from("team_members").select("id", { count: "exact", head: true }).eq("is_active", true)],
    ["Active partners", supabase.from("partners").select("id", { count: "exact", head: true }).eq("is_active", true)],
    ["Publishable testimonials", supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_active", true).eq("consent_confirmed", true).eq("approved_for_publication", true).not("published_at", "is", null).lte("published_at", new Date().toISOString())],
    ["Active FAQs", supabase.from("site_faqs").select("id", { count: "exact", head: true }).eq("is_active", true)],
    ["Active statistics", supabase.from("homepage_statistics").select("id", { count: "exact", head: true }).eq("is_active", true)],
    ["Registered media", supabase.from("cms_media").select("id", { count: "exact", head: true })],
    ["Inactive media", supabase.from("cms_media").select("id", { count: "exact", head: true }).eq("is_active", false)],
  ] as const;
  const results = await Promise.allSettled(queries.map(([, query]) => query));
  const summaries = queries.map(([label], index) => {
    const result = results[index];
    return {
      label,
      value:
        result.status === "fulfilled" && !result.value.error
          ? (result.value.count ?? 0)
          : null,
    };
  });
  const failures = summaries.filter((item) => item.value === null).length;
  const quickLinks = [
    { href: "/admin/cms/pages", label: "Edit pages", icon: FileText },
    { href: "/admin/cms/settings", label: "Update settings", icon: MapPin },
    { href: "/admin/cms/featured", label: "Featured content", icon: Handshake },
    { href: "/admin/cms/media", label: "Media library", icon: Images },
  ];

  return (
    <div>
      <PageHeader
        title="CMS Dashboard"
        description="Manage public website content and reusable media."
      />
      {failures > 0 && (
        <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {failures} summary {failures === 1 ? "could" : "could"} not be loaded.
          Other dashboard data remains available.
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((summary) => (
          <div key={summary.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-3xl font-semibold text-gray-900">
              {summary.value ?? "—"}
            </p>
            <p className="mt-1 text-sm text-gray-500">{summary.label}</p>
          </div>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-sm font-medium text-gray-800 shadow-sm hover:border-rose-200 hover:text-rose-700">
              <item.icon size={20} className="text-rose-600" />
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
