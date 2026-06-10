export type {
  Alert,
  AlertLevel,
  AppSetting,
  CandidateProfessional,
  CandidateStatus,
  Category,
  Claim,
  ClaimStatus,
  CoverageAlert,
  Database,
  Invoice,
  Professional,
  Request,
  RequestEvent,
  RequestEventType,
  RequestPhoto,
  RequestProfessionalLink,
  RequestStatus,
} from "./database";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database";

// Typage souple : le schéma Database est maintenu manuellement.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseDbClient = SupabaseClient<any>;
