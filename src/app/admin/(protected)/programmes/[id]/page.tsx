import { redirect } from "next/navigation";

export default async function LegacyEditProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/programmes/${id}/edit`);
}
