import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Protège /admin/* : redirection vers /admin/login si non authentifié. */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
