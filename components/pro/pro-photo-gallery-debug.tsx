"use client";

import { useEffect } from "react";

interface ProPhotoGalleryDebugProps {
  galleryId: string;
  receivedPhotoUrls: string[];
  renderedSrcs: string[];
}

export function ProPhotoGalleryDebug({
  galleryId,
  receivedPhotoUrls,
  renderedSrcs,
}: ProPhotoGalleryDebugProps) {
  useEffect(() => {
    console.log("[ProPhotoGallery] received photoUrls:", receivedPhotoUrls);
    console.log("[ProPhotoGallery] Image src passed at render:", renderedSrcs);

    const imgs = document.querySelectorAll<HTMLImageElement>(
      `#${galleryId} img`
    );

    imgs.forEach((img, index) => {
      console.log(`[ProPhotoGallery] DOM img[${index}].src:`, img.src);
      console.log(
        `[ProPhotoGallery] DOM img[${index}] src attribute:`,
        img.getAttribute("src")
      );
      console.log(
        `[ProPhotoGallery] DOM img[${index}] uses _next/image:`,
        img.src.includes("/_next/image")
      );
    });
  }, [galleryId, receivedPhotoUrls, renderedSrcs]);

  return null;
}
