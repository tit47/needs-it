-- Paramètres applicatifs (back-office admin)

CREATE TABLE app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_settings (key, value) VALUES
  ('mission_price_eur', '5'),
  ('sender_email', 'Need''s it <noreply@needs-it.fr>'),
  ('telegram_notifications_enabled', 'false');

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
