import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { normalizePagination, pageResult } from "@/lib/cms/pagination";
import PageHeader from "@/components/admin/cms/PageHeader";
import Pagination from "@/components/admin/cms/Pagination";
import StatusBadge from "@/components/admin/cms/StatusBadge";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const search = String(params.search ?? "").trim().slice(0, 100); const pagination = normalizePagination({ page: Number(params.page), pageSize: 20 }); const { supabase } = await requireAdmin();
  let query = supabase.from("testimonials").select("*", { count: "exact" }).order("display_order").order("id").range(pagination.from, pagination.to); if (search) query = query.or(`author_name.ilike.%${search}%,organisation.ilike.%${search}%`);
  const { data, error, count } = await query; const result = pageResult(data ?? [], count ?? 0, pagination); const now = new Date();
  return <div><PageHeader title="Testimonials" description="Manage public testimonial content and separately protected provenance." actionHref="/admin/cms/testimonials/new" actionLabel="Add testimonial" />
    <form className="mt-6 flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"><label className="sr-only" htmlFor="search">Search testimonials</label><input id="search" name="search" defaultValue={search} maxLength={100} placeholder="Search person or organization" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Search</button></form>
    {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Testimonials could not be loaded.</div>}
    <div className="mt-6 grid gap-4">{result.items.map((item) => { const publishable = item.is_active && item.consent_confirmed && item.approved_for_publication && Boolean(item.published_at && new Date(item.published_at) <= now); return <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{item.author_name}</h2><p className="text-sm text-gray-500">{item.author_role || item.organisation || "No role supplied"}</p></div><StatusBadge active={publishable} activeLabel="Publishable" inactiveLabel="Not publishable" /></div><p className="mt-3 line-clamp-2 text-sm text-gray-600">{item.quote}</p><Link className="mt-4 inline-flex text-sm font-medium text-rose-600" href={`/admin/cms/testimonials/${item.id}`}>Edit testimonial</Link></article>; })}</div>
    {!error && !result.items.length && <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-gray-500">No testimonials found.</div>}<Pagination page={result.page} totalPages={result.totalPages} pathname="/admin/cms/testimonials" searchParams={{ search }} /></div>;
}
