import PageHeader from "@/components/admin/cms/PageHeader";
import TeamMemberForm from "@/components/admin/cms/TeamMemberForm";

export default function NewTeamMemberPage() {
  return <div><PageHeader title="Add team member" description="Create the public profile first; private contacts and owned media can be added afterward." /><div className="mt-6"><TeamMemberForm media={[]} /></div></div>;
}
