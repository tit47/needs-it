"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  claimMission,
  releaseMission,
} from "@/services/pro-workflow.service";

export type ProActionResult =
  | { success: true }
  | { success: false; error: string };

export async function claimMissionAction(
  token: string,
  missionCode: string
): Promise<ProActionResult> {
  const client = createAdminClient();
  return claimMission(client, token, missionCode);
}

export async function releaseMissionAction(
  token: string
): Promise<ProActionResult> {
  const client = createAdminClient();
  return releaseMission(client, token);
}
