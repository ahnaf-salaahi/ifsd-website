import { createClient } from "@/lib/supabase/server";
import { FileText, CalendarDays, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: blogCount }, { count: eventCount }, { count: regCount }] =
    await Promise.all([
      supabase.from("blogs").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("event_registrations").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { icon: FileText, label: "Blog Posts", value: blogCount ?? 0 },
    { icon: CalendarDays, label: "Events", value: eventCount ?? 0 },
    { icon: Users, label: "Total Registrations", value: regCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome back — here's a quick overview.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
          >
            <s.icon className="text-rose-600" size={24} />
            <div className="mt-3 text-3xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}