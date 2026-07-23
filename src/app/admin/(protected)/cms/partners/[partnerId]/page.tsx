import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { getAdminMediaPickerOptions } from "@/lib/cms/media";
import PageHeader from "@/components/admin/cms/PageHeader";
import PartnerForm from "@/components/admin/cms/PartnerForm";
import { isUuid } from "@/lib/cms/validation";

export const dynamic = "force-dynamic";
export default async function EditPartnerPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params; if (!isUuid(partnerId)) notFound(); const { supabase } = await requireAdmin();
  const [partner, types, allMedia] = await Promise.all([supabase.from("partners").select("*").eq("id", partnerId).maybeSingle(), supabase.from("partner_types").select("type_key,display_name").eq("is_active", true).order("display_name"), getAdminMediaPickerOptions(["partner"])]);
  if (!partner.data) notFound(); const media = allMedia.filter((item) => item.objectPath.startsWith(`partners/${partnerId}/`));
  return <div><PageHeader title={partner.data.name} /><div className="mt-6"><PartnerForm partner={partner.data} types={types.data ?? []} media={media} /></div></div>;
}
