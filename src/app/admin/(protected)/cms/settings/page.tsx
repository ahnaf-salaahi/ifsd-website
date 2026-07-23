import { requireAdmin } from "@/lib/cms/auth";
import { getAdminMediaPickerOptions } from "@/lib/cms/media";
import PageHeader from "@/components/admin/cms/PageHeader";
import ActionForm from "@/components/admin/cms/ActionForm";
import MediaPickerField from "@/components/admin/cms/MediaPickerField";
import {
  Checkbox,
  Field,
  TextArea,
  TextInput,
} from "@/components/admin/cms/FormFields";
import {
  saveContactSettingsAction,
  saveDeliverySettingsAction,
  saveSettingsAction,
} from "../actions/settings";

export const dynamic = "force-dynamic";

export default async function CmsSettingsPage() {
  const { supabase } = await requireAdmin();
  const [settings, contact, delivery, media] = await Promise.all([
    supabase
      .from("site_settings")
      .select("*")
      .eq("singleton", true)
      .single(),
    supabase
      .from("contact_form_settings")
      .select("*")
      .eq("singleton", true)
      .single(),
    supabase
      .from("contact_form_delivery_settings")
      .select("*")
      .eq("singleton", true)
      .single(),
    getAdminMediaPickerOptions(["branding"]),
  ]);
  if (settings.error || contact.error || delivery.error) {
    return (
      <div>
        <PageHeader title="Site Settings" />
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Settings could not be loaded.
        </div>
      </div>
    );
  }
  const value = settings.data;
  const branding = media.filter((item) =>
    item.objectPath.startsWith("branding/global/"),
  );

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description="Manage organization identity, branding, public contact details, SEO, and contact delivery."
      />
      <ActionForm action={saveSettingsAction} sticky className="mt-6 space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-semibold">Organization identity</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Institute name" name="institute_name"><TextInput name="institute_name" defaultValue={value.institute_name ?? ""} /></Field>
            <Field label="Short name" name="short_name"><TextInput name="short_name" defaultValue={value.short_name ?? ""} /></Field>
            <Field label="Tagline" name="tagline"><TextInput name="tagline" defaultValue={value.tagline ?? ""} /></Field>
            <Field label="Default locale" name="default_locale"><TextInput name="default_locale" defaultValue={value.default_locale} required /></Field>
            <Field label="Default timezone" name="default_timezone"><TextInput name="default_timezone" defaultValue={value.default_timezone} required /></Field>
          </div>
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-semibold">Branding</h2>
          <p className="mt-1 text-sm text-gray-500">Use optimized raster images. Logos benefit from transparent WebP or PNG files; favicon artwork should remain legible at small sizes.</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <MediaPickerField name="primary_logo_path" label="Primary logo" value={value.primary_logo_path} options={branding} compatibleKinds={["branding"]} />
            <MediaPickerField name="secondary_logo_path" label="Secondary logo" value={value.secondary_logo_path} options={branding} compatibleKinds={["branding"]} />
            <MediaPickerField name="favicon_path" label="Favicon" value={value.favicon_path} options={branding} compatibleKinds={["branding"]} />
            <MediaPickerField name="seal_path" label="Seal" value={value.seal_path} options={branding} compatibleKinds={["branding"]} />
            <MediaPickerField name="default_og_image_path" label="Default Open Graph image" value={value.default_og_image_path} options={branding} compatibleKinds={["branding"]} />
          </div>
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-semibold">Public contact and footer</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Primary email" name="primary_email"><TextInput type="email" name="primary_email" defaultValue={value.primary_email ?? ""} /></Field>
            <Field label="Primary phone" name="primary_phone"><TextInput name="primary_phone" defaultValue={value.primary_phone ?? ""} /></Field>
            <Field label="Secondary phone" name="secondary_phone"><TextInput name="secondary_phone" defaultValue={value.secondary_phone ?? ""} /></Field>
            <Field label="WhatsApp number" name="whatsapp_number"><TextInput name="whatsapp_number" defaultValue={value.whatsapp_number ?? ""} /></Field>
            <Field label="Default office address" name="default_office_address"><TextArea name="default_office_address" defaultValue={value.default_office_address ?? ""} rows={4} /></Field>
            <Field label="Footer description" name="footer_description"><TextArea name="footer_description" defaultValue={value.footer_description ?? ""} rows={4} /></Field>
            <Field label="Copyright text" name="copyright_text"><TextInput name="copyright_text" defaultValue={value.copyright_text ?? ""} /></Field>
          </div>
          <div className="mt-5"><Checkbox name="newsletter_enabled" label="Newsletter enabled" defaultChecked={value.newsletter_enabled} /></div>
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-semibold">Default SEO</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Default SEO title" name="default_seo_title"><TextInput name="default_seo_title" defaultValue={value.default_seo_title ?? ""} /></Field>
            <Field label="Default SEO description" name="default_seo_description"><TextArea name="default_seo_description" defaultValue={value.default_seo_description ?? ""} rows={3} /></Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-5">
            <Checkbox name="default_robots_index" label="Index by default" defaultChecked={value.default_robots_index} />
            <Checkbox name="default_robots_follow" label="Follow links by default" defaultChecked={value.default_robots_follow} />
            <Checkbox name="maintenance_mode" label="Maintenance mode" defaultChecked={value.maintenance_mode} />
          </div>
        </section>
      </ActionForm>

      <ActionForm action={saveContactSettingsAction} className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 sm:p-8" submitLabel="Save contact form settings">
        <h2 className="text-lg font-semibold">Public contact-form configuration</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Recipient label" name="recipient_label"><TextInput name="recipient_label" defaultValue={contact.data.recipient_label ?? ""} /></Field>
          <Field label="Spam protection mode" name="spam_protection_mode"><TextInput name="spam_protection_mode" defaultValue={contact.data.spam_protection_mode} /></Field>
          <Field label="Success message" name="success_message"><TextArea name="success_message" defaultValue={contact.data.success_message} rows={3} /></Field>
          <Field label="Consent text" name="consent_text"><TextArea name="consent_text" defaultValue={contact.data.consent_text ?? ""} rows={3} /></Field>
          <Field label="Allowed attachment MIME types" name="allowed_attachment_types" hint="Comma-separated values already approved by the schema."><TextInput name="allowed_attachment_types" defaultValue={contact.data.allowed_attachment_types.join(", ")} /></Field>
        </div>
        <div className="mt-5 flex gap-5"><Checkbox name="enabled" label="Contact form enabled" defaultChecked={contact.data.enabled} /><Checkbox name="attachment_enabled" label="Attachments enabled" defaultChecked={contact.data.attachment_enabled} /></div>
      </ActionForm>

      <ActionForm action={saveDeliverySettingsAction} className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-8" submitLabel="Save private delivery settings">
        <h2 className="text-lg font-semibold">Private contact delivery</h2>
        <p className="mt-1 text-sm text-amber-800">Administrator-only. This value is loaded separately and is never passed to public components.</p>
        <div className="mt-5 max-w-xl"><Field label="Destination key" name="destination_key"><TextInput name="destination_key" defaultValue={delivery.data.destination_key ?? ""} autoComplete="off" /></Field></div>
      </ActionForm>
    </div>
  );
}
