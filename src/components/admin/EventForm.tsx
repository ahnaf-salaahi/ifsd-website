"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  location: string | null;
  registration_open: boolean;
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
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventDate, setEventDate] = useState(
    event?.event_date ? event.event_date.slice(0, 16) : ""
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [registrationOpen, setRegistrationOpen] = useState(
    event?.registration_open ?? true
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();

    if (event) {
      const { error } = await supabase
        .from("events")
        .update({
          title,
          description,
          event_date: eventDate,
          location,
          registration_open: registrationOpen,
        })
        .eq("id", event.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      router.push(`/admin/events/${event.id}`);
      router.refresh();
    } else {
      const slug = slugify(title);
      const { data, error } = await supabase
        .from("events")
        .insert({
          title,
          slug,
          description,
          event_date: eventDate,
          location,
          registration_open: registrationOpen,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      router.push(`/admin/events/${data.id}`);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm("Delete this event? This cannot be undone.")) return;

    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", event.id);

    if (error) {
      setError(error.message);
      return;
    }

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Date & Time</label>
          <input
            required
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Colombo or Online (Zoom)"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={registrationOpen}
          onChange={(e) => setRegistrationOpen(e.target.checked)}
          className="rounded border-gray-300"
        />
        Registration Open
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-rose-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : event ? "Save Changes" : "Create Event"}
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