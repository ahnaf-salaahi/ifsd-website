import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  if (!adminRecord) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar fullName={adminRecord.full_name} />
      <main className="flex-1 p-6 lg:p-8 min-w-0">{children}</main>
    </div>
  );
}