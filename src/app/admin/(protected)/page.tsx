import { createClient } from "@/lib/supabase/server";
import { FileText, CalendarDays, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: blogCount },
    { count: eventCount },
    { count: legacyRegCount },
    { count: dynamicRegCount },
  ] = await Promise.all([
    supabase.from("blogs").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { icon: FileText, label: "Blog Posts", value: blogCount ?? 0 },
    { icon: CalendarDays, label: "Events", value: eventCount ?? 0 },
    {
      icon: Users,
      label: "Total Registrations",
      value: (legacyRegCount ?? 0) + (dynamicRegCount ?? 0),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-500">
        Welcome back — here&apos;s a quick overview.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <stat.icon className="text-rose-600" size={24} />
            <div className="mt-3 text-3xl font-semibold text-gray-900">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
