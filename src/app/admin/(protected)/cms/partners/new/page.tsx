import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";
import PartnerForm from "@/components/admin/cms/PartnerForm";

export default async function NewPartnerPage() {
  const { supabase } = await requireAdmin(); const { data } = await supabase.from("partner_types").select("type_key,display_name").eq("is_active", true).order("display_name");
  return <div><PageHeader title="Add partner" /><div className="mt-6"><PartnerForm types={data ?? []} media={[]} /></div></div>;
}
