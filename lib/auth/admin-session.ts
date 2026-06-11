import { createClient } from "@/lib/supabase/server";

export type AdminAuthFailure = { success: false; error: string };

/**
 * Vérifie qu'une session Supabase Auth valide est présente (protection des server actions admin).
 */
export async function requireAdminSession(): Promise<AdminAuthFailure | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Session expirée. Reconnectez-vous.",
    };
  }

  return null;
}
