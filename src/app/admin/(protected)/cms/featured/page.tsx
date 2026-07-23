import { requireAdmin } from "@/lib/cms/auth";
import { getAdminMediaPickerOptions } from "@/lib/cms/media";
import { resolveFeaturedCta } from "@/lib/cms/featured";
import PageHeader from "@/components/admin/cms/PageHeader";
import ActionForm from "@/components/admin/cms/ActionForm";
import ActionButton from "@/components/admin/cms/ActionButton";
import MediaPickerField, { type MediaPickerOption } from "@/components/admin/cms/MediaPickerField";
import { Checkbox, Field, TextArea, TextInput } from "@/components/admin/cms/FormFields";
import { deleteFeaturedAction, saveFeaturedAction } from "../actions/featured";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const { supabase } = await requireAdmin();
  const [programmeRows, scholarshipRows, storyRows, programmes, scholarships, stories, media] = await Promise.all([
    supabase.from("homepage_featured_programmes").select("*,programmes(id,title,slug,published,programme_state,short_summary)").order("display_order").order("id"),
    supabase.from("homepage_featured_scholarships").select("*,scholarships(id,title,slug,published,description)").order("display_order").order("id"),
    supabase.from("homepage_featured_stories").select("*,success_stories(id,story_title,slug,published,short_summary)").order("display_order").order("id"),
    supabase.from("programmes").select("id,title,slug,published,programme_state,short_summary").order("title").limit(500),
    supabase.from("scholarships").select("id,title,slug,published,description").order("title").limit(500),
    supabase.from("success_stories").select("id,story_title,slug,published,short_summary").order("story_title").limit(500),
    getAdminMediaPickerOptions(["featured_programme", "featured_scholarship", "featured_story"]),
  ]);
  return <div><PageHeader title="Featured Content" description="Override homepage presentation without changing or publishing canonical source content." />
    <FeaturedSection title="Featured Programmes" kind="programme" rows={(programmeRows.data ?? []).map((row) => ({ ...row, source: row.programmes, sourceId: row.programme_id }))} sources={(programmes.data ?? []).map((item) => ({ id: item.id, title: item.title, slug: item.slug, published: Boolean(item.published), cancelled: item.programme_state === "cancelled", summary: item.short_summary }))} media={media} />
    <FeaturedSection title="Featured Scholarships" kind="scholarship" rows={(scholarshipRows.data ?? []).map((row) => ({ ...row, source: row.scholarships, sourceId: row.scholarship_id }))} sources={(scholarships.data ?? []).map((item) => ({ id: item.id, title: item.title, slug: item.slug, published: Boolean(item.published), cancelled: false, summary: item.description }))} media={media} />
    <FeaturedSection title="Featured Success Stories" kind="story" rows={(storyRows.data ?? []).map((row) => ({ ...row, source: row.success_stories, sourceId: row.story_id }))} sources={(stories.data ?? []).map((item) => ({ id: item.id, title: item.story_title, slug: item.slug, published: item.published, cancelled: false, summary: item.short_summary }))} media={media} />
  </div>;
}

type Source = { id: string; title: string; slug: string; published: boolean; cancelled: boolean; summary: string | null };
type FeaturedRow = {
  id: string; sourceId: string; custom_heading: string | null; custom_summary: string | null; image_override_path: string | null; cta_label: string | null; cta_url: string | null; display_order: number; is_active: boolean; source: unknown;
};

