import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { getAdminMediaPickerOptions } from "@/lib/cms/media";
import PageHeader from "@/components/admin/cms/PageHeader";
import TeamMemberForm from "@/components/admin/cms/TeamMemberForm";
import { isUuid } from "@/lib/cms/validation";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  if (!isUuid(memberId)) notFound();
  const { supabase } = await requireAdmin();
  const [member, contact, allMedia] = await Promise.all([
    supabase.from("team_members").select("*").eq("id", memberId).maybeSingle(),
    supabase.from("team_member_contacts").select("email,phone").eq("team_member_id", memberId).maybeSingle(),
    getAdminMediaPickerOptions(["team"]),
  ]);
  if (member.error || !member.data) notFound();
  const media = allMedia.filter((item) => item.objectPath.startsWith(`team/${memberId}/`));
  return <div><PageHeader title={member.data.full_name} description="Edit the public profile and administrator-only contacts." /><div className="mt-6"><TeamMemberForm member={member.data} contact={contact.data} media={media} /></div></div>;
}
