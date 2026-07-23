import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { normalizePagination, pageResult } from "@/lib/cms/pagination";
import PageHeader from "@/components/admin/cms/PageHeader";
import Pagination from "@/components/admin/cms/Pagination";
import StatusBadge from "@/components/admin/cms/StatusBadge";
import ActionButton from "@/components/admin/cms/ActionButton";
import { setPagePublicationAction } from "../actions/pages";

export const dynamic = "force-dynamic";

export default async function CmsPagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = String(params.search ?? "").trim().slice(0, 100);
  const status = ["draft", "published"].includes(String(params.status))
    ? String(params.status)
    : "";
  const pagination = normalizePagination({
    page: Number(params.page),
    pageSize: 20,
  });
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("site_pages")
    .select(
      "id,title,page_key,slug,status,published_at,updated_at,site_sections(count)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .order("id")
    .range(pagination.from, pagination.to);
  if (search) query = query.or(`title.ilike.%${search}%,page_key.ilike.%${search}%`);
  if (status) query = query.eq("status", status);
  const { data, error, count } = await query;
  const result = pageResult(data ?? [], count ?? 0, pagination);

  return (
    <div>
      <PageHeader title="Pages" description="Edit system pages and their ordered sections." />
      <form className="mt-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:grid-cols-[1fr_180px_auto]">
        <label className="sr-only" htmlFor="search">Search pages</label>
        <input id="search" name="search" defaultValue={search} maxLength={100} placeholder="Search title or page key" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Filter</button>
      </form>
      {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Pages could not be loaded.</div>}
      {!error && result.items.length === 0 && <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center text-sm text-gray-500">No pages match these filters.</div>}
      {result.items.length > 0 && (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white md:block">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Sections</th><th className="px-5 py-3">Updated</th><th className="px-5 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {result.items.map((page) => (
                  <tr key={page.id}>
                    <td className="px-5 py-4"><p className="font-medium text-gray-900">{page.title}</p><p className="text-xs text-gray-500">{page.page_key} · /{page.slug}</p></td>
                    <td className="px-5 py-4"><StatusBadge active={page.status === "published"} activeLabel="Published" inactiveLabel="Draft" /></td>
                    <td className="px-5 py-4">{page.site_sections[0]?.count ?? 0}</td>
                    <td className="px-5 py-4 text-gray-500">{new Date(page.updated_at).toLocaleString()}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-4"><Link className="font-medium text-rose-600" href={`/admin/cms/pages/${page.id}`}>Edit</Link><ActionButton action={setPagePublicationAction} fields={{ id: page.id, status: page.status === "published" ? "draft" : "published" }} label={page.status === "published" ? "Unpublish" : "Publish"} confirmMessage={page.status === "published" ? "Unpublish this page?" : undefined} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-4 md:hidden">
            {result.items.map((page) => (
              <article key={page.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><h2 className="font-medium">{page.title}</h2><p className="text-xs text-gray-500">{page.page_key} · /{page.slug}</p></div><StatusBadge active={page.status === "published"} activeLabel="Published" inactiveLabel="Draft" /></div>
                <p className="mt-3 text-sm text-gray-500">{page.site_sections[0]?.count ?? 0} sections</p>
                <div className="mt-4 flex gap-4"><Link className="text-sm font-medium text-rose-600" href={`/admin/cms/pages/${page.id}`}>Edit</Link><ActionButton action={setPagePublicationAction} fields={{ id: page.id, status: page.status === "published" ? "draft" : "published" }} label={page.status === "published" ? "Unpublish" : "Publish"} confirmMessage={page.status === "published" ? "Unpublish this page?" : undefined} /></div>
              </article>
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} pathname="/admin/cms/pages" searchParams={{ search, status }} />
        </>
      )}
    </div>
  );
}
