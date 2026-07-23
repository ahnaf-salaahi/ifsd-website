import { requireAdmin } from "@/lib/cms/auth";
import PageHeader from "@/components/admin/cms/PageHeader";
import TestimonialForm from "@/components/admin/cms/TestimonialForm";

export default async function NewTestimonialPage() {
  const { supabase } = await requireAdmin(); const [types, programmes] = await Promise.all([supabase.from("testimonial_source_types").select("type_key,display_name").eq("is_active", true).order("display_name"), supabase.from("programmes").select("id,title").order("title").limit(500)]);
  return <div><PageHeader title="Add testimonial" /><div className="mt-6"><TestimonialForm sourceTypes={types.data ?? []} programmes={programmes.data ?? []} media={[]} /></div></div>;
}
