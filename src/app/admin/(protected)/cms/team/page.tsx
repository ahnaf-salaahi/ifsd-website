import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { normalizePagination, pageResult } from "@/lib/cms/pagination";
import PageHeader from "@/components/admin/cms/PageHeader";
import Pagination from "@/components/admin/cms/Pagination";
import StatusBadge from "@/components/admin/cms/StatusBadge";

export const dynamic = "force-dynamic";

export default async function TeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = String(params.search ?? "").trim().slice(0, 100);
  const pagination = normalizePagination({ page: Number(params.page), pageSize: 20 });
  const { supabase } = await requireAdmin();
  let query = supabase.from("team_members").select("*", { count: "exact" }).order("display_order").order("id").range(pagination.from, pagination.to);
  if (search) query = query.or(`full_name.ilike.%${search}%,designation.ilike.%${search}%`);
  const { data, error, count } = await query;
  const result = pageResult(data ?? [], count ?? 0, pagination);
  return (
    <div>
      <PageHeader title="Team" description="Manage public profiles and separately protected private contacts." actionHref="/admin/cms/team/new" actionLabel="Add team member" />
      <form className="mt-6 flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"><label className="sr-only" htmlFor="search">Search team</label><input id="search" name="search" defaultValue={search} maxLength={100} placeholder="Search name or designation" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" /><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Search</button></form>
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Team members could not be loaded.</div>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((member) => (
          <article key={member.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{member.full_name}</h2><p className="text-sm text-gray-500">{member.designation}</p></div><StatusBadge active={member.is_active} /></div>
            <div className="mt-3 flex gap-2 text-xs text-gray-500"><span>Order {member.display_order}</span>{member.is_featured && <span className="text-rose-600">Featured</span>}</div>
            <Link href={`/admin/cms/team/${member.id}`} className="mt-4 inline-flex text-sm font-medium text-rose-600">Edit profile</Link>
          </article>
        ))}
      </div>
      {!error && result.items.length === 0 && <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-gray-500">No team members found.</div>}
      <Pagination page={result.page} totalPages={result.totalPages} pathname="/admin/cms/team" searchParams={{ search }} />
    </div>
  );
}
