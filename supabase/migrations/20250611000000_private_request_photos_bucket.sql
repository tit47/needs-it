-- Rendre le bucket request-photos privé (accès via signed URLs uniquement).
UPDATE storage.buckets
SET public = false
WHERE id = 'request-photos';
