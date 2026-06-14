import type { SupabaseDbClient } from "@/types";

export const REQUEST_PHOTOS_BUCKET = "request-photos";

/** Durée de validité des URLs signées : 24 heures. */
export const SIGNED_PHOTO_URL_EXPIRY_SECONDS = 60 * 60 * 24;

export const STORAGE_BUCKETS = {
  requestPhotos: REQUEST_PHOTOS_BUCKET,
} as const;

const PUBLIC_PHOTO_URL_PATTERN = new RegExp(
  `/storage/v1/object/public/${REQUEST_PHOTOS_BUCKET}/(.+)$`
);

/**
 * Normalise une valeur `photo_url` en chemin Storage
 * (chemin relatif ou ancienne URL publique Supabase).
 */
export function normalizePhotoStoragePath(photoUrl: string): string {
  const trimmed = photoUrl.trim();
  if (!trimmed) return trimmed;

  const publicMatch = trimmed.match(PUBLIC_PHOTO_URL_PATTERN);
  if (publicMatch?.[1]) {
    return decodeURIComponent(publicMatch[1]);
  }

  try {
    const url = new URL(trimmed);
    const signedMatch = url.pathname.match(
      new RegExp(`/storage/v1/object/sign/${REQUEST_PHOTOS_BUCKET}/(.+)$`)
    );
    if (signedMatch?.[1]) {
      return decodeURIComponent(signedMatch[1].split("?")[0] ?? signedMatch[1]);
    }
  } catch {
    // Valeur déjà stockée comme chemin relatif.
  }

  return trimmed;
}

export async function createSignedPhotoUrl(
  client: SupabaseDbClient,
  photoUrlOrPath: string
): Promise<string | null> {
  const path = normalizePhotoStoragePath(photoUrlOrPath);
  if (!path) return null;

  const { data, error } = await client.storage
    .from(REQUEST_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_PHOTO_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[storage] createSignedUrl failed:", error?.message ?? path);
    return null;
  }

  return data.signedUrl;
}

/**
 * Génère des URLs signées temporaires pour une liste de photos.
 * L'ordre des URLs correspond à l'ordre des entrées en entrée.
 */
export async function createSignedPhotoUrls(
  client: SupabaseDbClient,
  photos: { photo_url: string }[] | null | undefined
): Promise<string[]> {
  const items = photos ?? [];
  if (!items.length) return [];

  const paths = items.map((photo) => normalizePhotoStoragePath(photo.photo_url));

  const { data, error } = await client.storage
    .from(REQUEST_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_PHOTO_URL_EXPIRY_SECONDS);

  if (error || !data) {
    console.error("[storage] createSignedUrls failed:", error?.message);
    return [];
  }

  return data.flatMap((item) => {
    if (item.error || !item.signedUrl) {
      console.error(
        "[storage] signed URL failed:",
        item.error ?? item.path
      );
      return [];
    }

    if (!item.signedUrl.includes("/storage/v1/object/sign/")) {
      console.error("[storage] unexpected non-signed URL:", item.signedUrl);
      return [];
    }

    return [item.signedUrl];
  });
}

export async function withSignedPhotoUrls<T extends { photo_url: string }>(
  client: SupabaseDbClient,
  photos: T[]
): Promise<T[]> {
  if (!photos.length) return photos;

  const paths = photos.map((photo) => normalizePhotoStoragePath(photo.photo_url));

  const { data, error } = await client.storage
    .from(REQUEST_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_PHOTO_URL_EXPIRY_SECONDS);

  if (error || !data) {
    console.error("[storage] createSignedUrls failed:", error?.message);
    return [];
  }

  return photos.flatMap((photo, index) => {
    const signed = data[index];
    if (!signed || signed.error || !signed.signedUrl) {
      console.error(
        "[storage] signed URL failed:",
        signed?.error ?? paths[index]
      );
      return [];
    }

    return [{ ...photo, photo_url: signed.signedUrl }];
  });
}
