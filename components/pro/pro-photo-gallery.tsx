import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProPhotoGalleryProps {
  photoUrls: string[];
}

function isSignedPhotoUrl(url: string): boolean {
  return url.includes("/storage/v1/object/sign/request-photos/");
}

export function ProPhotoGallery({ photoUrls }: ProPhotoGalleryProps) {
  const displayUrls = photoUrls.filter(isSignedPhotoUrl);

  return (
    <Card padding="sm">
      <p className="mb-3 rounded-lg bg-red-600 px-3 py-2 text-center text-sm font-bold text-white">
        PROPHOTOGALLERY VERSION DEBUG — build 5db3c09+img-v2 — urls reçues:{" "}
        {photoUrls.length} — urls signées affichées: {displayUrls.length}
      </p>
      {displayUrls.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Aucune URL object/sign reçue. Composant actuel: img natif (pas next/image).
        </p>
      ) : null}
      {displayUrls.length > 0 ? (
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            {displayUrls.length} photo{displayUrls.length > 1 ? "s" : ""} jointe
            {displayUrls.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {displayUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="photo-thumbnail relative aspect-[4/3] overflow-hidden bg-black/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Photo ${index + 1} de la demande`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
