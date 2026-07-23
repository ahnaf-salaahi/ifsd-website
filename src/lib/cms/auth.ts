import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/types/database.types";
import { CmsError } from "./errors";

export type AdminContext = {
  user: User;
  administrator: Tables<"admin_users">;
  supabase: SupabaseClient<Database>;
};

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    throw new CmsError("unauthenticated", {
      operation: "admin.getUser",
      cause: authError ?? undefined,
    });
  }
  if (authError) {
    throw new CmsError("database", {
      operation: "admin.getUser",
      cause: authError,
    });
  }

  const { data: administrator, error } = await supabase
    .from("admin_users")
    .select("id, full_name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new CmsError("database", {
      operation: "admin.lookup",
      safeDetails: { databaseCode: error.code },
      cause: error,
    });
  }
  if (!administrator) {
    throw new CmsError("forbidden", { operation: "admin.lookup" });
  }

  return { user, administrator, supabase };
}
