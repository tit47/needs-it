import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProPhotoGalleryProps {
  photoUrls: string[];
}

function isSignedPhotoUrl(url: string): boolean {
  return url.includes("/storage/v1/object/sign/request-photos/");
}

export function ProPhotoGallery({ photoUrls }: ProPhotoGalleryProps) {
  const displayUrls = photoUrls.filter(isSignedPhotoUrl);

  if (!displayUrls.length) return null;

  return (
    <Card padding="sm">
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          {displayUrls.length} photo{displayUrls.length > 1 ? "s" : ""} jointe
          {displayUrls.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
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
