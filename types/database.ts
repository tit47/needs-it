export type RequestStatus =
  | "pending"
  | "claimed"
  | "completed"
  | "cancelled"
  | "no_match";

export type ClaimStatus = "claimed" | "released" | "completed";

export type CandidateStatus =
  | "pending"
  | "accepted"
  | "refused"
  | "suspended";

export type AlertLevel = "red" | "orange" | "green";

export type RequestEventType =
  | "request_created"
  | "email_sent"
  | "link_opened"
  | "mission_claimed"
  | "mission_released"
  | "mission_completed";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  active: boolean;
  created_at: string;
}

export interface Professional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  siren: string;
  categories: string[];
  radius_km: number;
  active: boolean;
  rating: number | null;
  response_rate: number | null;
  completed_jobs: number;
  subscription_level: string | null;
  created_at: string;
}

export interface CandidateProfessional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  siren: string;
  categories: string[];
  radius_km: number;
  status: CandidateStatus;
  created_at: string;
}

export interface Request {
  id: string;
  category_id: string;
  description: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  mission_code: string;
  status: RequestStatus;
  first_pro_distance: number | null;
  professional_count: number | null;
  search_extended: boolean;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestPhoto {
  id: string;
  request_id: string;
  photo_url: string;
  created_at: string;
}

export interface Claim {
  id: string;
  request_id: string;
  professional_id: string;
  claimed_at: string | null;
  released_at: string | null;
  status: ClaimStatus;
  created_at: string;
}

export interface Alert {
  id: string;
  request_id: string | null;
  city: string;
  category: string;
  level: AlertLevel;
  message: string;
  resolved: boolean;
  created_at: string;
}

export interface CoverageAlert {
  id: string;
  city: string;
  category: string;
  request_count: number;
  success_count: number;
  level: AlertLevel;
  resolved: boolean;
  first_seen: string;
  last_seen: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  professional_id: string;
  month: string;
  mission_count: number;
  amount: number;
  invoice_sent: boolean;
  paid: boolean;
  created_at: string;
}

export interface RequestEvent {
  id: string;
  request_id: string;
  event_type: RequestEventType;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Category>;
      };
      professionals: {
        Row: Professional;
        Insert: Omit<Professional, "id" | "created_at" | "completed_jobs"> & {
          id?: string;
          created_at?: string;
          completed_jobs?: number;
        };
        Update: Partial<Professional>;
      };
      candidate_professionals: {
        Row: CandidateProfessional;
        Insert: Omit<CandidateProfessional, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CandidateProfessional>;
      };
      requests: {
        Row: Request;
        Insert: Omit<Request, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Request>;
      };
      request_photos: {
        Row: RequestPhoto;
        Insert: Omit<RequestPhoto, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<RequestPhoto>;
      };
      claims: {
        Row: Claim;
        Insert: Omit<Claim, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Claim>;
      };
      alerts: {
        Row: Alert;
        Insert: Omit<Alert, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Alert>;
      };
      coverage_alerts: {
        Row: CoverageAlert;
        Insert: Omit<CoverageAlert, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CoverageAlert>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Invoice>;
      };
      request_events: {
        Row: RequestEvent;
        Insert: Omit<RequestEvent, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<RequestEvent>;
      };
    };
  };
}
