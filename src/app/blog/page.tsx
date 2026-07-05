import { createClient } from "@/lib/supabase/server";
import BlogListClient from "@/components/BlogListClient";

export const revalidate = 0;

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return <BlogListClient blogs={blogs ?? []} />;
}