import type { Tables } from "@/types/database.types";
import type { MediaPickerOption } from "./MediaPickerField";
import ActionForm from "./ActionForm";
import MediaPickerField from "./MediaPickerField";
import { Checkbox, Field, TextArea, TextInput } from "./FormFields";
import {
  saveTeamContactAction,
  saveTeamMemberAction,
} from "@/app/admin/(protected)/cms/actions/team";

export default function TeamMemberForm({
  member,
  contact,
  media,
}: {
  member?: Tables<"team_members">;
  contact?: Pick<Tables<"team_member_contacts">, "email" | "phone"> | null;
  media: MediaPickerOption[];
}) {
  return (
    <div className="space-y-6">
      <ActionForm action={saveTeamMemberAction} sticky className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8">
        <input type="hidden" name="id" value={member?.id ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="full_name"><TextInput name="full_name" defaultValue={member?.full_name ?? ""} required /></Field>
          <Field label="Designation" name="designation"><TextInput name="designation" defaultValue={member?.designation ?? ""} required /></Field>
          <Field label="LinkedIn URL" name="linkedin_url"><TextInput type="url" name="linkedin_url" defaultValue={member?.linkedin_url ?? ""} placeholder="https://…" /></Field>
          <Field label="Display order" name="display_order"><TextInput type="number" min={0} name="display_order" defaultValue={member?.display_order ?? 0} /></Field>
        </div>
        <div className="mt-5"><Field label="Biography" name="biography"><TextArea name="biography" defaultValue={member?.biography ?? ""} rows={7} /></Field></div>
        {member ? (
          <div className="mt-5"><MediaPickerField name="photo_path" label="Team photo" value={member.photo_path} options={media} compatibleKinds={["team"]} uploadKind="team" ownerId={member.id} /></div>
        ) : (
          <p className="mt-5 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Save this member first, then attach member-owned media.</p>
        )}
        <div className="mt-5 flex gap-5"><Checkbox name="is_active" label="Active" defaultChecked={member?.is_active ?? true} /><Checkbox name="is_featured" label="Featured" defaultChecked={member?.is_featured ?? false} /></div>
      </ActionForm>
      {member && (
        <ActionForm action={saveTeamContactAction} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-8" submitLabel="Save private contacts">
          <input type="hidden" name="team_member_id" value={member.id} />
          <h2 className="text-lg font-semibold">Administrator-only contacts</h2>
          <p className="mt-1 text-sm text-amber-800">These values are never included in public team queries. Clear both fields to delete the private contact record.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Private email" name="email"><TextInput type="email" name="email" defaultValue={contact?.email ?? ""} autoComplete="off" /></Field>
            <Field label="Private phone" name="phone"><TextInput name="phone" defaultValue={contact?.phone ?? ""} autoComplete="off" /></Field>
          </div>
        </ActionForm>
      )}
    </div>
  );
}
