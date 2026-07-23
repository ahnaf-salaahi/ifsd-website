import { requireAdmin } from "@/lib/cms/auth";
import { createAdminMediaSignedUrls } from "@/lib/cms/media";
import { normalizePagination, pageResult } from "@/lib/cms/pagination";
import { CMS_MEDIA_KINDS } from "@/lib/cms/validation";
import PageHeader from "@/components/admin/cms/PageHeader";
import Pagination from "@/components/admin/cms/Pagination";
import StatusBadge from "@/components/admin/cms/StatusBadge";
import ActionButton from "@/components/admin/cms/ActionButton";
import MediaUpload from "@/components/admin/cms/MediaUpload";
import {
  deactivateMediaAction,
  deleteOrphanMediaAction,
} from "../actions/media";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = String(params.search ?? "").trim().slice(0, 100);
  const kind = CMS_MEDIA_KINDS.includes(String(params.kind) as never)
    ? String(params.kind)
    : "";
  const active =
    params.active === "true" || params.active === "false"
      ? String(params.active)
      : "";
  const pagination = normalizePagination({
    page: Number(params.page),
    pageSize: 20,
  });
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("cms_media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range(pagination.from, pagination.to);
  if (search) query = query.ilike("original_filename", `%${search}%`);
  if (kind) query = query.eq("media_kind", kind);
  if (active) query = query.eq("is_active", active === "true");
  const { data, error, count } = await query;
  const result = pageResult(data ?? [], count ?? 0, pagination);
  const signed = error
    ? new Map<string, string | null>()
    : await createAdminMediaSignedUrls(
        result.items.map((item) => item.object_path),
      );

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Private registered CMS images with short-lived administrator previews."
      />
      <div className="mt-6">
        <MediaUpload />
      </div>
      <form className="mt-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_220px_180px_auto]">
        <label className="sr-only" htmlFor="search">Search filename</label>
        <input id="search" name="search" defaultValue={search} maxLength={100} placeholder="Search original filename" className="rounded-lg border px-3 py-2 text-sm" />
        <label className="sr-only" htmlFor="kind">Media kind</label>
        <select id="kind" name="kind" defaultValue={kind} className="rounded-lg border px-3 py-2 text-sm"><option value="">All kinds</option>{CMS_MEDIA_KINDS.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select>
        <label className="sr-only" htmlFor="active">Active state</label>
        <select id="active" name="active" defaultValue={active} className="rounded-lg border px-3 py-2 text-sm"><option value="">All states</option><option value="true">Active</option><option value="false">Inactive</option></select>
        <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Filter</button>
      </form>
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Media could not be loaded.</div>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((item) => {
          const preview = signed.get(item.object_path);
          const imperfect = ["gallery", "general"].includes(item.media_kind);
          return (
            <article key={item.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${item.is_active ? "border-gray-100" : "border-gray-300 opacity-75"}`}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={item.alt_text || item.original_filename} className="h-44 w-full bg-gray-50 object-cover" />
              ) : (
                <div className="flex h-44 items-center justify-center bg-gray-50 text-sm text-gray-400">Preview unavailable</div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-semibold">{item.original_filename}</h2><p className="text-xs text-gray-500">{item.media_kind} · {item.mime_type}</p></div><StatusBadge active={item.is_active} /></div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500"><div><dt>Size</dt><dd>{formatBytes(item.file_size_bytes)}</dd></div><div><dt>Dimensions</dt><dd>{item.width && item.height ? `${item.width}×${item.height}` : "Unknown"}</dd></div><div className="col-span-2"><dt>Path</dt><dd className="break-all font-mono">{item.object_path}</dd></div>{item.caption && <div className="col-span-2"><dt>Caption</dt><dd>{item.caption}</dd></div>}{item.credit && <div className="col-span-2"><dt>Credit</dt><dd>{item.credit}</dd></div>}<div className="col-span-2"><dt>Created</dt><dd>{new Date(item.created_at).toLocaleString()}</dd></div></dl>
                <div className="mt-4 flex flex-wrap gap-4">
                  {item.is_active && <ActionButton action={deactivateMediaAction} fields={{ id: item.id }} label="Deactivate" confirmMessage="Deactivate this registry record? Existing relationships may continue to reference the object." />}
                  <ActionButton action={deleteOrphanMediaAction} fields={{ id: item.id }} label="Delete confirmed orphan" destructive confirmMessage={`Permanently delete ${item.original_filename} (${item.media_kind}) at ${item.object_path}? Known references will be checked.${imperfect ? " Gallery/general reference detection is not complete." : ""}`} />
                </div>
                {imperfect && <p className="mt-3 text-xs text-amber-700">Gallery/general reference detection cannot be guaranteed complete.</p>}
              </div>
            </article>
          );
        })}
      </div>
      {!error && !result.items.length && <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-gray-500">No media matches these filters.</div>}
      <Pagination page={result.page} totalPages={result.totalPages} pathname="/admin/cms/media" searchParams={{ search, kind, active }} />
    </div>
  );
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(1)} MiB`;
}
