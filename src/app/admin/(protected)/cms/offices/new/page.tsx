import PageHeader from "@/components/admin/cms/PageHeader";
import OfficeForm from "@/components/admin/cms/OfficeForm";

export default function NewOfficePage() {
  return <div><PageHeader title="Add office" description="Create a public office location." /><div className="mt-6"><OfficeForm /></div></div>;
}
