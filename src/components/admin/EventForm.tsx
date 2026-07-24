"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncEmbedding, deleteEmbedding } from "@/lib/syncEmbedding";
import { Upload } from "lucide-react";
import RegistrationFormBuilder, {
  RegistrationFormBuilderHandle,
} from "@/components/admin/RegistrationFormBuilder";

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string | null;
  location: string | null;
  registration_open: boolean | null;
  cover_image_url: string | null;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function EventForm({ event }: { event?: Event }) {
  const router = useRouter();
  const formBuilderRef = useRef<RegistrationFormBuilderHandle>(null);
  const [eventId, setEventId] = useState(event?.id ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventDate, setEventDate] = useState(
    event?.event_date ? event.event_date.slice(0, 16) : ""
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [registrationOpen, setRegistrationOpen] = useState(
    event?.registration_open ?? true
  );
  const [coverImageUrl, setCoverImageUrl] = useState(event?.cover_image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleFlyerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `flyer-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);
    setCoverImageUrl(urlData.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const supabase = createClient();

    if (eventId) {
      const { error } = await supabase
        .from("events")
        .update({
          title,
          description,
          event_date: eventDate || null,
          location: location.trim() || null,
          registration_open: registrationOpen,
          cover_image_url: coverImageUrl || null,
        })
        .eq("id", eventId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      try {
        await formBuilderRef.current?.save(eventId);
      } catch (builderError) {
        setError(
          `Event details were saved, but the registration form was not: ${
            builderError instanceof Error
              ? builderError.message
              : "Unknown error"
          }`
        );
        setSaving(false);
        return;
      }

      const text = `Event: ${title}\n${description}\nDate: ${eventDate || "To be announced"}\nLocation: ${location || "To be announced"}\nRegistration Open: ${registrationOpen}`;
      syncEmbedding("event", eventId, text);

      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        router.push(`/admin/events/${eventId}`);
        router.refresh();
      }, 700);
    } else {
      const slug = slugify(title);
      const { data, error } = await supabase
        .from("events")
        .insert({
          title,
          slug,
          description,
          event_date: eventDate || null,
          location: location.trim() || null,
          registration_open: registrationOpen,
          cover_image_url: coverImageUrl || null,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      if (data) {
        setEventId(data.id);
        try {
          await formBuilderRef.current?.save(data.id);
        } catch (builderError) {
          setError(
            `The event was created, but the registration form was not saved. You can safely save again. ${
              builderError instanceof Error
                ? builderError.message
                : "Unknown error"
            }`
          );
          setSaving(false);
          return;
        }

        const text = `Event: ${title}\n${description}\nDate: ${eventDate || "To be announced"}\nLocation: ${location || "To be announced"}\nRegistration Open: ${registrationOpen}`;
        syncEmbedding("event", data.id, text);
      }

      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        router.push(`/admin/events/${data.id}`);
        router.refresh();
      }, 700);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm("Delete this event? This cannot be undone.")) return;

    const supabase = createClient();
    const { data: registrationForm, error: formLookupError } = await supabase
      .from("forms")
      .select("id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (formLookupError) {
      setError(`Could not check registration data: ${formLookupError.message}`);
      return;
    }

    if (registrationForm) {
      const { error: disableFormError } = await supabase
        .from("forms")
        .update({ is_active: false })
        .eq("id", registrationForm.id);
      if (disableFormError) {
        setError(`Could not close registration: ${disableFormError.message}`);
        return;
      }

      const { count: submissionCount, error: submissionsError } = await supabase
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .eq("form_id", registrationForm.id);
      if (submissionsError) {
        setError(`Could not check registration submissions: ${submissionsError.message}`);
        return;
      }
      if (submissionCount) {
        setError(
          "This event has registration submissions and cannot be deleted. It has been closed for new registrations."
        );
        return;
      }

      const { data: uploadIntents, error: uploadsError } = await supabase
        .from("form_upload_intents")
        .select("object_path")
        .eq("form_id", registrationForm.id);

      if (uploadsError) {
        setError(`Could not check registration uploads: ${uploadsError.message}`);
        return;
      }

      const uploadPaths = (uploadIntents ?? []).map(
        (upload) => upload.object_path
      );
      if (uploadPaths.length) {
        const { error: removeUploadsError } = await supabase.storage
          .from("form-uploads")
          .remove(uploadPaths);
        if (removeUploadsError) {
          setError(`Could not remove registration uploads: ${removeUploadsError.message}`);
          return;
        }
      }

      const { error: formDeleteError } = await supabase
        .from("forms")
        .delete()
        .eq("id", registrationForm.id);
      if (formDeleteError) {
        setError(`Could not delete the registration form: ${formDeleteError.message}`);
        return;
      }
    }

    const { error } = await supabase.from("events").delete().eq("id", event.id);

    if (error) {
      setError(error.message);
      return;
    }

    deleteEmbedding("event", event.id);

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-2xl p-8 max-w-2xl space-y-5"
    >
      <div>
        <label className="text-sm font-medium text-gray-700">Event Title</label>
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
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Date & Time <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Location <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Colombo or Online (Zoom)"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Event Flyer / Cover Image (optional)</label>
        <div className="mt-1 flex items-center gap-4">
          <label className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload Flyer"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFlyerUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {coverImageUrl && (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={coverImageUrl}
                alt="Event flyer preview"
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <RegistrationFormBuilder
        ref={formBuilderRef}
        ownerType="event"
        ownerId={event?.id}
        initialEnabled={registrationOpen}
        onEnabledChange={setRegistrationOpen}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || saved}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-90 whitespace-nowrap ${
            saved ? "bg-green-600 text-white" : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          {saved ? "Saved \u2713" : saving ? "Saving..." : event ? "Save Changes" : "Create Event"}
        </button>

        {event && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 text-sm font-medium hover:underline"
          >
            Delete Event
          </button>
        )}
      </div>
    </form>
  );
}
