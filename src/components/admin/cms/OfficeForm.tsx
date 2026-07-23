import type { Tables } from "@/types/database.types";
import ActionForm from "./ActionForm";
import { Checkbox, Field, TextArea, TextInput } from "./FormFields";
import { saveOfficeAction } from "@/app/admin/(protected)/cms/actions/offices";

export default function OfficeForm({
  office,
}: {
  office?: Tables<"office_locations">;
}) {
  return (
    <ActionForm
      action={saveOfficeAction}
      sticky
      className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8"
    >
      <input type="hidden" name="id" value={office?.id ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Office name" name="name"><TextInput name="name" defaultValue={office?.name ?? ""} required /></Field>
        <Field label="Address line 1" name="address_line_1"><TextInput name="address_line_1" defaultValue={office?.address_line_1 ?? ""} required /></Field>
        <Field label="Address line 2" name="address_line_2"><TextInput name="address_line_2" defaultValue={office?.address_line_2 ?? ""} /></Field>
        <Field label="City" name="city"><TextInput name="city" defaultValue={office?.city ?? ""} required /></Field>
        <Field label="District" name="district"><TextInput name="district" defaultValue={office?.district ?? ""} /></Field>
        <Field label="Province" name="province"><TextInput name="province" defaultValue={office?.province ?? ""} /></Field>
        <Field label="Postal code" name="postal_code"><TextInput name="postal_code" defaultValue={office?.postal_code ?? ""} /></Field>
        <Field label="Country" name="country"><TextInput name="country" defaultValue={office?.country ?? "Sri Lanka"} required /></Field>
        <Field label="Phone" name="phone"><TextInput name="phone" defaultValue={office?.phone ?? ""} /></Field>
        <Field label="Email" name="email"><TextInput type="email" name="email" defaultValue={office?.email ?? ""} /></Field>
        <Field label="Map URL" name="map_url"><TextInput type="url" name="map_url" defaultValue={office?.map_url ?? ""} placeholder="https://…" /></Field>
        <Field label="Display order" name="display_order"><TextInput type="number" min={0} name="display_order" defaultValue={office?.display_order ?? 0} /></Field>
        <Field label="Latitude" name="latitude"><TextInput type="number" step="any" name="latitude" defaultValue={office?.latitude ?? ""} /></Field>
        <Field label="Longitude" name="longitude"><TextInput type="number" step="any" name="longitude" defaultValue={office?.longitude ?? ""} /></Field>
      </div>
      <div className="mt-5"><Field label="Office hours" name="office_hours"><TextArea name="office_hours" rows={4} defaultValue={office?.office_hours ?? ""} /></Field></div>
      <div className="mt-5 flex flex-wrap gap-5">
        <Checkbox name="is_active" label="Active" defaultChecked={office?.is_active ?? true} />
        <Checkbox name="is_primary" label="Primary office" defaultChecked={office?.is_primary ?? false} />
      </div>
    </ActionForm>
  );
}
