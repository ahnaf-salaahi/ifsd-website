import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";
import ActionForm from "@/components/admin/cms/ActionForm";
import ActionButton from "@/components/admin/cms/ActionButton";
import { Checkbox, Field, TextInput } from "@/components/admin/cms/FormFields";
import { deleteStatisticAction, saveStatisticAction } from "../actions/statistics";

export const dynamic = "force-dynamic";
export default async function StatisticsPage() {
  const { supabase } = await requireAdmin(); const { data, error } = await supabase.from("homepage_statistics").select("*").order("display_order").order("id").limit(500);
  return <div><PageHeader title="Homepage Statistics" description="Values are stored and displayed as text; no computed metrics are inferred." />{error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">Statistics could not be loaded.</div>}
    <div className="mt-6 grid gap-5 lg:grid-cols-2">{(data ?? []).map((item) => <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5"><div className="mb-4 rounded-xl bg-rose-50 p-4 text-center"><p className="text-3xl font-semibold text-rose-700">{item.prefix}{item.display_value}{item.suffix}</p><p className="text-sm text-rose-900">{item.label}</p></div><StatisticForm item={item} /><div className="mt-3"><ActionButton action={deleteStatisticAction} fields={{ id: item.id }} label="Delete statistic" destructive confirmMessage="Delete this statistic?" /></div></article>)}
      <article className="rounded-2xl border border-dashed bg-white p-5"><h2 className="font-semibold">Add statistic</h2><div className="mt-4"><StatisticForm item={null} /></div></article></div>
  </div>;
}
function StatisticForm({ item }: { item: { id: string; label: string; display_value: string; prefix: string | null; suffix: string | null; supporting_text: string | null; icon_key: string | null; display_order: number; is_active: boolean } | null }) {
  const key = item?.id ?? "new"; return <ActionForm action={saveStatisticAction} submitLabel={item ? "Save statistic" : "Add statistic"}><input type="hidden" name="id" value={item?.id ?? ""} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Label" name={`stat-label-${key}`}><TextInput id={`stat-label-${key}`} name="label" defaultValue={item?.label ?? ""} required /></Field><Field label="Display value" name={`stat-value-${key}`}><TextInput id={`stat-value-${key}`} name="display_value" defaultValue={item?.display_value ?? ""} required /></Field><Field label="Prefix" name={`stat-prefix-${key}`}><TextInput id={`stat-prefix-${key}`} name="prefix" defaultValue={item?.prefix ?? ""} /></Field><Field label="Suffix" name={`stat-suffix-${key}`}><TextInput id={`stat-suffix-${key}`} name="suffix" defaultValue={item?.suffix ?? ""} /></Field><Field label="Supporting text" name={`stat-support-${key}`}><TextInput id={`stat-support-${key}`} name="supporting_text" defaultValue={item?.supporting_text ?? ""} /></Field><Field label="Icon key" name={`stat-icon-${key}`}><TextInput id={`stat-icon-${key}`} name="icon_key" defaultValue={item?.icon_key ?? ""} /></Field><Field label="Display order" name={`stat-order-${key}`}><TextInput id={`stat-order-${key}`} type="number" min={0} name="display_order" defaultValue={item?.display_order ?? 0} /></Field></div><div className="mt-4"><Checkbox name="is_active" label="Active" defaultChecked={item?.is_active ?? true} /></div></ActionForm>;
}
