"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2 } from "lucide-react";

type Photo = {
  id: string;
  photo_url: string;
  caption: string | null;
};

export default function EventPhotoUpload({
  eventId,
  photos,
}: {
  eventId: string;
  photos: Photo[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("event_photos")
      .insert({ event_id: eventId, photo_url: urlData.publicUrl });

    if (insertError) {
      setError(insertError.message);
      setUploading(false);
      return;
    }

    setUploading(false);
    router.refresh();
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("event_photos").delete().eq("id", photoId);

    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Photos</h2>

      <label className="flex items-center gap-2 w-fit bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
        <Upload size={16} />
        {uploading ? "Uploading..." : "Upload Photo"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="group relative h-32 overflow-hidden rounded-xl">
            <Image
              src={p.photo_url}
              alt={p.caption || "Event photo"}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleDeletePhoto(p.id)}
              aria-label="Delete Event photo"
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} className="text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
