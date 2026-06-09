-- Lecture publique des catégories actives (formulaire client)

CREATE POLICY "categories_public_read"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (active = true);
