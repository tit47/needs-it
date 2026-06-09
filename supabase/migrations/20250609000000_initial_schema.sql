-- Need's it — Schéma initial V1
-- Philosophie : UUID, pas de suppression, statuts et historique

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE request_status AS ENUM (
  'pending',
  'claimed',
  'completed',
  'cancelled',
  'no_match'
);

CREATE TYPE claim_status AS ENUM (
  'claimed',
  'released',
  'completed'
);

CREATE TYPE candidate_status AS ENUM (
  'pending',
  'accepted',
  'refused',
  'suspended'
);

CREATE TYPE alert_level AS ENUM (
  'red',
  'orange',
  'green'
);

CREATE TYPE request_event_type AS ENUM (
  'request_created',
  'email_sent',
  'link_opened',
  'mission_claimed',
  'mission_released',
  'mission_completed'
);

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  icon       TEXT,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE professionals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  address             TEXT NOT NULL,
  city                TEXT NOT NULL,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  siren               TEXT NOT NULL,
  categories          TEXT[] NOT NULL DEFAULT '{}',
  radius_km           INTEGER NOT NULL DEFAULT 30,
  active              BOOLEAN NOT NULL DEFAULT true,
  rating              NUMERIC(3, 2),
  response_rate       NUMERIC(5, 2),
  completed_jobs      INTEGER NOT NULL DEFAULT 0,
  subscription_level  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT professionals_siren_unique UNIQUE (siren)
);

CREATE TABLE candidate_professionals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL,
  address    TEXT NOT NULL,
  city       TEXT NOT NULL,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  siren      TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  radius_km  INTEGER NOT NULL DEFAULT 30,
  status     candidate_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidate_professionals_siren_unique UNIQUE (siren)
);

CREATE TABLE requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         UUID NOT NULL REFERENCES categories (id),
  description         TEXT NOT NULL,
  client_name         TEXT NOT NULL,
  client_phone        TEXT NOT NULL,
  client_address      TEXT NOT NULL,
  city                TEXT NOT NULL,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  mission_code        TEXT NOT NULL,
  status              request_status NOT NULL DEFAULT 'pending',
  first_pro_distance  DOUBLE PRECISION,
  professional_count  INTEGER,
  search_extended     BOOLEAN NOT NULL DEFAULT false,
  claimed_by          UUID REFERENCES professionals (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT requests_mission_code_unique UNIQUE (mission_code)
);

CREATE TABLE request_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests (id),
  photo_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID NOT NULL REFERENCES requests (id),
  professional_id UUID NOT NULL REFERENCES professionals (id),
  claimed_at      TIMESTAMPTZ,
  released_at     TIMESTAMPTZ,
  status          claim_status NOT NULL DEFAULT 'claimed',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests (id),
  city       TEXT NOT NULL,
  category   TEXT NOT NULL,
  level      alert_level NOT NULL,
  message    TEXT NOT NULL,
  resolved   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coverage_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city          TEXT NOT NULL,
  category      TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  level         alert_level NOT NULL,
  resolved      BOOLEAN NOT NULL DEFAULT false,
  first_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals (id),
  month           TEXT NOT NULL,
  mission_count   INTEGER NOT NULL DEFAULT 0,
  amount          NUMERIC(10, 2) NOT NULL DEFAULT 0,
  invoice_sent    BOOLEAN NOT NULL DEFAULT false,
  paid            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invoices_professional_month_unique UNIQUE (professional_id, month)
);

CREATE TABLE request_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests (id),
  event_type request_event_type NOT NULL,
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Index ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_categories_active ON categories (active);
CREATE INDEX idx_categories_name ON categories (name);

CREATE INDEX idx_professionals_city ON professionals (city);
CREATE INDEX idx_professionals_active ON professionals (active);
CREATE INDEX idx_professionals_categories ON professionals USING GIN (categories);

CREATE INDEX idx_candidate_professionals_status ON candidate_professionals (status);

CREATE INDEX idx_requests_status ON requests (status);
CREATE INDEX idx_requests_city ON requests (city);
CREATE INDEX idx_requests_category_id ON requests (category_id);
CREATE INDEX idx_requests_created_at ON requests (created_at DESC);
CREATE INDEX idx_requests_claimed_by ON requests (claimed_by);

CREATE INDEX idx_request_photos_request_id ON request_photos (request_id);

CREATE INDEX idx_claims_request_id ON claims (request_id);
CREATE INDEX idx_claims_professional_id ON claims (professional_id);
CREATE INDEX idx_claims_status ON claims (status);

CREATE INDEX idx_alerts_resolved ON alerts (resolved);
CREATE INDEX idx_alerts_level ON alerts (level);
CREATE INDEX idx_alerts_city_category ON alerts (city, category);

CREATE INDEX idx_coverage_alerts_city_category ON coverage_alerts (city, category);
CREATE INDEX idx_coverage_alerts_resolved ON coverage_alerts (resolved);
CREATE INDEX idx_coverage_alerts_level ON coverage_alerts (level);

CREATE INDEX idx_invoices_professional_id ON invoices (professional_id);
CREATE INDEX idx_invoices_month ON invoices (month);

CREATE INDEX idx_request_events_request_id ON request_events (request_id);
CREATE INDEX idx_request_events_event_type ON request_events (event_type);
CREATE INDEX idx_request_events_created_at ON request_events (created_at DESC);

-- ─── Triggers ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_requests_updated_at();

-- ─── Storage ─────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('request-photos', 'request-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Données initiales : catégories ──────────────────────────────────────────

INSERT INTO categories (name, icon) VALUES
  ('Plombier', 'wrench'),
  ('Électricien', 'zap'),
  ('Chauffagiste', 'flame'),
  ('Serrurier', 'key'),
  ('Climatisation', 'wind'),
  ('Dépannage informatique', 'monitor'),
  ('Réparation électroménager', 'plug'),
  ('Mécanicien automobile', 'car'),
  ('Homme à tout faire', 'hammer'),
  ('Peintre', 'paintbrush'),
  ('Menuisier', 'ruler'),
  ('Maçon', 'brick-wall'),
  ('Plaquiste', 'layout'),
  ('Carreleur', 'grid-3x3'),
  ('Jardinier', 'flower-2'),
  ('Élagueur', 'tree-pine'),
  ('Pisciniste', 'waves'),
  ('Paysagiste', 'mountain'),
  ('Vitrier', 'square'),
  ('Couvreur', 'home'),
  ('Nettoyage', 'sparkles');

-- ─── Row Level Security (préparation) ────────────────────────────────────────
-- Les politiques détaillées seront ajoutées à l'étape authentification admin.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_events ENABLE ROW LEVEL SECURITY;
