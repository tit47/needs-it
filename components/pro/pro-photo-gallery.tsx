import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProPhotoGalleryProps {
  photoUrls: string[];
}

function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;

  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function ProPhotoGallery({ photoUrls }: ProPhotoGalleryProps) {
  const validPhotoUrls = photoUrls.filter(isValidImageUrl);

  if (!validPhotoUrls.length) return null;

  return (
    <Card padding="sm">
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          {validPhotoUrls.length} photo{validPhotoUrls.length > 1 ? "s" : ""} jointe
          {validPhotoUrls.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3">
        {validPhotoUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/5"
          >
            <Image
              src={url}
              alt={`Photo ${index + 1} de la demande`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 240px"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
