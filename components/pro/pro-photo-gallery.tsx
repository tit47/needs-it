import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProPhotoGalleryProps {
  photoUrls: string[];
}

export function ProPhotoGallery({ photoUrls }: ProPhotoGalleryProps) {
  if (!photoUrls.length) return null;

  return (
    <Card padding="sm">
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          {photoUrls.length} photo{photoUrls.length > 1 ? "s" : ""} jointe
          {photoUrls.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3">
        {photoUrls.map((url, index) => (
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
