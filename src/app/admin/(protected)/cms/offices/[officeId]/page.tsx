import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";
import OfficeForm from "@/components/admin/cms/OfficeForm";
import { isUuid } from "@/lib/cms/validation";

export const dynamic = "force-dynamic";

export default async function EditOfficePage({ params }: { params: Promise<{ officeId: string }> }) {
  const { officeId } = await params;
  if (!isUuid(officeId)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("office_locations").select("*").eq("id", officeId).maybeSingle();
  if (!data) notFound();
  return <div><PageHeader title={data.name} description="Edit office details and primary status." /><div className="mt-6"><OfficeForm office={data} /></div></div>;
}
