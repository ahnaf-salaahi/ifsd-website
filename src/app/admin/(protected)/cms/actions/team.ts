"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import { databaseError } from "@/lib/cms/errors";
import {
  executeAdminAction,
  formBoolean,
  formEmail,
  formHttpsUrl,
  formInteger,
  formText,
  formUuid,
} from "./shared";

const refresh = (id?: string) => {
  revalidatePath("/admin/cms/team");
  revalidatePath("/admin/cms");
  if (id) revalidatePath(`/admin/cms/team/${id}`);
};

export async function saveTeamMemberAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  return executeAdminAction("cms.team.save", async ({ supabase }) => {
    const id = await formUuid(formData, "id", true);
    const values = {
      full_name: await formText(formData, "full_name", {
        required: true,
        max: 300,
      }),
      designation: await formText(formData, "designation", {
        required: true,
        max: 300,
      }),
      biography:
        (await formText(formData, "biography", { max: 20000 })) || null,
      biography_format: "plain_text",
      photo_path:
        (await formText(formData, "photo_path", { max: 1024 })) || null,
      linkedin_url: await formHttpsUrl(formData, "linkedin_url"),
      display_order: await formInteger(formData, "display_order"),
      is_active: await formBoolean(formData, "is_active"),
      is_featured: await formBoolean(formData, "is_featured"),
    };
    const result = id
      ? await supabase
          .from("team_members")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase.from("team_members").insert(values).select("id").single();
    if (result.error) throw databaseError("cms.team.save", result.error);
    refresh(result.data.id);
    return { id: result.data.id };
  });
}

export async function saveTeamContactAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.team.contact.save", async ({ supabase }) => {
    const teamMemberId = await formUuid(formData, "team_member_id");
    const email = await formEmail(formData, "email");
    const phone = (await formText(formData, "phone", { max: 50 })) || null;
    if (!email && !phone) {
      const { error } = await supabase
        .from("team_member_contacts")
        .delete()
        .eq("team_member_id", teamMemberId);
      if (error) throw databaseError("cms.team.contact.delete", error);
    } else {
      const { error } = await supabase.from("team_member_contacts").upsert({
        team_member_id: teamMemberId,
        email,
        phone,
      });
      if (error) throw databaseError("cms.team.contact.save", error);
    }
    refresh(teamMemberId);
  });
}
