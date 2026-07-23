import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { getAdminMediaPickerOptions } from "@/lib/cms/media";
import PageHeader from "@/components/admin/cms/PageHeader";
import TestimonialForm from "@/components/admin/cms/TestimonialForm";
import { isUuid } from "@/lib/cms/validation";

export const dynamic = "force-dynamic";
export default async function EditTestimonialPage({ params }: { params: Promise<{ testimonialId: string }> }) {
  const { testimonialId } = await params; if (!isUuid(testimonialId)) notFound(); const { supabase } = await requireAdmin();
  const [item, provenance, types, programmes, allMedia] = await Promise.all([supabase.from("testimonials").select("*").eq("id", testimonialId).maybeSingle(), supabase.from("testimonial_sources").select("source_reference,internal_notes").eq("testimonial_id", testimonialId).maybeSingle(), supabase.from("testimonial_source_types").select("type_key,display_name").eq("is_active", true).order("display_name"), supabase.from("programmes").select("id,title").order("title").limit(500), getAdminMediaPickerOptions(["testimonial"])]);
  if (!item.data) notFound(); const media = allMedia.filter((entry) => entry.objectPath.startsWith(`testimonials/${testimonialId}/`));
  return <div><PageHeader title={item.data.author_name} description="Edit public content and administrator-only provenance separately." /><div className="mt-6"><TestimonialForm testimonial={item.data} provenance={provenance.data} sourceTypes={types.data ?? []} programmes={programmes.data ?? []} media={media} /></div></div>;
}
