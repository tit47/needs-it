-- Étape 03 — Workflow professionnel : liens sécurisés par demande/pro

CREATE TABLE request_professional_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id       UUID NOT NULL REFERENCES requests (id),
  professional_id  UUID NOT NULL REFERENCES professionals (id),
  token            TEXT NOT NULL,
  distance_km      DOUBLE PRECISION NOT NULL,
  email_sent_at    TIMESTAMPTZ,
  link_opened_at   TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT request_professional_links_token_unique UNIQUE (token),
  CONSTRAINT request_professional_links_request_pro_unique UNIQUE (request_id, professional_id)
);

CREATE INDEX idx_request_professional_links_token ON request_professional_links (token);
CREATE INDEX idx_request_professional_links_request_id ON request_professional_links (request_id);
CREATE INDEX idx_request_professional_links_professional_id ON request_professional_links (professional_id);
CREATE INDEX idx_request_professional_links_active ON request_professional_links (active);

ALTER TABLE request_professional_links ENABLE ROW LEVEL SECURITY;
