export const REQUEST_PHOTOS_BUCKET = "request-photos";

export const STORAGE_BUCKETS = {
  requestPhotos: REQUEST_PHOTOS_BUCKET,
} as const;

export function getPublicPhotoUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return path;
  return `${baseUrl}/storage/v1/object/public/${REQUEST_PHOTOS_BUCKET}/${path}`;
}
