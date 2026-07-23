import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";
import ActionForm from "@/components/admin/cms/ActionForm";
import ActionButton from "@/components/admin/cms/ActionButton";
import { Checkbox, Field, TextArea, TextInput } from "@/components/admin/cms/FormFields";
import { deleteFaqAction, saveFaqAction } from "../actions/faqs";

export const dynamic = "force-dynamic";

export default async function FaqsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const pageFilter = String(params.page_id ?? ""); const { supabase } = await requireAdmin();
  const pagesResult = await supabase.from("site_pages").select("id,title,page_key").order("title").limit(200);
  let query = supabase.from("site_faqs").select("*").order("display_order").order("id").limit(500);
  if (pageFilter === "global") query = query.is("page_id", null); else if (/^[0-9a-f-]{36}$/i.test(pageFilter)) query = query.eq("page_id", pageFilter);
  const { data, error } = await query; const pages = pagesResult.data ?? [];
  return <div><PageHeader title="FAQs" description="Manage global and page-specific frequently asked questions." />
    <form className="mt-6 flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"><label htmlFor="page_id" className="sr-only">Filter by page</label><select id="page_id" name="page_id" defaultValue={pageFilter} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"><option value="">All FAQs</option><option value="global">Global FAQs</option>{pages.map((page) => <option key={page.id} value={page.id}>{page.title}</option>)}</select><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Filter</button></form>
    {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">FAQs could not be loaded.</div>}
    <div className="mt-6 space-y-4">{(data ?? []).map((faq) => <article key={faq.id} className="rounded-2xl border border-gray-100 bg-white p-5"><FaqForm faq={faq} pages={pages} /><div className="mt-3"><ActionButton action={deleteFaqAction} fields={{ id: faq.id }} label="Delete FAQ" destructive confirmMessage="Delete this FAQ?" /></div></article>)}
      <article className="rounded-2xl border border-dashed bg-white p-5"><h2 className="font-semibold">Add FAQ</h2><div className="mt-4"><FaqForm faq={null} pages={pages} /></div></article>
    </div>
  </div>;
}

function FaqForm({ faq, pages }: { faq: { id: string; page_id: string | null; question: string; answer: string; category: string | null; display_order: number; is_active: boolean } | null; pages: { id: string; title: string; page_key: string }[] }) {
  const key = faq?.id ?? "new";
  return <ActionForm action={saveFaqAction} submitLabel={faq ? "Save FAQ" : "Add FAQ"}><input type="hidden" name="id" value={faq?.id ?? ""} /><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Page" name={`faq-page-${key}`}><select id={`faq-page-${key}`} name="page_id" defaultValue={faq?.page_id ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">Global FAQ</option>{pages.map((page) => <option key={page.id} value={page.id}>{page.title}</option>)}</select></Field>
    <Field label="Category" name={`faq-category-${key}`}><TextInput id={`faq-category-${key}`} name="category" defaultValue={faq?.category ?? ""} /></Field>
    <Field label="Display order" name={`faq-order-${key}`}><TextInput id={`faq-order-${key}`} type="number" min={0} name="display_order" defaultValue={faq?.display_order ?? 0} /></Field>
  </div><div className="mt-4"><Field label="Question" name={`faq-question-${key}`}><TextInput id={`faq-question-${key}`} name="question" defaultValue={faq?.question ?? ""} required /></Field></div><div className="mt-4"><Field label="Answer" name={`faq-answer-${key}`}><TextArea id={`faq-answer-${key}`} name="answer" defaultValue={faq?.answer ?? ""} rows={5} required /></Field></div><div className="mt-4"><Checkbox name="is_active" label="Active" defaultChecked={faq?.is_active ?? true} /></div></ActionForm>;
}
