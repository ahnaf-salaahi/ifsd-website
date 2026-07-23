import type { Tables } from "@/types/database.types";
import type { MediaPickerOption } from "./MediaPickerField";
import ActionForm from "./ActionForm";
import MediaPickerField from "./MediaPickerField";
import { Checkbox, Field, TextArea, TextInput } from "./FormFields";
import {
  saveTestimonialAction,
  saveTestimonialSourceAction,
} from "@/app/admin/(protected)/cms/actions/testimonials";

export default function TestimonialForm({
  testimonial,
  provenance,
  sourceTypes,
  programmes,
  media,
}: {
  testimonial?: Tables<"testimonials">;
  provenance?: Pick<Tables<"testimonial_sources">, "source_reference" | "internal_notes"> | null;
  sourceTypes: Pick<Tables<"testimonial_source_types">, "type_key" | "display_name">[];
  programmes: Pick<Tables<"programmes">, "id" | "title">[];
  media: MediaPickerOption[];
}) {
  const publishable =
    testimonial?.is_active &&
    testimonial.consent_confirmed &&
    testimonial.approved_for_publication &&
    testimonial.published_at &&
    new Date(testimonial.published_at) <= new Date();
  const datetime = testimonial?.published_at
    ? new Date(testimonial.published_at).toISOString().slice(0, 16)
    : "";
  return (
    <div className="space-y-6">
      {testimonial && (
        <div className={`rounded-xl px-4 py-3 text-sm ${publishable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
          {publishable ? "Currently publishable under public RLS." : "Not currently publishable. Check active state, consent, approval, and publication time."}
        </div>
      )}
      <ActionForm action={saveTestimonialAction} sticky className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
        <input type="hidden" name="id" value={testimonial?.id ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Person name" name="author_name"><TextInput name="author_name" defaultValue={testimonial?.author_name ?? ""} required /></Field>
          <Field label="Role or title" name="author_role"><TextInput name="author_role" defaultValue={testimonial?.author_role ?? ""} /></Field>
          <Field label="Organization" name="organisation"><TextInput name="organisation" defaultValue={testimonial?.organisation ?? ""} /></Field>
          <Field label="Source type" name="source_type"><select id="source_type" name="source_type" defaultValue={testimonial?.source_type ?? sourceTypes[0]?.type_key} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">{sourceTypes.map((type) => <option key={type.type_key} value={type.type_key}>{type.display_name}</option>)}</select></Field>
          <Field label="Related programme" name="programme_id"><select id="programme_id" name="programme_id" defaultValue={testimonial?.programme_id ?? ""} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"><option value="">No programme</option>{programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.title}</option>)}</select></Field>
          <Field label="Publish from" name="published_at" hint="The current schema supports a start timestamp but no publish-until timestamp."><TextInput type="datetime-local" name="published_at" defaultValue={datetime} /></Field>
          <Field label="Display order" name="display_order"><TextInput type="number" min={0} name="display_order" defaultValue={testimonial?.display_order ?? 0} /></Field>
        </div>
        <div className="mt-5"><Field label="Testimonial text" name="quote"><TextArea name="quote" defaultValue={testimonial?.quote ?? ""} rows={7} required /></Field></div>
        {testimonial ? <div className="mt-5"><MediaPickerField name="photo_path" label="Testimonial photo" value={testimonial.photo_path} options={media} compatibleKinds={["testimonial"]} uploadKind="testimonial" ownerId={testimonial.id} /></div> : <p className="mt-5 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Save first, then attach testimonial-owned media.</p>}
        <div className="mt-5 flex flex-wrap gap-5">
          <Checkbox name="consent_confirmed" label="Consent confirmed" defaultChecked={testimonial?.consent_confirmed ?? false} />
          <Checkbox name="approved_for_publication" label="Approved for publication" defaultChecked={testimonial?.approved_for_publication ?? false} />
          <Checkbox name="is_active" label="Active" defaultChecked={testimonial?.is_active ?? false} />
          <Checkbox name="is_featured" label="Featured" defaultChecked={testimonial?.is_featured ?? false} />
        </div>
      </ActionForm>
      {testimonial && (
        <ActionForm action={saveTestimonialSourceAction} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-8" submitLabel="Save private provenance">
          <input type="hidden" name="testimonial_id" value={testimonial.id} />
          <h2 className="text-lg font-semibold">Administrator-only provenance</h2>
          <p className="mt-1 text-sm text-amber-800">Never included in public preview data or logs. Clear both fields to delete this provenance record.</p>
          <div className="mt-5 grid gap-5">
            <Field label="Source reference" name="source_reference"><TextInput name="source_reference" defaultValue={provenance?.source_reference ?? ""} autoComplete="off" /></Field>
            <Field label="Internal notes" name="internal_notes"><TextArea name="internal_notes" defaultValue={provenance?.internal_notes ?? ""} rows={6} /></Field>
          </div>
        </ActionForm>
      )}
    </div>
  );
}
