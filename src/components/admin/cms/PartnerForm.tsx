import type { Tables } from "@/types/database.types";
import type { MediaPickerOption } from "./MediaPickerField";
import ActionForm from "./ActionForm";
import MediaPickerField from "./MediaPickerField";
import { Checkbox, Field, TextArea, TextInput } from "./FormFields";
import { savePartnerAction } from "@/app/admin/(protected)/cms/actions/partners";

export default function PartnerForm({ partner, types, media }: { partner?: Tables<"partners">; types: Pick<Tables<"partner_types">, "type_key" | "display_name">[]; media: MediaPickerOption[] }) {
  return (
    <ActionForm action={savePartnerAction} sticky className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
      <input type="hidden" name="id" value={partner?.id ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name"><TextInput name="name" defaultValue={partner?.name ?? ""} required /></Field>
        <Field label="Partner type" name="partner_type"><select id="partner_type" name="partner_type" defaultValue={partner?.partner_type ?? types[0]?.type_key} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">{types.map((type) => <option key={type.type_key} value={type.type_key}>{type.display_name}</option>)}</select></Field>
        <Field label="Website" name="website_url"><TextInput type="url" name="website_url" defaultValue={partner?.website_url ?? ""} placeholder="https://…" /></Field>
        <Field label="Display order" name="display_order"><TextInput type="number" min={0} name="display_order" defaultValue={partner?.display_order ?? 0} /></Field>
      </div>
      <div className="mt-5"><Field label="Description" name="description"><TextArea name="description" defaultValue={partner?.description ?? ""} rows={6} /></Field></div>
      {partner ? <div className="mt-5"><MediaPickerField name="logo_path" label="Partner logo" value={partner.logo_path} options={media} compatibleKinds={["partner"]} uploadKind="partner" ownerId={partner.id} /></div> : <p className="mt-5 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Save the partner first, then attach partner-owned media.</p>}
      <div className="mt-5 flex gap-5"><Checkbox name="is_active" label="Active" defaultChecked={partner?.is_active ?? true} /><Checkbox name="is_featured" label="Featured" defaultChecked={partner?.is_featured ?? false} /></div>
    </ActionForm>
  );
}
