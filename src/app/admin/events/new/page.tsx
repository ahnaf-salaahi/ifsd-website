import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Event</h1>
      <EventForm />
    </div>
  );
}