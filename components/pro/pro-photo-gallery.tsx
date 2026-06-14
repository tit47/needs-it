import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProPhotoGalleryDebug } from "@/components/pro/pro-photo-gallery-debug";

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
  console.log("[ProPhotoGallery] photoUrls prop (server render):", photoUrls);

  const validPhotoUrls = photoUrls.filter(isValidImageUrl);
  const filteredOut = photoUrls.filter((url) => !isValidImageUrl(url));

  if (filteredOut.length) {
    console.log("[ProPhotoGallery] URLs filtered out by isValidImageUrl:", filteredOut);
  }

  console.log("[ProPhotoGallery] validPhotoUrls after filter:", validPhotoUrls);

  if (!validPhotoUrls.length) return null;

  const galleryId = "pro-photo-gallery-debug";
  const renderedSrcs = validPhotoUrls.map((url, index) => {
    console.log(`[ProPhotoGallery] Image src[${index}]:`, url);
    return url;
  });

  return (
    <Card padding="sm">
      <ProPhotoGalleryDebug
        galleryId={galleryId}
        receivedPhotoUrls={photoUrls}
        renderedSrcs={renderedSrcs}
      />
      <details
        className="mb-3 rounded-lg border border-dashed border-amber-500/60 bg-amber-50/80 p-3 text-xs text-amber-950"
        open
      >
        <summary className="cursor-pointer font-semibold">
          DEBUG photos (temporaire) — URLs transmises au composant Image
        </summary>
        <div className="mt-2 space-y-2 break-all">
          <p>
            <strong>photoUrls reçues ({photoUrls.length}) :</strong>
          </p>
          <pre className="whitespace-pre-wrap">{JSON.stringify(photoUrls, null, 2)}</pre>
          <p>
            <strong>src passés à Image ({renderedSrcs.length}) :</strong>
          </p>
          <pre className="whitespace-pre-wrap">{JSON.stringify(renderedSrcs, null, 2)}</pre>
        </div>
      </details>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          {validPhotoUrls.length} photo{validPhotoUrls.length > 1 ? "s" : ""} jointe
          {validPhotoUrls.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <div id={galleryId} className="grid grid-cols-2 gap-3">
        {renderedSrcs.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="photo-thumbnail relative aspect-[4/3] bg-black/5"
            data-debug-signed-src={url}
            data-debug-image-index={index}
          >
            <Image
              src={url}
              alt={`Photo ${index + 1} de la demande`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 240px"
              unoptimized
              data-debug-next-image-src={url}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
