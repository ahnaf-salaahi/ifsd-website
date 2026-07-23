import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";
import StatusBadge from "@/components/admin/cms/StatusBadge";
import ActionButton from "@/components/admin/cms/ActionButton";
import { toggleOfficeAction } from "../actions/offices";

export const dynamic = "force-dynamic";

export default async function OfficesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("office_locations").select("*").order("display_order").order("id").limit(200);
  return (
    <div>
      <PageHeader title="Offices" description="Manage public office locations. This schema has no office image field." actionHref="/admin/cms/offices/new" actionLabel="Add office" />
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Offices could not be loaded.</div>}
      <div className="mt-6 grid gap-4">
        {(data ?? []).map((office) => (
          <article key={office.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><div className="flex items-center gap-2"><h2 className="font-semibold">{office.name}</h2>{office.is_primary && <span className="rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-700">Primary</span>}</div><p className="mt-1 text-sm text-gray-500">{office.address_line_1}, {office.city}</p></div>
              <StatusBadge active={office.is_active} />
            </div>
            <div className="mt-4 flex gap-4"><Link href={`/admin/cms/offices/${office.id}`} className="text-sm font-medium text-rose-600">Edit</Link><ActionButton action={toggleOfficeAction} fields={{ id: office.id, active: String(!office.is_active) }} label={office.is_active ? "Deactivate" : "Activate"} confirmMessage={office.is_active && office.is_primary ? "A primary office cannot be deactivated until another is selected." : office.is_active ? "Deactivate this office?" : undefined} /></div>
          </article>
        ))}
        {!error && !data?.length && <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500">No offices configured.</div>}
      </div>
    </div>
  );
}
