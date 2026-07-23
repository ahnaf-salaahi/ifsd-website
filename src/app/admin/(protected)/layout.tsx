import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/cms/auth";
import { CmsError } from "@/lib/cms/errors";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let fullName: string;
  try {
    const { administrator } = await requireAdmin();
    fullName = administrator.full_name;
  } catch (error) {
    if (
      error instanceof CmsError &&
      (error.code === "unauthenticated" || error.code === "forbidden")
    ) {
      redirect("/admin/login");
    }
    throw error;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar fullName={fullName} />
      <main className="flex-1 p-6 lg:p-8 min-w-0">{children}</main>
    </div>
  );
}
