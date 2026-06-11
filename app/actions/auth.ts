"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInAdminAction(
  email: string,
  password: string
): Promise<{ success: false; error: string } | void> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    return {
      success: false,
      error: "Identifiants incorrects. Vérifiez votre email et mot de passe.",
    };
  }

  redirect("/admin");
}

export async function signOutAdminAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
