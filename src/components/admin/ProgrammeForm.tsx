"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload } from "lucide-react";

type Programme = {
  id: string;
  title: string;
  description: string;
  category: "past" | "upcoming";
  image_url: string | null;
  published: boolean;
};

export default function ProgrammeForm({ programme }: { programme?: Programme }) {
  const router = useRouter();
  const [title, setTitle] = useState(programme?.title ?? "");
  const [description, setDescription] = useState(programme?.description ?? "");
  const [category, setCategory] = useState<"past" | "upcoming">(
    programme?.category ?? "upcoming"
  );
  const [imageUrl, setImageUrl] = useState(programme?.image_url ?? "");
  const [published, setPublished] = useState(programme?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `programme-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = { title, description, category, image_url: imageUrl || null, published };

    if (programme) {
      const { error } = await supabase
        .from("programmes")
        .update(payload)
        .eq("id", programme.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("programmes").insert(payload);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/programmes");
    router.refresh();
  }

  async function handleDelete() {
    if (!programme) return;
    if (!confirm("Delete this programme? This cannot be undone.")) return;

    const supabase = createClient();
    const { error } = await supabase.from("programmes").delete().eq("id", programme.id);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/programmes");
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
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "past" | "upcoming")}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="upcoming">Upcoming Programme</option>
          <option value="past">Past Programme</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Image (optional)</label>
        <div className="mt-1 flex items-center gap-4">
          <label className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {imageUrl && (
            <img src={imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
          )}
        </div>
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
          disabled={saving}
          className="bg-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {saving ? "Saving..." : programme ? "Save Changes" : "Create Programme"}
        </button>

        {programme && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 text-sm font-medium hover:underline whitespace-nowrap"
          >
            Delete Programme
          </button>
        )}
      </div>
    </form>
  );
}