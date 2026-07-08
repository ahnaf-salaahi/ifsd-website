"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncEmbedding, deleteEmbedding } from "@/lib/syncEmbedding";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string | null;
  published: boolean;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function BlogForm({ blog }: { blog?: Blog }) {
  const router = useRouter();
  const [title, setTitle] = useState(blog?.title ?? "");
  const [content, setContent] = useState(blog?.content ?? "");
  const [author, setAuthor] = useState(blog?.author ?? "");
  const [published, setPublished] = useState(blog?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const supabase = createClient();

    if (blog) {
      const { error } = await supabase
        .from("blogs")
        .update({ title, content, author, published })
        .eq("id", blog.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      if (published) {
        const text = `Blog Post: ${title}\n${content}\nAuthor: ${author ?? "N/A"}`;
        syncEmbedding("blog", blog.id, text);
      } else {
        deleteEmbedding("blog", blog.id);
      }
    } else {
      const slug = slugify(title);
      const { data, error } = await supabase
        .from("blogs")
        .insert({ title, slug, content, author, published })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      if (published && data) {
        const text = `Blog Post: ${title}\n${content}\nAuthor: ${author ?? "N/A"}`;
        syncEmbedding("blog", data.id, text);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      router.push("/admin/blogs");
      router.refresh();
    }, 700);
  }

  async function handleDelete() {
    if (!blog) return;
    if (!confirm("Delete this blog post? This cannot be undone.")) return;

    const supabase = createClient();
    const { error } = await supabase.from("blogs").delete().eq("id", blog.id);

    if (error) {
      setError(error.message);
      return;
    }

    deleteEmbedding("blog", blog.id);

    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-2xl p-8 max-w-2xl space-y-5"
    >
      <div>
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Author</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Edu First Team"
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Content</label>
        <textarea
          required
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded border-gray-300"
        />
        Published (visible to the public)
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || saved}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-90 ${
            saved ? "bg-green-600 text-white" : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          {saved ? "Saved \u2713" : saving ? "Saving..." : blog ? "Save Changes" : "Create Post"}
        </button>

        {blog && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 text-sm font-medium hover:underline"
          >
            Delete Post
          </button>
        )}
      </div>
    </form>
  );
}
