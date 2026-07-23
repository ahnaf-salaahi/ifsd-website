import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { normalizePagination, pageResult } from "@/lib/cms/pagination";
import PageHeader from "@/components/admin/cms/PageHeader";
import Pagination from "@/components/admin/cms/Pagination";
import StatusBadge from "@/components/admin/cms/StatusBadge";

export const dynamic = "force-dynamic";

export default async function PartnersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const search = String(params.search ?? "").trim().slice(0, 100); const pagination = normalizePagination({ page: Number(params.page), pageSize: 20 });
  const { supabase } = await requireAdmin(); let query = supabase.from("partners").select("*", { count: "exact" }).order("display_order").order("id").range(pagination.from, pagination.to); if (search) query = query.ilike("name", `%${search}%`);
  const { data, error, count } = await query; const result = pageResult(data ?? [], count ?? 0, pagination);
  return <div><PageHeader title="Partners" description="Manage partner types, logos, links, and featured state." actionHref="/admin/cms/partners/new" actionLabel="Add partner" />
    <form className="mt-6 flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"><label className="sr-only" htmlFor="search">Search partners</label><input id="search" name="search" defaultValue={search} maxLength={100} placeholder="Search partner name" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Search</button></form>
    {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Partners could not be loaded.</div>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{result.items.map((partner) => <article key={partner.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{partner.name}</h2><p className="text-sm text-gray-500">{partner.partner_type}</p></div><StatusBadge active={partner.is_active} /></div><p className="mt-3 text-xs text-gray-500">Order {partner.display_order}{partner.is_featured ? " · Featured" : ""}</p><Link className="mt-4 inline-flex text-sm font-medium text-rose-600" href={`/admin/cms/partners/${partner.id}`}>Edit partner</Link></article>)}</div>
    {!error && !result.items.length && <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-gray-500">No partners found.</div>}<Pagination page={result.page} totalPages={result.totalPages} pathname="/admin/cms/partners" searchParams={{ search }} /></div>;
}
