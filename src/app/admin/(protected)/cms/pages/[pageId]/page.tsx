import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { isUuid } from "@/lib/cms/validation";
import { getAdminMediaPickerOptions } from "@/lib/cms/media";
import PageHeader from "@/components/admin/cms/PageHeader";
import ActionForm from "@/components/admin/cms/ActionForm";
import ActionButton from "@/components/admin/cms/ActionButton";
import MediaPickerField from "@/components/admin/cms/MediaPickerField";
import {
  Checkbox,
  Field,
  TextArea,
  TextInput,
} from "@/components/admin/cms/FormFields";
import {
  deleteSectionAction,
  moveSectionAction,
  savePageAction,
  saveSectionAction,
  setPagePublicationAction,
} from "../../actions/pages";

export const dynamic = "force-dynamic";

export default async function CmsPageEditor({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  if (!isUuid(pageId)) notFound();
  const { supabase } = await requireAdmin();
  const [pageResult, sectionResult, typeResult, media] = await Promise.all([
    supabase.from("site_pages").select("*").eq("id", pageId).maybeSingle(),
    supabase
      .from("site_sections")
      .select("*")
      .eq("page_id", pageId)
      .order("display_order")
      .order("id"),
    supabase
      .from("site_section_types")
      .select("type_key,display_name,is_active")
      .eq("is_active", true)
      .order("display_name"),
    getAdminMediaPickerOptions(["page", "section"]),
  ]);
  if (pageResult.error || !pageResult.data) notFound();
  const page = pageResult.data;
  const sections = sectionResult.data ?? [];
  const sectionTypes = typeResult.data ?? [];
  const pageMedia = media.filter((item) =>
    item.objectPath.startsWith(`pages/${page.id}/`),
  );

  return (
    <div>
      <PageHeader
        title={page.title}
        description={`System page: ${page.page_key}. Updated ${new Date(page.updated_at).toLocaleString()}.`}
      />
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
        <span className="text-sm text-gray-600">
          Current status: <strong>{page.status}</strong>
        </span>
        <ActionButton
          action={setPagePublicationAction}
          fields={{
            id: page.id,
            status: page.status === "published" ? "draft" : "published",
          }}
          label={page.status === "published" ? "Unpublish" : "Publish"}
          confirmMessage={
            page.status === "published" ? "Unpublish this page?" : undefined
          }
        />
      </div>

      <ActionForm
        action={savePageAction}
        sticky
        className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 sm:p-8"
      >
        <input type="hidden" name="id" value={page.id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Page title" name="title">
            <TextInput name="title" defaultValue={page.title} required />
          </Field>
          <Field
            label="Page key"
            name="page_key"
            hint="Stable system identifier; it cannot be changed here."
          >
            <TextInput
              name="page_key"
              value={page.page_key}
              readOnly
              className="bg-gray-50"
            />
          </Field>
          <Field label="Slug" name="slug">
            <TextInput name="slug" defaultValue={page.slug} required />
          </Field>
          <Field label="Canonical URL" name="canonical_url">
            <TextInput
              name="canonical_url"
              defaultValue={page.canonical_url ?? ""}
              placeholder="/about or https://…"
            />
          </Field>
          <Field label="SEO title" name="seo_title">
            <TextInput name="seo_title" defaultValue={page.seo_title ?? ""} />
          </Field>
          <Field label="Open Graph title" name="og_title">
            <TextInput name="og_title" defaultValue={page.og_title ?? ""} />
          </Field>
          <Field label="SEO description" name="seo_description">
            <TextArea
              name="seo_description"
              defaultValue={page.seo_description ?? ""}
              rows={3}
            />
          </Field>
          <Field label="Open Graph description" name="og_description">
            <TextArea
              name="og_description"
              defaultValue={page.og_description ?? ""}
              rows={3}
            />
          </Field>
        </div>
        <div className="mt-5">
          <MediaPickerField
            name="og_image_path"
            label="Open Graph image"
            value={page.og_image_path}
            options={pageMedia}
            compatibleKinds={["page"]}
            uploadKind="page"
            ownerId={page.id}
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-5">
          <Checkbox
            name="robots_index"
            label="Allow search indexing"
            defaultChecked={page.robots_index}
          />
          <Checkbox
            name="robots_follow"
            label="Allow link following"
            defaultChecked={page.robots_follow}
          />
        </div>
      </ActionForm>

      <section className="mt-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Page sections</h2>
          <p className="mt-1 text-sm text-gray-500">
            Reordering uses two sequential updates and is not transactional.
          </p>
        </div>
        <div className="mt-5 space-y-5">
          {sections.map((section, index) => {
            const sectionMedia = media.filter((item) =>
              item.objectPath.startsWith(`sections/${section.id}/`),
            );
            return (
              <article
                key={section.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {section.heading || section.section_key}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {section.section_type} · {section.status}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <ActionButton
                      action={moveSectionAction}
                      fields={{
                        id: section.id,
                        page_id: page.id,
                        direction: "up",
                      }}
                      label="Move up"
                      pendingLabel="Moving…"
                    />
                    <ActionButton
                      action={moveSectionAction}
                      fields={{
                        id: section.id,
                        page_id: page.id,
                        direction: "down",
                      }}
                      label="Move down"
                      pendingLabel="Moving…"
                    />
                    <ActionButton
                      action={deleteSectionAction}
                      fields={{ id: section.id, page_id: page.id }}
                      label="Delete"
                      destructive
                      confirmMessage="Delete this section? This cannot be undone."
                    />
                  </div>
                </div>
                <SectionForm
                  pageId={page.id}
                  section={section}
                  sectionTypes={sectionTypes}
                  media={sectionMedia}
                  index={index}
                />
              </article>
            );
          })}
          {sections.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
              No sections are configured yet.
            </div>
          )}
          <article className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 sm:p-7">
            <h3 className="font-semibold text-gray-900">Add section</h3>
            <p className="mt-1 text-xs text-gray-500">
              Save the section before attaching section-owned media.
            </p>
            <div className="mt-5">
              <SectionForm
                pageId={page.id}
                section={null}
                sectionTypes={sectionTypes}
                media={[]}
                index={sections.length}
              />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function SectionForm({
  pageId,
  section,
  sectionTypes,
  media,
  index,
}: {
  pageId: string;
  section: {
    id: string;
    section_key: string;
    section_type: string;
    heading: string | null;
    subheading: string | null;
    body: string | null;
    media_path: string | null;
    button_label: string | null;
    button_url: string | null;
    content_config: unknown;
    display_order: number;
    is_active: boolean;
    status: string;
  } | null;
  sectionTypes: { type_key: string; display_name: string; is_active: boolean }[];
  media: Awaited<ReturnType<typeof getAdminMediaPickerOptions>>;
  index: number;
}) {
  return (
    <ActionForm action={saveSectionAction} submitLabel={section ? "Save section" : "Add section"}>
      <input type="hidden" name="id" value={section?.id ?? ""} />
      <input type="hidden" name="page_id" value={pageId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Section key" name={`section_key-${section?.id ?? "new"}`}>
          <TextInput
            name="section_key"
            defaultValue={section?.section_key ?? `section_${index + 1}`}
            required
          />
        </Field>
        <Field label="Section type" name={`section_type-${section?.id ?? "new"}`}>
          <select
            id={`section_type-${section?.id ?? "new"}`}
            name="section_type"
            defaultValue={section?.section_type ?? sectionTypes[0]?.type_key}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {sectionTypes.map((type) => (
              <option key={type.type_key} value={type.type_key}>
                {type.display_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Heading" name={`heading-${section?.id ?? "new"}`}>
          <TextInput name="heading" defaultValue={section?.heading ?? ""} />
        </Field>
        <Field label="Subheading" name={`subheading-${section?.id ?? "new"}`}>
          <TextInput name="subheading" defaultValue={section?.subheading ?? ""} />
        </Field>
        <Field label="Button label" name={`button_label-${section?.id ?? "new"}`}>
          <TextInput name="button_label" defaultValue={section?.button_label ?? ""} />
        </Field>
        <Field label="Button URL" name={`button_url-${section?.id ?? "new"}`}>
          <TextInput name="button_url" defaultValue={section?.button_url ?? ""} />
        </Field>
        <Field label="Display order" name={`display_order-${section?.id ?? "new"}`}>
          <TextInput type="number" min={0} name="display_order" defaultValue={section?.display_order ?? index} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Body" name={`body-${section?.id ?? "new"}`}>
          <TextArea name="body" defaultValue={section?.body ?? ""} rows={5} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Structured configuration (JSON object)" name={`content_config-${section?.id ?? "new"}`} hint="Use only for section-type-specific structured values. Executable markup is rejected.">
          <TextArea name="content_config" defaultValue={JSON.stringify(section?.content_config ?? {}, null, 2)} rows={6} className="font-mono" />
        </Field>
      </div>
      {section && (
        <div className="mt-4">
          <MediaPickerField name="media_path" label="Section media" value={section.media_path} options={media} compatibleKinds={["section"]} uploadKind="section" ownerId={section.id} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-5">
        <Checkbox name="is_active" label="Enabled" defaultChecked={section?.is_active ?? true} />
        <Checkbox name="published" label="Published" defaultChecked={section?.status === "published"} />
      </div>
    </ActionForm>
  );
}