function FeaturedSection({ title, kind, rows, sources, media }: { title: string; kind: "programme" | "scholarship" | "story"; rows: FeaturedRow[]; sources: Source[]; media: MediaPickerOption[] }) {
  const mediaKind = kind === "programme" ? "featured_programme" : kind === "scholarship" ? "featured_scholarship" : "featured_story";
  return <section className="mt-8"><h2 className="text-xl font-semibold text-gray-900">{title}</h2><div className="mt-4 space-y-5">
    {rows.map((row) => { const source = sources.find((item) => item.id === row.sourceId); const options = media.filter((item) => item.objectPath.startsWith(`featured/${kind === "story" ? "stories" : `${kind}s`}/${row.id}/`)); return <article key={row.id} className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
      {source && (!source.published || source.cancelled) && <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{source.cancelled ? "Warning: this Programme is cancelled. " : ""}{!source.published ? "Warning: the source is unpublished." : ""} This control will not publish it.</div>}
      {source && <div className="mb-4 rounded-xl bg-gray-50 p-4"><p className="text-xs font-medium uppercase text-gray-400">Effective preview</p><h3 className="mt-1 font-semibold">{row.custom_heading || source.title}</h3><p className="mt-1 text-sm text-gray-600">{row.custom_summary || source.summary || "No summary"}</p><p className="mt-2 text-xs text-rose-600">{row.cta_label || (kind === "story" ? "Read story" : `View ${kind}`)} → {resolveFeaturedCta(row.cta_url, `/${kind === "story" ? "success-stories" : `${kind}s`}/${source.slug}`)}</p></div>}
      <FeaturedForm kind={kind} row={row} sources={sources} media={options} mediaKind={mediaKind} />
      <div className="mt-3"><ActionButton action={deleteFeaturedAction} fields={{ id: row.id, kind }} label="Remove featured relationship" destructive confirmMessage="Remove this featured relationship? The source content will not be deleted." /></div>
    </article>; })}
    <article className="rounded-2xl border border-dashed bg-white p-5"><h3 className="font-semibold">Add {title.toLowerCase().replace("featured ", "")}</h3><div className="mt-4"><FeaturedForm kind={kind} row={null} sources={sources} media={[]} mediaKind={mediaKind} /></div></article>
  </div></section>;
}

function FeaturedForm({ kind, row, sources, media, mediaKind }: { kind: "programme" | "scholarship" | "story"; row: FeaturedRow | null; sources: Source[]; media: MediaPickerOption[]; mediaKind: string }) {
  const key = row?.id ?? `new-${kind}`; return <ActionForm action={saveFeaturedAction} submitLabel={row ? "Save featured item" : "Add featured item"}><input type="hidden" name="id" value={row?.id ?? ""} /><input type="hidden" name="kind" value={kind} /><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Source content" name={`featured-source-${key}`}><select id={`featured-source-${key}`} name="source_id" defaultValue={row?.sourceId ?? ""} required className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">Select source</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.title}{!source.published ? " — draft" : ""}{source.cancelled ? " — cancelled" : ""}</option>)}</select></Field>
    <Field label="Display order" name={`featured-order-${key}`}><TextInput id={`featured-order-${key}`} type="number" min={0} name="display_order" defaultValue={row?.display_order ?? 0} /></Field>
    <Field label="Heading override" name={`featured-heading-${key}`}><TextInput id={`featured-heading-${key}`} name="custom_heading" defaultValue={row?.custom_heading ?? ""} /></Field>
    <Field label="CTA label override" name={`featured-cta-label-${key}`}><TextInput id={`featured-cta-label-${key}`} name="cta_label" defaultValue={row?.cta_label ?? ""} /></Field>
    <Field label="CTA URL override" name={`featured-cta-url-${key}`}><TextInput id={`featured-cta-url-${key}`} name="cta_url" defaultValue={row?.cta_url ?? ""} placeholder="/path or https://…" /></Field>
  </div><div className="mt-4"><Field label="Summary override" name={`featured-summary-${key}`}><TextArea id={`featured-summary-${key}`} name="custom_summary" defaultValue={row?.custom_summary ?? ""} rows={3} /></Field></div>
  {row ? <div className="mt-4"><MediaPickerField name="image_override_path" label="Image override" value={row.image_override_path} options={media} compatibleKinds={[mediaKind]} uploadKind={mediaKind} ownerId={row.id} /></div> : <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Save the relationship first, then attach relationship-owned media.</p>}
  <div className="mt-4"><Checkbox name="is_active" label="Active" defaultChecked={row?.is_active ?? true} /></div></ActionForm>;
}
