import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (!blog) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Blog Post</h1>
      <BlogForm blog={blog} />
    </div>
  );
}