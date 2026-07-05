import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { User, Calendar } from "lucide-react";

export const revalidate = 0;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!blog) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 pt-16 pb-24">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
        {blog.title}
      </h1>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        {blog.author && (
          <span className="flex items-center gap-1">
            <User size={16} /> {blog.author}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={16} /> {formatDate(blog.created_at)}
        </span>
      </div>
      <div className="mt-8 text-gray-700 leading-relaxed whitespace-pre-line">
        {blog.content}
      </div>
    </article>
  );
}