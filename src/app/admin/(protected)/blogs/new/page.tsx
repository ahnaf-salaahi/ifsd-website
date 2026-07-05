import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Blog Post</h1>
      <BlogForm />
    </div>
  );
}